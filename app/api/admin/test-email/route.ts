import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { createEmailTransporter, getFromEmail, isEmailConfigured } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminSession(request);
    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { testEmail } = await request.json();
    const recipientEmail = testEmail || admin.email;

    // Check configuration
    const configStatus = {
      isConfigured: isEmailConfigured(),
      hasBrevoApiKey: !!process.env.BREVO_API_KEY,
      hasBrevoEmail: !!process.env.BREVO_EMAIL,
      hasBrevoSmtpUser: !!process.env.BREVO_SMTP_USER,
      hasBrevoFrom: !!process.env.BREVO_FROM,
      fromEmail: getFromEmail(),
      smtpHost: process.env.SMTP_HOST,
      smtpUser: process.env.SMTP_USER ? "Set" : "Not set",
    };

    if (!isEmailConfigured()) {
      return NextResponse.json({
        success: false,
        message: "Email not configured",
        config: configStatus,
      }, { status: 400 });
    }

    // Test SMTP connection
    let connectionTest = { success: false, error: null as string | null };
    try {
      const transporter = createEmailTransporter();
      await transporter.verify();
      connectionTest.success = true;
    } catch (error) {
      connectionTest.error = error instanceof Error ? error.message : "Unknown error";
    }

    // Try sending test email
    let sendTest = { success: false, messageId: null as string | null, error: null as string | null };
    if (connectionTest.success) {
      try {
        const transporter = createEmailTransporter();
        const result = await transporter.sendMail({
          from: getFromEmail(),
          to: recipientEmail,
          subject: "Test Email from Taravani",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Test Email</h2>
              <p>This is a test email from your Taravani application.</p>
              <p>If you received this, your email configuration is working correctly!</p>
              <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
            </div>
          `,
          text: "This is a test email from your Taravani application. If you received this, your email configuration is working correctly!",
        });
        sendTest.success = true;
        sendTest.messageId = result.messageId || null;
      } catch (error) {
        sendTest.error = error instanceof Error ? error.message : "Unknown error";
      }
    }

    return NextResponse.json({
      success: sendTest.success,
      message: sendTest.success 
        ? `Test email sent successfully to ${recipientEmail}` 
        : "Failed to send test email",
      config: configStatus,
      connectionTest,
      sendTest,
    });
  } catch (error) {
    console.error("Error in test email:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Error testing email", 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

