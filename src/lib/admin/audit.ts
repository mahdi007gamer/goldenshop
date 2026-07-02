import { prisma } from "@/lib/prisma";

interface AuditLogEntry {
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  targetRef?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Write an admin action to the audit log.
 * Fire-and-forget — errors are logged but never thrown.
 */
export async function logAdminAction(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId: entry.adminId,
        adminName: entry.adminName,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId,
        targetRef: entry.targetRef || null,
        before: JSON.stringify(entry.before || {}),
        after: JSON.stringify(entry.after || {}),
        ipAddress: entry.ipAddress || null,
        userAgent: entry.userAgent || null,
      },
    });
  } catch (err) {
    console.error("[AUDIT] Failed to log admin action:", err);
  }
}

/**
 * Build a verification history entry and append to existing JSON array.
 */
export function appendVerificationHistory(
  existingJson: string | null,
  entry: { action: string; by: string; at: string; note?: string }
): string {
  try {
    const arr = existingJson ? JSON.parse(existingJson) : [];
    if (!Array.isArray(arr)) return JSON.stringify([entry]);
    arr.push(entry);
    return JSON.stringify(arr);
  } catch {
    return JSON.stringify([entry]);
  }
}
