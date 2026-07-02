import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Lesson } from "@prisma/client";
import { ArrowRight, BookOpen, Clock, Gamepad2, GraduationCap, ListOrdered, Play, Tag, Download, Lock, File } from "lucide-react";
import { CourseClient } from "./CourseClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

type CourseWithLessons = {
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

async function getCourse(slug: string): Promise<CourseWithLessons | null> {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      lessons: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course || course.status !== "published") {
    return null;
  }

  return course;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    return { title: "دوره یافت نشد | Golden Cheat" };
  }

  return {
    title: `${course.title} | آموزش‌ها | Golden Cheat`,
    description: course.description || `دوره آموزشی ${course.title} - Golden Cheat`,
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    notFound();
  }

  return <CourseClient initialCourse={course} />;
}