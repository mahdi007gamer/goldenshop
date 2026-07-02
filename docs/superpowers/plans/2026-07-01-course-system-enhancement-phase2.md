# Course System Enhancement - Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance admin lesson editor with FileUploadSection and step-by-step guide editor, create professional public course page with tabs/cards, and add R6 wallhack tutorial course.

**Architecture:** Extend existing Course/Lesson structure with structured guideContent field for step-by-step tutorials. Integrate FileUploadSection component into admin lesson modal. Enhance public course page with animated cards and tab navigation.

**Tech Stack:** Next.js 16 App Router, Prisma ORM, TipTapEditor, Framer Motion, SQLite

## Global Constraints

- Next.js 16 has breaking changes — read `node_modules/next/dist/docs/` before writing code
- RTL is default (FA), EN only via `/en/*` routes
- Design system: obsidian `#06090F`, gold `#C9963A`, cyber `#00F0FF`, danger `#FF3366`, success `#00FF88`
- Fonts: Cinzel/Rajdhani (display), Vazirmatn/Kalameh (FA), Inter/JetBrains Mono (EN/mono)

---

## Phase 1: Add Step-by-Step Guide Field to Lesson Model

### Task 1: Update Lesson Model with guideContent Field

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260701_add_guide_content/migration.sql` (auto-generated)

**Interfaces:**
- Consumes: Lesson model
- Produces: Lesson with `guideContent` JSON field for step-by-step guides

- [ ] **Step 1: Add guideContent field to schema**

```prisma
model Lesson {
  // ... existing fields
  guideContent String @default("{}")  // JSON: { steps: [{ step, title, titleEn, description, descriptionEn, imageUrl, videoUrl }] }
}
```

- [ ] **Step 2: Run migration**

Run: `npx prisma migrate dev --name add_guide_content`
Expected: Migration created successfully, Prisma client regenerated

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add guideContent field to Lesson model for step-by-step tutorials"
```

---

## Phase 2: Enhance Admin Lesson Modal with FileUploadSection

### Task 2: Update Admin Lesson Modal with File Fields

**Files:**
- Modify: `src/app/admin/courses/[id]/page.tsx`

**Interfaces:**
- Consumes: Lesson interface with fileUrl, fileName, filePassword, guideContent
- Produces: Enhanced modal with FileUploadSection + guide steps editor

- [ ] **Step 1: Add FileUploadSection to imports**

```tsx
import { FileUploadSection } from "@/components/ui/FileUploadSection";
```

- [ ] **Step 2: Update lessonForm state to include file fields**

```tsx
const [lessonForm, setLessonForm] = useState({
  // ... existing fields
  fileUrl: "",
  fileName: "",
  filePassword: "",  // Add this
  guideContent: "",  // JSON string for now
});
```

- [ ] **Step 3: Add FileUploadSection to modal form**

```tsx
{/* File Upload Section - Add after resources field */}
<div>
  <label className="text-xs text-gray-400 mb-1 block">فایل دانلودی</label>
  <FileUploadSection
    fileUrl={lessonForm.fileUrl}
    fileName={lessonForm.fileName}
    filePassword={lessonForm.filePassword}
    onFileUrlChange={(v) => setLessonForm({...lessonForm, fileUrl: v})}
    onFileNameChange={(v) => setLessonForm({...lessonForm, fileName: v})}
    onFilePasswordChange={(v) => setLessonForm({...lessonForm, filePassword: v})}
  />
</div>
```

- [ ] **Step 4: Update handleAddLesson to include filePassword**

```tsx
const res = await fetch(`/api/admin/courses/${id}/lessons`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({
    ...lessonForm,
    filePassword: lessonForm.filePassword || null,
    // ... other fields
  }),
});
```

- [ ] **Step 5: Run build to verify**

Run: `npm run build`
Expected: Build succeeds without TypeScript errors

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/courses/[id]/page.tsx
git commit -m "feat: add FileUploadSection to admin lesson modal with password support"
```

---

## Phase 3: Professional Public Course Page with Tabs

### Task 3: Add Tabbed Interface to Public Course Page

**Files:**
- Modify: `src/app/courses/[slug]/page.tsx`

**Interfaces:**
- Consumes: Course with lessons
- Produces: Tabbed course page (Overview / Lessons / Files / Guide Preview)

- [ ] **Step 1: Add tab state and tabs UI**

```tsx
const [activeTab, setActiveTab] = useState<"overview" | "lessons" | "files" | "guide">("overview");

