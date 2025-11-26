import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createEmailTransporter, getFromEmail, isEmailConfigured } from "@/lib/email";

const submissionSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  dateOfBirth: z.string(),
  timeOfBirth: z.string(),
  approximateTime: z.boolean().optional().default(false),
  placeOfBirth: z.string().min(1, "Place of birth is required"),
  focusArea: z.enum(["Career", "Relationships", "Health", "Money", "General"]),
  consent1: z.boolean().refine((val) => val === true, "Consent 1 is required"),
  consent2: z.boolean().refine((val) => val === true, "Consent 2 is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validated = submissionSchema.parse(body);
    
    // Calculate delete_at (30 days from now)
    const deleteAt = new Date();
    deleteAt.setDate(deleteAt.getDate() + 30);
    
    // Create reading
    const reading = await prisma.reading.create({
      data: {
        name: validated.fullName,
        email: validated.email,
        dob: new Date(validated.dateOfBirth),
        timeOfBirth: validated.timeOfBirth,
        placeOfBirth: validated.placeOfBirth,
        focusArea: validated.focusArea,
        status: "NEW",
        deleteAt: deleteAt,
      },
    });

    // Send confirmation email (don't block on email failure)
    try {
      await sendConfirmationEmail(validated.email, validated.fullName);
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      { success: true, id: reading.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.issues },
        { status: 400 }
      );
    }
    
    console.error("Error creating reading:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

async function sendConfirmationEmail(email: string, name: string) {
  // If no email credentials are configured, skip sending
  if (!isEmailConfigured()) {
    console.log("Email not configured. Confirmation email would be sent to:", email);
    return;
  }

  // Create email transporter
  const transporter = createEmailTransporter();

  // Send confirmation email
  await transporter.sendMail({
    from: getFromEmail(),
    to: email,
    subject: `We've Received Your Reading Request - Taravani`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #0a0e27;">
        <h1 style="font-family: serif; color: #0a0e27; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
          Thank You, ${name}!
        </h1>
        <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
          We've successfully received your birth chart reading request.
        </p>
        <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-left: 4px solid #6366f1; border-radius: 4px;">
          <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #0a0e27;">
            <strong>Your personalized report will be delivered to this email address within 48 hours.</strong>
          </p>
        </div>
        <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
          Our professional astrologer is now preparing your detailed, human-written birth chart reading based on the information you provided.
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
          You'll receive your complete report directly in your inbox. No need to download anything or visit any links.
        </p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="font-size: 14px; color: #4a5568; margin: 0;">
            <strong>What happens next?</strong><br>
            • Your reading is being personally written by our astrologer<br>
            • You'll receive it within 48 hours<br>
            • Your details are stored securely for 30 days, then permanently deleted
          </p>
        </div>
        <p style="font-size: 12px; color: #8a8a9e; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          If you have any questions, please don't hesitate to contact us.
        </p>
        <p style="font-size: 12px; color: #8a8a9e; margin-top: 10px;">
          Best regards,<br>
          <strong style="color: #0a0e27;">Taravani</strong>
        </p>
      </div>
    `,
    text: `
Thank You, ${name}!

We've successfully received your birth chart reading request.

Your personalized report will be delivered to this email address within 48 hours.

Our professional astrologer is now preparing your detailed, human-written birth chart reading based on the information you provided.

You'll receive your complete report directly in your inbox. No need to download anything or visit any links.

What happens next?
• Your reading is being personally written by our astrologer
• You'll receive it within 48 hours
• Your details are stored securely for 30 days, then permanently deleted

If you have any questions, please don't hesitate to contact us.

Best regards,
Taravani
    `,
  });
}
