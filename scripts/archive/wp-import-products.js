/**
 * WordPress Product Import Script
 * Fetches products from goldencheat.ir WP REST API, cleans HTML, maps categories/tags,
 * assigns default prices based on game/category, saves raw + cleaned data.
 *
 * Usage: node scripts/wp-import-products.js
 * Note: Run WITHOUT proxy/VPN for goldencheat.ir domain.
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const WP_BASE = "https://goldencheat.ir/wp-json/wp/v2";
const OUTPUT_DIR = path.join(process.cwd(), "content", "products");
const RAW_DIR = path.join(OUTPUT_DIR, "raw");
const CLEANED_DIR = path.join(OUTPUT_DIR, "cleaned");

// Ensure directories exist
[RAW_DIR, CLEANED_DIR].forEach((d) => fs.mkdirSync(d, { recursive: true }));

// ============================================================
// Default Pricing (IRR) by game
// ============================================================
const GAME_PRICING = {
  "dota 2": 500000,
  "cs2": 450000,
  "csgo": 450000,
  "valorant": 550000,
  "apex legends": 400000,
  "apex": 400000,
  "r6 siege": 450000,
  "r6": 450000,
  "rainbow six": 450000,
  "gta v": 350000,
  "gta": 350000,
  "gta5": 350000,
  "fivem": 300000,
  "pubg": 350000,
  "pubg mobile": 350000,
  "pubg lite": 350000,
  "pubg pc": 350000,
  "battlefield 6": 400000,
  "delta force": 400000,
  "dead by daylight": 400000,
  "dayz": 350000,
  "mobile legends": 400000,
  "scum": 350000,
  "zula": 350000,
};

const DEFAULT_PRICE = 400000; // Fallback for unknown games

/**
 * Calculate all duration prices from a base monthly price
 */
function calculateDurationPrices(monthlyPrice) {
  return {
    daily: Math.round(monthlyPrice * 0.15),
    weekly: Math.round(monthlyPrice * 0.4),
    biweekly: Math.round(monthlyPrice * 0.7),
    monthly: monthlyPrice,
    bimonthly: Math.round(monthlyPrice * 1.8),
    quarterly: Math.round(monthlyPrice * 2.5),
    lifetime: Math.round(monthlyPrice * 4.0),
  };
}

/**
 * Detect game from category names and product title
 */
function detectGame(categoryNames, title) {
  const titleLower = title.toLowerCase();

  // Check title first (most specific)
  const gameKeywords = [
    { keywords: ["dota 2", "dota2"], game: "Dota 2" },
    { keywords: ["cs2", "counter-strike 2", "counter strike 2"], game: "CS2" },
    { keywords: ["csgo", "cs:go", "cs go"], game: "CS2" },
    { keywords: ["valorant"], game: "Valorant" },
    { keywords: ["apex", "apex legends"], game: "Apex Legends" },
    { keywords: ["r6", "rainbow six", "rainbow 6"], game: "R6 Siege" },
    { keywords: ["gta v", "gta5", "gta 5", "grand theft auto"], game: "GTA V" },
    { keywords: ["fivem", "five m"], game: "FiveM" },
    { keywords: ["pubg mobile", "pubgm"], game: "Pubg Mobile" },
    { keywords: ["pubg lite"], game: "Pubg Lite" },
    { keywords: ["pubg pc", "pubg"], game: "Pubg PC" },
    { keywords: ["battlefield 6", "bf6", "battlefield6"], game: "Battlefield 6" },
    { keywords: ["delta force", "deltaforce"], game: "Delta Force" },
    { keywords: ["dead by daylight", "dbd"], game: "Dead by Daylight" },
    { keywords: ["dayz"], game: "DayZ" },
    { keywords: ["mobile legends", "mlbb"], game: "Mobile Legends" },
    { keywords: ["scum"], game: "Scum" },
    { keywords: ["zula"], game: "Zula" },
  ];

  for (const { keywords, game } of gameKeywords) {
    if (keywords.some((kw) => titleLower.includes(kw))) {
      return game;
    }
  }

  // Check category names
  for (const catName of categoryNames) {
    const catLower = catName.toLowerCase();
    for (const { keywords, game } of gameKeywords) {
      if (keywords.some((kw) => catLower.includes(kw))) {
        return game;
      }
    }
  }

  return "Unknown";
}

