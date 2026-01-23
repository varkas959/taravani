import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createOrderSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  dateOfBirth: z.string(),
  timeOfBirth: z.string(),
  approximateTime: z.boolean().optional().default(false),
  placeOfBirth: z.string().min(1),
  focusArea: z.enum(["Career", "Relationships", "Health", "Money", "General"]),
  consent1: z.boolean().refine((val) => val === true),
  consent2: z.boolean().refine((val) => val === true),
});

export async function POST(request: NextRequest) {
  try {
    // Check Razorpay credentials first
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay credentials not configured");
      return NextResponse.json(
        { message: "Razorpay credentials not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validated = createOrderSchema.parse(body);
    
    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Amount in paise (₹499 = 49900 paise)
    const amount = 49900;

    // Calculate delete_at (30 days from now)
    const deleteAt = new Date();
    deleteAt.setDate(deleteAt.getDate() + 30);

    // Create reading with PENDING payment status
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
        paymentStatus: "PENDING",
        amount: amount,
      },
    });

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: `reading_${reading.id}`,
      notes: {
        readingId: reading.id,
        name: validated.fullName,
        email: validated.email,
      },
    });

    // Update reading with Razorpay order ID
    await prisma.reading.update({
      where: { id: reading.id },
      data: { razorpayOrderId: order.id },
    });

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
        readingId: reading.id,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.issues);
      return NextResponse.json(
        { message: "Validation error", errors: error.issues },
        { status: 400 }
      );
    }
    
    console.error("Error creating Razorpay order:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Internal server error", error: errorMessage },
      { status: 500 }
    );
  }
}

