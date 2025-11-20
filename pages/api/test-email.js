import nodemailer from 'nodemailer'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    // Check environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return res.status(500).json({ 
        success: false,
        message: 'Email configuration missing',
        details: {
          hasEmailUser: !!process.env.EMAIL_USER,
          hasEmailPassword: !!process.env.EMAIL_PASSWORD
        }
      })
    }

    console.log('📧 Testing email with config:', {
      from: process.env.EMAIL_USER,
      to: email,
      hasPassword: !!process.env.EMAIL_PASSWORD
    })

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // Verify connection
    await transporter.verify()
    console.log('✅ SMTP connection verified')

    // Send test email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Test Email from VSTRA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #000; color: #fff; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 32px;">VSTRA</h1>
          </div>
          <div style="background-color: #f5f5f5; padding: 40px; text-align: center;">
            <h2 style="color: #10b981; margin: 0 0 20px 0;">✅ Email Configuration Successful!</h2>
            <p style="color: #666; font-size: 16px;">
              Your email system is working correctly. You will now receive order confirmations and updates.
            </p>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              This is a test email from your VSTRA store.
            </p>
          </div>
        </div>
      `,
    })

    console.log('✅ Test email sent successfully:', info.messageId)

    res.status(200).json({
      success: true,
      message: 'Test email sent successfully!',
      messageId: info.messageId,
      to: email
    })
  } catch (error) {
    console.error('❌ Test email error:', error)
    
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message,
      details: {
        code: error.code,
        command: error.command,
        response: error.response
      }
    })
  }
}
