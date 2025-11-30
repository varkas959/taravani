import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminSession(request);
    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const read = searchParams.get("read"); // "true" or "false" or null for all
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 100;

    // Build where clause
    const where: any = {};
    if (read === "true") {
      where.read = true;
    } else if (read === "false") {
      where.read = false;
    }

    // Fetch contacts
    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminSession(request);
    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, read } = body;

    if (!id || typeof read !== "boolean") {
      return NextResponse.json(
        { message: "Invalid request. id and read (boolean) are required." },
        { status: 400 }
      );
    }

    // Update contact read status
    const contact = await prisma.contact.update({
      where: { id },
      data: { read },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error("Error updating contact:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

