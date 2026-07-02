import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-utils";

// ─── Sanitize Unicode for fetch body ───────────────────────────────────────────

function sanitizeForByteString(text: string): string {
  return text
    .replace(/—/g, "-")   // em dash → hyphen
    .replace(/–/g, "-")   // en dash → hyphen
    .replace(/‘/g, "'")   // left single quote → apostrophe
    .replace(/’/g, "'")   // right single quote → apostrophe
    .replace(/“/g, '"')   // left double quote → quote
    .replace(/”/g, '"')   // right double quote → quote
    .replace(/…/g, "...") // ellipsis → three dots
    .replace(/ /g, " ");  // non-breaking space → regular space
}

// ─── OpenRouter Configuration ──────────────────────────────────────────────────

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

const MODEL_CHAIN = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "openrouter/owl-alpha",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
] as const;

const MAX_RETRIES_PER_MODEL = 1;
const REQUEST_TIMEOUT_MS = 45000;

// ─── OpenRouter API caller with fallback ───────────────────────────────────────

async function callOpenRouter(
  messages: Array<{ role: "system" | "user"; content: string }>,
  maxTokens: number
): Promise<{ text: string; modelUsed: string }> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY not set in environment");
  }

  let lastError: Error | null = null;

  for (const model of MODEL_CHAIN) {
    for (let retry = 0; retry < MAX_RETRIES_PER_MODEL; retry++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": "https://goldencheat.com",
            "X-Title": "Golden Cheat — AI SEO Generator",
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens: maxTokens,
            temperature: 0.7,
          }),
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (!res.ok) {
          const errBody = await res.text().catch(() => "");
          console.warn(`[OpenRouter] ${model} returned ${res.status}: ${errBody.slice(0, 200)}`);
          lastError = new Error(`Model ${model} → HTTP ${res.status}`);
          break; // try next model
        }

        const json = await res.json();
        const text = json?.choices?.[0]?.message?.content ?? "";
        if (!text) {
          console.warn(`[OpenRouter] ${model} returned empty text`);
          lastError = new Error(`Model ${model} → empty response`);
          break; // try next model
        }

        return { text: text.trim(), modelUsed: model };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`[OpenRouter] ${model} attempt ${retry + 1} failed: ${lastError.message}`);
        if (lastError.name === "AbortError") {
          lastError = new Error(`Model ${model} → timeout after ${REQUEST_TIMEOUT_MS}ms`);
          break; // try next model (timeout)
        }
      }
    }
  }

  throw lastError ?? new Error("All OpenRouter models failed");
}

// ─── JSON extraction helper ────────────────────────────────────────────────────

function extractJSON(text: string): unknown {
  // Try direct parse first
  try { return JSON.parse(text); } catch { /* continue */ }

  // Try fenced code blocks
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try { return JSON.parse(fenceMatch[1].trim()); } catch { /* continue */ }
  }

  // Try to find the first { ... } object
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try { return JSON.parse(objMatch[0]); } catch { /* continue */ }
  }

  // Try to find the first [ ... ] array
  const arrMatch = text.match(/\[[\s\S]*\]/);
  if (arrMatch) {
    try { return JSON.parse(arrMatch[0]); } catch { /* continue */ }
  }

  throw new Error("Could not extract JSON from AI response");
}

// ─── Build product context string ──────────────────────────────────────────────

function buildProductContext(data: Record<string, unknown>): string {
  const name = String(data.name || "");
  const nameFa = String(data.nameFa || "");
  const game = String(data.game || "");
  const category = String(data.category || "");
  const features: string[] = Array.isArray(data.features) ? data.features.map(String) : [];
  const featuresFa: string[] = Array.isArray(data.featuresFa) ? data.featuresFa.map(String) : [];
  const description = String(data.description || "").slice(0, 300);
  const slug = String(data.slug || "");
  const focusKeyphrase = String(data.focusKeyphrase || name);

  return [
    `Product: ${name}`,
    nameFa ? `Persian Name: ${nameFa}` : "",
    `Game: ${game}`,
    `Category: ${category}`,
    features.length ? `Features (EN): ${features.join(", ")}` : "",
    featuresFa.length ? `Features (FA): ${featuresFa.join("، ")}` : "",
    focusKeyphrase ? `Focus Keyphrase: ${focusKeyphrase}` : "",
    slug ? `URL Slug: ${slug}` : "",
    description ? `Description Preview: ${description}` : "",
  ].filter(Boolean).join("\n");
}