/**
 * Detect category type from title and tags
 */
function detectCategoryType(title, tagNames, categoryNames) {
  const allText = [title, ...tagNames, ...categoryNames].join(" ").toLowerCase();

  if (allText.includes("aimbot") || allText.includes("aim bot") || allText.includes("قفل هدف")) {
    return "Aimbot";
  }
  if (allText.includes("wallhack") || allText.includes("wall hack") || allText.includes("وال هک")) {
    return "Wallhack";
  }
  if (allText.includes("esp") || allText.includes("نمایش دشمن") || allText.includes("دشمن")) {
    return "ESP Overlay";
  }
  if (allText.includes("hwid") || allText.includes("spoofer") || allText.includes("اسپوفر")) {
    return "HWID Spoofer";
  }
  if (allText.includes("skin") || allText.includes("اسکین") || allText.includes("skin changer")) {
    return "Skin Changer";
  }
  if (allText.includes("radar") || allText.includes("رادار")) {
    return "Radar";
  }

  // Check for multi-cheat (has multiple features)
  const featureCount = ["aimbot", "wallhack", "esp", "hwid", "skin", "radar"].filter((f) =>
    allText.includes(f)
  ).length;
  if (featureCount >= 2) return "Aimbot"; // Multi-cheats default to Aimbot category

  return "Aimbot"; // Default
}

// ============================================================
// HTTP Request helper (uses PowerShell to bypass proxy)
// ============================================================
async function fetchJson(url) {
  const psCmd = `powershell -Command "$r = Invoke-WebRequest -Uri '${url}' -UseBasicParsing -TimeoutSec 30; $r.Content"`;
  return new Promise((resolve, reject) => {
    const child = require("child_process").exec(psCmd, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(`PowerShell fetch failed: ${stderr || err.message}`));
      try {
        resolve(JSON.parse(stdout.trim()));
      } catch (parseErr) {
        reject(new Error(`JSON parse failed for ${url}: ${parseErr.message}`));
      }
    });
  });
}

