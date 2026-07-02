-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "videoUrl" TEXT,
    "imageUrl" TEXT,
    "audioUrl" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "filePassword" TEXT,
    "guideContent" TEXT NOT NULL DEFAULT '{}',
    "duration" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "resources" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Lesson" ("audioUrl", "content", "courseId", "createdAt", "duration", "fileName", "filePassword", "fileUrl", "id", "imageUrl", "order", "resources", "title", "updatedAt", "videoUrl") SELECT "audioUrl", "content", "courseId", "createdAt", "duration", "fileName", "filePassword", "fileUrl", "id", "imageUrl", "order", "resources", "title", "updatedAt", "videoUrl" FROM "Lesson";
DROP TABLE "Lesson";
ALTER TABLE "new_Lesson" RENAME TO "Lesson";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
