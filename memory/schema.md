# Prisma Schema

Prisma + SQLite (`prisma/dev.db`). Provider: `prisma-client-js`. 21 models.

### `User`

- `id String @id @default(cuid())`
- `username String @unique`
- `phone String @unique`
- `passwordHash String`
- `avatar String?`
- `role String @default("user")`
- `status String @default("active")`
- `walletBalance Float @default(0)`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`
- `cardPayments CardToCardPayment[]`
- `licenses License[]`
- `notifications Notification[]`
- `orders Order[]`
- `reviews Review[]`
- `sessions Session[]`
- `tickets Ticket[]`
- `transactions WalletTransaction[]`

### `Session`

- `id String @id @default(cuid())`
- `userId String`
- `token String @unique`
- `expiresAt DateTime`
- `createdAt DateTime @default(now())`
- `user User @relation(fields: [userId], references: [id], onDelete: Cascade)` → relation

### `OtpCode`

- `id String @id @default(cuid())`
- `phone String`
- `code String`
- `purpose String`
- `expiresAt DateTime`
- `used Boolean @default(false)`
- `createdAt DateTime @default(now())`

### `Product`

- `id String @id @default(cuid())`
- `name String`
- `nameFa String?`
- `slug String @unique`
- `game String`
- `category String`
- `price Float`
- `salePrice Float?`
- `priceDaily Float?`
- `priceWeekly Float?`
- `priceMonthly Float?`
- `priceLifetime Float?`
- `rating Float @default(0)`
- `reviewsCount Int @default(0)`
- `features String @default("[]")`
- `featuresFa String @default("[]")`
- `description String`
- `descriptionFa String?`
- `shortDesc String?`
- `shortDescFa String?`
- `longDescription String?`
- `isPopular Boolean @default(false)`
- `status String @default("active")`
- `bypassRate String @default("100%")`
- `updateStatus String @default("Undetected")`
- `imageUrl String?`
- `bannerImage String?`
- `galleryImages String @default("[]")`
- `galleryItems String @default("[]")`
- `featuresDetail String @default("[]")`
- `videoUrl String?`
- `audioUrl String?`
- `metaTitle String?`
- `metaTitleFa String?`
- `metaDescription String?`
- `metaDescriptionFa String?`
- `focusKeyphrase String?`
- `focusKeyphraseFa String?`
- `metaKeywords String @default("[]")`
- `metaKeywordsFa String @default("[]")`
- `ogTitle String?`
- `ogDescription String?`
- `ogImage String?`
- `twitterTitle String?`
- `twitterDescription String?`
- `twitterImage String?`
- `canonicalUrl String?`
- `schemaType String @default("Product")`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`
- `priceBiWeekly Float?`
- `priceBimonthly Float?`
- `priceQuarterly Float?`
- `courses Course[]`
- `licenses License[]`
- `licenseInventory LicenseInventory[]`
- `orderItems OrderItem[]`
- `reviews Review[]`

### `Game`

- `id String @id @default(cuid())`
- `name String`
- `nameEn String?`
- `slug String @unique`
- `slugEn String? @unique`
- `description String?`
- `descriptionEn String?`
- `iconUrl String?`
- `bannerUrl String?`
- `accentColor String @default("#C9963A")`
- `gradientFrom String?`
- `gradientTo String?`
- `sortOrder Int @default(0)`
- `isActive Boolean @default(true)`
- `metaTitle String?`
- `metaTitleEn String?`
- `metaDescription String?`
- `metaDescriptionEn String?`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`

### `Order`

- `id String @id @default(cuid())`
- `userId String`
- `subtotal Float`
- `discount Float @default(0)`
- `total Float`
- `status String @default("pending")`
- `paymentMethod String @default("wallet")`
- `billingCycle String`
- `promoCode String?`
- `bankCardId String?`
- `last4Digits String?`
- `transactionTime DateTime?`
- `receiptNote String?`
- `userNote String?`
- `rejectionReason String?`
- `isEditable Boolean @default(true)`
- `paymentStatus String? @default("pending")`
- `receiptImage String?`
- `exchangeRate Float?`
- `priceUSD Float?`
- `priceToman Float?`
- `assignedLicenseIds String @default("[]")`
- `flagged Boolean @default(false)`
- `flagReason String?`
- `verificationHistory String @default("[]")`
- `verificationStep String?`
- `verifiedBy String?`
- `verifiedAt DateTime?`
- `adminInternalNote String?`
- `licenseDelivery String?`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`
- `orderNumber String? @unique`
- `licenses License[]`
- `licenseInventory LicenseInventory[]`
- `user User @relation(fields: [userId], references: [id])` → relation
- `items OrderItem[]`
- `Ticket Ticket[]`

### `OrderItem`

- `id String @id @default(cuid())`
- `orderId String`
- `productId String`
- `productName String`
- `price Float`
- `quantity Int @default(1)`
- `billingCycle String`
- `product Product @relation(fields: [productId], references: [id])` → relation
- `order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)` → relation

### `License`

