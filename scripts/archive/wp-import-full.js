/**
 * Full WordPress → Database Import Script
 * Imports ALL products with images, gallery, pricing tiers, descriptions
 *
 * Usage: node scripts/wp-import-full.js
 * Note: Idempotent — skips products that already exist (by slug), updates if exists
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const prisma = new PrismaClient();

const WP_JSON = "D:/ClaudeCode/golden-cheat-next/wp-import/all-products.json";
const WP_VARS = "D:/ClaudeCode/golden-cheat-next/wp-import/all-variations.json";
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "products");
const WP_CONSUMER_KEY = "ck_94b2faf21cafade1ea1937f044c8e3d66bf3f1b8";
const WP_CONSUMER_SECRET = "cs_a1a854e659971641380bad065b7e0053b455817a";

// ============================================================
// Download image from URL to local path
// ============================================================
function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    protocol
      .get(url, { timeout: 15000 }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadImage(res.headers.location, destPath).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const file = fs.createWriteStream(destPath);
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (e) => reject(e));
  });
}

// ============================================================
// Generate unique slug (ASCII-only for new products)
// ============================================================
async function generateUniqueSlug(baseSlug, excludeId = null) {
  let slug = decodeURIComponent(baseSlug);
  // Convert to ASCII-only slug (English)
  slug = slug.replace(/[^a-zA-Z0-9\-_]/g, "-");
  slug = slug.replace(/-+/g, "-").replace(/^-|-$/g, "");
  // If empty after sanitization, use product name
  if (!slug || slug.length < 2) {
    slug = "product";
  }

  let counter = 1;
  let candidateSlug = slug;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug: candidateSlug } });
    if (!existing || (excludeId && existing.id === excludeId)) break;
    candidateSlug = `${slug}-${counter}`;
    counter++;
  }
  return candidateSlug;
}

// ============================================================
// Extract pricing tiers from variations
// ============================================================
function extractPricing(variations) {
  const durations = {};
  for (const v of variations) {
    let days = 0;
    for (const a of v.attributes || []) {
      const name = a.name || "";
      const option = a.option || "";
      // Match any attribute that contains duration info
      // Common patterns: زمان-چیت, مدت-زمان, مدت-زمان-چیت, زمان-استفاده, dota-2, etc.
      if (
        name.includes("زمان") ||
        name.includes("مدت") ||
        name.includes("dota") ||
        name.includes("مدت-زمان")
      ) {
        if (option.includes("LifeTime") || option.includes("بدون محدودیت")) {
          days = 99999;
        } else {
          const m = option.match(/(\d+)/);
          if (m) days = parseInt(m[1]);
        }
      }
    }
    const price = parseFloat(v.price || "0");
    if (price > 0 && (!(days in durations) || price < durations[days])) {
      durations[days] = price;
    }
  }

  return {
    priceDaily: durations[1] || null,
    priceWeekly: durations[7] || null,
    priceMonthly: durations[30] || null,
    priceLifetime: durations[99999] || null,
    // Also store all variations as JSON for reference
    allTiers: Object.entries(durations)
      .map(([d, p]) => ({ days: parseInt(d), price: p }))
      .sort((a, b) => a.days - b.days),
  };
}

// ============================================================
// Main import
// ============================================================
async function importAll() {
  console.log("=== Full WordPress → Database Import ===\n");

  const products = JSON.parse(fs.readFileSync(WP_JSON, "utf8"));
  const variations = JSON.parse(fs.readFileSync(WP_VARS, "utf8"));

  // Build variation lookup by ID
  const varById = {};
  for (const v of variations) {
    varById[v.id] = v;
  }

  // Build parent product lookup for each variation
  const varToProduct = {};
  for (const p of products) {
    for (const vid of p.variations || []) {
      varToProduct[vid] = p.id;
    }
  }

  // Ensure uploads dir exists
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  let imported = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const p of products) {
    try {
      // Skip draft/private products (optional — set to true to include)
      if (p.status === "draft") {
        console.log(`   ⏭ Skipping draft: ${p.name.substring(0, 50)}`);
        skipped++;
        continue;
      }

      // Check if exists — try multiple slug formats
      const decodedSlug = decodeURIComponent(p.slug);
      // Also try ASCII-only version (for old products with English slugs)
      const asciiSlug = decodedSlug.replace(/[^a-zA-Z0-9\-_]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      // Try to find by slug, slugEn, or by name match
      const existing = await prisma.product.findFirst({
        where: {
          OR: [
            { slug: decodedSlug },
            { slugEn: decodedSlug },
            { slug: asciiSlug },
            { slugEn: asciiSlug },
            { name: p.name },
          ],
        },
      });

      // Use existing slug if found, otherwise generate new unique slug
      const slug = existing ? existing.slug : await generateUniqueSlug(p.slug);

      // Extract images
      const images = p.images || [];
      const galleryUrls = [];
      let imageUrl = null;

      // Download images
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const imgUrl = img.src;
        let filename;
        try {
          filename = path.basename(new URL(imgUrl).pathname);
        } catch {
          filename = `product-${p.id}-${i}.jpg`;
        }

        const localPath = path.join(UPLOADS_DIR, filename);
        const localUrl = `/uploads/products/${filename}`;

        // Download if not exists locally
        if (!fs.existsSync(localPath)) {
          try {
            await downloadImage(imgUrl, localPath);
          } catch (e) {
            console.log(`     ⚠ Image download failed: ${e.message}`);
          }
        }

        galleryUrls.push(localUrl);
        if (i === 0) imageUrl = localUrl;
      }

      // Extract pricing from variations
      const productVars = (p.variations || []).map((vid) => varById[vid]).filter(Boolean);
      const pricing = extractPricing(productVars);

      // For simple products without variations, use regular/sale price
      if (productVars.length === 0) {
        const regular = parseFloat(p.regular_price || "0");
        const sale = parseFloat(p.sale_price || "0");
        if (regular > 0) {
          pricing.priceDaily = regular; // For simple products, treat as base price
          if (sale > 0) pricing.priceDaily = sale;
        }
      }

      // Determine final price (lowest tier or simple price)
      const finalPrice =
        pricing.priceDaily || pricing.priceWeekly || pricing.priceMonthly || pricing.priceLifetime || parseFloat(p.price || "0") || 0;

      // Prepare tags
      const tags = [];
      for (const c of p.categories || []) tags.push(c.name);
      for (const t of p.tags || []) tags.push(t.name);
      if (tags.length === 0) {
        if (p.game) tags.push(p.game);
        if (p.category) tags.push(p.category);
      }

      // Prepare features from description (extract key points)
      const features = [];
      const descText = (p.description || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const shortDescText = (p.short_description || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // Status mapping
      const status = p.status === "publish" ? "active" : p.status === "private" ? "private" : "draft";

      // Build product data
      const productData = {
        name: p.name,
        slug: slug,
        slugEn: p.slug,
        game: p.categories?.[0]?.name || p.game || "Unknown",
        category: p.tags?.[0]?.name || p.category || "چیت",
        price: finalPrice,
        salePrice: pricing.priceDaily && pricing.priceDaily < (pricing.priceWeekly || Infinity) ? pricing.priceDaily : null,
        priceDaily: pricing.priceDaily,
        priceWeekly: pricing.priceWeekly,
        priceMonthly: pricing.priceMonthly,
        priceLifetime: pricing.priceLifetime,
        rating: parseFloat(p.average_rating) || 0,
        reviewsCount: parseInt(p.rating_count) || 0,
        description: p.description || "",
        descriptionFa: p.description || "",
        shortDesc: p.short_description || null,
        shortDescFa: p.short_description || null,
        longDescription: descText.substring(0, 5000),
        tags: JSON.stringify(tags),
        tagsEn: JSON.stringify([]),
        features: JSON.stringify(features),
        featuresFa: JSON.stringify(features),
        featuresEn: JSON.stringify([]),
        imageUrl: imageUrl,
        bannerImage: galleryUrls[1] || null,
        galleryImages: JSON.stringify(galleryUrls),
        galleryItems: JSON.stringify(galleryUrls.map((url, i) => ({ url, alt: `${p.name} - تصویر ${i + 1}` }))),
        featuresDetail: JSON.stringify(pricing.allTiers),
        status: status,
        bypassRate: "100%",
        updateStatus: "Undetected",
        isPopular: p.featured || false,
        metaTitle: p.name,
        metaDescription: shortDescText.substring(0, 160),
        metaTitleFa: p.name,
        metaDescriptionFa: shortDescText.substring(0, 160),
        videoUrl: null,
        audioUrl: null,
      };

      // Upsert using the correct slug
      // For existing products: use existing DB slug in where clause
      // For new products: use the generated slug
      const upsertSlug = existing ? existing.slug : slug;
      const result = await prisma.product.upsert({
        where: { slug: upsertSlug },
        update: productData,
        create: productData,
      });

      if (existing) {
        console.log(`   ↻ Updated: ${result.name.substring(0, 50)} | daily=${pricing.priceDaily} weekly=${pricing.priceWeekly} monthly=${pricing.priceMonthly} lifetime=${pricing.priceLifetime} | imgs=${galleryUrls.length}`);
        updated++;
      } else {
        console.log(`   ✓ Imported: ${result.name.substring(0, 50)} | slug=${result.slug} | imgs=${galleryUrls.length}`);
        imported++;
      }
    } catch (err) {
      console.log(`   ❌ Error: ${p.name.substring(0, 50)} — ${err.message}`);
      errors++;
    }
  }

  // Summary
  console.log("\n========================================");
  console.log("         IMPORT COMPLETE");
  console.log("========================================");
  console.log(`Total WP products: ${products.length}`);
  console.log(`Imported: ${imported}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped (draft): ${skipped}`);
  console.log(`Errors: ${errors}`);

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
importAll()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("\n❌ Import failed:", e.message);
    prisma.$disconnect();
    process.exit(1);
  });
