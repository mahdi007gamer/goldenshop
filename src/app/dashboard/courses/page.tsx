"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Search, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useLang } from "@/context/LangContext";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  category: string;
  game: string;
  status: string;
  productId: string | null;
  createdAt: string;
  _count: { lessons: number };
}

interface CoursesResponse {
  success: boolean;
  data: {
    courses: Course[];
    total: number;
  };
}

// ─── Font helpers ────────────────────────────────────────────────────────────
const fontFa = "'Vazirmatn', 'IRANYekan', sans-serif";
const fontEn = "'Inter', sans-serif";

// ─── Loading Skeleton Card ───────────────────────────────────────────────────
function SkeletonCard({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background: "rgba(10,14,26,0.9)",
        borderColor: "rgba(201,150,58,0.15)",
      }}
    >
      {/* Thumbnail skeleton */}
      <div
        className="h-40 w-full animate-pulse"
        style={{ background: "rgba(201,150,58,0.06)" }}
      />
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div
          className="h-5 w-3/4 rounded animate-pulse"
          style={{ background: "rgba(201,150,58,0.08)" }}
        />
        <div
          className="h-4 w-full rounded animate-pulse"
          style={{ background: "rgba(201,150,58,0.05)" }}
        />
        <div className="flex gap-2 pt-1">
          <div
            className="h-6 w-16 rounded-full animate-pulse"
            style={{ background: "rgba(201,150,58,0.06)" }}
          />
          <div
            className="h-6 w-20 rounded-full animate-pulse"
          style={{ background: "rgba(201,150,58,0.06)" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Course Card ─────────────────────────────────────────────────────────────
function CourseCard({
  course,
  index,
  lang,
  isRTL,
}: {
  course: Course;
  index: number;
  lang: "fa" | "en";
  isRTL: boolean;
}) {
  const isFa = lang === "fa";

  // Truncate description to 100 chars
  const truncatedDesc =
    course.description.length > 100
      ? course.description.slice(0, 100) + "..."
      : course.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", damping: 20 }}
    >
      <Link
        href={`/courses/${course.slug}`}
        className="block h-full rounded-2xl border overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
        style={{
          background: "rgba(10,14,26,0.9)",
          borderColor: "rgba(201,150,58,0.15)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor =
            "rgba(201,150,58,0.35)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor =
            "rgba(201,150,58,0.15)";
        }}
      >
        {/* Thumbnail */}
        <div
          className="h-40 w-full flex items-center justify-center relative overflow-hidden"
          style={{
            background: course.thumbnail
              ? "none"
              : "linear-gradient(135deg, rgba(201,150,58,0.08) 0%, rgba(10,14,26,1) 100%)",
          }}
        >
          {course.thumbnail ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </>
          ) : (
            <BookOpen size={40} className="text-gray-700" />
          )}
          {/* Category badge overlay */}
          {course.category && (
            <span
              className="absolute top-3 start-3 px-2.5 py-1 rounded-lg text-xs font-semibold"
              style={{
                background: "rgba(201,150,58,0.15)",
                color: "#C9963A",
                backdropFilter: "blur(8px)",
                fontFamily: isRTL ? fontFa : fontEn,
              }}
            >
              {course.category}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3
            className="text-base font-bold text-white line-clamp-1 group-hover:text-gold transition-colors duration-200"
            style={{ fontFamily: isRTL ? fontFa : fontEn }}
            dir={isRTL ? "rtl" : "ltr"}
          >
            {course.title}
          </h3>

          {/* Description */}
          <p
            className="text-sm text-gray-500 line-clamp-2 leading-relaxed"
            style={{ fontFamily: isRTL ? fontFa : fontEn }}
            dir={isRTL ? "rtl" : "ltr"}
          >
            {truncatedDesc}
          </p>

          {/* Badges row */}
          <div className="flex items-center gap-2 pt-1">
            {/* Lesson count badge */}
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                background: "rgba(0,240,255,0.08)",
                color: "#00f0ff",
                fontFamily: isRTL ? fontFa : fontEn,
              }}
            >
              <GraduationCap size={12} />
              {course._count.lessons}{" "}
              {isFa ? "درس" : course._count.lessons === 1 ? "lesson" : "lessons"}
            </span>

            {/* Game badge */}
            {course.game && (
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: "rgba(201,150,58,0.1)",
                  color: "#C9963A",
                  fontFamily: isRTL ? fontFa : fontEn,
                }}
              >
                {course.game}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState({
  lang,
  isRTL,
  isSearch,
}: {
  lang: "fa" | "en";
  isRTL: boolean;
  isSearch: boolean;
}) {
  const isFa = lang === "fa";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-2xl border p-8"
      style={{
        background: "rgba(10,14,26,0.9)",
        borderColor: "rgba(201,150,58,0.15)",
      }}
    >
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "rgba(201,150,58,0.08)" }}
        >
          <BookOpen size={32} className="text-gray-700" />
        </div>
        <p
          className="text-lg text-gray-400 mb-2"
          style={{ fontFamily: isRTL ? fontFa : fontEn }}
        >
          {isSearch
            ? isFa
              ? "نتیجه‌ای یافت نشد"
              : "No results found"
            : isFa
            ? "هنوز دوره‌ای منتشر نشده است"
            : "No courses published yet"}
        </p>
        <p
          className="text-sm text-gray-600 max-w-sm"
          style={{ fontFamily: isRTL ? fontFa : fontEn }}
        >
          {isSearch
            ? isFa
              ? "عبارت جستجو را تغییر دهید"
              : "Try a different search term"
            : isFa
            ? "به زودی دوره‌های آموزشی اضافه خواهند شد"
            : "Courses will be added soon"}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main Courses Page ───────────────────────────────────────────────────────
export default function CoursesPage() {
  const { lang, isRTL } = useLang();
  const isFa = lang === "fa";

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch courses on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchCourses() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/courses", { credentials: "include" });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data: CoursesResponse = await res.json();
        if (data.success && !cancelled) {
          setCourses(data.data.courses);
        } else if (!cancelled) {
          setError(isFa ? "خطا در بارگذاری دوره‌ها" : "Failed to load courses");
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        if (!cancelled) {
          setError(isFa ? "خطا در برقراری ارتباط" : "Connection error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCourses();
    return () => {
      cancelled = true;
    };
  }, [isFa]);

  // Client-side filter by title
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    const q = searchQuery.toLowerCase().trim();
    return courses.filter((course) => course.title.toLowerCase().includes(q));
  }, [courses, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="space-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1
          className="text-2xl font-bold text-white mb-2"
          style={{ fontFamily: "var(--font-fa)" }}
        >
          {isFa ? "دوره‌های آموزشی" : "Courses"}
        </h1>
        <p
          className="text-gray-400"
          style={{ fontFamily: "var(--font-fa)" }}
        >
          {isFa ? "آموزش نصب و استفاده از محصولات" : "Learn how to install and use products"}
        </p>
      </motion.div>

      {/* Search Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-gray-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-11 pe-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-[rgba(201,150,58,0.5)] focus:ring-1 focus:ring-[rgba(201,150,58,0.2)]"
            style={{
              background: "rgba(10,14,26,0.9)",
              border: "1.5px solid rgba(201,150,58,0.2)",
              fontFamily: isRTL ? fontFa : fontEn,
              direction: isRTL ? "rtl" : "ltr",
            }}
            placeholder={
              isFa ? "جستجوی دوره..." : "Search courses..."
            }
          />
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-6 text-center"
          style={{
            background: "rgba(239,68,68,0.05)",
            borderColor: "rgba(239,68,68,0.2)",
          }}
        >
          <p
            className="text-sm text-red-400"
            style={{ fontFamily: isRTL ? fontFa : fontEn }}
          >
            {error}
          </p>
        </motion.div>
      )}

      {/* Loading Skeleton */}
      {loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard delay={0} />
          <SkeletonCard delay={0.08} />
          <SkeletonCard delay={0.16} />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredCourses.length === 0 && (
        <EmptyState lang={lang} isRTL={isRTL} isSearch={isSearching} />
      )}

      {/* Course Grid */}
      {!loading && !error && filteredCourses.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {filteredCourses.map((course, idx) => (
            <CourseCard
              key={course.id}
              course={course}
              index={idx}
              lang={lang}
              isRTL={isRTL}
            />
          ))}
        </motion.div>
      )}

      {/* Total count */}
      {!loading && !error && filteredCourses.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs text-gray-600 text-center pt-2"
          style={{ fontFamily: isRTL ? fontFa : fontEn }}
        >
          {isFa
            ? `نمایش ${filteredCourses.length} از ${courses.length} دوره`
            : `Showing ${filteredCourses.length} of ${courses.length} courses`}
        </motion.p>
      )}
    </div>
  );
}
