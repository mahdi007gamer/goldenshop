import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowRight, ArrowLeft, BookOpen, Clock, Home, Play, Download, Lock } from "lucide-react";
import FileDownloadSection from "./FileDownloadSection";

interface PageProps {
  params: Promise<{ slug: string; lessonOrder: string }>;
}

async function getLesson(slug: string, order: number) {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      lessons: { orderBy: { order: "asc" } },
    },
  });

  if (!course || course.status !== "published") return null;

  const lesson = course.lessons.find((l) => l.order === order);
  if (!lesson) return null;

  const currentIndex = course.lessons.findIndex((l) => l.order === order);
  const prevLesson = currentIndex > 0 ? course.lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null;

  return { course, lesson, prevLesson, nextLesson, totalLessons: course.lessons.length };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, lessonOrder } = await params;
  const order = parseInt(lessonOrder);
  const result = await getLesson(slug, order);

  if (!result) return { title: "درس یافت نشد | Golden Cheat" };

  return {
    title: `${result.lesson.title} | ${result.course.title} | آموزش‌ها | Golden Cheat`,
    description: `درس ${result.lesson.order} از دوره ${result.course.title}`,
  };
}

function VideoEmbed({ videoUrl }: { videoUrl: string | null }) {
  if (!videoUrl) return null;

  // Handle YouTube URLs
  const youtubeMatch = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return (
      <div className="relative mb-8 w-full overflow-hidden rounded-xl border border-white/10" style={{ paddingBottom: "56.25%" }}>
        <iframe src={`https://www.youtube.com/embed/${videoId}`} title="Lesson Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full" />
      </div>
    );
  }

  // Handle Vimeo URLs
  const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    const videoId = vimeoMatch[1];
    return (
      <div className="relative mb-8 w-full overflow-hidden rounded-xl border border-white/10" style={{ paddingBottom: "56.25%" }}>
        <iframe src={`https://player.vimeo.com/video/${videoId}`} title="Lesson Video" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full" />
      </div>
    );
  }

  // Generic video tag for direct video URLs
  if (videoUrl.match(/\.(mp4|webm|ogg)$/i)) {
    return (
      <div className="mb-8 overflow-hidden rounded-xl border border-white/10">
        <video src={videoUrl} controls className="w-full" preload="metadata" />
      </div>
    );
  }

  // Fallback: link to video
  return (
    <div className="mb-8 rounded-xl border border-cyber/20 bg-cyber/5 p-4 text-center">
      <Play size={24} className="mx-auto mb-2 text-cyber" />
      <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-cyber hover:underline">
        مشاهده ویدیو (لینک خارجی)
      </a>
    </div>
  );
}