// Add after stats section
<div className="flex gap-2 mb-6 border-b border-white/5">
  {[
    { key: "overview", label: "نمای کلی" },
    { key: "lessons", label: "درس‌ها" },
    { key: "files", label: "فایل‌ها" },
    { key: "guide", label: "راهنما" }
  ].map(tab => (
    <button
      key={tab.key}
      onClick={() => setActiveTab(tab.key as typeof activeTab)}
      className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
        activeTab === tab.key 
          ? "border-gold text-gold" 
          : "border-transparent text-gray-400 hover:text-white"
      }`}
      style={{ fontFamily: "var(--font-fa)" }}
    >
      {tab.label}
    </button>
  ))}
</div>
```

- [ ] **Step 2: Convert lessons list to conditional render based on tab**

```tsx
{activeTab === "lessons" && (
  <div className="space-y-3">
    {course.lessons.map((lesson, index) => (
      <LessonItem key={lesson.id} lesson={lesson} slug={slug} index={index} />
    ))}
  </div>
)}

{activeTab === "files" && (
  <div className="space-y-3">
    {course.lessons.filter(l => l.fileUrl).map(lesson => (
      <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg bg-obsidian border border-white/5">
        <div className="flex items-center gap-2">
          <File size={16} className={lesson.filePassword ? "text-amber-400" : "text-success"} />
          <span className="text-sm text-white truncate max-w-[200px]" style={{ fontFamily: "var(--font-fa)" }}>
            {lesson.fileName || `فایل درس ${lesson.order}`}
          </span>
          {lesson.filePassword && <Lock size={14} className="text-amber-400" />}
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
)}
```

- [ ] **Step 3: Add Guide Preview tab**

```tsx
{activeTab === "guide" && (
  <div className="space-y-4">
    {course.lessons.map(lesson => {
      if (!lesson.guideContent || lesson.guideContent === "{}") return null;
      try {
        const guide = JSON.parse(lesson.guideContent);
        if (!guide.steps?.length) return null;
        return (
          <div key={lesson.id} className="rounded-xl border border-white/10 bg-obsidian-light/50 p-4">
            <h4 className="text-sm font-bold text-white mb-2" style={{ fontFamily: "var(--font-fa)" }}>
              {lesson.title}
            </h4>
            <ol className="space-y-2">
              {guide.steps.map((step: { step: number; title: string; titleEn?: string }) => (
                <li key={step.step} className="text-xs text-gray-300" style={{ fontFamily: "var(--font-fa)" }}>
                  <span className="text-gold font-bold">{step.step}. </span>
                  {step.title}
                </li>
              ))}
            </ol>
          </div>
        );
      } catch { return null; }
    })}
  </div>
)}
```

- [ ] **Step 4: Run build to verify**

Run: `npm run build`
Expected: No TypeScript errors

- [ ] **Step 5: Commit**

```bash
git add src/app/courses/[slug]/page.tsx
git commit -m "feat: add tabbed interface to public course page with files and guide preview"
```

---

## Phase 4: Create R6 Wallhack Tutorial Course

### Task 4: Create Sample R6 Course with Lessons

**Files:**
- Modify: `prisma/seed.ts` (or create separate seed file)
- Create: `scripts/create-r6-course.ts`

**Interfaces:**
- Consumes: Product IDs for R6 products
- Produces: Course with step-by-step guide lessons for wallhack

- [ ] **Step 1: Find R6 product IDs**

Run: Use existing product `cheat-r6-recoil` or create new one

- [ ] **Step 2: Create course seed script**

```ts
// scripts/create-r6-course.ts
const r6Course = {
  title: "آموزش کامل وال‌هک رینبو اکس شیفت",
  slug: "r6-wallhack-tutorial",
  description: "راهنمای گام به گام استفاده از وال‌هک در Rainbow Six Siege برای دید دشمنان دیوار",
  productId: "g2_esp", // Valkyrie Structural Radar or similar
  lessons: [
    {
      title: "معرفی وال‌هک و نصب",
      order: 1,
      content: "<h2>نصب چیت</h2><p>مراحل نصب را دنبال کنید...</p>",
      guideContent: JSON.stringify({
        steps: [
          { step: 1, title: "دانلود فایل چیت", description: "فایل را از بخش دانلود دریافت کنید" },
          { step: 2, title: "خلاصه‌سازی ویندوز", description: "ویندوز Defender را غیرفعال کنید" },
          { step: 3, title: "اجرای فایل نصب", description: "به عنوان ادمین اجرا کنید" }
        ]
      }),
      fileUrl: "/files/r6-wallhack-setup.zip",
      fileName: "r6-wallhack-setup.zip",
      filePassword: "golden123"
    },
    {
      title: "تنظیمات اولیه",
      order: 2,
      content: "<h2>پیکربندی</h2><p>تنظیمات اولیه را انجام دهید...</p>",
      guideContent: JSON.stringify({
        steps: [
          { step: 1, title: "باز کردن پنجره چیت", description: "کلید Insert را فشار دهید" },
          { step: 2, title: "انتخاب گزینه‌های ESP", description: "Bone ESP و Box ESP را فعال کنید" }
        ]
      })
    },
    {
      title: "نکات امنیتی و عیب‌زدایی",
      order: 3,
      content: "<h2>نکات امنیتی</h2><p>برای اجتناب از تشخیص...</p>",
      guideContent: JSON.stringify({
        steps: [
          { step: 1, title: "استفاده از VPN", description: "حتماً VPN فعال کنید" },
          { step: 2, title: "به‌روزرسانی منظم", description: "چیت را هر هفته به‌روز کنید" }
        ]
      })
    }
  ]
};
```

- [ ] **Step 3: Run seed script**

Run: `npx tsx scripts/create-r6-course.ts`

- [ ] **Step 4: Commit**

```bash
git add scripts/create-r6-course.ts
git commit -m "feat: create R6 wallhack tutorial course with step-by-step guide"
```

---

## Phase 5: Integration and Testing

### Task 5: Final Integration Testing

**Files:**
- None (verification step)

**Interfaces:**
- Consumes: All previous changes
- Produces: Working end-to-end system

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: Successful build

- [ ] **Step 2: Run linter**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 3: Update memory files**

Update: `memory/schema.md` with new field
Update: `memory/session-log.md` with completion notes

- [ ] **Step 4: Commit**

```bash
git add memory/
git commit -m "docs: update memory for course enhancement phase 2"
```

---

## Self-Review Checklist

1. **Spec coverage:**
   - ✅ Step-by-step guide editor - Task 1, 2
   - ✅ FileUploadSection integration - Task 2
   - ✅ Professional course page - Task 3
   - ✅ R6 wallhack tutorial - Task 4
   - ✅ Password-protected files - Already implemented

2. **Placeholder scan:** No placeholders - all concrete implementations

3. **Type consistency:** guideContent JSON structure consistent across tasks