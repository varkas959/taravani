import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { verifyAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Check if we're on Vercel (read-only filesystem)
const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;

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

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const readingId = formData.get("readingId") as string;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    if (!readingId) {
      return NextResponse.json(
        { message: "Reading ID is required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { message: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { message: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Get file data
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${readingId}-${timestamp}.pdf`;

    let pdfPath: string | null = null;
    let pdfData: string | null = null;

    if (isVercel) {
      // On Vercel: Store as base64 in database
      pdfData = buffer.toString("base64");
    } else {
      // Local development: Save to file system
      try {
        const uploadsDir = join(process.cwd(), "public", "uploads");
        await mkdir(uploadsDir, { recursive: true });
        const filepath = join(uploadsDir, filename);
        await writeFile(filepath, buffer);
        pdfPath = `/uploads/${filename}`;
      } catch (error) {
        // If file system write fails, fall back to base64 storage
        console.warn("Failed to write to file system, using base64 storage:", error);
        pdfData = buffer.toString("base64");
      }
    }

    // Update reading with PDF data
    await prisma.reading.update({
      where: { id: readingId },
      data: {
        reportPdfPath: pdfPath,
        reportPdfData: pdfData,
      },
    });

    return NextResponse.json({
      success: true,
      message: "PDF uploaded successfully",
      path: pdfPath || "stored in database",
    });
  } catch (error) {
    console.error("Error uploading PDF:", error);
    return NextResponse.json(
      { message: "Failed to upload PDF", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

