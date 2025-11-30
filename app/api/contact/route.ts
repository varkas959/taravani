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
        const transporter = createEmailTransporter();

        const destinationEmail =
          process.env.CONTACT_TO ||
          process.env.SMTP_FROM ||
          process.env.BREVO_FROM ||
          process.env.SMTP_USER ||
          process.env.BREVO_EMAIL;

        if (destinationEmail) {
          await transporter.sendMail({
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
        }
      }
    } catch (emailError) {
      console.error("Error sending contact email:", emailError);
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