export default async function LessonViewerPage({ params }: PageProps) {
  const { slug, lessonOrder } = await params;
  const order = parseInt(lessonOrder);
  const result = await getLesson(slug, order);

  if (!result) notFound();

  const { course, lesson, prevLesson, nextLesson, totalLessons } = result;

  return (
    <div className="relative min-h-screen bg-obsidian text-gray-200">
      <div className="smoke" />

      <div className="relative mx-auto max-w-4xl px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/courses" className="flex items-center gap-1 hover:text-gold transition-colors">
            <Home size={14} /> دوره‌ها
          </Link>
          <span className="text-gray-700">/</span>
          <Link href={`/courses/${slug}`} className="hover:text-gold transition-colors" style={{ fontFamily: "var(--font-fa)" }}>
            {course.title}
          </Link>
          <span className="text-gray-700">/</span>
          <span className="text-gray-400" style={{ fontFamily: "var(--font-fa)" }}>
            درس {lesson.order}
          </span>
        </nav>

        {/* Lesson Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 text-xs font-bold text-gold">
              {lesson.order}
            </span>
            <span className="text-sm text-gray-500" style={{ fontFamily: "var(--font-fa)" }}>
              {lesson.order} از {totalLessons}
            </span>
            {lesson.duration > 0 && (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Clock size={14} /> {lesson.duration} دقیقه
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl" style={{ fontFamily: "var(--font-fa)" }}>
            {lesson.title}
          </h1>
        </div>

        {/* Video */}
        <VideoEmbed videoUrl={lesson.videoUrl} />

        {/* Lesson Content */}
        {lesson.content && (
          <div className="mb-10 rounded-xl border border-white/10 bg-obsidian-light/50 p-6 sm:p-8">
            <div
              className="prose prose-invert max-w-none text-gray-300 leading-relaxed [&_h2]:text-white [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-4 [&_h3]:text-white [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-3 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:pr-6 [&_li]:mb-1 [&_a]:text-gold [&_a]:hover:underline [&_code]:bg-obsidian [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-cyber [&_code]:text-sm [&_pre]:bg-obsidian [&_pre]:border [&_pre]:border-white/10 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_blockquote]:border-r-4 [&_blockquote]:border-gold/30 [&_blockquote]:pr-4 [&_blockquote]:text-gray-400 [&_blockquote]:italic [&_img]:rounded-lg [&_img]:border [&_img]:border-white/10"
              style={{ fontFamily: "var(--font-fa)" }}
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </div>
        )}

        {/* Resources */}
        {lesson.resources && lesson.resources !== "[]" && lesson.resources !== "" && (
          <div className="mb-10 rounded-xl border border-white/10 bg-obsidian-light/50 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white" style={{ fontFamily: "var(--font-fa)" }}>
              <BookOpen size={18} className="text-gold" /> منابع درس
            </h3>
            <div className="text-sm text-gray-400" style={{ fontFamily: "var(--font-fa)" }}>
              {(() => {
                try {
                  const resources = JSON.parse(lesson.resources);
                  if (Array.isArray(resources)) {
                    return (
                      <ul className="space-y-2">
                        {resources.map((r: { title?: string; url?: string; name?: string }, i: number) => (
                          <li key={i}>
                            <a href={r.url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-cyber hover:underline">
                              <ArrowLeft size={14} className="rotate-180" /> {r.title || r.name || `منبع ${i + 1}`}
                            </a>
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return <p>{lesson.resources}</p>;
                } catch {
                  return <p>{lesson.resources}</p>;
                }
              })()}
            </div>
          </div>
        )}

        {/* File Download Section */}
        {lesson.fileUrl && (
          <FileDownloadSection fileUrl={lesson.fileUrl} filePassword={lesson.filePassword} fileName={lesson.fileName} />
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-8">
          {prevLesson ? (
            <Link href={`/courses/${slug}/${prevLesson.order}`} className="group flex items-center gap-3 rounded-xl border border-white/10 bg-obsidian-light/50 px-4 py-3 transition-all hover:border-gold/20 hover:bg-obsidian-lighter/50">
              <ArrowRight size={18} className="text-gray-500 group-hover:text-gold transition-colors" />
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-gray-600" style={{ fontFamily: "var(--font-fa)" }}>درس قبلی</span>
                <p className="text-sm text-gray-300 group-hover:text-gold transition-colors truncate max-w-[180px]" style={{ fontFamily: "var(--font-fa)" }}>
                  {prevLesson.title}
                </p>
              </div>
            </Link>
          ) : (
            <div />
          )}

          <Link href={`/courses/${slug}`} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-400 transition-all hover:border-gold/20 hover:text-gold" style={{ fontFamily: "var(--font-fa)" }}>
            <BookOpen size={16} /> فهرست درس‌ها
          </Link>

          {nextLesson ? (
            <Link href={`/courses/${slug}/${nextLesson.order}`} className="group flex items-center gap-3 rounded-xl border border-white/10 bg-obsidian-light/50 px-4 py-3 transition-all hover:border-gold/20 hover:bg-obsidian-lighter/50">
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-gray-600" style={{ fontFamily: "var(--font-fa)" }}>درس بعدی</span>
                <p className="text-sm text-gray-300 group-hover:text-gold transition-colors truncate max-w-[180px]" style={{ fontFamily: "var(--font-fa)" }}>{nextLesson.title}</p>
              </div>
              <ArrowLeft size={18} className="text-gray-500 group-hover:text-gold transition-colors" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}