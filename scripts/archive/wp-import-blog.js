/**
 * WordPress Blog Import Script
 * Fetches posts from goldencheat.ir WP REST API, cleans HTML, saves raw + cleaned data
 *
 * Usage: node scripts/wp-import-blog.js
 * Requires: --noproxy or Invoke-WebRequest (Windows PowerShell)
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const WP_BASE = "https://goldencheat.ir/wp-json/wp/v2";
const OUTPUT_DIR = path.join(process.cwd(), "content", "blog", "articles");
const RAW_DIR = path.join(OUTPUT_DIR, "wp-raw");
const CLEANED_DIR = path.join(OUTPUT_DIR, "cleaned");

// Ensure directories exist
[RAW_DIR, CLEANED_DIR].forEach((d) => fs.mkdirSync(d, { recursive: true }));

// ============================================================
// HTTP Request helper (handles proxy by using PowerShell)
// ============================================================
async function fetchJson(url) {
  // Use PowerShell Invoke-WebRequest to bypass proxy
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
  };
  for (const [entity, char] of Object.entries(entities)) {
    cleaned = cleaned.split(entity).join(char);
  }

  // Remove empty self-closing divs/spans with no content
  cleaned = cleaned.replace(/<div[^>]*>\s*<\/div>/g, "");
  cleaned = cleaned.replace(/<span[^>]*>\s*<\/span>/g, "");
  cleaned = cleaned.replace(/<p[^>]*>\s*<\/p>/g, "");

  // Remove WordPress-specific broken tags
  cleaned = cleaned.replace(/<br\/>\s*<\/br>/g, "<br/>");

  // Fix relative URLs in href/src (wp-content/uploads → local path)
  cleaned = cleaned.replace(
    /href="(\/wp-content\/uploads\/([^"]+))"/g,
    'href="/uploads/articles/$2"'
  );
  cleaned = cleaned.replace(
    /src="(\/wp-content\/uploads\/([^"]+))"/g,
    'src="/uploads/articles/$2"'
  );
  cleaned = cleaned.replace(
    /src='(\/wp-content\/uploads\/([^']+))'/g,
    "src='/uploads/articles/$2'"
  );

  // Handle full URLs pointing to wp-content/uploads
  cleaned = cleaned.replace(
    /https?:\/\/goldencheat\.ir\/wp-content\/uploads\/([^"'\s)]+)/g,
    "/uploads/articles/$1"
  );

  // Remove empty paragraphs with only whitespace/nbsp
  cleaned = cleaned.replace(/<p[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/p>/g, "");

  // Remove multiple consecutive empty lines
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, "\n\n");

  return cleaned.trim();
}

// ============================================================
// Extract first image from content
// ============================================================
function extractFirstImage(html) {
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/);
  if (imgMatch) return imgMatch[1];

  // Try data-src (lazy loading)
  const lazyMatch = html.match(/<img[^>]+data-src=["']([^"']+)["']/);
  return lazyMatch ? lazyMatch[1] : null;
}

// ============================================================
// Extract all image URLs from content
// ============================================================
function extractAllImages(html) {
  const images = [];
  // Standard src
  const srcRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
  let match;
  while ((match = srcRegex.exec(html)) !== null) {
    if (!match[1].startsWith("data:")) images.push(match[1]);
  }
  // data-src lazy load
  const lazyRegex = /<img[^>]+data-src=["']([^"']+)["'][^>]*>/g;
  while ((match = lazyRegex.exec(html)) !== null) {
    if (!match[1].startsWith("data:")) images.push(match[1]);
  }
  return [...new Set(images)];
}

// ============================================================
// Calculate reading time
// ============================================================
function calculateReadingTime(text) {
  // Strip HTML tags
  const plainText = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = plainText.split(/\s+/).length;
  // Average reading speed: 200 words per minute
  return Math.max(1, Math.ceil(words / 200));
}

// ============================================================
// Main Import Logic
// ============================================================
async function importBlog() {
  console.log("=== WordPress Blog Import ===\n");

  // 1. Fetch categories
  console.log("📁 Fetching categories...");
  let categories = {};
  try {
    const cats = await fetchJson(`${WP_BASE}/categories?per_page=100`);
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
    const tgs = await fetchJson(`${WP_BASE}/tags?per_page=100`);
    for (const tag of tgs) {
      tags[tag.id] = { name: tag.name, slug: tag.slug };
    }
    console.log(`   Found ${Object.keys(tags).length} tags`);
  } catch (e) {
    console.log("   ⚠️ Tags fetch failed:", e.message);
  }

  // 3. Fetch media (for featured image mapping)
  console.log("\n�️  Fetching media...");
  let media = {};
  try {
    let page = 1;
    let totalPages = 1;
    while (page <= totalPages) {
      const medias = await fetchJson(`${WP_BASE}/media?per_page=100&page=${page}`);
      if (page === 1 && medias.length > 0) {
        totalPages = parseInt(medias[0]._paging?.totalPages || "1", 10) || medias.length >= 100 ? 2 : 1;
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
    console.log("   ⚠️ Media fetch failed (will use featured_media URLs without mapping):", e.message);
  }

  // 4. Fetch articles
  console.log("\n📝 Fetching blog posts...");
  let articles = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const url = `${WP_BASE}/posts?per_page=100&page=${page}`;
    try {
      const posts = await fetchJson(url);
      if (!Array.isArray(posts) || posts.length === 0) break;
      articles = articles.concat(posts);
      console.log(`   Page ${page}: ${posts.length} posts (total so far: ${articles.length})`);
      page++;
      // Safety: if we got less than 100, we're done
      if (posts.length < 100) break;
    } catch (e) {
      console.log(`   ❌ Failed to fetch page ${page}:`, e.message);
      break;
    }
  }

  if (articles.length === 0) {
    console.log("\n❌ No articles fetched. Check VPN/network connection.");
    return;
  }

  console.log(`\n✅ Fetched ${articles.length} articles total`);

  // 5. Process each article
  console.log("\n🔄 Processing articles...");
  const processedArticles = [];

  for (const post of articles) {
    // Build category names
    const categoryIds = post.categories || [];
    const categoryNames = categoryIds.map((id) => categories[id]?.name || "").filter(Boolean);
    const primaryCategory = categoryNames[0] || "General";
    const primaryCategorySlug = categoryIds
      .map((id) => categories[id]?.slug || "")
      .filter(Boolean)[0] || "general";

    // Build tag names
    const tagIds = post.tags || [];
    const tagNames = tagIds.map((id) => tags[id]?.name || "").filter(Boolean);

    // Get featured image URL
    let featuredImageUrl = null;
    if (post.featured_media && media[post.featured_media]) {
      featuredImageUrl = media[post.featured_media].url;
    }

    // Clean content
    const rawContent = post.content?.rendered || "";
    const cleanedContent = cleanHtml(rawContent);

    // Extract all images from content
    const contentImages = extractAllImages(rawContent);

    // Build article object
    const article = {
      wpId: post.id,
      title: post.title?.rendered || "",
      slug: post.slug,
      excerpt: cleanHtml(post.excerpt?.rendered || ""),
      content: cleanedContent,
      rawContent: rawContent, // Keep raw for reference
      featuredImage: featuredImageUrl,
      contentImages: contentImages,
      category: primaryCategory,
      categorySlug: primaryCategorySlug,
      categoryNames: categoryNames,
      tags: tagNames,
      author: "Golden Cheat", // WP doesn't expose author name in REST
      status: post.status,
      publishedAt: post.date,
      modifiedAt: post.modified,
      readingTime: calculateReadingTime(rawContent),
      wpLink: post.link,
      originalMeta: {
        yoast: post.yoast_head_json || null,
      },
    };

    processedArticles.push(article);

    // Decode slug for filename (WordPress returns URL-encoded slugs)
    const decodedSlug = decodeURIComponent(post.slug);

    // Save raw JSON
    const rawFile = path.join(RAW_DIR, `${decodedSlug}.json`);
    fs.writeFileSync(rawFile, JSON.stringify(post, null, 2), "utf8");

    // Save cleaned JSON (without rawContent to keep it lean)
    const cleanedData = { ...article };
    delete cleanedData.rawContent;
    const cleanedFile = path.join(CLEANED_DIR, `${decodedSlug}.json`);
    fs.writeFileSync(cleanedFile, JSON.stringify(cleanedData, null, 2), "utf8");

    console.log(`   ✓ ${decodedSlug} (${contentImages.length} images in content)`);
  }

  // 6. Save taxonomies
  console.log("\n� Saving taxonomy mappings...");
  const taxonomies = {
    categories: categories,
    tags: tags,
    totalMedia: Object.keys(media).length,
  };
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "..", "taxonomies.json"),
    JSON.stringify(taxonomies, null, 2),
    "utf8"
  );

  // 7. Summary report
  const totalImages = processedArticles.reduce((sum, a) => sum + a.contentImages.length, 0);

  console.log("\n========================================");
  console.log("           IMPORT COMPLETE");
  console.log("========================================");
  console.log(`Articles: ${articles.length}`);
  console.log(`Categories: ${Object.keys(categories).length}`);
  console.log(`Tags: ${Object.keys(tags).length}`);
  console.log(`Media items: ${Object.keys(media).length}`);
  console.log(`Content images found: ${totalImages}`);
  console.log(`Raw data: ${RAW_DIR}`);
  console.log(`Cleaned data: ${CLEANED_DIR}`);

  // 8. List all articles for verification
  console.log("\n--- Articles Summary ---");
  processedArticles.forEach((a, i) => {
    console.log(`${i + 1}. [${a.status}] ${a.title}`);
    console.log(`   Slug: ${a.slug} | Category: ${a.category} | Images: ${a.contentImages.length}`);
    console.log(`   Tags: ${a.tags.join(", ") || "none"}`);
  });
}

// ============================================================
// Run
// ============================================================
importBlog().catch((e) => {
  console.error("\n❌ Import failed:", e.message);
  process.exit(1);
});
