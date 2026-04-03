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
        <td style="padding: 15px 0; border-bottom: 1px solid #e5e5e5;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="80" style="vertical-align: top;">
                <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 80px; object-fit: cover; display: block; border: 1px solid #f0f0f0;" />
              </td>
              <td style="vertical-align: top; padding-left: 15px;">
                <h4 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold; color: #000; text-transform: uppercase;">${item.name}</h4>
                <p style="margin: 0 0 5px 0; color: #666; font-size: 12px; text-transform: uppercase;">Size: ${item.size} | Color: ${item.color}</p>
                <p style="margin: 0; font-size: 12px; color: #000; font-weight: bold;">QTY: ${item.quantity}</p>
              </td>
              <td style="vertical-align: top; text-align: right;">
                <p style="margin: 0; font-size: 14px; font-weight: bold; color: #000;">₹${item.price.toFixed(2)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `).join('')

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'VSTRA <noreply@vstra.com>',
      to: email,
      subject: 'COMPLETE YOUR PURCHASE - VSTRA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #ffffff;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #000000;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #000000; padding: 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 36px; letter-spacing: 4px; font-weight: 300; text-transform: uppercase;">VSTRA</h1>
                    </td>
                  </tr>
                  
                  <td style="padding: 50px 40px 20px; text-align: center;">
                    <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 20px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Items Left Behind</h2>
                    <p style="color: #333333; margin: 0; font-size: 14px; line-height: 1.6; letter-spacing: 0.5px;">We noticed you left some items in your cart. Complete your order before they sell out.</p>
                  </td>
                  
                  <!-- Cart Items -->
                  <tr>
                    <td style="padding: 0 40px 20px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        ${itemsHtml}
                        <tr>
                          <td style="padding-top: 20px; text-align: right;">
                            <span style="font-size: 14px; text-transform: uppercase; color: #666; margin-right: 15px;">Total</span>
                            <span style="font-size: 18px; font-weight: 600; color: #000;">₹${totalAmount.toFixed(2)}</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- CTA -->
                  <tr>
                    <td style="padding: 20px 40px 40px; text-align: center;">
                      <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/cart" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 15px 40px; text-decoration: none; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                        RETURN TO CART
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
