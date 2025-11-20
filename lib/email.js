import nodemailer from 'nodemailer'

// Verify email configuration
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.warn('⚠️ Email configuration missing! Please set EMAIL_USER and EMAIL_PASSWORD in .env.local')
}

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Email transporter verification failed:', error.message)
  } else {
    console.log('✅ Email server is ready to send messages')
  }
})

// Send order confirmation email
export const sendOrderConfirmationEmail = async (order, userEmail, userName) => {
  try {
    const orderItems = order.orderItems
      .map(
        (item) =>
          `<tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
              <strong>${item.name}</strong><br/>
              <small>Size: ${item.size} | Color: ${item.color}</small>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
              ${item.quantity}
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
              ₹${item.price}
            </td>
          </tr>`
      )
      .join('')

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'VSTRA <noreply@vstra.com>',
      to: userEmail,
      subject: `Order Confirmation #${order._id.toString().slice(-8)} - VSTRA`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #000000; padding: 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; letter-spacing: 2px;">VSTRA</h1>
                    </td>
                  </tr>

                  <!-- Success Message -->
                  <tr>
                    <td style="padding: 40px 30px; text-align: center;">
                      <div style="width: 80px; height: 80px; background-color: #10b981; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 40px;">✓</span>
                      </div>
                      <h2 style="color: #000000; margin: 0 0 10px 0; font-size: 28px;">Order Confirmed!</h2>
                      <p style="color: #666666; margin: 0; font-size: 16px;">Thank you for your purchase, ${userName}!</p>
                    </td>
                  </tr>

                  <!-- Order Details -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                        <tr>
                          <td>
                            <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">Order ID</p>
                            <p style="margin: 0; color: #000000; font-size: 18px; font-weight: bold;">#${order._id.toString().slice(-8)}</p>
                          </td>
                          <td align="right">
                            <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">Order Date</p>
                            <p style="margin: 0; color: #000000; font-size: 18px; font-weight: bold;">${new Date(order.createdAt).toLocaleDateString()}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Order Items -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <h3 style="margin: 0 0 20px 0; color: #000000; font-size: 20px;">Order Items</h3>
                      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                        <thead>
                          <tr style="background-color: #f9fafb;">
                            <th style="padding: 12px; text-align: left; font-size: 14px; color: #666666;">Item</th>
                            <th style="padding: 12px; text-align: center; font-size: 14px; color: #666666;">Qty</th>
                            <th style="padding: 12px; text-align: right; font-size: 14px; color: #666666;">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${orderItems}
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  <!-- Order Summary -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 8px 0; color: #666666;">Subtotal</td>
                          <td align="right" style="padding: 8px 0; color: #000000; font-weight: bold;">₹${order.itemsPrice?.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #666666;">Tax (10%)</td>
                          <td align="right" style="padding: 8px 0; color: #000000; font-weight: bold;">₹${order.taxPrice?.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #666666;">Shipping</td>
                          <td align="right" style="padding: 8px 0; color: #10b981; font-weight: bold;">FREE</td>
                        </tr>
                        <tr style="border-top: 2px solid #000000;">
                          <td style="padding: 15px 0 0 0; color: #000000; font-size: 18px; font-weight: bold;">Total</td>
                          <td align="right" style="padding: 15px 0 0 0; color: #000000; font-size: 24px; font-weight: bold;">₹${order.totalPrice?.toFixed(2)}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Shipping Address -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <h3 style="margin: 0 0 15px 0; color: #000000; font-size: 20px;">Shipping Address</h3>
                      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px;">
                        <p style="margin: 0; color: #000000; font-weight: bold;">${order.shippingAddress.fullName}</p>
                        <p style="margin: 5px 0 0 0; color: #666666; line-height: 1.6;">
                          ${order.shippingAddress.addressLine1}<br/>
                          ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '<br/>' : ''}
                          ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br/>
                          ${order.shippingAddress.country}<br/>
                          Phone: ${order.shippingAddress.phone}
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Status Badge -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px; text-align: center;">
                      <div style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 25px; font-weight: bold;">
                        Status: ${order.status.toUpperCase()}
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #eee;">
                      <p style="margin: 0 0 15px 0; color: #666666; font-size: 14px;">
                        Need help? Contact us at <a href="mailto:support@vstra.com" style="color: #000000; text-decoration: none; font-weight: bold;">support@vstra.com</a>
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} VSTRA. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Order confirmation email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    return { success: false, error: error.message }
  }
}

