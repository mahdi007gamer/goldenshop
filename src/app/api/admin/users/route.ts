import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAdmin, sanitizeString, sanitizePhone, parsePositiveInt } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const search = sanitizeString(searchParams.get("search"));
    const role = sanitizeString(searchParams.get("role"));
    const status = sanitizeString(searchParams.get("status"));
    const take = parsePositiveInt(searchParams.get("take"), 50);
    const skip = parsePositiveInt(searchParams.get("skip"), 0);
    const where: Record<string, unknown> = {};
    if (search) where.OR = [{ username: { contains: search } }, { phone: { contains: search } }];
    if (role) where.role = role;
    if (status) where.status = status;
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, select: { id: true, username: true, phone: true, role: true, status: true, walletBalance: true, createdAt: true, updatedAt: true }, orderBy: { createdAt: "desc" }, take, skip }),
      prisma.user.count({ where }),
    ]);
    return NextResponse.json({ success: true, data: { users, total } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "USERS_ERROR", message: "Failed to load users" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const username = sanitizeString(body.username, 100);
    const phone = sanitizePhone(body.phone);
    const password = body.password;
    const role = body.role === "admin" ? "admin" : "user";
    const walletBalance = body.walletBalance !== undefined ? parseFloat(body.walletBalance) : 0;

    if (!username || !phone || !password) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Username, phone, and password are required" } }, { status: 400 });
    }
    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Phone must be 11 digits starting with 09" } }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Password must be at least 6 characters" } }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({ where: { OR: [{ username }, { phone }] } });
    if (existing) return NextResponse.json({ success: false, error: { code: "DUPLICATE_USER", message: "Username or phone already exists" } }, { status: 400 });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { username, phone, passwordHash, role, walletBalance: isNaN(walletBalance) ? 0 : walletBalance, status: "active" },
      select: { id: true, username: true, phone: true, role: true, status: true, walletBalance: true, createdAt: true },
    });
    return NextResponse.json({ success: true, data: user });
  } catch {
    return NextResponse.json({ success: false, error: { code: "CREATE_USER_ERROR", message: "Failed to create user" } }, { status: 500 });
  }
}
