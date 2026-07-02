-- Ticket: Remove game column, add orderId
-- Course: Add fullDescription and prerequisites columns

-- Step 1: Rebuild Ticket table without game column
CREATE TABLE "Ticket_new" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "orderId" TEXT,
  "subject" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL
);

INSERT INTO "Ticket_new" ("id", "userId", "subject", "status", "createdAt", "updatedAt")
SELECT "id", "userId", "subject", "status", "createdAt", "updatedAt" FROM "Ticket";

DROP TABLE "Ticket";
ALTER TABLE "Ticket_new" RENAME TO "Ticket";

-- Step 2: Add Course columns
ALTER TABLE "Course" ADD COLUMN "fullDescription" TEXT;
ALTER TABLE "Course" ADD COLUMN "prerequisites" TEXT;
