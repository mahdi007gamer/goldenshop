# Course System Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add tutorial/guide links on order completion page, enhance Course admin pages with full TipTapEditor, and create professional public Course pages with file upload/password sections.

**Architecture:** Extend the existing Course/Lesson structure to include file resources and password protection. Connect orders to courses via productId relationship. Enhance UI to match Blog/Article system richness with animated cards, rich content display, and file management.

**Tech Stack:** Next.js 16 App Router, Prisma ORM, TipTapEditor, Framer Motion, SQLite

## Global Constraints

- Next.js 16 has breaking changes — read `node_modules/next/dist/docs/` before writing code
- RTL is default (FA), EN only via `/en/*` routes
- Design system: obsidian `#06090F`, gold `#C9963A`, cyber `#00F0FF`, danger `#FF3366`, success `#00FF88`
- Fonts: Cinzel/Rajdhani (display), Vazirmatn/Kalameh (FA), Inter/JetBrains Mono (EN/mono)

---

## Phase 1: Schema Updates for File Resources and Password Protection

### Task 1: Add Resource and Password Fields to Lesson Model

**Files:**
- Modify: `prisma/schema.prisma:269-285`
- Create: `prisma/migrations/20260701_add_lesson_resources/migration.sql` (auto-generated)

**Interfaces:**
- Consumes: Lesson model structure
- Produces: Extended Lesson model with fileUrl, fileName, filePassword, resourcesJson fields

- [ ] **Step 1: Update schema.prisma Lesson model**

```prisma
model Lesson {
  id         String   @id @default(cuid())
  courseId   String
  title      String
  content    String
  videoUrl   String?
  imageUrl   String?
  audioUrl   String?
  fileUrl    String?
  fileName   String?
  filePassword String?  // Optional password for protected files
  duration   Int        @default(0)
  order      Int        @default(0)
  resources  String     @default("[]")
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  course     Course     @relation(fields: [courseId], references: [id], onDelete: Cascade)
}
```

- [ ] **Step 2: Run migration**

Run: `npx prisma migrate dev --name add_lesson_resources`
Expected: Migration creates successfully, prisma client regenerated

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add fileUrl, fileName, filePassword to Lesson model"
```

---

### Task 2: Create Password Reveal Modal Component

**Files:**
- Create: `src/components/ui/PasswordModal.tsx`
- Modify: `src/components/ui/index.ts` (export the component)

**Interfaces:**
- Consumes: None
- Produces: `PasswordModal` component with `isOpen`, `onClose`, `onSubmit` props

- [ ] **Step 1: Write PasswordModal component**

```tsx
// src/components/ui/PasswordModal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/context/LangContext";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  hint?: string;
}