// ============================================================
// HTML Cleaning
// ============================================================
function cleanHtml(html) {
  if (!html) return "";

  let cleaned = html;

  // Decode common HTML entities
  const entities = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&nbsp;": " ",
    "&#8217;": "'",
    "&#8216;": "'",
    "&#8220;": '"',
    "&#8221;": '"',
    "&#8211;": "-",
    "&#8212;": "-",
    "&#8230;": "...",
    "&hellip;": "...",
    "&mdash;": "-",
    "&ndash;": "-",
    "&#038;": "&",
  };
  for (const [entity, char] of Object.entries(entities)) {
    cleaned = cleaned.split(entity).join(char);
  }

  // Remove empty self-closing divs/spans with no content
  cleaned = cleaned.replace(/<div[^>]*>\s*<\/div>/g, "");
  cleaned = cleaned.replace(/<span[^>]*>\s*<\/span>/g, "");
  cleaned = cleaned.replace(/<p[^>]*>\s*<\/p>/g, "");

  // Fix relative URLs in href/src (wp-content/uploads → local path)
  cleaned = cleaned.replace(
    /href="(\/wp-content\/uploads\/([^"]+))"/g,
    'href="/uploads/products/$2"'
  );
  cleaned = cleaned.replace(
    /src="(\/wp-content\/uploads\/([^"]+))"/g,
    'src="/uploads/products/$2"'
  );
  cleaned = cleaned.replace(
    /src='(\/wp-content\/uploads\/([^']+))'/g,
    "src='/uploads/products/$2'"
  );

  // Handle full URLs pointing to wp-content/uploads
  cleaned = cleaned.replace(
    /https?:\/\/goldencheat\.ir\/wp-content\/uploads\/([^"'\s)]+)/g,
    "/uploads/products/$1"
  );

  // Remove empty paragraphs with only whitespace/nbsp
  cleaned = cleaned.replace(/<p[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/p>/g, "");

  // Remove multiple consecutive empty lines
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, "\n\n");

  return cleaned.trim();
}

// ============================================================
// Extract all image URLs from content
// ============================================================
function extractAllImages(html) {
  const images = [];
  const srcRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
  let match;
  while ((match = srcRegex.exec(html)) !== null) {
    if (!match[1].startsWith("data:")) images.push(match[1]);
  }
  const lazyRegex = /<img[^>]+data-src=["']([^"']+)["'][^>]*>/g;
  while ((match = lazyRegex.exec(html)) !== null) {
    if (!match[1].startsWith("data:")) images.push(match[1]);
  }
  return [...new Set(images)];
}

// ============================================================
// Extract features from content (list items, headings)
// ============================================================
function extractFeatures(content) {
  const features = [];

  // Extract list items
  const liRegex = /<li[^>]*>(.*?)<\/li>/g;
  let match;
  while ((match = liRegex.exec(content)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, "").trim();
    if (text && text.length > 2 && text.length < 100) {
      features.push(text);
    }
  }

  // Extract headings as features if short
  const hRegex = /<h[1-4][^>]*>(.*?)<\/h[1-4]>/g;
  while ((match = hRegex.exec(content)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, "").trim();
    if (text && text.length > 2 && text.length < 80) {
      features.push(text);
    }
  }

  return [...new Set(features)].slice(0, 10); // Max 10 features
}

// ============================================================
// Main Import Logic
// ============================================================
async function importProducts() {
  console.log("=== WordPress Product Import ===\n");

  // 1. Fetch categories
  console.log("📁 Fetching categories...");
  let categories = {};
  try {
    const cats = await fetchJson(`${WP_BASE}/product_cat?per_page=100`);
    for (const cat of cats) {
      categories[cat.id] = { name: cat.name, slug: cat.slug };
    }
    console.log(`   Found ${Object.keys(categories).length} categories`);
  } catch (e) {
    console.log("   ⚠️ Categories fetch failed:", e.message);
  }

  // 2. Fetch tags
  console.log("\n🏷️  Fetching tags...");
  let tags = {};
  try {
    const tgs = await fetchJson(`${WP_BASE}/product_tag?per_page=100`);
    for (const tag of tgs) {
      tags[tag.id] = { name: tag.name, slug: tag.slug };
    }
    console.log(`   Found ${Object.keys(tags).length} tags`);
  } catch (e) {
    console.log("   ⚠️ Tags fetch failed:", e.message);
  }

  // 3. Fetch media (for featured image mapping)
  console.log("\n🖼️  Fetching media...");
  let media = {};
  try {
    let page = 1;
    let totalPages = 1;
    while (page <= totalPages) {
      const medias = await fetchJson(`${WP_BASE}/media?per_page=100&page=${page}`);
      if (page === 1 && medias.length > 0) {
        totalPages = medias.length >= 100 ? 2 : 1;
      }
      for (const m of medias) {
        media[m.id] = {
          url: m.source_url,
          alt: m.alt_text || "",
          title: m.title?.rendered || "",
        };
      }
      page++;
    }
    console.log(`   Found ${Object.keys(media).length} media items`);
  } catch (e) {
    console.log("   ⚠️ Media fetch failed:", e.message);
  }

  // 4. Fetch products
  console.log("\n📦 Fetching products...");
  let products = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const url = `${WP_BASE}/product?per_page=100&page=${page}`;
    try {
      const prods = await fetchJson(url);
      if (!Array.isArray(prods) || prods.length === 0) break;
      products = products.concat(prods);
      console.log(`   Page ${page}: ${prods.length} products (total so far: ${products.length})`);
      page++;
      if (prods.length < 100) break;
    } catch (e) {
      console.log(`   ❌ Failed to fetch page ${page}:`, e.message);
      break;
    }
  }

  if (products.length === 0) {
    console.log("\n❌ No products fetched. Check VPN/network connection.");
    return;
  }

  console.log(`\n✅ Fetched ${products.length} products total`);

  // 5. Process each product
  console.log("\n🔄 Processing products...");
  const processedProducts = [];

  for (const prod of products) {
    // Build category names
    const categoryIds = prod.product_cat || [];
    const categoryNames = categoryIds
      .map((id) => categories[id]?.name || "")
      .filter(Boolean);

    // Build tag names
    const tagIds = prod.product_tag || [];
    const tagNames = tagIds
      .map((id) => tags[id]?.name || "")
      .filter(Boolean);

    // Get featured image URL
    let featuredImageUrl = null;
    if (prod.featured_media && media[prod.featured_media]) {
      featuredImageUrl = media[prod.featured_media].url;
    }

    // Clean content
    const rawContent = prod.content?.rendered || "";
    const cleanedContent = cleanHtml(rawContent);

    // Extract all images from content
    const contentImages = extractAllImages(rawContent);

    // Extract features from content
    const features = extractFeatures(rawContent);

    // Detect game and category
    const game = detectGame(categoryNames, prod.title?.rendered || "");
    const categoryType = detectCategoryType(
      prod.title?.rendered || "",
      tagNames,
      categoryNames
    );

    // Calculate pricing
    const gameLower = game.toLowerCase();
    const monthlyPrice = GAME_PRICING[gameLower] || DEFAULT_PRICE;
    const prices = calculateDurationPrices(monthlyPrice);

    // Build product object
    const product = {
      wpId: prod.id,
      name: prod.title?.rendered || "",
      slug: prod.slug,
      game: game,
      category: categoryType,
      prices: prices,
      description: cleanedContent,
      shortDesc: cleanHtml(prod.excerpt?.rendered || ""),
      featuredImage: featuredImageUrl,
      contentImages: contentImages,
      features: features,
      tags: tagNames,
      categoryNames: categoryNames,
      status: prod.status === "publish" ? "active" : "draft",
      publishedAt: prod.date,
      modifiedAt: prod.modified,
      wpLink: prod.link,
    };

    processedProducts.push(product);

    // Decode slug for filename
    const decodedSlug = decodeURIComponent(prod.slug);

    // Save raw JSON
    const rawFile = path.join(RAW_DIR, `${decodedSlug}.json`);
    fs.writeFileSync(rawFile, JSON.stringify(prod, null, 2), "utf8");

    // Save cleaned JSON
    const cleanedFile = path.join(CLEANED_DIR, `${decodedSlug}.json`);
    fs.writeFileSync(cleanedFile, JSON.stringify(product, null, 2), "utf8");

    console.log(`   ✓ ${decodedSlug} | game=${game} | price=${prices.monthly} IRR | images=${contentImages.length}`);
  }

  // 6. Save taxonomies
  console.log("\n📋 Saving taxonomy mappings...");
  const taxonomies = {
    categories: categories,
    tags: tags,
    totalMedia: Object.keys(media).length,
  };
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "taxonomies.json"),
    JSON.stringify(taxonomies, null, 2),
    "utf8"
  );

  // 7. Summary report
  const totalImages = processedProducts.reduce((sum, p) => sum + p.contentImages.length, 0);
  const gameBreakdown = {};
  processedProducts.forEach((p) => {
    gameBreakdown[p.game] = (gameBreakdown[p.game] || 0) + 1;
  });

  console.log("\n========================================");
  console.log("           IMPORT COMPLETE");
  console.log("========================================");
  console.log(`Products: ${products.length}`);
  console.log(`Categories: ${Object.keys(categories).length}`);
  console.log(`Tags: ${Object.keys(tags).length}`);
  console.log(`Media items: ${Object.keys(media).length}`);
  console.log(`Content images found: ${totalImages}`);
  console.log(`Raw data: ${RAW_DIR}`);
  console.log(`Cleaned data: ${CLEANED_DIR}`);

  console.log("\n--- Game Breakdown ---");
  Object.entries(gameBreakdown).forEach(([game, count]) => {
    console.log(`  ${game}: ${count}`);
  });

  console.log("\n--- Products Summary ---");
  processedProducts.forEach((p, i) => {
    console.log(`${i + 1}. [${p.status}] ${p.name}`);
    console.log(`   Slug: ${p.slug} | Game: ${p.game} | Category: ${p.category}`);
    console.log(`   Price: ${p.prices.monthly} IRR | Images: ${p.contentImages.length} | Features: ${p.features.length}`);
  });
}

// ============================================================
// Run
// ============================================================
importProducts().catch((e) => {
  console.error("\n❌ Import failed:", e.message);
  process.exit(1);
});
