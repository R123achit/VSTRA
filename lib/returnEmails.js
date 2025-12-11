import nodemailer from 'nodemailer'

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

/**
 * Send return request submitted email
 */
export const sendReturnRequestEmail = async (returnRequest, userEmail, userName) => {
  try {
    const mailOptions = {
      from: `"VSTRA Returns" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '✅ Return Request Submitted - VSTRA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔄 Return Request Submitted</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              
              <p>We've received your return request and it's being reviewed by the seller.</p>
              
              <div class="details">
                <h3>Return Details</h3>
                <p><strong>Return ID:</strong> #${returnRequest._id.toString().slice(-8)}</p>
                <p><strong>Product:</strong> ${returnRequest.itemName}</p>
                <p><strong>Reason:</strong> ${returnRequest.reason}</p>
                <p><strong>Refund Amount:</strong> ₹${returnRequest.refundAmount?.toLocaleString()}</p>
                <p><strong>Status:</strong> <span style="color: #f59e0b;">Pending Seller Approval</span></p>
              </div>
              
              <p><strong>What happens next?</strong></p>
              <ul>
                <li>The seller will review your request within 24-48 hours</li>
                <li>You'll receive an email once the seller approves or rejects your request</li>
                <li>If approved, we'll schedule a pickup from your address</li>
                <li>After receiving and inspecting the item, we'll process your refund</li>
              </ul>
              
              <center>
                <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/my-returns" class="button">Track Return Status</a>
              </center>
              
              <p>If you have any questions, feel free to contact our support team.</p>
              
              <p>Best regards,<br>VSTRA Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} VSTRA. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
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

    const mailOptions = {
      from: `"VSTRA Returns" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '✅ Return Request Approved - VSTRA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Return Request Approved!</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              
              <div class="success-box">
                <p style="margin: 0; color: #065f46;"><strong>Great news!</strong> Your return request has been approved by the seller.</p>
              </div>
              
              <div class="details">
                <h3>Return Details</h3>
                <p><strong>Return ID:</strong> #${returnRequest._id.toString().slice(-8)}</p>
                <p><strong>Product:</strong> ${returnRequest.itemName}</p>
                <p><strong>Refund Amount:</strong> ₹${returnRequest.refundAmount?.toLocaleString()}</p>
                <p><strong>Pickup Scheduled:</strong> ${pickupDate}</p>
              </div>
              
              <p><strong>📦 Pickup Instructions:</strong></p>
              <ul>
                <li>Keep the item ready in its original packaging with all tags attached</li>
                <li>Our courier partner will contact you before pickup</li>
                <li>Make sure someone is available at the pickup address</li>
                <li>You'll receive a pickup confirmation once collected</li>
              </ul>
              
              ${returnRequest.sellerResponse?.message ? `
                <div class="details">
                  <h4>Seller's Message:</h4>
                  <p style="font-style: italic;">"${returnRequest.sellerResponse.message}"</p>
                </div>
              ` : ''}
              
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Item will be picked up from your address</li>
                <li>Seller will inspect the item for quality</li>
                <li>Once approved, refund will be processed within 5-7 business days</li>
              </ol>
              
              <center>
                <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/my-returns" class="button">Track Return Status</a>
              </center>
              
              <p>Thank you for shopping with VSTRA!</p>
              
              <p>Best regards,<br>VSTRA Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} VSTRA. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
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
    const mailOptions = {
      from: `"VSTRA Returns" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '❌ Return Request Not Approved - VSTRA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .warning-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Return Request Update</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              
              <div class="warning-box">
                <p style="margin: 0; color: #991b1b;">We regret to inform you that your return request could not be approved.</p>
              </div>
              
              <div class="details">
                <h3>Return Details</h3>
                <p><strong>Return ID:</strong> #${returnRequest._id.toString().slice(-8)}</p>
                <p><strong>Product:</strong> ${returnRequest.itemName}</p>
                <p><strong>Status:</strong> <span style="color: #ef4444;">Rejected</span></p>
              </div>
              
              ${returnRequest.sellerResponse?.message ? `
                <div class="details">
                  <h4>Reason for Rejection:</h4>
                  <p style="font-style: italic;">"${returnRequest.sellerResponse.message}"</p>
                </div>
              ` : ''}
              
              <p>If you believe this decision was made in error or have additional information to share, please contact our customer support team.</p>
              
              <center>
                <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/my-returns" class="button">View Return Details</a>
              </center>
              
              <p>We appreciate your understanding.</p>
              
              <p>Best regards,<br>VSTRA Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} VSTRA. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
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
    const mailOptions = {
      from: `"VSTRA Returns" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '💰 Refund Processed - VSTRA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .amount { font-size: 32px; color: #10b981; font-weight: bold; text-align: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 Refund Processed!</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              
              <div class="success-box">
                <p style="margin: 0; color: #065f46;"><strong>Great news!</strong> Your refund has been processed successfully.</p>
              </div>
              
              <div class="amount">
                ₹${returnRequest.refundAmount?.toLocaleString()}
              </div>
              
              <div class="details">
                <h3>Refund Details</h3>
                <p><strong>Return ID:</strong> #${returnRequest._id.toString().slice(-8)}</p>
                <p><strong>Product:</strong> ${returnRequest.itemName}</p>
                <p><strong>Refund Amount:</strong> ₹${returnRequest.refundAmount?.toLocaleString()}</p>
                <p><strong>Refund Method:</strong> Original Payment Method</p>
                ${returnRequest.refundTransactionId ? `<p><strong>Transaction ID:</strong> ${returnRequest.refundTransactionId}</p>` : ''}
                <p><strong>Processed On:</strong> ${new Date(returnRequest.refundedAt).toLocaleDateString('en-IN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
              
              <p><strong>⏰ When will I receive my refund?</strong></p>
              <ul>
                <li>The refund will be credited to your original payment method</li>
                <li>It typically takes 5-7 business days to reflect in your account</li>
                <li>You may see it sooner depending on your bank/payment provider</li>
              </ul>
              
              <p>If you don't see the refund after 7 business days, please contact your bank or our support team with the transaction ID above.</p>
              
              <center>
                <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/my-returns" class="button">View Return Details</a>
              </center>
              
              <p>Thank you for shopping with VSTRA. We hope to serve you again soon!</p>
              
              <p>Best regards,<br>VSTRA Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} VSTRA. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Refund processed email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Refund processed email error:', error)
    return { success: false, error: error.message }
  }
}
