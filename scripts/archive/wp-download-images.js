/**
 * WordPress Product Image Download Script
 * Reads cleaned product data and downloads featured + gallery images.
 *
 * Usage: node scripts/wp-download-images.js
 * Note: Run WITHOUT proxy/VPN for goldencheat.ir domain.
 */

const fs = require("fs");
const path = require("path");

const CLEANED_DIR = path.join(process.cwd(), "content", "products", "cleaned");
const IMAGES_DIR = path.join(process.cwd(), "content", "products", "images");
const PUBLIC_DIR = path.join(process.cwd(), "public", "uploads", "products");

// Ensure directories exist
[IMAGES_DIR, PUBLIC_DIR].forEach((d) => fs.mkdirSync(d, { recursive: true }));

// Track downloads
const stats = { success: 0, failed: 0, skipped: 0 };
const failedUrls = [];
const imageMap = {}; // url -> localPath

// ============================================================
// Download a single image using PowerShell (bypasses proxy)
// ============================================================
function downloadImage(url, destPath) {
  return new Promise((resolve) => {
    // Skip if already exists
    if (fs.existsSync(destPath)) {
      stats.skipped++;
      resolve(true);
      return;
    }

    // Use PowerShell to download (bypasses system proxy)
    const psCmd = `powershell -Command "try { Invoke-WebRequest -Uri '${url}' -OutFile '${destPath}' -UseBasicParsing -TimeoutSec 30; exit 0 } catch { exit 1 }"`;
    require("child_process").exec(psCmd, { timeout: 35000 }, (err) => {
      if (err) {
        stats.failed++;
        failedUrls.push(url);
        // Clean up partial file
        try { fs.unlinkSync(destPath); } catch {}
        resolve(false);
      } else {
        stats.success++;
        resolve(true);
      }
    });
  });
}

// ============================================================
// Extract filename from URL
// ============================================================
function getFilenameFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const filename = path.basename(pathname);
    // Decode and sanitize
    return decodeURIComponent(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
  } catch {
    return null;
  }
}

// ============================================================
// Main
// ============================================================
async function downloadImages() {
  console.log("=== WordPress Product Image Download ===\n");

  // Read all cleaned products
  const files = fs.readdirSync(CLEANED_DIR).filter((f) => f.endsWith(".json"));
  console.log(`Found ${files.length} cleaned products\n`);

  if (files.length === 0) {
    console.log("No products found. Run wp-import-products.js first.");
    return;
  }

  // Collect all unique image URLs
  const imageList = []; // { url, filename, type, productSlug }

  for (const file of files) {
    const product = JSON.parse(fs.readFileSync(path.join(CLEANED_DIR, file), "utf8"));

    // Featured image
    if (product.featuredImage) {
      const filename = getFilenameFromUrl(product.featuredImage);
      if (filename) {
        imageList.push({
          url: product.featuredImage,
          filename: filename,
          type: "featured",
          productSlug: product.slug,
        });
      }
    }

    // Content images
    for (const imgUrl of product.contentImages || []) {
      const filename = getFilenameFromUrl(imgUrl);
      if (filename && !imageList.find((i) => i.filename === filename)) {
        imageList.push({
          url: imgUrl,
          filename: filename,
          type: "content",
          productSlug: product.slug,
        });
      }
    }
  }

  console.log(`Found ${imageList.length} unique images to download\n`);

  if (imageList.length === 0) {
    console.log("No images to download.");
    return;
  }

  // Download each image
  for (let i = 0; i < imageList.length; i++) {
    const img = imageList[i];
    const destPath = path.join(IMAGES_DIR, img.filename);
    const publicPath = path.join(PUBLIC_DIR, img.filename);

    process.stdout.write(`   [${i + 1}/${imageList.length}] ${img.filename} (${img.type})... `);

    const success = await downloadImage(img.url, destPath);

    if (success) {
      // Copy to public/ directory for serving
      try {
        fs.copyFileSync(destPath, publicPath);
      } catch (e) {
        // Ignore copy errors
      }
      const sizeKB = fs.existsSync(destPath) ? Math.round(fs.statSync(destPath).size / 1024) : 0;
      imageMap[img.url] = `/uploads/products/${img.filename}`;
      console.log(`✓ ${sizeKB}KB`);
    } else {
      console.log("✗ FAILED");
    }
  }

  // Update cleaned products with local image paths
  console.log("\n🔄 Updating product data with local image paths...");
  for (const file of files) {
    const productPath = path.join(CLEANED_DIR, file);
    const product = JSON.parse(fs.readFileSync(productPath, "utf8"));

    let updated = false;

    // Update featured image path
    if (product.featuredImage && imageMap[product.featuredImage]) {
      product.localFeaturedImage = imageMap[product.featuredImage];
      updated = true;
    }

    // Update content image paths
    if (product.contentImages && product.contentImages.length > 0) {
      product.localContentImages = product.contentImages.map(
        (imgUrl) => imageMap[imgUrl] || imgUrl
      );
      updated = true;
    }

    if (updated) {
      fs.writeFileSync(productPath, JSON.stringify(product, null, 2), "utf8");
    }
  }

  // Save image mapping for reference
  fs.writeFileSync(
    path.join(IMAGES_DIR, "image-map.json"),
    JSON.stringify(imageMap, null, 2),
    "utf8"
  );

  // Summary
  console.log("\n========================================");
  console.log("         DOWNLOAD COMPLETE");
  console.log("========================================");
  console.log(`Total images: ${imageList.length}`);
  console.log(`Downloaded: ${stats.success}`);
  console.log(`Already existed: ${stats.skipped}`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`\nImages saved to:`);
  console.log(`  ${IMAGES_DIR}`);
  console.log(`  ${PUBLIC_DIR}`);

  if (failedUrls.length > 0) {
    console.log("\n--- Failed URLs (manual download needed) ---");
    failedUrls.forEach((url) => console.log(`  ${url}`));

    // Save failed URLs to file for manual download
    const failedFile = path.join(process.cwd(), "content", "products", "failed-images.txt");
    fs.writeFileSync(failedFile, failedUrls.join("\n"), "utf8");
    console.log(`\nFailed URLs saved to: ${failedFile}`);
  }

  // List downloaded files
  const downloadedFiles = fs.readdirSync(IMAGES_DIR).filter((f) => !f.endsWith(".json"));
  console.log(`\nTotal files in images directory: ${downloadedFiles.length}`);
}

// ============================================================
// Run
// ============================================================
downloadImages().catch((e) => {
  console.error("\n❌ Download failed:", e.message);
  process.exit(1);
});
