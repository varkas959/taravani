import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifyAdminSession } from "@/lib/auth";

const updateSchema = z.object({
  reportText: z.string().optional(),
  status: z.enum(["NEW", "IN_PROGRESS", "SENT", "FAILED"]).optional(),
  sendEmail: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminSession(request);
    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const reading = await prisma.reading.findUnique({
      where: { id },
    });

    if (!reading) {
      return NextResponse.json(
        { message: "Reading not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(reading);
  } catch (error) {
    console.error("Error fetching reading:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminSession(request);
    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateSchema.parse(body);

    const updateData: any = {};
    if (validated.reportText !== undefined) {
      updateData.reportText = validated.reportText;
    }
    if (validated.status !== undefined) {
      updateData.status = validated.status;
    }
    if (validated.status === "SENT" && validated.sendEmail) {
      updateData.reportSentAt = new Date();
    }

    const reading = await prisma.reading.update({
      where: { id },
      data: updateData,
    });

    // If sendEmail is true, trigger email sending
    if (validated.sendEmail && reading.reportText) {
      try {
        await fetch(`${request.nextUrl.origin}/api/admin/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            readingId: reading.id,
            email: reading.email,
            reportText: reading.reportText,
            name: reading.name,
            pdfPath: reading.reportPdfPath,
            pdfData: reading.reportPdfData,
          }),
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Update status to FAILED if email fails
        await prisma.reading.update({
          where: { id: reading.id },
          data: { status: "FAILED" },
        });
      }
    }

    return NextResponse.json(reading);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating reading:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
