/*
  Warnings:

  - You are about to drop the column `category` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `game` on the `Course` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleEn" TEXT,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "fullDescription" TEXT,
    "fullDescriptionEn" TEXT,
    "prerequisites" TEXT,
    "prerequisitesEn" TEXT,
    "thumbnail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'published',
    "productId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Course_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Course" ("createdAt", "description", "fullDescription", "id", "prerequisites", "productId", "slug", "status", "thumbnail", "title", "updatedAt") SELECT "createdAt", "description", "fullDescription", "id", "prerequisites", "productId", "slug", "status", "thumbnail", "title", "updatedAt" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
