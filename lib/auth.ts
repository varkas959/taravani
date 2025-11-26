import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Middleware to check if admin is authenticated
 * This is a basic implementation - for production, use proper session management
 */
export async function verifyAdminSession(request: NextRequest): Promise<{ id: string; email: string; name: string | null } | null> {
  try {
    // In a real implementation, you would:
    // 1. Check for httpOnly cookie with session token
    // 2. Verify JWT token or session in database
    // 3. Return admin data if valid
    
    // For now, we'll check the Authorization header as a temporary solution
    // This is NOT secure for production - implement proper session management
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    // Extract admin ID from token (in production, verify JWT)
    const adminId = authHeader.replace("Bearer ", "");
    
    // Verify admin exists
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, name: true },
    });

    return admin;
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}

/**
 * Get admin from localStorage session (client-side only)
 * This is used by client components to get admin info
 */
export function getAdminFromSession(): { id: string; email: string; name: string | null } | null {
  if (typeof window === "undefined") return null;
  
  try {
    const session = localStorage.getItem("adminSession");
    if (!session) return null;
    return JSON.parse(session);
  } catch {
    return null;
  }
}

