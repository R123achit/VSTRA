// Use require to avoid webpack issues with nodemailer
const nodemailer = require('nodemailer')

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
})

// Send abandoned cart email
export async function sendAbandonedCartEmail(email, cartItems, totalAmount) {
  try {
    const itemsHtml = cartItems.map(item => `
      <tr>
        <td style="padding: 10px;">
          <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
        </td>
        <td style="padding: 10px;">
          <strong>${item.name}</strong><br>
          <span style="color: #666;">Size: ${item.size} | Color: ${item.color}</span><br>
          <span style="color: #666;">Qty: ${item.quantity}</span>
        </td>
        <td style="padding: 10px; text-align: right;">
          <strong>₹${item.price.toFixed(2)}</strong>
        </td>
      </tr>
    `).join('')

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'VSTRA <noreply@vstra.com>',
      to: email,
      subject: '🛒 You left items in your cart - Complete your purchase!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px;">VSTRA</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your Fashion Destination</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Don't Miss Out! 🛍️</h2>
            <p style="font-size: 16px; color: #666;">
              Hi there! We noticed you left some amazing items in your cart. 
              They're still waiting for you!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Your Cart Items:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${itemsHtml}
                <tr style="border-top: 2px solid #ddd;">
                  <td colspan="2" style="padding: 15px; text-align: right;">
                    <strong style="font-size: 18px;">Total:</strong>
                  </td>
                  <td style="padding: 15px; text-align: right;">
                    <strong style="font-size: 20px; color: #667eea;">₹${totalAmount.toFixed(2)}</strong>
                  </td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/cart" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Complete Your Purchase
              </a>
            </div>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #856404;">
                ⚡ <strong>Hurry!</strong> Items in your cart are selling fast. Complete your order before they're gone!
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Need help? Contact us at <a href="mailto:support@vstra.com" style="color: #667eea;">support@vstra.com</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              You're receiving this email because you added items to your cart at VSTRA.<br>
              © ${new Date().getFullYear()} VSTRA. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ Abandoned cart email sent to ${email}`)
    return true
  } catch (error) {
    console.error('Error sending abandoned cart email:', error)
    throw error
  }
}
