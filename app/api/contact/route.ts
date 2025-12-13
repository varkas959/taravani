import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createEmailTransporter, getFromEmail, isEmailConfigured } from "@/lib/email";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Message should be at least 10 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = contactSchema.parse(body);

    // Save to database first
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        message,
      },
    });

    // Try to send email (don't fail if email fails)
    try {
      if (isEmailConfigured()) {
        console.log("📧 Contact form email configuration:");
        console.log("  - BREVO_API_KEY:", process.env.BREVO_API_KEY ? `Set (${process.env.BREVO_API_KEY.length} chars)` : "Not set");
        console.log("  - BREVO_EMAIL:", process.env.BREVO_EMAIL || "Not set");
        console.log("  - BREVO_SMTP_USER:", process.env.BREVO_SMTP_USER || "Not set");
        console.log("  - From Email:", getFromEmail());
        
        const transporter = createEmailTransporter();
        
        // Verify connection before sending
        try {
          console.log("🔍 Verifying SMTP connection for contact form...");
          await transporter.verify();
          console.log("✅ SMTP connection verified for contact form");
        } catch (verifyError) {
          console.error("❌ SMTP verification failed for contact form:");
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
          throw verifyError; // Re-throw to be caught by outer catch
        }

        const destinationEmail =
          process.env.CONTACT_TO ||
          process.env.SMTP_FROM ||
          process.env.BREVO_FROM ||
          process.env.SMTP_USER ||
          process.env.BREVO_EMAIL;

        if (destinationEmail) {
          console.log("  - To Email:", destinationEmail);
          console.log("📤 Sending contact form email...");
          const result = await transporter.sendMail({
            from: getFromEmail(),
            to: destinationEmail,
            replyTo: email,
            subject: `New contact form message from ${name}`,
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="margin-bottom: 8px;">New message from ${name}</h2>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-line;">${message}</p>
              </div>
            `,
            text: `New message from ${name} (${email})\n\n${message}`,
          });
          console.log("✅ Contact form email sent successfully:", result.messageId);
        } else {
          console.warn("⚠️ No destination email configured for contact form");
        }
      }
    } catch (emailError) {
      console.error("❌ Error sending contact email:");
      console.error("  - Error type:", emailError instanceof Error ? emailError.constructor.name : typeof emailError);
      console.error("  - Error message:", emailError instanceof Error ? emailError.message : String(emailError));
      if (emailError instanceof Error && 'code' in emailError) {
        console.error("  - Error code:", (emailError as any).code);
      }
      if (emailError instanceof Error && 'response' in emailError) {
        console.error("  - SMTP response:", (emailError as any).response);
      }
      if (emailError instanceof Error && 'responseCode' in emailError) {
        console.error("  - SMTP response code:", (emailError as any).responseCode);
      }
      if (emailError instanceof Error && 'command' in emailError) {
        console.error("  - Failed command:", (emailError as any).command);
      }
      // Don't fail the request if email fails - message is already saved
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.issues },
        { status: 400 }
      );
    }

    console.error("Contact form error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