// Send order status update email
export const sendOrderStatusEmail = async (order, userEmail, userName, newStatus) => {
  try {
    const statusConfig = {
      processing: {
        title: 'Order is Being Prepared',
        message: 'Great news! Your order is now being processed and prepared for shipment.',
        icon: '📦',
        color: '#3b82f6',
        bgColor: '#dbeafe',
        nextStep: 'Your order will be shipped soon. We\'ll notify you once it\'s on the way!'
      },
      shipped: {
        title: 'Order Has Been Shipped',
        message: 'Exciting! Your order is on its way to you.',
        icon: '🚚',
        color: '#8b5cf6',
        bgColor: '#ede9fe',
        nextStep: 'Track your package and expect delivery within 3-5 business days.'
      },
      delivered: {
        title: 'Order Delivered Successfully',
        message: 'Your order has been delivered! We hope you love your purchase.',
        icon: '✅',
        color: '#10b981',
        bgColor: '#d1fae5',
        nextStep: 'Enjoy your new items! Don\'t forget to leave a review.'
      },
      cancelled: {
        title: 'Order Has Been Cancelled',
        message: 'Your order has been cancelled as requested.',
        icon: '❌',
        color: '#ef4444',
        bgColor: '#fee2e2',
        nextStep: 'If you have any questions, please contact our support team.'
      },
      pending: {
        title: 'Order is Pending',
        message: 'Your order is awaiting confirmation.',
        icon: '⏳',
        color: '#f59e0b',
        bgColor: '#fef3c7',
        nextStep: 'We\'ll update you once your order is confirmed.'
      }
    }

    const config = statusConfig[newStatus] || statusConfig.processing

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'VSTRA <noreply@vstra.com>',
      to: userEmail,
      subject: `${config.icon} Order Update #${order._id.toString().slice(-8)} - ${config.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Status Update</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #000000; padding: 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; letter-spacing: 2px;">VSTRA</h1>
                    </td>
                  </tr>

                  <!-- Status Icon & Message -->
                  <tr>
                    <td style="padding: 40px 30px; text-align: center; background: linear-gradient(to bottom, ${config.bgColor}, #ffffff);">
                      <div style="width: 100px; height: 100px; background-color: ${config.color}; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                        <span style="font-size: 50px;">${config.icon}</span>
                      </div>
                      <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 28px;">${config.title}</h2>
                      <p style="color: #666666; margin: 0; font-size: 16px; line-height: 1.6;">
                        Hi ${userName},<br/><br/>
                        ${config.message}
                      </p>
                    </td>
                  </tr>

                  <!-- Order Info Card -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; border: 2px solid ${config.color};">
                        <tr>
                          <td>
                            <p style="margin: 0 0 5px 0; color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order ID</p>
                            <p style="margin: 0 0 15px 0; color: #000000; font-size: 20px; font-weight: bold;">#${order._id.toString().slice(-8)}</p>
                            
                            <p style="margin: 0 0 5px 0; color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order Date</p>
                            <p style="margin: 0 0 15px 0; color: #000000; font-size: 16px;">${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            
                            <p style="margin: 0 0 5px 0; color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Total Amount</p>
                            <p style="margin: 0; color: #000000; font-size: 24px; font-weight: bold;">₹${order.totalPrice?.toFixed(2)}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Status Timeline -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <h3 style="margin: 0 0 20px 0; color: #000000; font-size: 18px;">Order Status Timeline</h3>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 10px 0;">
                            <div style="display: flex; align-items: center;">
                              <div style="width: 30px; height: 30px; border-radius: 50%; background-color: ${newStatus === 'pending' || newStatus === 'processing' || newStatus === 'shipped' || newStatus === 'delivered' ? '#10b981' : '#e5e7eb'}; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                                <span style="color: white; font-size: 16px;">✓</span>
                              </div>
                              <span style="color: #000000; font-weight: ${newStatus === 'pending' ? 'bold' : 'normal'};">Order Placed</span>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0;">
                            <div style="display: flex; align-items: center;">
                              <div style="width: 30px; height: 30px; border-radius: 50%; background-color: ${newStatus === 'processing' || newStatus === 'shipped' || newStatus === 'delivered' ? '#10b981' : '#e5e7eb'}; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                                <span style="color: white; font-size: 16px;">${newStatus === 'processing' || newStatus === 'shipped' || newStatus === 'delivered' ? '✓' : '○'}</span>
                              </div>
                              <span style="color: #000000; font-weight: ${newStatus === 'processing' ? 'bold' : 'normal'};">Processing</span>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0;">
                            <div style="display: flex; align-items: center;">
                              <div style="width: 30px; height: 30px; border-radius: 50%; background-color: ${newStatus === 'shipped' || newStatus === 'delivered' ? '#10b981' : '#e5e7eb'}; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                                <span style="color: white; font-size: 16px;">${newStatus === 'shipped' || newStatus === 'delivered' ? '✓' : '○'}</span>
                              </div>
                              <span style="color: #000000; font-weight: ${newStatus === 'shipped' ? 'bold' : 'normal'};">Shipped</span>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0;">
                            <div style="display: flex; align-items: center;">
                              <div style="width: 30px; height: 30px; border-radius: 50%; background-color: ${newStatus === 'delivered' ? '#10b981' : '#e5e7eb'}; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                                <span style="color: white; font-size: 16px;">${newStatus === 'delivered' ? '✓' : '○'}</span>
                              </div>
                              <span style="color: #000000; font-weight: ${newStatus === 'delivered' ? 'bold' : 'normal'};">Delivered</span>
                            </div>
                          </td>
                        </tr>
                        ${newStatus === 'cancelled' ? `
                        <tr>
                          <td style="padding: 10px 0;">
                            <div style="display: flex; align-items: center;">
                              <div style="width: 30px; height: 30px; border-radius: 50%; background-color: #ef4444; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                                <span style="color: white; font-size: 16px;">✕</span>
                              </div>
                              <span style="color: #ef4444; font-weight: bold;">Cancelled</span>
                            </div>
                          </td>
                        </tr>
                        ` : ''}
                      </table>
                    </td>
                  </tr>

                  <!-- Next Steps -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <div style="background-color: ${config.bgColor}; padding: 20px; border-radius: 8px; border-left: 4px solid ${config.color};">
                        <p style="margin: 0; color: #000000; font-size: 14px; line-height: 1.6;">
                          <strong>What's Next?</strong><br/>
                          ${config.nextStep}
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- CTA Button -->
                  <tr>
                    <td style="padding: 0 30px 40px 30px; text-align: center;">
                      <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/orders" style="display: inline-block; background-color: ${config.color}; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                        View Order Details
                      </a>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #eee;">
                      <p style="margin: 0 0 15px 0; color: #666666; font-size: 14px;">
                        Questions? Contact us at <a href="mailto:support@vstra.com" style="color: #000000; text-decoration: none; font-weight: bold;">support@vstra.com</a>
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} VSTRA. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Order status email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Error sending order status email:', error)
    return { success: false, error: error.message }
  }
}
