// Verify email configuration
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.warn('⚠️ Email configuration missing! Please set EMAIL_USER and EMAIL_PASSWORD in .env.local')
} else {
  console.log('✅ Email configuration found:', {
    user: process.env.EMAIL_USER,
    hasPassword: !!process.env.EMAIL_PASSWORD
  })
}

// Use require to avoid webpack issues with nodemailer
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
})

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Email transporter verification failed:', error.message)
    console.error('❌ Please check your EMAIL_USER and EMAIL_PASSWORD in .env.local')
    console.error('❌ For Gmail, you need to use an App Password, not your regular password')
    console.error('❌ Generate one at: https://myaccount.google.com/apppasswords')
  } else {
    console.log('✅ Email server is ready to send messages')
    console.log('✅ Configured email:', process.env.EMAIL_USER)
  }
})

// Send order confirmation email
export const sendOrderConfirmationEmail = async (order, userEmail, userName) => {
  try {
    const orderItems = order.orderItems
      .map(
        (item) =>
          `<tr>
            <td style="padding: 20px 0; border-bottom: 1px solid #e5e5e5;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="100" style="vertical-align: top;">
                    <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 100px; object-fit: cover; display: block; border: 1px solid #f0f0f0;" />
                  </td>
                  <td style="vertical-align: top; padding-left: 15px;">
                    <h4 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold; color: #000; text-transform: uppercase; letter-spacing: 0.5px;">${item.name}</h4>
                    <p style="margin: 0 0 5px 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Size: ${item.size} | Color: ${item.color}</p>
                    <p style="margin: 0; font-size: 12px; color: #000; font-weight: bold;">QTY: ${item.quantity}</p>
                  </td>
                  <td style="vertical-align: top; text-align: right;">
                    <p style="margin: 0; font-size: 14px; font-weight: bold; color: #000;">₹${item.price}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
      )
      .join('')

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'VSTRA <noreply@vstra.com>',
      to: userEmail,
      subject: `ORDER CONFIRMATION #${order.orderId || order._id.toString().slice(-8).toUpperCase()} - VSTRA`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #000000;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #000000; padding: 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 36px; letter-spacing: 4px; font-weight: 300; text-transform: uppercase;">VSTRA</h1>
                    </td>
                  </tr>

                  <!-- Success Message -->
                  <tr>
                    <td style="padding: 50px 40px 30px; text-align: center;">
                      <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 24px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Order Confirmed</h2>
                      <p style="color: #333333; margin: 0; font-size: 14px; line-height: 1.6; letter-spacing: 0.5px;">Dear ${userName},<br/>Thank you for your purchase. Your order has been placed successfully.</p>
                    </td>
                  </tr>

                  <!-- Order Details -->
                  <tr>
                    <td style="padding: 0 40px 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 20px 0;">
                        <tr>
                          <td width="50%">
                            <p style="margin: 0 0 5px 0; color: #666666; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
                            <p style="margin: 0; color: #000000; font-size: 16px; font-weight: 600;">${order.orderId || ('#' + order._id.toString().slice(-8).toUpperCase())}</p>
                          </td>
                          <td width="50%" align="right">
                            <p style="margin: 0 0 5px 0; color: #666666; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Order Date</p>
                            <p style="margin: 0; color: #000000; font-size: 16px; font-weight: 600;">${new Date(order.createdAt).toLocaleDateString()}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Order Items -->
                  <tr>
                    <td style="padding: 0 40px 20px;">
                      <h3 style="margin: 0 0 15px 0; color: #000000; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Order Details</h3>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        ${orderItems}
                      </table>
                    </td>
                  </tr>

                  <!-- Order Summary -->
                  <tr>
                    <td style="padding: 0 40px 40px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                        <tr>
                          <td width="50%" style="vertical-align: top; padding-right: 20px;">
                            <!-- Shipping Address -->
                            <h3 style="margin: 0 0 10px 0; color: #000000; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Shipping Address</h3>
                            <p style="margin: 0; color: #333333; font-size: 12px; line-height: 1.6; text-transform: uppercase;">
                              <strong>${order.shippingAddress.fullName}</strong><br/>
                              ${order.shippingAddress.addressLine1}<br/>
                              ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '<br/>' : ''}
                              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br/>
                              ${order.shippingAddress.country}<br/>
                              T: ${order.shippingAddress.phone}
                            </p>
                          </td>
                          <td width="50%" style="vertical-align: bottom;">
                            <!-- Totals -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding: 5px 0; color: #666666; font-size: 12px; text-transform: uppercase;">Subtotal</td>
                                <td align="right" style="padding: 5px 0; color: #000000; font-size: 12px; font-weight: 600;">₹${order.itemsPrice?.toFixed(2)}</td>
                              </tr>
                              <tr>
                                <td style="padding: 5px 0; color: #666666; font-size: 12px; text-transform: uppercase;">Tax</td>
                                <td align="right" style="padding: 5px 0; color: #000000; font-size: 12px; font-weight: 600;">₹${order.taxPrice?.toFixed(2)}</td>
                              </tr>
                              <tr>
                                <td style="padding: 5px 0; color: #666666; font-size: 12px; text-transform: uppercase;">Shipping</td>
                                <td align="right" style="padding: 5px 0; color: #000000; font-size: 12px; font-weight: 600;">FREE</td>
                              </tr>
                              <tr>
                                <td colspan="2" style="padding-top: 10px;">
                                  <div style="border-top: 1px solid #000;"></div>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 15px 0 0 0; color: #000000; font-size: 14px; font-weight: 600; text-transform: uppercase;">Total</td>
                                <td align="right" style="padding: 15px 0 0 0; color: #000000; font-size: 18px; font-weight: 600;">₹${order.totalPrice?.toFixed(2)}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #000000; padding: 40px; text-align: center;">
                      <p style="margin: 0 0 15px 0; color: #ffffff; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">
                        Need assistance? Contact our support at <a href="mailto:support@vstra.com" style="color: #ffffff; text-decoration: underline; font-weight: bold;">support@vstra.com</a>
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 10px; letter-spacing: 0.5px;">
                        © ${new Date().getFullYear()} VSTRA. ALL RIGHTS RESERVED.
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
        title: 'ORDER PROCESSING',
        message: 'Your order is currently being processed by our team.',
        nextStep: 'We will notify you once your order has been dispatched.',
      },
      shipped: {
        title: 'ORDER SHIPPED',
        message: 'Your order has been dispatched and is on its way.',
        nextStep: 'Please expect delivery within our estimated timeframe.',
      },
      delivered: {
        title: 'ORDER DELIVERED',
        message: 'Your order has been successfully delivered.',
        nextStep: 'We hope you appreciate the quality of VSTRA. Thank you for your continued patronage.',
      },
      cancelled: {
        title: 'ORDER CANCELLED',
        message: 'Your order has been cancelled.',
        nextStep: 'Any eligible refunds will be processed to your original payment method.',
      },
      pending: {
        title: 'ORDER PENDING',
        message: 'Your order is currently awaiting confirmation.',
        nextStep: 'We will update you shortly on its status.',
      }
    }

    const config = statusConfig[newStatus] || statusConfig.processing

    const orderItems = order.orderItems
      .map(
        (item) =>
          `<tr>
            <td style="padding: 15px 0; border-bottom: 1px solid #e5e5e5;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="60" style="vertical-align: top;">
                    <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 65px; object-fit: cover; display: block; border: 1px solid #f0f0f0;" />
                  </td>
                  <td style="vertical-align: top; padding-left: 10px;">
                    <p style="margin: 0 0 3px 0; font-size: 12px; font-weight: bold; color: #000; text-transform: uppercase;">${item.name}</p>
                    <p style="margin: 0 0 3px 0; color: #666; font-size: 10px; text-transform: uppercase;">Size: ${item.size} | Color: ${item.color}</p>
                    <p style="margin: 0; font-size: 10px; color: #000; font-weight: bold;">QTY: ${item.quantity}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
      )
      .join('')

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'VSTRA <noreply@vstra.com>',
      to: userEmail,
      subject: `ORDER UPDATE ${order.orderId || ('#' + order._id.toString().slice(-8).toUpperCase())} - ${config.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Status Update</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #000000;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #000000; padding: 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 36px; letter-spacing: 4px; font-weight: 300; text-transform: uppercase;">VSTRA</h1>
                    </td>
                  </tr>

                  <!-- Status Message -->
                  <tr>
                    <td style="padding: 50px 40px 30px; text-align: center;">
                      <h2 style="color: #000000; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">${config.title}</h2>
                      <p style="color: #333333; margin: 0; font-size: 14px; line-height: 1.6; letter-spacing: 0.5px;">Dear ${userName},<br/>${config.message}</p>
                    </td>
                  </tr>

                  <!-- Order Brief -->
                  <tr>
                    <td style="padding: 0 40px 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #000; padding: 20px;">
                        <tr>
                          <td width="50%" style="vertical-align: top; padding-right: 15px;">
                            <p style="margin: 0 0 5px 0; color: #666666; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Order ID</p>
                            <p style="margin: 0 0 15px 0; color: #000000; font-size: 14px; font-weight: 600;">${order.orderId || ('#' + order._id.toString().slice(-8).toUpperCase())}</p>
                            
                            <p style="margin: 0 0 5px 0; color: #666666; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Total Amount</p>
                            <p style="margin: 0; color: #000000; font-size: 16px; font-weight: 600;">₹${order.totalPrice?.toFixed(2)}</p>
                          </td>
                          <td width="50%" style="vertical-align: top;">
                            <p style="margin: 0 0 5px 0; color: #666666; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Items Included</p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                              ${orderItems}
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Next Steps -->
                  <tr>
                    <td style="padding: 0 40px 40px; text-align: center;">
                      <h3 style="margin: 0 0 10px 0; color: #000000; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">What's Next?</h3>
                      <p style="margin: 0 0 30px 0; color: #333333; font-size: 14px; line-height: 1.6;">${config.nextStep}</p>
                      
                      <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/orders" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 15px 40px; text-decoration: none; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                        View Order Details
                      </a>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #000000; padding: 40px; text-align: center;">
                      <p style="margin: 0 0 15px 0; color: #ffffff; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">
                        Need assistance? Contact our support at <a href="mailto:support@vstra.com" style="color: #ffffff; text-decoration: underline; font-weight: bold;">support@vstra.com</a>
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 10px; letter-spacing: 0.5px;">
                        © ${new Date().getFullYear()} VSTRA. ALL RIGHTS RESERVED.
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
