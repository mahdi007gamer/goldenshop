-- Add orderNumber column (nullable first, to populate existing rows)
ALTER TABLE "Order" ADD COLUMN "orderNumber" TEXT;

-- Create unique index first (allows NULL values)
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
