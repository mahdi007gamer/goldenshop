/**
 * WordPress Blog → Database Import Script
 * Reads cleaned articles and imports into Prisma database
 *
 * Usage: node scripts/wp-import-to-db.js
 * Note: Idempotent — skips articles that already exist (by slug)
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

const CLEANED_DIR = path.join(process.cwd(), "content", "blog", "articles", "cleaned");

// ============================================================
// Map WP category to Article category field
// ============================================================
function mapCategory(wpCategory) {
  // Map Persian/Finglish categories to standard categories
  const categoryMap = {
    general: "عمومی",
    fivem: "FiveM",
    "بدون-دسته‌بندی": "عمومی",
    uncategorized: "عمومی",
  };

  if (!wpCategory) return "عمومی";
  const lower = wpCategory.toLowerCase();
  return categoryMap[lower] || categoryMap[wpCategory] || wpCategory;
}

// ============================================================
// Generate a unique slug (handle duplicates)
// ============================================================
async function generateUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 1;

  // Decode URL-encoded slug
  try {
    slug = decodeURIComponent(slug);
  } catch {}

  // Sanitize: replace non-alphanumeric (except dash/underscore) with dash
  slug = slug.replace(/[^a-zA-Z0-9؀-ۿ\-_]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  // Ensure uniqueness
  while (await prisma.article.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// ============================================================
// Main
// ============================================================
async function importToDb() {
  console.log("=== WordPress Blog → Database Import ===\n");

  // Read all cleaned articles
  const files = fs.readdirSync(CLEANED_DIR).filter((f) => f.endsWith(".json"));
  console.log(`Found ${files.length} cleaned articles\n`);

  if (files.length === 0) {
    console.log("No articles found. Run wp-import-blog.js first.");
    return;
  }

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const article = JSON.parse(fs.readFileSync(path.join(CLEANED_DIR, file), "utf8"));

    // Check if already exists (by slug)
    const existing = await prisma.article.findFirst({
      where: { slug: decodeURIComponent(article.slug) },
    });

    if (existing) {
      console.log(`   ⏭️  Skipping (exists): ${article.title.substring(0, 50)}...`);
      skipped++;
      continue;
    }

    try {
      // Generate unique slug
      const slug = await generateUniqueSlug(article.slug);

      // Map category
      const category = mapCategory(article.categorySlug || article.category);

      // Prepare tags (JSON array)
      const tags = article.tags || [];

      // Cover image — convert WP URL to local path if downloaded
      let coverImage = null;
      if (article.featuredImage) {
        const filename = path.basename(new URL(article.featuredImage).pathname);
        const localPath = path.join(process.cwd(), "content", "blog", "images", "articles", filename);
        if (fs.existsSync(localPath)) {
          coverImage = `/uploads/articles/${filename}`;
        } else {
          // Keep original URL as fallback
          coverImage = article.featuredImage;
        }
      }

      // Create article in database
      const created = await prisma.article.create({
        data: {
          title: article.title,
          slug: slug,
          excerpt: article.excerpt.substring(0, 500), // Limit excerpt length
          content: article.content,
          coverImage: coverImage,
          authorId: "admin-001", // Default to admin
          authorName: "Golden Cheat",
          category: category,
          tags: JSON.stringify(tags),
          status: article.status === "publish" ? "published" : "draft",
          readingTime: article.readingTime || 5,
          publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
          metaTitle: article.title,
          metaDescription: article.excerpt.substring(0, 160),
        },
      });

      console.log(`   ✓ Imported: ${created.title.substring(0, 50)}... (slug: ${created.slug})`);
      imported++;
    } catch (err) {
      console.log(`   ❌ Error importing ${article.title}: ${err.message}`);
      errors++;
    }
  }

  // Summary
  console.log("\n========================================");
  console.log("         IMPORT COMPLETE");
  console.log("========================================");
  console.log(`Total articles: ${files.length}`);
  console.log(`Imported: ${imported}`);
  console.log(`Skipped (already exist): ${skipped}`);
  console.log(`Errors: ${errors}`);

  // Verify
  const totalInDb = await prisma.article.count();
  console.log(`\nTotal articles in database: ${totalInDb}`);
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