// ─── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  if (!OPENROUTER_API_KEY) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "AI_NOT_CONFIGURED",
          message: "OpenRouter API key not configured. Set OPENROUTER_API_KEY in .env",
        },
      },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { field, productData } = body as {
      field: string;
      productData: Record<string, unknown>;
    };

    if (!field) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "field is required" } },
        { status: 400 }
      );
    }

    const ctx = buildProductContext(productData);
    const name = String(productData.name || "");
    const nameFa = String(productData.nameFa || "");
    const game = String(productData.game || "");
    const focusKeyphrase = String(productData.focusKeyphrase || name);

    // ── Build prompts per field ────────────────────────────────────────────

    let systemPrompt = "";
    let userPrompt = "";
    let maxTokens = 1024;
    let expectJSON = false;

    switch (field) {
      case "metaTitle":
        systemPrompt = "You are a world-class SEO copywriter specializing in gaming software products. Output ONLY the requested text — no quotes, no explanations, no markdown.";
        userPrompt = `Write a professional SEO-optimized meta title for this gaming cheat product.\n${ctx}\n\nRequirements:\n- 40–60 characters (hard limit)\n- Start with the primary keyword: "${focusKeyphrase}"\n- Include the game name: ${game}\n- Power words: Undetectable, Premium, Safe, Pro, Elite, Instant\n- Compelling and click-worthy tone\n- Output ONLY the title text`;
        break;

      case "metaTitleFa":
        systemPrompt = "شما یک متخصص حرفه‌ای سئو و کپی‌رایتر فارسی هستید. فقط متن نهایی را خروجی بدهید — بدون توضیح، بدون گیومه.";
        userPrompt = `یک عنوان متا حرفه‌ای و بهینه برای سئو برای این محصول چیت بازی بنویس.\n${ctx}\n\nالزامات:\n- ۵۰ تا ۷۰ کاراکتر\n- با کلمه کلیدی اصلی شروع شود: "${nameFa || name}"\n- نام بازی را شامل شود: ${game}\n- کلمات قدرت: غیرقابل شناسایی، حرفه‌ای، امن، پرمیوم، فوری\n- جذاب و کلیک‌برانگیز\n- فقط متن عنوان را خروجی بدهید`;
        break;

      case "metaDescription":
        systemPrompt = "You are a world-class SEO copywriter specializing in gaming software products. Output ONLY the requested text — no quotes, no explanations.";
        userPrompt = `Write a compelling, conversion-optimized meta description for this gaming cheat product.\n${ctx}\n\nRequirements:\n- 140–160 characters (hard limit)\n- Naturally include the primary keyword: "${focusKeyphrase}"\n- Include a strong call-to-action (Buy, Get, Access, Try)\n- Mention the game: ${game}\n- Highlight 1–2 key benefits (undetectable, premium, instant delivery, 24/7 support)\n- Create urgency or desire\n- Output ONLY the description text`;
        break;

      case "metaDescriptionFa":
        systemPrompt = "شما یک متخصص حرفه‌ای سئو و کپی‌رایتر فارسی هستید. فقط متن نهایی را خروجی بدهید.";
        userPrompt = `یک توضیحات متا جذاب و بهینه شده برای تبدیل برای این محصول چیت بازی بنویس.\n${ctx}\n\nالزامات:\n- ۱۲۰ تا ۱۶۰ کاراکتر\n- کلمه کلیدی اصلی را طبیعی استفاده کنید: "${nameFa || name}"\n- دعوت به اقدام قوی داشته باشد (بخرید، دریافت کنید، امتحان کنید)\n- نام بازی را ذکر کنید: ${game}\n- ۱ تا ۲ مزیت کلیدی برجسته کنید (غیرقابل شناسایی، تحویل فوری، پشتیبانی ۲۴/۷)\n- حس فوریت یا خواستن ایجاد کنید\n- فقط متن توضیحات را خروجی بدهید`;
        break;

      case "keywords":
        systemPrompt = "You are an expert SEO keyword researcher for gaming products. Output ONLY a valid JSON array of strings — no markdown, no explanations.";
        userPrompt = `Generate 10 high-value SEO keywords for this gaming cheat product.\n${ctx}\n\nRequirements:\n- Mix of short-tail (2 words) and long-tail (3–4 words) keywords\n- Include product type, game name, cheat features, and buyer-intent keywords\n- Think about what gamers actually search for\n- Output ONLY a JSON array, e.g. ["keyword one", "keyword two", ...]`;
        expectJSON = true;
        break;

      case "keywordsFa":
        systemPrompt = "شما یک متخصص تحقیق کلمات کلیدی سئو برای محصولات گیمینگ هستید. فقط یک JSON array معتبر خروجی بدهید.";
        userPrompt = `۱۰ کلمه کلیدی ارزشمند سئو برای این محصول چیت بازی تولید کنید.\n${ctx}\n\nالزامات:\n- ترکیبی از کلمات کلیدی کوتاه (۲ کلمه) و بلند (۳ تا ۴ کلمه)\n- شامل نوع محصول، نام بازی، ویژگی‌های چیت و کلمات کلیدی قصد خرید\n- فکر کنید گیمرها واقعاً چه چیزی سرچ می‌کنند\n- فقط JSON array خروجی بدهید، مثلاً: ["کلمه یک", "کلمه دو", ...]`;
        expectJSON = true;
        break;

      case "focusKeyphrase":
        systemPrompt = "You are an SEO expert specializing in gaming products. Output ONLY the keyphrase — no quotes, no explanation.";
        userPrompt = `Suggest the single best focus keyphrase for this gaming product.\n${ctx}\n\nRequirements:\n- 2–4 words\n- High commercial search intent\n- Includes game name or cheat type\n- Natural language — how real gamers search\n- Must be specific and actionable\n- Output ONLY the keyphrase`;
        break;

      case "focusKeyphraseFa":
        systemPrompt = "شما یک متخصص سئوی محصولات گیمینگ هستید. فقط کلمه کلیدی را خروجی بدهید.";
        userPrompt = `بهترین کلمه کلیدی اصلی را برای این محصول گیمینگ پیشنهاد دهید.\n${ctx}\n\nالزامات:\n- ۲ تا ۴ کلمه\n- قصد جستجوی تجاری بالا\n- شامل نام بازی یا نوع چیت\n- زبان طبیعی — همانطور که گیمرهای واقعی سرچ می‌کنند\n- فقط کلمه کلیدی را خروجی بدهید`;
        break;

      case "ogTitle":
        systemPrompt = "You are a social media copywriter for gaming brands. Output ONLY the OG title text.";
        userPrompt = `Write an engaging Open Graph title for social media sharing of this gaming cheat product.\n${ctx}\n\nRequirements:\n- 60–90 characters\n- Engaging and share-worthy\n- May include 1 relevant emoji\n- Highlights the main benefit or unique selling point\n- Output ONLY the OG title`;
        break;

      case "ogDescription":
        systemPrompt = "You are a social media copywriter for gaming brands. Output ONLY the OG description text.";
        userPrompt = `Write an engaging Open Graph description for social media sharing.\n${ctx}\n\nRequirements:\n- 100–200 characters\n- Engaging, highlights key benefits\n- Includes a call-to-action\n- Makes people want to click\n- Output ONLY the OG description`;
        break;

      case "description":
        systemPrompt = "You are a professional gaming product copywriter and SEO specialist. Write detailed, SEO-optimized, conversion-focused content. Output ONLY the HTML content.";
        userPrompt = `Write a comprehensive, SEO-optimized product description for this gaming cheat.\n${ctx}\n\nRequirements:\n- 300–500 words\n- First paragraph MUST naturally start with the primary keyword: "${focusKeyphrase}"\n- Include the primary keyword 3–5 times naturally throughout (not stuffed)\n- Mention the game "${game}" multiple times naturally\n- Weave features naturally into persuasive prose\n- Structure: Introduction (hook + keyphrase), Key Features (benefits-focused), Why Choose This (trust + social proof), Compatibility & Requirements\n- Professional gaming tone — confident, exciting, trustworthy\n- Use HTML paragraph tags <p> only — no headers, no lists\n- Output ONLY the HTML description`;
        maxTokens = 2048;
        break;

      case "descriptionFa":
        systemPrompt = "شما یک کپی‌رایتر حرفه‌ای محصولات گیمینگ و متخصص سئوی فارسی هستید. فقط محتوای HTML را خروجی بدهید.";
        userPrompt = `یک توضیحات محصول جامع و بهینه شده برای سئو برای این چیت بازی بنویس.\n${ctx}\n\nالزامات:\n- ۲۰۰ تا ۴۰۰ کلمه\n- پاراگراف اول باید طبیعی با کلمه کلیدی اصلی شروع شود: "${nameFa || name}"\n- کلمه کلیدی اصلی را ۳ تا ۵ بار طبیعی در متن استفاده کنید (نه پرکننده)\n- نام بازی "${game}" را چندین بار طبیعی ذکر کنید\n- ویژگی‌ها را طبیعی در متن متقاعدکننده بگنجانید\n- ساختار: مقدمه (قلاب + کلمه کلیدی)، ویژگی‌های کلیدی (متمرکز بر مزایا)، چرا این محصول (اعتماد + اثبات اجتماعی)، سازگاری و نیازمندی‌ها\n- لحن حرفه‌ای گیمینگ — مطمئن، هیجان‌انگیز، قابل اعتماد\n- فقط تگ‌های پاراگراف HTML (<p>) — بدون هدر، بدون لیست\n- فقط HTML توضیحات را خروجی بدهید`;
        maxTokens = 2048;
        break;

      case "allSEO":
        systemPrompt = "You are a world-class bilingual SEO specialist for gaming products. Output ONLY valid, parseable JSON — no markdown fences, no explanations, no extra text.";
        userPrompt = `Generate complete, professional SEO data for this gaming cheat product.\n${ctx}\n\nOutput a valid JSON object with these exact keys:\n{\n  "metaTitle": "40-60 char EN title starting with primary keyword, compelling",\n  "metaTitleFa": "50-70 char FA title, professional, keyword-rich",\n  "metaDescription": "140-160 char EN description with CTA, benefits, game name",\n  "metaDescriptionFa": "140-160 char FA description with CTA, benefits",\n  "focusKeyphrase": "2-4 word EN primary keyword with high search intent",\n  "focusKeyphraseFa": "2-4 word FA primary keyword",\n  "metaKeywords": ["kw1","kw2","kw3","kw4","kw5","kw6","kw7","kw8","kw9","kw10"],\n  "metaKeywordsFa": ["کلمه۱","کلمه۲","کلمه۳","کلمه۴","کلمه۵","کلمه۶","کلمه۷","کلمه۸"],\n  "ogTitle": "60-90 char social share title, engaging, emoji optional",\n  "ogDescription": "100-200 char social description with CTA"\n}\n\nRules:\n- All text must be professional, optimized, and publication-ready\n- Keywords must be real search terms gamers use\n- Titles must be compelling and click-worthy\n- Descriptions must include benefits + call-to-action\n- Output ONLY the JSON object — nothing else`;
        expectJSON = true;
        maxTokens = 2048;
        break;

      default:
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: `Unknown field: ${field}` } },
          { status: 400 }
        );
    }

    // ── Call OpenRouter ────────────────────────────────────────────────────

    const messages: Array<{ role: "system" | "user"; content: string }> = [
      { role: "system", content: sanitizeForByteString(systemPrompt) },
      { role: "user", content: sanitizeForByteString(userPrompt) },
    ];

    const { text: rawText, modelUsed } = await callOpenRouter(messages, maxTokens);

    // ── Parse response ─────────────────────────────────────────────────────

    if (expectJSON) {
      try {
        const parsed = extractJSON(rawText);
        return NextResponse.json({ success: true, data: parsed, field, model: modelUsed });
      } catch {
        return NextResponse.json(
          {
            success: false,
            error: { code: "PARSE_ERROR", message: "Failed to parse AI response as JSON" },
            raw: rawText.slice(0, 500),
            model: modelUsed,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, data: rawText, field, model: modelUsed });
  } catch (err) {
    console.error("[AI SEO Fill]", err);
    const message = err instanceof Error ? err.message : "AI generation failed";
    return NextResponse.json(
      { success: false, error: { code: "AI_ERROR", message } },
      { status: 500 }
    );
  }
}
