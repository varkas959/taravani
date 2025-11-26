import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createEmailTransporter, getFromEmail, isEmailConfigured } from "@/lib/email";

const verifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  readingId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = verifySchema.parse(body);

    // Verify signature
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const text = `${validated.razorpay_order_id}|${validated.razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest("hex");

    if (generatedSignature !== validated.razorpay_signature) {
      return NextResponse.json(
        { message: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Find reading
    const reading = await prisma.reading.findUnique({
      where: { id: validated.readingId },
    });

    if (!reading) {
      return NextResponse.json(
        { message: "Reading not found" },
        { status: 404 }
      );
    }

    // Update reading with payment details
    await prisma.reading.update({
      where: { id: validated.readingId },
      data: {
        razorpayPaymentId: validated.razorpay_payment_id,
        paymentStatus: "PAID",
      },
    });

    // Send confirmation email (don't block on email failure)
    try {
      await sendConfirmationEmail(reading.email, reading.name);
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      { success: true, message: "Payment verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.issues },
        { status: 400 }
      );
    }

    console.error("Error verifying payment:", error);
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
          We've successfully received your birth chart reading request and payment.
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

We've successfully received your birth chart reading request and payment.

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

