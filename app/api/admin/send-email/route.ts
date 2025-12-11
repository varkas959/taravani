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
      console.log("Email not configured. Would send to:", email);
      console.log("Report text:", reportText.substring(0, 100) + "...");
      return NextResponse.json(
        { message: "Email service not configured. Check console for details." },
        { status: 200 }
      );
    }

    // Create email transporter
    const transporter = createEmailTransporter();

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
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { message: "Failed to send email", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