export function PasswordModal({ isOpen, onClose, onSubmit, hint }: PasswordModalProps) {
  const { lang } = useLang();
  const isFa = lang === "fa";
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
    setPassword("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-obsidian-light rounded-2xl border border-white/10 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Lock size={18} className="text-gold" />
                  <h3 className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-fa)" }}>
                    {isFa ? "رمز عبور فایل" : "File Password"}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {hint && (
                <div className="mb-4 p-3 rounded-lg bg-gold/5 border border-gold/20">
                  <p className="text-xs text-gold" style={{ fontFamily: "var(--font-fa)" }}>
                    {hint}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isFa ? "رمز عبور را وارد کنید..." : "Enter password..."}
                    className="w-full px-3 py-2.5 pr-10 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none"
                    style={{ fontFamily: "var(--font-fa)" }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button
                  type="submit"
                  className="btn-gold w-full mt-4 py-2.5 text-sm"
                >
                  {isFa ? "دانلود فایل" : "Download File"}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 3: Export from index**

```ts
// src/components/ui/index.ts
export { PasswordModal } from "./PasswordModal";
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/PasswordModal.tsx src/components/ui/index.ts
git commit -m "feat: add PasswordModal component for protected files"
```

---

## Phase 2: Add Tutorial/Guide Link on Order Completion

### Task 3: Update Order Status API to Include Course Link

**Files:**
- Modify: `src/app/api/orders/[id]/status/route.ts:30-63`

**Interfaces:**
- Consumes: Current order status API
- Produces: Response including `courseSlug` when order has a linked product with course

- [ ] **Step 1: Add courseSlug to response**

```ts
// src/app/api/orders/[id]/status/route.ts
const order = await prisma.order.findFirst({
  where: { id, userId: auth.user.id },
  select: {
    id: true,
    status: true,
    paymentStatus: true,
    last4Digits: true,
    createdAt: true,
    updatedAt: true,
    rejectionReason: true,
    licenseDeliveries: {
      select: {
        id: true,
        deliveredAt: true,
        method: true,
      },
    },
    licenses: {
      select: {
        id: true,
        key: true,
        status: true,
        productName: true,
        expiresAt: true,
        orderId: true,
      },
    },
    items: {
      select: {
        productName: true,
        billingCycle: true,
        productId: true,
      },
    },
  },
});

// After fetching order, query for course via productId
let courseSlug: string | null = null;
if (order?.items?.length > 0) {
  const productId = order.items[0].productId;
  if (productId) {
    const course = await prisma.course.findFirst({
      where: { productId },
      select: { slug: true },
    });
    courseSlug = course?.slug || null;
  }
}
```

```ts
// Update response data
const res = NextResponse.json({
  success: true,
  data: {
    ...order,
    courseSlug,
    remainingSeconds: Math.floor(remainingMs / 1000),
    estimatedCompletion: estimatedCompletion.toISOString(),
  },
});
```

- [ ] **Step 2: Run build to verify types**

Run: `npm run build`
Expected: Builds successfully without type errors

- [ ] **Step 3: Commit**

```bash
git add src/app/api/orders/[id]/status/route.ts
git commit -m "feat: add courseSlug to order status API for tutorial link"
```

---

### Task 4: Add Tutorial Button to OrderStatusTracker Completed State

**Files:**
- Modify: `src/components/OrderStatusTracker.tsx:294-400`

**Interfaces:**
- Consumes: `StatusResponse` with `courseSlug` field, `license` object
- Produces: "راهنمای استفاده" button linking to `/courses/[slug]` on completed state

- [ ] **Step 1: Update StatusResponse interface**

```tsx
interface StatusResponse {
  id: string;
  status: TrackedStatus;
  paymentStatus: string;
  last4Digits: string | null;
  rejectionReason: string | null;
  remainingSeconds: number;
  estimatedCompletion: string;
  courseSlug: string | null;
  licenses: StatusLicense[];
  licenseDelivery: { id: string; deliveredAt: string; method: string } | null;
  items: { productName: string; billingCycle: string; productId?: string }[];
}
```

- [ ] **Step 2: Add Tutorial button to completed state**

```tsx
// In the completed state section (line ~383), add after View Licenses button:
<Link href={courseSlug ? `/courses/${courseSlug}` : "#"}>
  <button 
    className="btn-outline-gold w-full py-3 flex items-center justify-center gap-2"
    disabled={!courseSlug}
  >
    {isFa ? "راهنمای استفاده" : "Usage Guide"}
  </button>
</Link>
```

- [ ] **Step 3: Run build to verify**

Run: `npm run build`
Expected: No TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add src/components/OrderStatusTracker.tsx
git commit -m "feat: add tutorial/guide link button to order completion page"
```

---

## Phase 3: Enhance Course Admin Pages with Full TipTapEditor

### Task 5: Update Course Edit Page to Use TipTapEditor for All Rich Content

**Files:**
- Modify: `src/app/admin/courses/[id]/edit/page.tsx`

**Interfaces:**
- Consumes: Existing edit page structure
- Produces: Full TipTapEditor for `fullDescription` and `prerequisites` fields

- [ ] **Step 1: Add TipTapEditor import and state management**

```tsx
// Add to imports
import { TipTapEditor } from "@/components/ui/TipTapEditor";

// Update form interface to include descriptionEn, prerequisitesEn
interface CourseForm {
  title: string;
  titleEn: string;
  slug: string;
  description: string;
  descriptionEn: string;
  fullDescription: string;
  fullDescriptionEn: string;
  prerequisites: string;
  prerequisitesEn: string;
  thumbnail: string;
  status: string;
  productId: string;
}
```

- [ ] **Step 2: Replace textarea for description with TipTapEditor (FA and EN)**

```tsx
{/* Full Description - Persian */}
<div className="bg-obsidian-light rounded-xl border border-white/5 overflow-hidden">
  <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2">
    <BookOpen size={14} className={isFa ? "text-gold" : "text-cyber"} />
    <span className="text-xs font-medium text-gray-300">
      {isFa ? "توضیحات کامل (فارسی)" : "Full Description (English)"}
    </span>
  </div>
  <TipTapEditor
    key={`full-${langTab}`}
    value={langTab === "fa" ? form.fullDescription : form.fullDescriptionEn}
    onChange={(v) => update(langTab === "fa" ? "fullDescription" : "fullDescriptionEn", v)}
    minHeight={300}
    dir={dir}
    placeholder={isFa ? "توضیحات کامل دوره را بنویسید..." : "Write full course description..."}
  />
</div>
```

- [ ] **Step 3: Replace textarea for prerequisites with TipTapEditor**

```tsx
{/* Prerequisites - Same pattern for FA/EN */}
<div className="bg-obsidian-light rounded-xl border border-white/5 overflow-hidden">
  <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2">
    <FileText size={14} className={isFa ? "text-gold" : "text-cyber"} />
    <span className="text-xs font-medium text-gray-300">
      {isFa ? "پیش‌نیازها (فارسی)" : "Prerequisites (English)"}
    </span>
  </div>
  <TipTapEditor
    key={`prereq-${langTab}`}
    value={langTab === "fa" ? form.prerequisites : form.prerequisitesEn}
    onChange={(v) => update(langTab === "fa" ? "prerequisites" : "prerequisitesEn", v)}
    minHeight={200}
    dir={dir}
    placeholder={isFa ? "پیش‌نیازهای دوره را بنویسید..." : "Write course prerequisites..."}
  />
</div>
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/courses/[id]/edit/page.tsx
git commit -m "feat: upgrade Course admin edit page with full TipTapEditor"
```

---

### Task 6: Create Professional File Upload Section in Lesson Admin

**Files:**
- Create: `src/components/ui/FileUploadSection.tsx`
- Modify: `src/app/admin/courses/[id]/edit/LessonsTab.tsx` (or inline in the page)

**Interfaces:**
- Consumes: Lesson form data with `fileUrl`, `fileName`, `filePassword`
- Produces: Styled file upload component with password toggle

- [ ] **Step 1: Create FileUploadSection component**

```tsx
// src/components/ui/FileUploadSection.tsx
"use client";

import { Upload, File, Link as LinkIcon, Lock, Unlock } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "@/store/toast-store";

interface FileUploadSectionProps {
  fileUrl: string;
  fileName: string;
  filePassword?: string;
  onFileUrlChange: (url: string) => void;
  onFileNameChange: (name: string) => void;
  onFilePasswordChange: (password: string) => void;
}

export function FileUploadSection({
  fileUrl, fileName, filePassword,
  onFileUrlChange, onFileNameChange, onFilePasswordChange,
}: FileUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "file");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        onFileUrlChange(json.data.url);
        onFileNameChange(file.name);
        toast.success("موفق", "فایل آپلود شد");
      } else {
        toast.error("خطا", json.error?.message || "آپلود با مشکل مواجه شد");
      }
    } catch {
      toast.error("خطا", "آپلود فایل با مشکل مواجه شد");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-xs text-gray-400 block">فایل دانلودی</label>
      
      {fileUrl ? (
        <div className="p-3 rounded-lg bg-success/5 border border-success/20">
          <div className="flex items-center gap-2 mb-2">
            <File size={14} className="text-success" />
            <span className="text-xs text-success truncate">{fileName || "فایل آپلود شده"}</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-outline-gold text-xs py-1 px-2"
            >
              {uploading ? "در حال آپلود..." : "تغییر فایل"}
            </button>
            <button
              type="button"
              onClick={() => { onFileUrlChange(""); onFileNameChange(""); }}
              className="btn-outline-danger text-xs py-1 px-2"
            >
              حذف
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={fileUrl}
            onChange={(e) => onFileUrlChange(e.target.value)}
            className="flex-1 px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30"
            placeholder="/files/download.zip"
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
          >
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            آپلود
          </button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
        </div>
      )}

      <div className="flex items-center gap-2">
        {filePassword ? <Unlock size={14} className="text-gold" /> : <Lock size={14} className="text-gray-500" />}
        <input
          type="text"
          value={filePassword || ""}
          onChange={(e) => onFilePasswordChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30"
          placeholder="رمز عبور فایل (اختیاری)..."
          dir="ltr"
        />
        {filePassword && (
          <button
            type="button"
            onClick={() => onFilePasswordChange("")}
            className="text-xs text-gray-500 hover:text-danger"
          >
            حذف
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Export from index**

```ts
// src/components/ui/index.ts
export { FileUploadSection } from "./FileUploadSection";
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/FileUploadSection.tsx
git commit -m "feat: add FileUploadSection component with password support"
```

---

## Phase 4: Enhance Public Course Page with Professional UI

### Task 7: Display File Resources in Lesson Viewer

**Files:**
- Modify: `src/app/courses/[slug]/[lessonOrder]/page.tsx:189-227`

**Interfaces:**
- Consumes: Lesson model with `fileUrl`, `fileName`, `filePassword`, `resources`
- Produces: File download section with password-protected file support

- [ ] **Step 1: Replace Resources section with enhanced version**

```tsx
{/* Enhanced Resources Section */}
{lesson.resources && lesson.resources !== "[]" && (
  <div className="mb-10 rounded-xl border border-white/10 bg-obsidian-light/50 p-6">
    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white" style={{ fontFamily: "var(--font-fa)" }}>
      <BookOpen size={18} className="text-gold" />
      منابع درس
    </h3>
    <div className="space-y-3 text-sm">
      {(() => {
        try {
          const resources = JSON.parse(lesson.resources);
          return (
            <ul className="space-y-2">
              {resources.map((r: { title?: string; url?: string; name?: string }, i: number) => (
                <li key={i}>
                  <a
                    href={r.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-cyber hover:underline"
                  >
                    <ArrowLeft size={14} className="rotate-180" />
                    {r.title || r.name || `منبع ${i + 1}`}
                  </a>
                </li>
              ))}
            </ul>
          );
        } catch {
          return <p className="text-gray-400">{lesson.resources}</p>;
        }
      })()}

      {/* File Download Section */}
      {lesson.fileUrl && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <Link
            href={`/courses/${slug}/${lesson.order}?download=true`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
          >
            <Download size={16} />
            دانلود فایل: {lesson.fileName || "فایل آموزشی"}
          </Link>
        </div>
      )}
    </div>
  </div>
)}
```

Add Download icon import: `Download` from "lucide-react"

- [ ] **Step 3: Run build to verify**

Run: `npm run build`
Expected: No TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add src/app/courses/[slug]/[lessonOrder]/page.tsx
git commit -m "feat: add file download section to lesson viewer"
```

---

### Task 8: Create Password-Protected File Download Handler

**Files:**
- Create: `src/app/courses/[slug]/[lessonOrder]/FileDownloadHandler.tsx`
- Modify: `src/app/courses/[slug]/[lessonOrder]/page.tsx`

**Interfaces:**
- Consumes: URL search params `download=true`, lesson data with `filePassword`
- Produces: Password modal for protected file downloads

- [ ] **Step 1: Update lesson page to handle password-protected downloads**

```tsx
// At the top of the page, add:
import { useSearchParams, useRouter } from "next/navigation";
import { PasswordModal } from "@/components/ui/PasswordModal";

// Inside the component, add state:
const searchParams = useSearchParams();
const router = useRouter();
const [showPasswordModal, setShowPasswordModal] = useState(false);

// Add useEffect for download handling:
useEffect(() => {
  if (searchParams.get("download") === "true" && lesson.fileUrl && lesson.filePassword) {
    setShowPasswordModal(true);
  } else if (searchParams.get("download") === "true" && lesson.fileUrl && !lesson.filePassword) {
    // Direct download for non-protected files
    window.location.href = lesson.fileUrl;
    router.replace(`#`);
  }
}, [searchParams, lesson.fileUrl, lesson.filePassword, router]);

// Add modal at the end:
<PasswordModal
  isOpen={showPasswordModal}
  onClose={() => {
    setShowPasswordModal(false);
    router.replace(`#`);
  }}
  onSubmit={(password) => {
    if (password === lesson.filePassword) {
      window.location.href = lesson.fileUrl!;
    } else {
      toast.error("خطا", "رمز عبور اشتباه است");
    }
    setShowPasswordModal(false);
    router.replace(`#`);
  }}
  hint="رمز عبور فایل را وارد کنید"
/>
```

- [ ] **Step 2: Run build to verify**

Run: `npm run build`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add src/app/courses/[slug]/[lessonOrder]/page.tsx
git commit -m "feat: add password-protected file download handler to lesson page"
```

---

## Phase 5: Professional Public Course UI Enhancements

### Task 9: Add File Upload Section to Public Course Page

**Files:**
- Modify: `src/app/courses/[slug]/page.tsx:213-243`

**Interfaces:**
- Consumes: Course with lessons containing file resources
- Produces: Dedicated sections for downloadable files and protected resources

- [ ] **Step 1: Add file resources summary to course page**

```tsx
{/* Files Section - New */}
{course.lessons.some(l => l.fileUrl) && (
  <div className="mt-8 rounded-xl border border-white/10 bg-obsidian-light/50 p-6">
    <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white" style={{ fontFamily: "var(--font-fa)" }}>
      <Download size={20} className="text-gold" />
      فایل‌های قابل دانلود
    </h2>
    <div className="space-y-3">
      {course.lessons
        .filter(l => l.fileUrl)
        .map((lesson, idx) => (
          <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg bg-obsidian border border-white/5">
            <div className="flex items-center gap-2">
              <File size={16} className={lesson.filePassword ? "text-amber-400" : "text-success"} />
              <span className="text-sm text-white" style={{ fontFamily: "var(--font-fa)" }}>
                {lesson.fileName || `فایل درس ${lesson.order}`}
              </span>
              {lesson.filePassword && (
                <Lock size={12} className="text-amber-400" />
              )}
            </div>
            <Link
              href={`/courses/${slug}/${lesson.order}?download=true`}
              className="text-xs text-gold hover:underline"
            >
              دانلود
            </Link>
          </div>
        ))}
    </div>
  </div>
)}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/courses/[slug]/page.tsx
git commit -m "feat: add downloadable files section to public course page"
```

---

### Task 10: Add Password-Protected Files Section

**Files:**
- Modify: `src/app/courses/[slug]/page.tsx`

**Interfaces:**
- Consumes: Course lessons with `filePassword`
- Produces: Visual indicator for password-protected resources

- [ ] **Step 1: Add password-protected files indicator**

```tsx
{/* Password Protected Resources - New */}
{course.lessons.some(l => l.filePassword) && (
  <div className="mt-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
    <div className="flex items-center gap-2 mb-2">
      <Lock size={16} className="text-amber-400" />
      <span className="text-sm font-medium text-amber-300" style={{ fontFamily: "var(--font-fa)" }}>
        منابع رمزدار
      </span>
    </div>
    <p className="text-xs text-amber-300/70" style={{ fontFamily: "var(--font-fa)" }}>
      برخی فایل‌های این دوره نیاز به رمز عبور دارند. پس از خرید، رمز عبور را دریافت خواهید کرد.
    </p>
  </div>
)}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/courses/[slug]/page.tsx
git commit -m "feat: add password-protected files indicator to course page"
```

---

## Phase 6: Integrate Everything and Test

### Task 11: Update API to Pass Course Data to Lessons

**Files:**
- Modify: `src/app/api/admin/courses/[id]/lessons/route.ts`
- Modify: `src/app/api/courses/[id]/route.ts` (if exists)

**Interfaces:**
- Consumes: Lesson creation/update with new fields
- Produces: API accepting `filePassword` field

- [ ] **Step 1: Update admin lessons API to include filePassword**

```ts
// src/app/api/admin/courses/[id]/lessons/route.ts
// In POST method - add to destructuring:
const { title, content, videoUrl, imageUrl, audioUrl, fileUrl, fileName, filePassword, duration, order, resources } = body;

// In create data - add filePassword:
const lesson = await prisma.lesson.create({
  data: {
    courseId,
    title,
    content: content || "",
    videoUrl: videoUrl || null,
    imageUrl: imageUrl || null,
    audioUrl: audioUrl || null,
    fileUrl: fileUrl || null,
    fileName: fileName || null,
    filePassword: filePassword || null,
    duration: duration || 0,
    order: order ?? (lastLesson?.order ?? 0) + 1,
    resources: Array.isArray(resources) ? JSON.stringify(resources) : resources || "[]",
  },
});
```

- [ ] **Step 2: Add filePassword to PUT method**

```ts
// In PUT method data object:
if (filePassword !== undefined) data.filePassword = filePassword;
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/courses/[id]/lessons/route.ts
git commit -m "feat: add filePassword field to lessons API"
```

---

### Task 12: Final Integration and Build Verification

**Files:**
- None (verification step)

**Interfaces:**
- Consumes: All previous changes
- Produces: Working system

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: Successful build with no errors

- [ ] **Step 2: Run linter**

Run: `npm run lint`
Expected: No linting errors

- [ ] **Step 3: Update session log**

```md
# Session Log Update

## 2026-07-01 - Course System Enhancement
- Committed existing schema/seed changes
- Added fileUrl, fileName, filePassword to Lesson model
- Created PasswordModal component
- Added tutorial/guide link on order completion page
- Enhanced Course admin pages with TipTapEditor
- Created FileUploadSection component for admin
- Enhanced public course/lesson pages with file sections
- Connected orders to courses via productId
```

- [ ] **Step 4: Commit**

```bash
git add memory/session-log.md
git commit -m "docs: record course system enhancement session"
```

---

## Self-Review Checklist

1. **Spec coverage:**
   - ✅ Tutorial/Guide link on order completion - Task 4
   - ✅ Course admin pages with TipTapEditor - Task 5
   - ✅ File upload section - Task 6
   - ✅ Password-protected files - Tasks 2, 8, 10
   - ✅ Step-by-step guide section - Already exists via TipTapEditor in lessons

2. **Placeholder scan:** No placeholders found - all code is concrete

3. **Type consistency:** All interfaces defined with concrete types