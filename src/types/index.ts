// ============================================
// Core Domain Types (extended from existing)
// ============================================

export type GameType = "Dota 2" | "R6 Siege" | "Valorant" | "CS2" | "Apex Legends";
export type CategoryType = "Aimbot" | "Wallhack" | "ESP Overlay" | "HWID Spoofer" | "Skin Changer" | "Radar";
export type BillingCycle = "daily" | "weekly" | "monthly" | "lifetime";

// ============================================
// User & Auth
// ============================================

export interface User {
  id: string;
  username: string;
  phone: string;
  passwordHash?: string;
  avatar?: string | null;
  role: "user" | "admin";
  status: "active" | "suspended";
  walletBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface OtpCode {
  id: string;
  phone: string;
  code: string;
  purpose: "register" | "login" | "reset-password";
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

// ============================================
// Product
// ============================================

export interface Product {
  id: string;
  name: string;
  nameFa?: string | null;
  nameEn?: string | null;
  slug: string;
  slugEn?: string | null;
  game: GameType | string;
  category: CategoryType | string;
  categoryEn?: string | null;
  price: number;
  salePrice?: number | null;
  priceDaily?: number | null;
  priceWeekly?: number | null;
  priceMonthly?: number | null;
  priceLifetime?: number | null;
  rating: number;
  reviewsCount: number;
  features: string[];
  featuresFa?: string[];
  featuresEn?: string[];
  description: string;
  descriptionFa?: string | null;
  descriptionEn?: string | null;
  shortDesc?: string | null;
  shortDescFa?: string | null;
  shortDescEn?: string | null;
  longDescription?: string | null;
  isPopular: boolean;
  status: "active" | "inactive";
  bypassRate: string;
  updateStatus: "Undetected" | "Updating" | "Testing";
  imageUrl?: string | null;
  bannerImage?: string | null;
  galleryImages?: string[];
  galleryItems?: GalleryItem[];
  featuresDetail?: FeatureDetail[];
  videoUrl?: string | null;
  audioUrl?: string | null;
  // SEO fields
  metaTitle?: string | null;
  metaTitleFa?: string | null;
  metaTitleEn?: string | null;
  metaDescription?: string | null;
  metaDescriptionFa?: string | null;
  metaDescriptionEn?: string | null;
  focusKeyphrase?: string | null;
  focusKeyphraseFa?: string | null;
  focusKeyphraseEn?: string | null;
  metaKeywords?: string[];
  metaKeywordsFa?: string[];
  metaKeywordsEn?: string[];
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogTitleEn?: string | null;
  ogDescriptionEn?: string | null;
  ogImage?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterTitleEn?: string | null;
  twitterDescriptionEn?: string | null;
  twitterImage?: string | null;
  canonicalUrl?: string | null;
  schemaType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItem {
  url: string;
  captionFa?: string;
  captionEn?: string;
  order?: number;
}

export interface FeatureDetail {
  titleFa: string;
  titleEn: string;
  descriptionFa?: string;
  descriptionEn?: string;
  icon?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  billingCycle: BillingCycle;
}

// ============================================
// Order
// ============================================

export type OrderStatus =
  | "pending_payment"
  | "payment_submitted"
  | "payment_verifying"
  | "payment_confirmed"
  | "payment_rejected"
  | "processing"
  | "completed"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "submitted" | "verified" | "rejected" | "awaiting_license";

export type LicenseStatus = "available" | "reserved" | "assigned";

export interface OrderStatusConfig {
  label: { fa: string; en: string };
  color: string;
  bgColor: string;
  icon: string;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, OrderStatusConfig> = {
  pending_payment: {
    label: { fa: "در انتظار پرداخت", en: "Pending Payment" },
    color: "#F59E0B",
    bgColor: "rgba(245,158,11,0.15)",
    icon: "Clock",
  },
  payment_submitted: {
    label: { fa: "پرداخت ثبت شده", en: "Payment Submitted" },
    color: "#3B82F6",
    bgColor: "rgba(59,130,246,0.15)",
    icon: "Upload",
  },
  payment_verifying: {
    label: { fa: "در حال بررسی", en: "Verifying" },
    color: "#8B5CF6",
    bgColor: "rgba(139,92,246,0.15)",
    icon: "Search",
  },
  payment_confirmed: {
    label: { fa: "تأیید پرداخت", en: "Payment Confirmed" },
    color: "#06B6D4",
    bgColor: "rgba(6,182,212,0.15)",
    icon: "CheckCircle",
  },
  payment_rejected: {
    label: { fa: "رد پرداخت", en: "Payment Rejected" },
    color: "#EF4444",
    bgColor: "rgba(239,68,68,0.15)",
    icon: "XCircle",
  },
  processing: {
    label: { fa: "در حال پردازش", en: "Processing" },
    color: "#F97316",
    bgColor: "rgba(249,115,22,0.15)",
    icon: "Loader",
  },
  completed: {
    label: { fa: "تکمیل شده", en: "Completed" },
    color: "#22C55E",
    bgColor: "rgba(34,197,94,0.15)",
    icon: "CheckCircle",
  },
  cancelled: {
    label: { fa: "لغو شده", en: "Cancelled" },
    color: "#6B7280",
    bgColor: "rgba(107,114,128,0.15)",
    icon: "Ban",
  },
  refunded: {
    label: { fa: "بازگشت وجه", en: "Refunded" },
    color: "#EC4899",
    bgColor: "rgba(236,72,153,0.15)",
    icon: "RotateCcw",
  },
};

export interface BankCard {
  id: string;
  cardNumber: string;
  shebaNumber: string;
  bankName: string;
  accountHolder: string;
  isActive: boolean;
  isDefault?: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus | "pending" | "paid" | "active" | "expired" | "cancelled" | "refunded";
  paymentMethod: "wallet" | "card-to-card";
  billingCycle: BillingCycle;
  promoCode?: string | null;
  createdAt: string;
  updatedAt: string;
  // Extended fields for card-to-card payment
  bankCardId?: string | null;
  last4Digits?: string | null;
  transactionTime?: string | null;
  receiptNote?: string | null;
  userNote?: string | null;
  rejectionReason?: string | null;
  isEditable?: boolean;
  // Payment tracking
  paymentStatus?: PaymentStatus;
  receiptImage?: string | null;
  exchangeRate?: number | null;
  priceUSD?: number | null;
  priceToman?: number | null;
  assignedLicenseIds?: string[]; // JSON array of license IDs
  // Included relations
  licenses?: Array<{
    key: string;
    status: string;
    productName: string;
    expiresAt: string;
  }>;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  billingCycle: BillingCycle;
}

// ============================================
// License
// ============================================

export interface License {
  id: string;
  key: string;
  orderId: string;
  userId: string;
  productId: string;
  productName: string;
  game: string;
  status: "active" | "expired" | "revoked" | "hardware-locked";
  hwid?: string | null;
  activatedAt?: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface LicenseInventory {
  id: string;
  productId: string;
  licenseKey: string; // Encrypted — only decrypted for admin viewing
  status: "available" | "reserved" | "assigned";
  orderId: string | null;
  assignedAt: string | null;
  createdAt: string;
  // Included relations
  product?: Product;
}

export interface GeneratedLicense {
  id: string;
  productName: string;
  game: string;
  licenseKey: string;
  purchaseDate: string;
  expiryDate: string;
  status: "Active" | "Expired" | "Hardware Locked";
  hwid: string;
}

// ============================================
// Ticket
// ============================================

export interface Ticket {
  id: string;
  userId: string;
  subject: string;
  game: string;
  status: "open" | "answered" | "pending" | "closed";
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userName: string;
  subject: string;
  game: string;
  status: "Open" | "Replied" | "Resolved";
  date: string;
  messages: {
    role: "user" | "guardian" | "staff";
    text: string;
    timestamp: string;
  }[];
}

// ============================================
// Wallet
// ============================================

export interface WalletTransaction {
  id: string;
  userId: string;
  type: "deposit" | "withdrawal" | "purchase" | "refund" | "promo";
  amount: number;
  balance: number;
  description: string;
  referenceId?: string | null;
  status: "completed" | "pending" | "failed";
  createdAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount: number;
  discountType: "percent" | "fixed";
  maxUses?: number | null;
  usedCount: number;
  expiresAt?: string | null;
  active: boolean;
  createdAt: string;
}

export interface CardToCardPayment {
  id: string;
  userId: string;
  amount: number;
  cardNumber: string;
  reference: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedAt?: string | null;
}

// ============================================
// Course
// ============================================

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string | null;
  category: string;
  game: string;
  status: "published" | "draft";
  productId?: string | null;
  createdAt: string;
  updatedAt: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  videoUrl?: string | null;
  imageUrl?: string | null;
  audioUrl?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  duration: number;
  order: number;
  resources: Resource[];
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  name: string;
  url: string;
  type: "pdf" | "zip" | "link" | "image" | "video" | "audio" | "file";
}

// ============================================
// Article / Blog
// ============================================

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string | null;
  authorId: string;
  authorName: string;
  category: string;
  tags: string[];
  status: "published" | "draft";
  readingTime: number;
  views: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Notification
// ============================================

export interface Notification {
  id: string;
  userId: string;
  type: "order" | "license" | "ticket" | "system" | "wallet";
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
}

// ============================================
// Legacy (kept for backwards compatibility)
// ============================================

export interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: "WAF_BLOCK" | "SQLI_PREVENTED" | "XSS_FILTER" | "AUTH_JWT" | "2FA_VERIFY";
  ip: string;
  details: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
}

export interface LegacyUserSession {
  loggedIn: boolean;
  username: string;
  tfaEnabled: boolean;
  role?: "user" | "admin";
}

export interface Testimonial {
  id: string;
  name: string;
  game: string;
  rating: number;
  text: string;
  date: string;
  avatar: string;
}

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
  duration?: number;
}

// ============================================
// Auth Form Types
// ============================================

export interface LoginInput {
  usernameOrPhone: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  phone: string;
  password: string;
}

export interface OtpVerifyInput {
  phone: string;
  code: string;
  purpose: "register" | "login" | "reset-password";
}

export interface ResetPasswordInput {
  phone: string;
  code: string;
  newPassword: string;
}
