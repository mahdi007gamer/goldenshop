-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LicenseInventory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL DEFAULT 30,
    "licenseKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "orderId" TEXT,
    "assignedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LicenseInventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LicenseInventory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_LicenseInventory" ("assignedAt", "createdAt", "id", "licenseKey", "orderId", "productId", "status") SELECT "assignedAt", "createdAt", "id", "licenseKey", "orderId", "productId", "status" FROM "LicenseInventory";
DROP TABLE "LicenseInventory";
ALTER TABLE "new_LicenseInventory" RENAME TO "LicenseInventory";
CREATE INDEX "LicenseInventory_productId_status_durationDays_idx" ON "LicenseInventory"("productId", "status", "durationDays");
CREATE INDEX "LicenseInventory_status_idx" ON "LicenseInventory"("status");
CREATE TABLE "new_Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Ticket" ("createdAt", "id", "orderId", "status", "subject", "updatedAt", "userId") SELECT "createdAt", "id", "orderId", "status", "subject", "updatedAt", "userId" FROM "Ticket";
DROP TABLE "Ticket";
ALTER TABLE "new_Ticket" RENAME TO "Ticket";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
