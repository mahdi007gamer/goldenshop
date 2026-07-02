/**
 * WordPress Products → Database Import Script
 * Reads cleaned products and imports into Prisma database
 *
 * Usage: node scripts/wp-import-products-to-db.js
 * Note: Idempotent — skips products that already exist (by slug)
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

const CLEANED_DIR = path.join(process.cwd(), "content", "products", "cleaned");

// ============================================================
// Generate a unique slug (handle duplicates)
// ============================================================
async function generateUniqueSlug(baseSlug) {
  let slug = decodeURIComponent(baseSlug);

  // Sanitize: replace non-alphanumeric (except dash/underscore) with dash
  slug = slug.replace(/[^a-zA-Z0-9؀-ۿ\-_]/g, "-");
  slug = slug.replace(/-+/g, "-").replace(/^-|-$/g, "");

  // Ensure uniqueness
  let counter = 1;
  let candidateSlug = slug;
  while (await prisma.product.findUnique({ where: { slug: candidateSlug } })) {
    candidateSlug = `${slug}-${counter}`;
    counter++;
  }

  return candidateSlug;
}

// ============================================================
// Main
// ============================================================
async function importToDb() {
  console.log("=== WordPress Products → Database Import ===\n");

  // Read all cleaned products
  const files = fs.readdirSync(CLEANED_DIR).filter((f) => f.endsWith(".json"));
  console.log(`Found ${files.length} cleaned products\n`);

  if (files.length === 0) {
    console.log("No products found. Run wp-import-products.js first.");
    return;
  }

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const product = JSON.parse(fs.readFileSync(path.join(CLEANED_DIR, file), "utf8"));

    // Check if already exists (by slug)
    const decodedSlug = decodeURIComponent(product.slug);
    const existing = await prisma.product.findFirst({
      where: { slug: decodedSlug },
    });

    try {
      // Generate unique slug (only for new products)
      const slug = existing ? existing.slug : await generateUniqueSlug(product.slug);

      // Prepare pricing fields
      const prices = product.prices || {};

      // Prepare features (JSON array)
      const features = product.features || [];

      // Prepare gallery images (JSON array) — merge featured + content images
      const galleryImages = product.localContentImages || [];

      // Cover image — use local path if available, otherwise WP URL, otherwise first gallery image
      let imageUrl = null;
      if (product.localFeaturedImage) {
        imageUrl = product.localFeaturedImage;
      } else if (product.featuredImage) {
        try {
          const filename = path.basename(new URL(product.featuredImage).pathname);
          const localPath = path.join(process.cwd(), "content", "products", "images", filename);
          if (fs.existsSync(localPath)) {
            imageUrl = `/uploads/products/${filename}`;
          } else {
            imageUrl = product.featuredImage; // Fallback to WP URL
          }
        } catch {
          imageUrl = product.featuredImage;
        }
      }
      // If still no image, use first gallery image
      if (!imageUrl && galleryImages.length > 0) {
        const first = galleryImages.find(u => u.startsWith('/uploads/'));
        if (first) imageUrl = first;
      }

      // Prepare tags (JSON array) — add defaults if empty
      const tags = product.tags || [];
      if (tags.length === 0) {
        const game = product.game || '';
        if (game) tags.push(game);
        if (product.category) tags.push(product.category);
        // Add generic cheat tag
        if (product.name && product.name.includes('چیت')) tags.push('چیت');
      }

      // Upsert product in database
      const created = await prisma.product.upsert({
        where: { slug: decodeURIComponent(product.slug) },
        update: {
          name: product.name,
          game: product.game || "Unknown",
          category: product.category || "Aimbot",
          price: prices.monthly || 400000,
          priceDaily: prices.daily || null,
          priceWeekly: prices.weekly || null,
          priceBiWeekly: prices.biweekly || null,
          priceMonthly: prices.monthly || null,
          priceBimonthly: prices.bimonthly || null,
          priceQuarterly: prices.quarterly || null,
          priceLifetime: prices.lifetime || null,
          description: product.description || "",
          shortDesc: product.shortDesc || null,
          imageUrl: imageUrl,
          galleryImages: JSON.stringify(galleryImages),
          features: JSON.stringify(features),
          tags: JSON.stringify(tags),
          status: product.status === "active" ? "active" : "draft",
          bypassRate: "100%",
          updateStatus: "Undetected",
          metaTitle: product.name,
          metaDescription: product.shortDesc ? product.shortDesc.substring(0, 160) : null,
        },
        create: {
          name: product.name,
          slug: slug,
          game: product.game || "Unknown",
          category: product.category || "Aimbot",
          price: prices.monthly || 400000,
          priceDaily: prices.daily || null,
          priceWeekly: prices.weekly || null,
          priceBiWeekly: prices.biweekly || null,
          priceMonthly: prices.monthly || null,
          priceBimonthly: prices.bimonthly || null,
          priceQuarterly: prices.quarterly || null,
          priceLifetime: prices.lifetime || null,
          description: product.description || "",
          shortDesc: product.shortDesc || null,
          imageUrl: imageUrl,
          galleryImages: JSON.stringify(galleryImages),
          features: JSON.stringify(features),
          tags: JSON.stringify(tags),
          status: product.status === "active" ? "active" : "draft",
          bypassRate: "100%",
          updateStatus: "Undetected",
          metaTitle: product.name,
          metaDescription: product.shortDesc ? product.shortDesc.substring(0, 160) : null,
        },
      });

      if (existing) {
        console.log(`   ↻ Updated: ${created.name.substring(0, 50)}... (tags: ${tags.length})`);
        skipped++;
      } else {
        console.log(`   ✓ Imported: ${created.name.substring(0, 50)}... (slug: ${created.slug}, game: ${created.game})`);
        imported++;
      }
    } catch (err) {
      console.log(`   ❌ Error importing ${product.name}: ${err.message}`);
      errors++;
    }
  }

  // Summary
  console.log("\n========================================");
  console.log("         IMPORT COMPLETE");
  console.log("========================================");
  console.log(`Total products: ${files.length}`);
  console.log(`Imported: ${imported}`);
  console.log(`Skipped (already exist): ${skipped}`);
  console.log(`Errors: ${errors}`);

  // Verify
  const totalInDb = await prisma.product.count();
  console.log(`\nTotal products in database: ${totalInDb}`);

  // Game breakdown
  const games = await prisma.product.groupBy({
    by: ["game"],
    _count: { game: true },
  });
  console.log("\n--- Products by Game ---");
  games.forEach((g) => {
    console.log(`  ${g.game}: ${g._count.game}`);
  });
}

// ============================================================
// Run
// ============================================================
importToDb()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("\n❌ Import failed:", e.message);
    prisma.$disconnect();
    process.exit(1);
  });
