"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Gamepad2, GraduationCap, ListOrdered, Play, Tag, Download, Lock, File, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Lesson } from "@prisma/client";

interface CourseClientProps {
  initialCourse: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    thumbnail: string | null;
    category: string;
    game: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    lessons: Lesson[];
  };
}

type TabKey = "overview" | "lessons" | "files" | "guide";

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "overview", label: "نمای کلی", icon: <BookOpen size={14} /> },
  { key: "lessons", label: "درس‌ها", icon: <ListOrdered size={14} /> },
  { key: "files", label: "فایل‌ها", icon: <File size={14} /> },
  { key: "guide", label: "راهنما", icon: <GraduationCap size={14} /> },
];

function LessonItem({
  lesson,
  slug,
  index,
}: {
  lesson: Lesson;
  slug: string;
  index: number;
}) {
  return (
    <Link
      href={`/courses/${slug}/${lesson.order}`}
      className="group flex items-center gap-4 rounded-lg border border-white/5 bg-obsidian-light/50 p-4 transition-all hover:border-gold/20 hover:bg-obsidian-lighter/50"
    >
      {/* Order number */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold font-bold text-sm group-hover:bg-gold/20 transition-colors">
        {index + 1}
      </div>

      {/* Lesson info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white group-hover:text-gold transition-colors truncate" style={{ fontFamily: "var(--font-fa)" }}>
          {lesson.title}
        </h4>
        <div className="mt-1 flex items-center gap-3">
          {lesson.duration > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={12} />
              {lesson.duration} دقیقه
            </span>
          )}
          {lesson.videoUrl && (
            <span className="flex items-center gap-1 text-xs text-cyber">
              <Play size={12} />
              ویدیو
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight size={16} className="flex-shrink-0 text-gray-600 group-hover:text-gold transition-colors" />
    </Link>
  );
}

export function CourseClient({ initialCourse }: CourseClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const course = initialCourse;

  const totalDuration = course.lessons.reduce((acc, l) => acc + (l.duration || 0), 0);

  const gradientMap: Record<string, string> = {
    "Dota 2": "from-orange-900/50 to-red-900/30",
    "R6 Siege": "from-blue-900/50 to-slate-900/30",
    Valorant: "from-red-900/50 to-pink-900/30",
    CS2: "from-yellow-900/50 to-amber-900/30",
    "Apex Legends": "from-purple-900/50 to-indigo-900/30",
  };
  const gradient = gradientMap[course.game] || "from-gray-900/50 to-gray-800/30";

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Description */}
            {course.description && (
              <div className="prose prose-invert max-w-none" style={{ fontFamily: "var(--font-fa)" }}>
                <p className="text-gray-400 leading-relaxed">{course.description}</p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/5 bg-obsidian-light/50 p-6 text-center">
                <BookOpen size={28} className="mx-auto mb-2 text-gold" />
                <div className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-fa)" }}>
                  {course.lessons.length}
                </div>
                <div className="text-xs text-gray-500 mt-1" style={{ fontFamily: "var(--font-fa)" }}>
                  تعداد درس‌ها
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-obsidian-light/50 p-6 text-center">
                <Clock size={28} className="mx-auto mb-2 text-cyber" />
                <div className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-fa)" }}>
                  {totalDuration} دقیقه
                </div>
                <div className="text-xs text-gray-500 mt-1" style={{ fontFamily: "var(--font-fa)" }}>
                  مجموع مدت زمان
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-obsidian-light/50 p-6 text-center">
                <GraduationCap size={28} className="mx-auto mb-2 text-success" />
                <div className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-fa)" }}>
                  مقدماتی تا پیشرفته
                </div>
                <div className="text-xs text-gray-500 mt-1" style={{ fontFamily: "var(--font-fa)" }}>
                  سطح دوره
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "lessons":
        return (
          <motion.div
            key="lessons"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {course.lessons.length > 0 ? (
              course.lessons.map((lesson, index) => (
                <LessonItem key={lesson.id} lesson={lesson} slug={course.slug} index={index} />
              ))
            ) : (
              <div className="rounded-xl border border-white/5 bg-obsidian-light/50 py-12 text-center">
                <BookOpen size={40} className="mx-auto mb-3 text-gray-600" />
                <p className="text-gray-500" style={{ fontFamily: "var(--font-fa)" }}>
                  هنوز درسی برای این دوره اضافه نشده است
                </p>
              </div>
            )}
          </motion.div>
        );

      case "files":
        return (
          <motion.div
            key="files"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {course.lessons
              .filter((l) => l.fileUrl)
              .map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg bg-obsidian border border-white/5">
                  <div className="flex items-center gap-2">
                    <File size={16} className={lesson.filePassword ? "text-amber-400" : "text-success"} />
                    <span className="text-sm text-white truncate max-w-[200px]" style={{ fontFamily: "var(--font-fa)" }}>
                      {lesson.fileName || `فایل درس ${lesson.order}`}
                    </span>
                    {lesson.filePassword && <Lock size={14} className="text-amber-400" />}
                  </div>
                  <Link
                    href={`/courses/${course.slug}/${lesson.order}?download=true`}
                    className="text-xs text-gold hover:underline"
                  >
                    دانلود
                  </Link>
                </div>
              ))}
            {course.lessons.filter((l) => l.fileUrl).length === 0 && (
              <div className="rounded-xl border border-white/5 bg-obsidian-light/50 py-12 text-center">
                <File size={40} className="mx-auto mb-3 text-gray-600" />
                <p className="text-gray-500" style={{ fontFamily: "var(--font-fa)" }}>
                  فایل قابل دانلودی برای این دوره وجود ندارد
                </p>
              </div>
            )}
          </motion.div>
        );

      case "guide":
        return (
          <motion.div
            key="guide"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {course.lessons.map((lesson) => {
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
                      {guide.steps.map((step: { step: number; title: string; titleEn?: string; description?: string; descriptionEn?: string }) => (
                        <li key={step.step} className="text-xs text-gray-300" style={{ fontFamily: "var(--font-fa)" }}>
                          <span className="text-gold font-bold">{step.step}. </span>
                          {step.title}
                          {step.description && <p className="mt-1 text-gray-500">{step.description}</p>}
                        </li>
                      ))}
                    </ol>
                  </div>
                );
              } catch {
                return null;
              }
            })}
            {course.lessons.filter((l) => l.guideContent && l.guideContent !== "{}").length === 0 && (
              <div className="rounded-xl border border-white/5 bg-obsidian-light/50 py-12 text-center">
                <GraduationCap size={40} className="mx-auto mb-3 text-gray-600" />
                <p className="text-gray-500" style={{ fontFamily: "var(--font-fa)" }}>
                  راهنمای قدم‌به‌قدم برای این دوره وجود ندارد
                </p>
              </div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-obsidian text-gray-200">
      {/* Background smoke */}
      <div className="smoke" />

      <div className="relative mx-auto max-w-5xl px-4 py-12">
        {/* Back button */}
        <Link
          href="/courses"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gold transition-colors"
          style={{ fontFamily: "var(--font-fa)" }}
        >
          <ArrowRight size={16} />
          بازگشت به دوره‌ها
        </Link>

        {/* Course Header */}
        <div className="mb-10 overflow-hidden rounded-2xl border border-white/10">
          {/* Thumbnail / Banner */}
          <div className={`relative h-56 w-full overflow-hidden bg-gradient-to-br ${gradient} sm:h-64`}>
            <div className="absolute inset-0 grid-pattern opacity-30" />
            {course.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={course.thumbnail}
                alt={course.title}
                className="h-full w-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-black/30 backdrop-blur-sm">
                  <GraduationCap size={36} className="text-gold/70" />
                </div>
              </div>
            )}
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
          </div>

          {/* Course info */}
          <div className="bg-obsidian-light/80 p-6 sm:p-8">
            {/* Tags */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                <Tag size={12} />
                {course.category}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-cyber/10 px-3 py-1 text-xs font-semibold text-cyber">
                <Gamepad2 size={12} />
                {course.game}
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-3 text-2xl font-bold text-white sm:text-3xl" style={{ fontFamily: "var(--font-fa)" }}>
              {course.title}
            </h1>

            {/* Tab Navigation */}
            <div className="flex gap-1 mb-6 border-b border-white/5">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
                    activeTab === tab.key
                      ? "border-gold text-gold"
                      : "border-transparent text-gray-400 hover:text-white"
                  }`}
                  style={{ fontFamily: "var(--font-fa)" }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[200px]">
              {renderTabContent()}
            </div>
          </div>
        </div>

        {/* Password Protected Notice */}
        {course.lessons.some((l) => l.filePassword) && (
          <div className="mt-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center gap-2 mb-2">
              <Lock size={16} className="text-amber-400" />
              <span className="text-sm font-medium text-amber-300" style={{ fontFamily: "var(--font-fa)" }}>
                منابع رمزدار
              </span>
            </div>
            <p className="text-xs text-amber-300/70" style={{ fontFamily: "var(--font-fa)" }}>
              برخی فایل‌های این دوره نیاز به رمز عبور دارند. پس از خرید محصول مرتبط، رمز عبور را دریافت خواهید کرد.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}