import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { createEmailTransporter, getFromEmail, isEmailConfigured } from "@/lib/email";
import { readFile } from "fs/promises";
import { join } from "path";

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

    const { email, reportText, name, readingId, pdfPath, pdfData } = await request.json();

    if (!email || !reportText || !name) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // If no email credentials are configured, return success (for development)
    if (!isEmailConfigured()) {
      console.log("❌ Email not configured. Would send to:", email);
      console.log("Report text:", reportText.substring(0, 100) + "...");
      return NextResponse.json(
        { message: "Email service not configured. Check console for details." },
        { status: 200 }
      );
    }

    // Log email configuration status
    console.log("📧 Email Configuration Check:");
    console.log("  - BREVO_API_KEY:", process.env.BREVO_API_KEY ? "✅ Set" : "❌ Not set");
    console.log("  - BREVO_EMAIL:", process.env.BREVO_EMAIL || "Not set");
    console.log("  - BREVO_FROM:", process.env.BREVO_FROM || "Not set");
    console.log("  - SMTP_HOST:", process.env.SMTP_HOST || "Not set");
    console.log("  - From Email:", getFromEmail());
    console.log("  - To Email:", email);

    // Create email transporter
    const transporter = createEmailTransporter();
    
    // Verify transporter connection
    try {
      console.log("🔍 Attempting SMTP connection verification...");
      await transporter.verify();
      console.log("✅ SMTP connection verified successfully");
    } catch (verifyError) {
      console.error("❌ SMTP connection verification failed:");
      console.error("  - Error type:", verifyError instanceof Error ? verifyError.constructor.name : typeof verifyError);
      console.error("  - Error message:", verifyError instanceof Error ? verifyError.message : String(verifyError));
      
      if (verifyError instanceof Error && 'code' in verifyError) {
        console.error("  - Error code:", (verifyError as any).code);
      }
      if (verifyError instanceof Error && 'response' in verifyError) {
        console.error("  - SMTP response:", (verifyError as any).response);
      }
      if (verifyError instanceof Error && 'responseCode' in verifyError) {
        console.error("  - SMTP response code:", (verifyError as any).responseCode);
      }
      if (verifyError instanceof Error && 'command' in verifyError) {
        console.error("  - Failed command:", (verifyError as any).command);
      }
      
      return NextResponse.json(
        { 
          message: "SMTP connection failed", 
          error: verifyError instanceof Error ? verifyError.message : "Unknown error",
          details: "Check your Brevo credentials in Vercel environment variables",
          errorCode: verifyError instanceof Error && 'code' in verifyError ? (verifyError as any).code : undefined,
          smtpResponse: verifyError instanceof Error && 'response' in verifyError ? (verifyError as any).response : undefined,
        },
        { status: 500 }
      );
    }

    // Prepare email options
    const mailOptions: any = {
      from: getFromEmail(),
      to: email,
      subject: `Your birth chart reading, ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a2e;">
          <h1 style="font-family: serif; color: #1a1a2e; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
            Your Birth Chart Reading
          </h1>
          <p>Dear ${name},</p>
          <p>Thank you for requesting your birth chart reading. Below is your personalised report, written specifically for you.</p>
          <div style="background: #fafafa; padding: 20px; margin: 20px 0; border-left: 4px solid #d4af37; white-space: pre-wrap; line-height: 1.6;">
            ${reportText.replace(/\n/g, "<br>")}
          </div>
          ${pdfPath ? '<p style="margin-top: 20px;">A PDF version of your report is attached to this email.</p>' : ''}
          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #8a8a9e;">
            We store your details for 30 days so we can resend this if needed, then they are permanently deleted.
          </p>
          <p style="font-size: 12px; color: #8a8a9e;">
            This report was personally written by a professional astrologer. If you have any questions, please don't hesitate to contact us.
          </p>
          <p style="font-size: 12px; color: #8a8a9e; margin-top: 20px;">
            Taravani
          </p>
        </div>
      `,
      text: `
Your Birth Chart Reading

Dear ${name},

Thank you for requesting your birth chart reading. Below is your personalised report, written specifically for you.

${reportText}

${pdfPath ? '\nA PDF version of your report is attached to this email.\n' : ''}
---
We store your details for 30 days so we can resend this if needed, then they are permanently deleted.

This report was personally written by a professional astrologer. If you have any questions, please don't hesitate to contact us.

Taravani
      `,
    };

    // Attach PDF if provided
    if (pdfPath || pdfData) {
      try {
        let pdfBuffer: Buffer;
        
        if (pdfData) {
          // Use base64 data from database
          pdfBuffer = Buffer.from(pdfData, "base64");
        } else if (pdfPath) {
          // Try to read from file system (local dev)
          try {
            const filePath = join(process.cwd(), "public", pdfPath);
            pdfBuffer = await readFile(filePath);
          } catch (error) {
            console.error("Error reading PDF file:", error);
            // If file read fails and no base64 data, skip attachment
            if (!pdfData) {
              throw error;
            }
            pdfBuffer = Buffer.from(pdfData, "base64");
          }
        } else {
          throw new Error("No PDF data or path provided");
        }

        mailOptions.attachments = [
          {
            filename: `Birth_Chart_Reading_${name.replace(/\s+/g, "_")}.pdf`,
            content: pdfBuffer,
          },
        ];
      } catch (error) {
        console.error("Error preparing PDF attachment:", error);
        // Continue without attachment if PDF processing fails
      }
    }

    // Send email
    console.log("📤 Attempting to send email...");
    console.log("  - From:", mailOptions.from);
    console.log("  - To:", mailOptions.to);
    console.log("  - Subject:", mailOptions.subject);
    console.log("  - Has PDF:", !!(pdfPath || pdfData));
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log("✅ Email sent successfully!");
    console.log("  - Message ID:", result.messageId);
    console.log("  - Response:", result.response);
    
    return NextResponse.json({ 
      success: true, 
      message: "Email sent successfully",
      messageId: result.messageId,
      response: result.response
    });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error("  - Error name:", error.name);
      console.error("  - Error message:", error.message);
      console.error("  - Error stack:", error.stack);
      
      // Check for specific Brevo errors
      if (error.message.includes("Invalid login")) {
        console.error("  - Issue: Invalid Brevo credentials");
      } else if (error.message.includes("timeout")) {
        console.error("  - Issue: Connection timeout to Brevo");
      } else if (error.message.includes("ECONNREFUSED")) {
        console.error("  - Issue: Cannot connect to Brevo SMTP server");
      }
    }
    
    return NextResponse.json(
      { 
        message: "Failed to send email", 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
