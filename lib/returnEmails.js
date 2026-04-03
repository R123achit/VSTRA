import nodemailer from 'nodemailer'

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

// Helper for minimal B&W template
const generateReturnTemplate = (title, content, userName) => `
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

          <!-- Content Area -->
          <tr>
            <td style="padding: 50px 40px 40px; text-align: center;">
              <h2 style="color: #000000; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">${title}</h2>
              <p style="color: #333333; margin: 0 0 30px 0; font-size: 14px; line-height: 1.6; letter-spacing: 0.5px;">Dear ${userName},<br/>${content.message}</p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #000; padding: 20px; margin-bottom: 30px; text-align: left;">
                <tr>
                  <td width="50%" style="vertical-align: top;">
                    <p style="margin: 0 0 5px 0; color: #666666; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Return ID</p>
                    <p style="margin: 0 0 15px 0; color: #000000; font-size: 14px; font-weight: 600;">#${content.returnId}</p>
                    
                    <p style="margin: 0 0 5px 0; color: #666666; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Product</p>
                    <p style="margin: 0; color: #000000; font-size: 14px; font-weight: 600;">${content.product}</p>
                  </td>
                  <td width="50%" style="vertical-align: top;">
                    <p style="margin: 0 0 5px 0; color: #666666; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Refund Amount</p>
                    <p style="margin: 0 0 15px 0; color: #000000; font-size: 16px; font-weight: 600;">₹${content.amount}</p>
                    
                    <p style="margin: 0 0 5px 0; color: #666666; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Status</p>
                    <p style="margin: 0; color: #000000; font-size: 14px; font-weight: 600; text-transform: uppercase;">${content.status}</p>
                  </td>
                </tr>
              </table>

              ${content.extraHtml ? content.extraHtml : ''}

              <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/my-returns" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 15px 40px; text-decoration: none; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 20px;">
                VIEW RETURN DETAILS
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

/**
 * Send return request submitted email
 */
export const sendReturnRequestEmail = async (returnRequest, userEmail, userName) => {
  try {
    const extraHtml = `
      <div style="text-align: left; padding: 20px; background-color: #f5f5f5; border: 1px solid #e5e5e5; margin-bottom: 20px;">
        <h4 style="margin: 0 0 10px 0; color: #000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Next Steps</h4>
        <ul style="margin: 0; padding-left: 20px; color: #333; font-size: 12px; line-height: 1.6;">
          <li>Your request will be reviewed within 24-48 hours.</li>
          <li>You will receive an update once approved or rejected.</li>
          <li>If approved, a pickup will be scheduled.</li>
        </ul>
      </div>
    `

    const mailOptions = {
      from: `"VSTRA Returns" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'RETURN REQUEST RECEIVED - VSTRA',
      html: generateReturnTemplate(
        'RETURN REQUEST RECEIVED',
        {
          message: 'We have received your return request and it is currently being reviewed.',
          returnId: returnRequest._id.toString().slice(-8),
          product: returnRequest.itemName,
          amount: returnRequest.refundAmount?.toLocaleString(),
          status: 'Pending Approval',
          extraHtml
        },
        userName
      )
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Return request email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Return request email error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send return approved email
 */
export const sendReturnApprovedEmail = async (returnRequest, userEmail, userName) => {
  try {
    const pickupDate = returnRequest.pickupScheduled 
      ? new Date(returnRequest.pickupScheduled).toLocaleDateString('en-IN', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'Within 2-3 business days'

    const extraHtml = `
      <div style="text-align: left; padding: 20px; background-color: #f5f5f5; border: 1px solid #e5e5e5; margin-bottom: 20px;">
        <h4 style="margin: 0 0 10px 0; color: #000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Pickup Instructions</h4>
        <p style="margin: 0 0 10px 0; font-size: 12px;"><strong>Scheduled:</strong> ${pickupDate}</p>
        <ul style="margin: 0; padding-left: 20px; color: #333; font-size: 12px; line-height: 1.6;">
          <li>Keep the item ready in original packaging with tags.</li>
          <li>Our courier will contact you prior to pickup.</li>
        </ul>
      </div>
    `

    const mailOptions = {
      from: `"VSTRA Returns" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'RETURN REQUEST APPROVED - VSTRA',
      html: generateReturnTemplate(
        'RETURN APPROVED',
        {
          message: 'Your return request has been approved. A pickup will be scheduled shortly.',
          returnId: returnRequest._id.toString().slice(-8),
          product: returnRequest.itemName,
          amount: returnRequest.refundAmount?.toLocaleString(),
          status: 'Approved',
          extraHtml
        },
        userName
      )
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Return approved email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Return approved email error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send return rejected email
 */
export const sendReturnRejectedEmail = async (returnRequest, userEmail, userName) => {
  try {
    const extraHtml = returnRequest.sellerResponse?.message ? `
      <div style="text-align: left; padding: 20px; border: 1px solid #000; margin-bottom: 20px;">
        <h4 style="margin: 0 0 10px 0; color: #000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Reason for Rejection</h4>
        <p style="margin: 0; color: #333; font-size: 12px; font-style: italic;">"${returnRequest.sellerResponse.message}"</p>
      </div>
    ` : ''

    const mailOptions = {
      from: `"VSTRA Returns" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'RETURN REQUEST NOT APPROVED - VSTRA',
      html: generateReturnTemplate(
        'RETURN NOT APPROVED',
        {
          message: 'We regret to inform you that your return request could not be approved at this time.',
          returnId: returnRequest._id.toString().slice(-8),
          product: returnRequest.itemName,
          amount: returnRequest.refundAmount?.toLocaleString(),
          status: 'Rejected',
          extraHtml
        },
        userName
      )
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Return rejected email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Return rejected email error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send refund processed email
 */
export const sendRefundProcessedEmail = async (returnRequest, userEmail, userName) => {
  try {
    const extraHtml = `
      <div style="text-align: left; padding: 20px; background-color: #f5f5f5; border: 1px solid #e5e5e5; margin-bottom: 20px;">
        <h4 style="margin: 0 0 10px 0; color: #000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Refund Processed</h4>
        <p style="margin: 0; color: #333; font-size: 12px; line-height: 1.6;">
          Your refund has been released to your original payment method. 
          Please allow 5-7 business days for the funds to reflect in your account.
        </p>
        ${returnRequest.refundTransactionId ? `<p style="margin: 10px 0 0 0; font-size: 12px;"><strong>Transaction ID:</strong> ${returnRequest.refundTransactionId}</p>` : ''}
      </div>
    `

    const mailOptions = {
      from: `"VSTRA Returns" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'REFUND PROCESSED - VSTRA',
      html: generateReturnTemplate(
        'REFUND PROCESSED',
        {
          message: 'Your refund has been successfully processed.',
          returnId: returnRequest._id.toString().slice(-8),
          product: returnRequest.itemName,
          amount: returnRequest.refundAmount?.toLocaleString(),
          status: 'Refunded',
          extraHtml
        },
        userName
      )
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Refund processed email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Refund processed email error:', error)
    return { success: false, error: error.message }
  }
}
