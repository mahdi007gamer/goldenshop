import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeString } from "@/lib/auth-utils";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const game = await prisma.game.findUnique({ where: { id } });
    if (!game) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Game not found" } }, { status: 404 });
    return NextResponse.json({ success: true, data: game });
  } catch {
    return NextResponse.json({ success: false, error: { code: "GAME_ERROR", message: "Failed to load game" } }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const existing = await prisma.game.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Game not found" } }, { status: 404 });
    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = sanitizeString(body.name, 100);
    if (body.nameEn !== undefined) data.nameEn = sanitizeString(body.nameEn, 100) || null;
    if (body.slug !== undefined) data.slug = sanitizeString(body.slug, 100);
    if (body.slugEn !== undefined) data.slugEn = sanitizeString(body.slugEn, 100) || null;
    if (body.description !== undefined) data.description = sanitizeString(body.description, 1000) || null;
    if (body.descriptionEn !== undefined) data.descriptionEn = sanitizeString(body.descriptionEn, 1000) || null;
    if (body.iconUrl !== undefined) data.iconUrl = sanitizeString(body.iconUrl, 500) || null;
    if (body.bannerUrl !== undefined) data.bannerUrl = sanitizeString(body.bannerUrl, 500) || null;
    if (body.accentColor !== undefined) data.accentColor = sanitizeString(body.accentColor, 20) || "#C9963A";
    if (body.gradientFrom !== undefined) data.gradientFrom = sanitizeString(body.gradientFrom, 50) || null;
    if (body.gradientTo !== undefined) data.gradientTo = sanitizeString(body.gradientTo, 50) || null;
    if (body.sortOrder !== undefined) data.sortOrder = parseInt(body.sortOrder) || 0;
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (body.metaTitle !== undefined) data.metaTitle = sanitizeString(body.metaTitle, 200) || null;
    if (body.metaTitleEn !== undefined) data.metaTitleEn = sanitizeString(body.metaTitleEn, 200) || null;
    if (body.metaDescription !== undefined) data.metaDescription = sanitizeString(body.metaDescription, 500) || null;
    if (body.metaDescriptionEn !== undefined) data.metaDescriptionEn = sanitizeString(body.metaDescriptionEn, 500) || null;
    const game = await prisma.game.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: game, message: `Game "${game.name}" updated` });
  } catch (err: unknown) {
    const message = err instanceof Error && err.message.includes("Unique") ? "A game with this slug already exists" : "Failed to update game";
    return NextResponse.json({ success: false, error: { code: "UPDATE_GAME_ERROR", message } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const existing = await prisma.game.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Game not found" } }, { status: 404 });
    await prisma.game.delete({ where: { id } });
    return NextResponse.json({ success: true, data: { message: `Game "${existing.name}" deleted` } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "DELETE_GAME_ERROR", message: "Failed to delete game" } }, { status: 500 });
  }
}
