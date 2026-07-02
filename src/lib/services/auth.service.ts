import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendOtp, generateOtpCode } from "./kavenegar.service";

const SESSION_DURATION_DAYS = 30;

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function generateLicenseKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segmentLength = 4;
  const segments = 4;
  const bytes = crypto.randomBytes(segmentLength * segments);
  const parts: string[] = [];
  for (let i = 0; i < segments; i++) {
    let part = "";
    for (let j = 0; j < segmentLength; j++) {
      part += chars[bytes[i * segmentLength + j] % chars.length];
    }
    parts.push(part);
  }
  return parts.join("-");
}

export async function createOtp(phone: string, purpose: "register" | "login" | "reset-password"): Promise<{ code: string; sent: boolean }> {
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await prisma.otpCode.create({
    data: {
      phone,
      code,
      purpose,
      expiresAt,
    },
  });

  // In development, always return the code for testing
  const isDev = process.env.NODE_ENV === "development";
  const sent = isDev ? true : await sendOtp(phone, code);

  if (isDev) {
    console.log(`\n📱 OTP for ${phone} [${purpose}]: ${code}\n`);
  }

  return { code: isDev ? code : "000000", sent };
}

export async function verifyOtp(phone: string, code: string, purpose: string): Promise<boolean> {
  const otp = await prisma.otpCode.findFirst({
    where: {
      phone,
      code,
      purpose,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) return false;

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { used: true },
  });

  return true;
}

export async function registerUser(username: string, phone: string, password: string) {
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ username }, { phone }] },
  });

  if (existingUser) {
    throw new Error(existingUser.username === username ? "Username already taken" : "Phone number already registered");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      username,
      phone,
      passwordHash,
    },
  });

  return createSession(user.id);
}

export async function loginWithPassword(usernameOrPhone: string, password: string) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: usernameOrPhone }, { phone: usernameOrPhone }],
    },
  });

  if (!user) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error("Invalid credentials");

  if (user.status === "suspended") throw new Error("Account suspended");

  return createSession(user.id);
}

export async function createSession(userId: string) {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, phone: true, avatar: true, role: true, status: true, walletBalance: true, createdAt: true, updatedAt: true },
  });

  return { user, token, expiresAt };
}

export async function getSession(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        select: { id: true, username: true, phone: true, avatar: true, role: true, status: true, walletBalance: true, createdAt: true, updatedAt: true },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  return session.user;
}

export async function destroySession(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}

export async function resetUserPassword(phone: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw new Error("User not found");

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  // Invalidate all existing sessions
  await prisma.session.deleteMany({ where: { userId: user.id } });
}

export { generateLicenseKey };
