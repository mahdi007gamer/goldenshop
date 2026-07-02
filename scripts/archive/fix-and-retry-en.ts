/**
 * fix-and-retry-en.ts
 *
 * 1. Cleans up bad longDescriptionEn (HTTP 429 error messages saved by mistake)
 * 2. Retries generating tagsEn and longDescriptionEn for remaining products
 *
 * STRICT: Only touches EN fields, never FA fields
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GATEWAY_URL = process.env.LLM_GATEWAY_URL || "http://127.0.0.1:8082";
const GATEWAY_AUTH = process.env.LLM_GATEWAY_AUTH || "mysecret";
const MODEL_ID =
  process.env.LLM_MODEL || "open_router/nvidia/nemotron-3-ultra-550b-a55b:free";

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
    throw new Error(`HTTP ${res.status}`);
  }

  const text = await res.text();

  // Check for error messages in response
  if (text.includes("HTTP 429") || text.includes("rate_limit")) {
    throw new Error("RATE_LIMIT");
  }
  if (text.includes("HTTP 402") || text.includes("Insufficient credits")) {
    throw new Error("NO_CREDITS");
  }

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

  const trimmed = fullContent.trim();

  // Final validation: reject if it looks like an error message
  if (trimmed.startsWith("Upstream provider") || trimmed.includes("HTTP 429")) {
    throw new Error("BAD_RESPONSE");
  }

  return trimmed;
}

async function generateTagsEn(
  name: string,
  slug: string,
  game: string,
  categoryEn: string | null,
  featuresEn: string
): Promise<string[]> {
  const existingFeatures: string[] = (() => {
    try {
      const parsed = JSON.parse(featuresEn);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const systemPrompt = `You are an SEO keyword specialist for gaming enhancement software.
Generate English search keywords/tags for the product.
IMPORTANT: Return ONLY the JSON array, no other text, no wrapping markdown, no code fences.
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
Product name: ${name}
Slug: ${slug}
Game: ${game}
Category: ${categoryEn || ""}
Key features: ${existingFeatures.join(", ")}

IMPORTANT: Return ONLY the raw JSON array. No other text.`;

  const raw = await callLLM(systemPrompt, userPrompt);
  const cleaned = raw.replace(/```(|json|javascript)/g, "");
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (!match) return [];

  try {
    const arr = JSON.parse(match[0]);
    if (Array.isArray(arr)) return arr.filter((x: any) => typeof x === "string");
  } catch {}

  return [];
}

async function generateLongDescEn(
  name: string,
  game: string,
  categoryEn: string | null,
  shortDescEn: string | null,
  featuresEn: string,
  descriptionEn: string | null
): Promise<string> {
  const existingFeatures: string[] = (() => {
    try {
      const parsed = JSON.parse(featuresEn);
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

  const userPrompt = `Product: ${name}
Game: ${game}
Category: ${categoryEn || ""}
Short Description: ${shortDescEn || ""}
Key Features: ${existingFeatures.join(", ")}
Existing Description: ${(descriptionEn || "").substring(0, 300)}

Generate a professional HTML long description.`;

  return await callLLM(systemPrompt, userPrompt);
}

async function main() {
  console.log("🔧 Fix & Retry EN Content");
  console.log(`   Model: ${MODEL_ID}\n`);

  // ── Step 1: Clean bad longDescriptionEn ──
  const badProducts = await prisma.product.findMany({
    where: { longDescriptionEn: { contains: "HTTP 429" } },
    select: { id: true, name: true },
  });

  if (badProducts.length > 0) {
    console.log(`🧹 Cleaning ${badProducts.length} bad longDescriptionEn...`);
    for (const p of badProducts) {
      await prisma.product.update({
        where: { id: p.id },
        data: { longDescriptionEn: null },
      });
      console.log(`  ✅ Cleaned: ${p.name}`);
    }
  }

  // ── Step 2: Find products needing tagsEn ──
  const allProducts = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      game: true,
      categoryEn: true,
      featuresEn: true,
      tagsEn: true,
      longDescriptionEn: true,
      shortDescEn: true,
      descriptionEn: true,
    },
    orderBy: { name: "asc" },
  });

  const needTags = allProducts.filter(
    (p) => !p.tagsEn || p.tagsEn === "[]" || p.tagsEn === "null" || p.tagsEn === ""
  );
  const needLongDesc = allProducts.filter(
    (p) => !p.longDescriptionEn || p.longDescriptionEn.trim() === ""
  );

  console.log(`\n📦 Products needing tagsEn: ${needTags.length}`);
  console.log(`📦 Products needing longDescriptionEn: ${needLongDesc.length}\n`);

  // ── Step 3: Generate tagsEn ──
  let tagsOk = 0;
  let tagsFail = 0;

  for (const p of needTags) {
    console.log(`🏷️  ${p.name} [${p.slug}]`);
    try {
      const tags = await generateTagsEn(
        p.name,
        p.slug,
        p.game,
        p.categoryEn,
        p.featuresEn
      );
      if (tags.length === 0) {
        console.log(`    ⚠️ Empty result`);
        tagsFail++;
      } else {
        await prisma.product.update({
          where: { id: p.id },
          data: { tagsEn: JSON.stringify(tags) },
        });
        console.log(`    ✅ ${tags.length} tags`);
        tagsOk++;
      }
    } catch (err: any) {
      console.log(`    ❌ ${err.message}`);
      tagsFail++;
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  // ── Step 4: Generate longDescriptionEn ──
  let longOk = 0;
  let longFail = 0;

  for (const p of needLongDesc) {
    console.log(`📝 ${p.name} [${p.slug}]`);
    try {
      const longDesc = await generateLongDescEn(
        p.name,
        p.game,
        p.categoryEn,
        p.shortDescEn,
        p.featuresEn,
        p.descriptionEn
      );
      if (!longDesc || longDesc.length < 100) {
        console.log(`    ⚠️ Too short (${longDesc.length} chars)`);
        longFail++;
      } else {
        await prisma.product.update({
          where: { id: p.id },
          data: { longDescriptionEn: longDesc },
        });
        console.log(`    ✅ ${longDesc.length} chars`);
        longOk++;
      }
    } catch (err: any) {
      console.log(`    ❌ ${err.message}`);
      longFail++;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`📊 RESULT`);
  console.log(`   tagsEn:       ${tagsOk} updated, ${tagsFail} failed`);
  console.log(`   longDescEn:   ${longOk} updated, ${longFail} failed`);
  console.log(`   FA fields:    0 changed`);
  console.log(`═══════════════════════════════════════`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
