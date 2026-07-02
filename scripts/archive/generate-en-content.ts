/**
 * generate-en-content.ts
 *
 * Generates missing English content fields (tagsEn, longDescriptionEn)
 * using Claude Opus 4.8 via local OpenRouter gateway.
 *
 * STRICT RULES:
 * - ONLY modifies English fields that are currently EMPTY
 * - NEVER touches any Persian/FA field
 * - NEVER overwrites existing EN content
 * - NEVER modifies schema, UI, routes, or logic
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Gateway Config ───────────────────────────────────────────────
const GATEWAY_URL = process.env.LLM_GATEWAY_URL || "http://127.0.0.1:8082";
const GATEWAY_AUTH = process.env.LLM_GATEWAY_AUTH || "mysecret";
const MODEL_ID =
  process.env.LLM_MODEL || "open_router/nvidia/nemotron-3-ultra-550b-a55b:free";

// ─── Types ────────────────────────────────────────────────────────
type ProductRow = {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  game: string;
  category: string;
  categoryEn: string | null;
  description: string;
  descriptionEn: string | null;
  features: string;
  featuresEn: string;
  tags: string;
  tagsEn: string;
  longDescription: string | null;
  longDescriptionEn: string | null;
  shortDescEn: string | null;
};

// ─── LLM Call ─────────────────────────────────────────────────────
async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch(`${GATEWAY_URL}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GATEWAY_AUTH}`,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL_ID,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LLM error ${res.status}: ${errText}`);
  }

  // Parse SSE stream
  const text = await res.text();
  let fullContent = "";
  for (const line of text.split("\n")) {
    if (line.startsWith("data: ")) {
      try {
        const json = JSON.parse(line.slice(6));
        if (json.type === "content_block_delta" && json.delta?.text) {
          fullContent += json.delta.text;
        }
      } catch {}
    }
  }
  return fullContent.trim();
}

// ─── Tags Generation ──────────────────────────────────────────────
async function generateTagsEn(product: ProductRow): Promise<string[]> {
  const existingFeatures: string[] = (() => {
    try {
      const parsed = JSON.parse(product.featuresEn);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const systemPrompt = `You are an SEO keyword specialist for gaming enhancement software.
Generate English search keywords/tags for the product.
IMPORTANT: Return ONLY the JSON other text, no wrapping markdown no code fences.
Format: exactly like ["keyword1","keyword2",...]
Rules:
- 10-15 keywords total
- Short (1-2 words): category terms, slang
- Long-tail (3-5 words): "buy X mod", "X undetected 2026", "best X enhancement"
- Include: game name + "cheat", game name + "hack", "mod menu [game]", "ESP [game]", "wallhack [game]"
- Include: "undetected", "free", "private", "2026"
- No Persian text, all lowercase
- No duplicates`;

  const userPrompt = `Generate SEO tags for:
Product name: ${product.nameEn || product.name}
Slug: ${product.slug}
Game: ${product.game}
Category: ${product.categoryEn || product.category}
Key features: ${existingFeatures.join(", ")}

IMPORTANT: Return ONLY the raw JSON array. No other text.`;

  const raw = await callLLM(systemPrompt, userPrompt);

  // Try to extract JSON array from response
  const cleaned = raw.replace(/```(|json|javascript)/g, "").replace(/^\s*\[/, "[").replace(/\]\s*$/, "]");
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (!match) {
    console.warn(`  ⚠️ Could not parse tags from LLM response: ${cleaned.substring(0, 100)}`);
    return [];
  }

  try {
    const arr = JSON.parse(match[0]);
    if (Array.isArray(arr)) return arr.filter((x: any) => typeof x === "string");
  } catch {}

  return [];
}

// ─── Long Description Generation ──────────────────────────────────
async function generateLongDescriptionEn(product: ProductRow): Promise<string> {
  const existingFeatures: string[] = (() => {
    try {
      const parsed = JSON.parse(product.featuresEn);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const systemPrompt = `You are a professional copywriter for a gaming software e-commerce store.
Generate an HTML long description in English for the product.
Rules:
- Return ONLY valid HTML, nothing else (no markdown, no code fences)
- Use <h2>, <h3>, <p>, <ul>, <li>, <strong> tags
- Structure: H2 intro → benefits paragraph → feature list (ul) → closing CTA paragraph
- 200-400 words total
- Professional, persuasive tone
- Focus on benefits, not just features
- Include 1-2 calls-to-action ("Start dominating today!", "Get yours now")
- SEO-friendly: naturally include game name, key features, "undetected", "cheat"
- No Persian text whatsoever`;

  const userPrompt = `Product: ${product.nameEn || product.name}
Game: ${product.game}
Category: ${product.categoryEn || product.category}
Short Description: ${product.shortDescEn || ""}
Key Features: ${existingFeatures.join(", ")}
Existing Description: ${(product.descriptionEn || "").substring(0, 300)}

Generate a professional HTML long description.`;

  return await callLLM(systemPrompt, userPrompt);
}

// ─── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 English Content Generator");
  console.log(`   Gateway: ${GATEWAY_URL}`);
  console.log(`   Model: ${MODEL_ID}\n`);

  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      nameEn: true,
      slug: true,
      game: true,
      category: true,
      categoryEn: true,
      description: true,
      descriptionEn: true,
      features: true,
      featuresEn: true,
      tags: true,
      tagsEn: true,
      longDescription: true,
      longDescriptionEn: true,
      shortDescEn: true,
    },
    orderBy: { name: "asc" },
  });

  console.log(`📦 Total products: ${products.length}\n`);

  // ── Phase 1: Generate tagsEn ──
  const needTags = products.filter(
    (p) => !p.tagsEn || p.tagsEn === "[]" || p.tagsEn === "null"
  );
  console.log(`🏷️  Products needing tagsEn: ${needTags.length}`);

  let tagsUpdated = 0;
  let tagsSkipped = 0;

  for (const p of needTags) {
    console.log(`  → ${p.nameEn || p.name} [${p.slug}]`);
    try {
      const tagsEn = await generateTagsEn(p);
      if (tagsEn.length === 0) {
        console.log(`    ⚠️ Empty result, skipping`);
        tagsSkipped++;
        continue;
      }

      await prisma.product.update({
        where: { id: p.id },
        data: { tagsEn: JSON.stringify(tagsEn) },
      });

      console.log(`    ✅ ${tagsEn.length} tags: ${tagsEn.slice(0, 5).join(", ")}...`);
      tagsUpdated++;
    } catch (err) {
      console.error(`    ❌ Error: ${err}`);
      tagsSkipped++;
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(
    `\n🏷️  Tags: ${tagsUpdated} updated, ${tagsSkipped} skipped\n`
  );

  // ── Phase 2: Generate longDescriptionEn ──
  const needLongDesc = products.filter(
    (p) => !p.longDescriptionEn || p.longDescriptionEn.trim() === ""
  );
  console.log(`📝 Products needing longDescriptionEn: ${needLongDesc.length}`);

  let longDescUpdated = 0;
  let longDescSkipped = 0;

  for (const p of needLongDesc) {
    console.log(`  → ${p.nameEn || p.name} [${p.slug}]`);
    try {
      const generatedLongDesc = await generateLongDescriptionEn(p);
      if (!generatedLongDesc || generatedLongDesc.length < 50) {
        console.log(`    ⚠️ Too short or empty, skipping`);
        longDescSkipped++;
        continue;
      }

      await prisma.product.update({
        where: { id: p.id },
        data: { longDescriptionEn: generatedLongDesc },
      });

      console.log(
        `    ✅ ${generatedLongDesc.length} chars, starts with: ${generatedLongDesc.substring(0, 60)}...`
      );
      longDescUpdated++;
    } catch (err) {
      console.error(`    ❌ Error: ${err}`);
      longDescSkipped++;
    }

    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(
    `\n📝 Long Desc: ${longDescUpdated} updated, ${longDescSkipped} skipped\n`
  );

  // ── Summary ──
  console.log("═══════════════════════════════════════");
  console.log("📊 SUMMARY");
  console.log(`   tagsEn:       ${tagsUpdated}/${needTags.length} updated`);
  console.log(`   longDescEn:   ${longDescUpdated}/${needLongDesc.length} updated`);
  console.log(`   FA fields:    0 changed (strict rule)`);
  console.log("═══════════════════════════════════════");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
