export type OrderStatus =
  | "pending_payment"
  | "payment_submitted"
  | "payment_verifying"
  | "payment_confirmed"
  | "payment_rejected"
  | "license_pending"
  | "license_out_of_stock"
  | "completed"
  | "cancelled"
  | "refunded";

export interface StatusConfig {
  labelFa: string;
  labelEn: string;
  dotColor: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  highlight?: boolean;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  pending_payment: {
    labelFa: "منتظر پرداخت",
    labelEn: "Pending",
    dotColor: "#6B7280",
    bgColor: "rgba(107,114,128,0.12)",
    borderColor: "rgba(107,114,128,0.25)",
    textColor: "#9CA3AF",
  },
  payment_submitted: {
    labelFa: "پرداخت ثبت شده",
    labelEn: "Submitted",
    dotColor: "#3B82F6",
    bgColor: "rgba(59,130,246,0.12)",
    borderColor: "rgba(59,130,246,0.3)",
    textColor: "#93C5FD",
  },
  payment_verifying: {
    labelFa: "در بررسی",
    labelEn: "Verifying",
    dotColor: "#8B5CF6",
    bgColor: "rgba(139,92,246,0.12)",
    borderColor: "rgba(139,92,246,0.3)",
    textColor: "#C4B5FD",
  },
  payment_confirmed: {
    labelFa: "پرداخت تایید شد",
    labelEn: "Confirmed",
    dotColor: "#10B981",
    bgColor: "rgba(16,185,129,0.12)",
    borderColor: "rgba(16,185,129,0.3)",
    textColor: "#6EE7B7",
  },
  payment_rejected: {
    labelFa: "رد شد",
    labelEn: "Rejected",
    dotColor: "#EF4444",
    bgColor: "rgba(239,68,68,0.12)",
    borderColor: "rgba(239,68,68,0.3)",
    textColor: "#FCA5A5",
  },
  license_pending: {
    labelFa: "در انتظار لایسنس",
    labelEn: "License Pending",
    dotColor: "#F59E0B",
    bgColor: "rgba(245,158,11,0.12)",
    borderColor: "rgba(245,158,11,0.3)",
    textColor: "#FCD34D",
  },
  license_out_of_stock: {
    labelFa: "موجودی ناکافی",
    labelEn: "Out of Stock",
    dotColor: "#F97316",
    bgColor: "rgba(249,115,22,0.15)",
    borderColor: "rgba(249,115,22,0.4)",
    textColor: "#FDBA74",
  },
  completed: {
    labelFa: "تکمیل شده",
    labelEn: "Completed",
    dotColor: "#C9963A",
    bgColor: "rgba(201,150,58,0.12)",
    borderColor: "rgba(201,150,58,0.3)",
    textColor: "#F0C060",
  },
  cancelled: {
    labelFa: "لغو شده",
    labelEn: "Cancelled",
    dotColor: "#374151",
    bgColor: "rgba(55,65,81,0.12)",
    borderColor: "rgba(55,65,81,0.3)",
    textColor: "#6B7280",
  },
  refunded: {
    labelFa: "بازگشت وجه",
    labelEn: "Refunded",
    dotColor: "#EC4899",
    bgColor: "rgba(236,72,153,0.12)",
    borderColor: "rgba(236,72,153,0.3)",
    textColor: "#F9A8D4",
  },
};

export const ALL_ORDER_STATUSES: OrderStatus[] = [
  "pending_payment",
  "payment_submitted",
  "payment_verifying",
  "payment_confirmed",
  "payment_rejected",
  "license_pending",
  "license_out_of_stock",
  "completed",
  "cancelled",
  "refunded",
];

/**
 * StatusBadge component — clean colored dot + Persian label, no emoji.
 */
export function StatusBadge({ status }: { status: OrderStatus }) {
  const config = ORDER_STATUS_CONFIG[status];
  if (!config) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        color: config.textColor,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: config.dotColor }}
      />
      {config.labelFa}
    </span>
  );
}

/**
 * Get the timeline icon for a verification history action.
 */
export function getTimelineIcon(action: string): string {
  switch (action) {
    case "start_verify":
    case "payment_verifying":
      return "🔍";
    case "confirm_payment":
    case "payment_confirmed":
      return "✅";
    case "reject_payment":
    case "payment_rejected":
      return "❌";
    case "deliver_license":
    case "license_pending":
      return "🚀";
    case "completed":
      return "🎉";
    case "license_out_of_stock":
    case "out_of_stock":
      return "⚠️";
    case "cancelled":
      return "🚫";
    case "flagged":
      return "🚩";
    default:
      return "📋";
  }
}

/**
 * Get FA label for a verification history action.
 */
export function getActionLabelFa(action: string): string {
  switch (action) {
    case "order_created":
      return "سفارش ثبت شد";
    case "payment_submitted":
      return "اطلاعات پرداخت کارت به کارت ثبت شد";
    case "start_verify":
      return "بررسی پرداخت شروع شد";
    case "confirm_payment":
      return "پرداخت تایید شد";
    case "reject_payment":
      return "پرداخت رد شد";
    case "auto_deliver":
      return "لایسنس اتوماتیک صادر شد";
    case "manual_deliver":
      return "لایسنس دستی تحویل داده شد";
    case "completed":
      return "سفارش تکمیل شد";
    case "license_out_of_stock":
    case "out_of_stock":
      return "موجودی ناکافی - نیاز به تحویل دستی";
    case "cancelled":
      return "سفارش لغو شد";
    case "refunded":
      return "وجه بازگشت داده شد";
    case "flagged":
      return "سفارش به عنوان مشکوک علامت‌گذاری شد";
    case "unflagged":
      return "علامت مشکوک برداشته شد";
    case "note_added":
      return "یادداشت داخلی اضافه شد";
    default:
      return action;
  }
}
