import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * This endpoint should be called by a cron job or scheduled function daily
 * to delete readings where delete_at <= now()
 */
export async function POST(request: NextRequest) {
  try {
    // Verify this is an authorized request (e.g., from a cron service with a secret)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();
    
    // Delete readings where delete_at <= now()
    const result = await prisma.reading.deleteMany({
      where: {
        deleteAt: {
          lte: now,
        },
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      deletedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Error cleaning up old readings:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Also allow GET for manual testing
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    
    const result = await prisma.reading.deleteMany({
      where: {
        deleteAt: {
          lte: now,
        },
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      deletedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Error cleaning up old readings:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

