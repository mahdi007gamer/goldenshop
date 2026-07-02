import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookOpen, Clock, GraduationCap, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "آموزش‌ها | Golden Cheat",
  description: "دوره‌های آموزشی تخصصی گیمینگ - Golden Cheat",
};

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

async function getCourses(search?: string, page = 1) {
  const take = 50;
  const skip = (page - 1) * take;

  const where: Record<string, unknown> = { status: "published" };
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { slug: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        _count: { select: { lessons: true } },
      },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.course.count({ where }),
  ]);

  return { courses, total };
}

function CourseCard({ course }: { course: Awaited<ReturnType<typeof getCourses>>["courses"][number] }) {
  const gradientMap: Record<string, string> = {
    "Dota 2": "from-orange-900/50 to-red-900/30",
    "R6 Siege": "from-blue-900/50 to-slate-900/30",
    Valorant: "from-red-900/50 to-pink-900/30",
    CS2: "from-yellow-900/50 to-amber-900/30",
    "Apex Legends": "from-purple-900/50 to-indigo-900/30",
  };
  const gradient = gradientMap[course.game] || "from-gray-900/50 to-gray-800/30";

  return (
    <Link href={`/courses/${course.slug}`}>
      <div className="glass-card glass-card-hover group relative flex h-full flex-col overflow-hidden rounded-xl">
        {/* Thumbnail / Gradient Placeholder */}
        <div className={`relative h-44 w-full overflow-hidden bg-gradient-to-br ${gradient}`}>
          <div className="absolute inset-0 grid-pattern opacity-30" />
          {course.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-black/30 backdrop-blur-sm">
                <GraduationCap size={28} className="text-gold/70" />
              </div>
            </div>
          )}
          {/* Category badge */}
          <div className="absolute bottom-2 right-2">
            <span className="rounded-full bg-black/50 px-2.5 py-0.5 text-[11px] font-semibold text-cyber backdrop-blur-sm">
              {course.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5">
          {/* Game tag */}
          <div className="mb-2 flex items-center gap-2">
            <Tag size={12} className="text-gold/60" />
            <span className="text-xs font-medium text-gold/60">{course.game}</span>
          </div>

          {/* Title */}
          <h3 className="mb-2 text-lg font-bold text-white group-hover:text-gold transition-colors" style={{ fontFamily: "var(--font-fa)" }}>
            {course.title}
          </h3>

          {/* Description */}
          {course.description && (
            <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-400 line-clamp-2" style={{ fontFamily: "var(--font-fa)" }}>
              {course.description}
            </p>
          )}

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
            <div className="flex items-center gap-1.5 text-gray-400">
              <BookOpen size={14} />
              <span className="text-xs" style={{ fontFamily: "var(--font-fa)" }}>
                {course._count.lessons} درس
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Clock size={14} />
              <span className="text-xs">
                {new Date(course.createdAt).toLocaleDateString("fa-IR")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function CoursesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const page = parseInt(params.page || "1");
  const { courses, total } = await getCourses(search, page);

  return (
    <div className="relative min-h-screen bg-obsidian text-gray-200">
      {/* Background smoke */}
      <div className="smoke" />

      <div className="relative mx-auto max-w-7xl px-4 py-16">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl font-black tracking-tight text-gold-gradient sm:text-5xl">
            آموزش‌ها
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-gray-400" style={{ fontFamily: "var(--font-fa)" }}>
            دوره‌های آموزشی تخصصی برای بهبود مهارت‌های گیمینگ شما
          </p>
        </div>

        {/* Search Bar */}
        <div className="mx-auto mb-10 max-w-md">
          <form method="GET" action="/courses">
            <div className="relative">
              <input
                type="text"
                name="search"
                placeholder="جستجوی دوره..."
                defaultValue={search}
                className="input-gold w-full py-3 pl-4 pr-10 text-sm"
                style={{ fontFamily: "var(--font-fa)" }}
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Results count */}
        {search && (
          <p className="mb-6 text-center text-sm text-gray-500" style={{ fontFamily: "var(--font-fa)" }}>
            {total} نتیجه برای &quot;{search}&quot;
          </p>
        )}

        {/* Course Grid */}
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <GraduationCap size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-lg text-gray-500" style={{ fontFamily: "var(--font-fa)" }}>
              دوره‌ای یافت نشد
            </p>
            <p className="mt-1 text-sm text-gray-600" style={{ fontFamily: "var(--font-fa)" }}>
              عبارت جستجوی دیگری را امتحان کنید
            </p>
          </div>
        )}

        {/* Pagination info */}
        {total > 50 && (
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500" style={{ fontFamily: "var(--font-fa)" }}>
              نمایش {courses.length} از {total} دوره
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