- `id String @id @default(cuid())`
- `key String @unique`
- `orderId String`
- `userId String`
- `productId String`
- `productName String`
- `game String`
- `status String @default("active")`
- `paymentStatus String? @default("pending")`
- `hwid String?`
- `activatedAt DateTime?`
- `expiresAt DateTime`
- `createdAt DateTime @default(now())`
- `product Product @relation(fields: [productId], references: [id])` → relation
- `user User @relation(fields: [userId], references: [id])` → relation
- `order Order @relation(fields: [orderId], references: [id])` → relation

### `Ticket`

- `id String @id @default(cuid())`
- `userId String`
- `orderId String?`
- `subject String`
- `status String @default("open")`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`
- `Order Order? @relation(fields: [orderId], references: [id])`
- `user User @relation(fields: [userId], references: [id])` → relation
- `messages TicketMessage[]`

### `TicketMessage`

- `id String @id @default(cuid())`
- `ticketId String`
- `userId String`
- `text String`
- `createdAt DateTime @default(now())`
- `ticket Ticket @relation(fields: [ticketId], references: [id], onDelete: Cascade)` → relation

### `WalletTransaction`

- `id String @id @default(cuid())`
- `userId String`
- `type String`
- `amount Float`
- `balance Float`
- `description String`
- `referenceId String?`
- `status String @default("completed")`
- `createdAt DateTime @default(now())`
- `user User @relation(fields: [userId], references: [id])` → relation

### `PromoCode`

- `id String @id @default(cuid())`
- `code String @unique`
- `discount Float`
- `discountType String`
- `maxUses Int?`
- `usedCount Int @default(0)`
- `expiresAt DateTime?`
- `active Boolean @default(true)`
- `createdAt DateTime @default(now())`

### `CardToCardPayment`

- `id String @id @default(cuid())`
- `userId String`
- `amount Float`
- `cardNumber String`
- `reference String`
- `status String @default("pending")`
- `createdAt DateTime @default(now())`
- `approvedAt DateTime?`
- `user User @relation(fields: [userId], references: [id])` → relation

### `Course`

- `id String @id @default(cuid())`
- `title String`
- `titleEn String?`
- `slug String @unique`
- `description String`
- `descriptionEn String?`
- `fullDescription String?`
- `fullDescriptionEn String?`
- `prerequisites String?`
- `prerequisitesEn String?`
- `thumbnail String?`
- `status String @default("published")`
- `productId String?`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`
- `product Product? @relation(fields: [productId], references: [id])`
- `lessons Lesson[]`

### `Lesson`

- `id String @id @default(cuid())`
- `courseId String`
- `title String`
- `content String`
- `videoUrl String?`
- `imageUrl String?`
- `audioUrl String?`
- `fileUrl String?`
- `fileName String?`
- `filePassword String?`
- `guideContent String @default("{}") // JSON: { steps: [{ step, title, titleEn, description, descriptionEn, imageUrl, videoUrl }] }`
- `duration Int @default(0)`
- `order Int @default(0)`
- `resources String @default("[]")`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`
- `course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)` → relation

### `Article`

- `id String @id @default(cuid())`
- `title String`
- `slug String @unique`
- `excerpt String`
- `content String`
- `coverImage String?`
- `authorId String`
- `authorName String`
- `category String`
- `tags String @default("[]")`
- `status String @default("draft")`
- `readingTime Int @default(0)`
- `views Int @default(0)`
- `metaTitle String?`
- `metaDescription String?`
- `publishedAt DateTime?`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`
- `categoryEn String?`
- `contentEn String?`
- `excerptEn String?`
- `metaDescriptionEn String?`
- `metaTitleEn String?`
- `titleEn String?`

### `AdminAuditLog`

- `id String @id @default(cuid())`
- `adminId String`
- `adminName String`
- `action String`
- `targetType String`
- `targetId String`
- `targetRef String?`
- `before String?`
- `after String?`
- `ipAddress String?`
- `userAgent String?`
- `createdAt DateTime @default(now())`

### `Notification`

- `id String @id @default(cuid())`
- `userId String`
- `type String`
- `title String`
- `message String`
- `link String?`
- `read Boolean @default(false)`
- `createdAt DateTime @default(now())`
- `user User @relation(fields: [userId], references: [id], onDelete: Cascade)` → relation

### `BankCard`

- `id String @id @default(cuid())`
- `cardNumber String`
- `shebaNumber String`
- `bankName String`
- `accountHolder String`
- `isActive Boolean @default(true)`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`

### `Review`

- `id String @id @default(cuid())`
- `rating Int`
- `comment String?`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`
- `userId String`
- `productId String`
- `product Product @relation(fields: [productId], references: [id], onDelete: Cascade)` → relation
- `user User @relation(fields: [userId], references: [id], onDelete: Cascade)` → relation

### `LicenseInventory`

- `id String @id @default(cuid())`
- `productId String`
- `durationDays Int @default(30)`
- `licenseKey String`
- `status String @default("available")`
- `orderId String?`
- `assignedAt DateTime?`
- `createdAt DateTime @default(now())`
- `order Order? @relation(fields: [orderId], references: [id])`
- `product Product @relation(fields: [productId], references: [id])` → relation

---

_Regenerated from `prisma/schema.prisma`._
