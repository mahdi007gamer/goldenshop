import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAuth, sanitizeString } from "@/lib/auth-utils";

// GET /api/users/[id] — Get user profile (own profile or admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;

    // Users can only view their own profile (admins can view any)
    if (auth.user.id !== id && auth.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        walletBalance: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to get user";
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message } },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] — Update user profile (own profile or admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;

    // Users can only update their own profile (admins can update any)
    if (auth.user.id !== id && auth.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const username = body.username !== undefined ? sanitizeString(body.username, 50) : undefined;
    const phone = body.phone !== undefined ? sanitizeString(body.phone, 20) : undefined;
    const { currentPassword, newPassword } = body;

    // If changing password
    if (currentPassword && newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: "Password must be at least 6 characters" } },
          { status: 400 }
        );
      }

      // Verify current password
      const targetUser = await prisma.user.findUnique({ where: { id } });
      if (!targetUser) {
        return NextResponse.json(
          { success: false, error: { code: "USER_NOT_FOUND", message: "User not found" } },
          { status: 404 }
        );
      }

      const valid = await bcrypt.compare(currentPassword, targetUser.passwordHash);
      if (!valid) {
        return NextResponse.json(
          { success: false, error: { code: "INVALID_PASSWORD", message: "Current password is incorrect" } },
          { status: 400 }
        );
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({ where: { id }, data: { passwordHash } });

      // Invalidate all sessions for security
      await prisma.session.deleteMany({ where: { userId: id } });

      return NextResponse.json({
        success: true,
        data: { message: "Password changed successfully. Please login again." },
      });
    }

    // Update profile fields
    const updateData: Record<string, string> = {};

    if (username !== undefined) {
      if (username.length < 3) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: "Username must be at least 3 characters" } },
          { status: 400 }
        );
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: "Username can only contain letters, numbers, and underscores" } },
          { status: 400 }
        );
      }
      // Check uniqueness
      const existing = await prisma.user.findFirst({
        where: { username, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: { code: "DUPLICATE_USERNAME", message: "Username already taken" } },
          { status: 400 }
        );
      }
      updateData.username = username;
    }

    if (phone !== undefined) {
      if (!/^09\d{9}$/.test(phone)) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: "Phone must be 11 digits starting with 09" } },
          { status: 400 }
        );
      }
      // Check uniqueness
      const existing = await prisma.user.findFirst({
        where: { phone, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: { code: "DUPLICATE_PHONE", message: "Phone number already registered" } },
          { status: 400 }
        );
      }
      updateData.phone = phone;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "NO_CHANGES", message: "No valid fields to update" } },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        walletBalance: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update user";
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message } },
      { status: 500 }
    );
  }
}
