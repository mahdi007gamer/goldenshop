"use client";

import { useState } from "react";

interface SEOFieldsProps {
  formData: Record<string, unknown>;
  onChange: (field: string, value: unknown) => void;
  locale?: "en" | "fa";
}

// ── Char Counter ──────────────────────────────────────────────────────────────

function CharCounter({ value, min, max }: { value: string; min: number; max: number }) {
  const len = (value || "").length;
  const color = len < min || len > max ? "#E05050" : "#06C864";
  return (
    <span style={{ fontFamily: "'Rajdhani'", fontSize: "0.68rem", color, fontWeight: 700, marginInlineStart: "0.5rem" }}>
      {len}/{max}
    </span>
  );
}

// ── Keywords Input ────────────────────────────────────────────────────────────

function KeywordsInput({
  label, value, onChange, placeholder, isFa, rtl = false,
}: {
  label: string; value: string[]; onChange: (v: string[]) => void;
  placeholder: string; isFa: boolean; rtl?: boolean;
}) {
  const [input, setInput] = useState("");

  const addKeyword = () => {
    const kw = input.trim();
    if (kw && !value.includes(kw)) onChange([...value, kw]);
    setInput("");
  };

  const removeKeyword = (kw: string) => onChange(value.filter((k) => k !== kw));

  return (
    <div dir={rtl ? "rtl" : "ltr"}>
      <div style={{
        fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "0.72rem",
        letterSpacing: "0.1em", textTransform: "uppercase",
        color: "rgba(201,150,58,0.8)", marginBottom: "0.35rem",
        display: "flex", justifyContent: "space-between",
      }}>
        <span>{label}</span>
        <span style={{ color: "rgba(255,255,255,0.3)", textTransform: "none", letterSpacing: 0 }}>
          {value.length}/10
        </span>
      </div>

      {value.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.5rem" }}>
          {value.map((kw) => (
            <span key={kw} style={{
              display: "flex", alignItems: "center", gap: "0.3rem",
              background: "rgba(201,150,58,0.12)", border: "1px solid rgba(201,150,58,0.3)",
              color: "#C9963A", fontFamily: rtl ? "'Vazirmatn'" : "'Inter'",
              fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "4px",
            }}>
              {kw}
              <button
                type="button"
                onClick={() => removeKeyword(kw)}
                style={{
                  background: "none", border: "none", color: "rgba(201,150,58,0.6)",
                  cursor: "pointer", fontSize: "0.8rem", padding: 0, lineHeight: 1,
                }}
              >×</button>
            </span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          style={{
            flex: 1, background: "rgba(5,8,18,0.8)", border: "1px solid rgba(201,150,58,0.2)",
            borderRadius: "6px", color: "#fff", fontFamily: rtl ? "'Vazirmatn'" : "'Inter'",
            fontSize: "0.82rem", padding: "0.5rem 0.75rem", outline: "none",
            direction: rtl ? "rtl" : "ltr",
          }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); addKeyword(); }
            if (e.key === ",") { e.preventDefault(); addKeyword(); }
          }}
          placeholder={placeholder}
          disabled={value.length >= 10}
          onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(201,150,58,0.6)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(201,150,58,0.2)"; }}
        />
        <button
          type="button"
          onClick={addKeyword}
          disabled={!input.trim() || value.length >= 10}
          style={{
            background: "rgba(201,150,58,0.15)", border: "1px solid rgba(201,150,58,0.35)",
            color: "#C9963A", fontFamily: "'Rajdhani'", fontWeight: 700,
            fontSize: "0.75rem", letterSpacing: "0.08em",
            padding: "0.5rem 0.75rem", borderRadius: "6px", cursor: "pointer",
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────

const INPUT_STYLE: React.CSSProperties = {
  width: "100%", background: "rgba(5,8,18,0.8)", border: "1px solid rgba(201,150,58,0.2)",
  borderRadius: "6px", color: "#fff", fontFamily: "'Inter', sans-serif",
  fontSize: "0.85rem", padding: "0.6rem 0.85rem", outline: "none",
  transition: "border-color 0.2s", boxSizing: "border-box",
};

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "0.72rem",
  letterSpacing: "0.1em", textTransform: "uppercase",
  color: "rgba(201,150,58,0.8)", marginBottom: "0.35rem",
  display: "flex", alignItems: "center", justifyContent: "space-between",
};

export function SEOFields({ formData, onChange, locale = "en" }: SEOFieldsProps) {
  const [activeSection, setActiveSection] = useState<string | null>("basic");
  const isFa = locale === "fa";

  const get = (key: string): string => (formData[key] as string) || "";
  const getArr = (key: string): string[] => {
    const v = formData[key];
    if (Array.isArray(v)) return v as string[];
    return [];
  };
  // Pick the right field for the active locale: FA fields for fa, EN fields for en
  const loc = (base: string): string => {
    const enKey = base + "En";
    return isFa ? get(base) : (get(enKey) || get(base));
  };
  const locArr = (base: string): string[] => {
    const enKey = base + "En";
    return isFa ? getArr(base) : (getArr(enKey).length ? getArr(enKey) : getArr(base));
  };

  const sections = [
    { id: "basic", label: isFa ? "کلیدی اصلی" : "Focus" },
    { id: "meta", label: isFa ? "عنوان و توضیحات" : "Meta Tags" },
    { id: "social", label: isFa ? "اجتماعی" : "Social" },
    { id: "keywords", label: isFa ? "کلمات کلیدی" : "Keywords" },
  ];

  return (
    <div style={{
      background: "rgba(8,12,24,0.92)", border: "1.5px solid rgba(201,150,58,0.22)",
      borderRadius: "12px", overflow: "hidden",
    }}>
      {/* Section tabs */}
      <div style={{
        display: "flex", borderBottom: "1px solid rgba(201,150,58,0.12)",
        background: "rgba(0,0,0,0.3)",
      }}>
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveSection(activeSection === s.id ? null : s.id)}
            style={{
              flex: 1,
              fontFamily: isFa ? "'Vazirmatn'" : "'Rajdhani'",
              fontWeight: 600, fontSize: "0.72rem", letterSpacing: "0.05em",
              padding: "0.65rem 0.5rem", border: "none", cursor: "pointer",
              background: activeSection === s.id ? "rgba(201,150,58,0.12)" : "transparent",
              color: activeSection === s.id ? "#C9963A" : "rgba(255,255,255,0.45)",
              borderBottom: activeSection === s.id ? "2px solid #C9963A" : "2px solid transparent",
              transition: "all 0.2s", whiteSpace: "nowrap",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "1.25rem" }}>
        {/* FOCUS KEYPHRASE */}
        {activeSection === "basic" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <div style={LABEL_STYLE}>
                <span>{isFa ? "کلمه کلیدی اصلی (EN)" : "Focus Keyphrase (EN)"}</span>
              </div>
              <input
                style={INPUT_STYLE}
                value={loc("focusKeyphrase")}
                onChange={(e) => onChange("focusKeyphraseEn", e.target.value)}
                placeholder="e.g. phantom strike aimbot cs2"
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(201,150,58,0.6)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(201,150,58,0.2)"; }}
              />
              <p style={{ fontFamily: "'Inter'", fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", marginTop: "0.3rem" }}>
                {isFa ? "کلمه‌ای که می‌خواهید صفحه برای آن رتبه‌بندی شود" : "The search query you want this page to rank for"}
              </p>
            </div>
            <div>
              <div style={{ ...LABEL_STYLE, direction: "rtl" }}>
                <span>{isFa ? "کلمه کلیدی اصلی (FA)" : "Focus Keyphrase (FA)"}</span>
              </div>
              <input
                style={{ ...INPUT_STYLE, direction: "rtl", fontFamily: "'Vazirmatn', sans-serif" }}
                value={get("focusKeyphraseFa")}
                onChange={(e) => onChange("focusKeyphraseFa", e.target.value)}
                placeholder="مثلاً: ایم‌بات CS2 غیرقابل شناسایی"
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(201,150,58,0.6)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(201,150,58,0.2)"; }}
              />
            </div>
          </div>
        )}

        {/* META TAGS */}
        {activeSection === "meta" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* EN Meta Title */}
            <div>
              <div style={LABEL_STYLE}>
                <span>Meta Title (EN)</span>
                <CharCounter value={loc("metaTitle")} min={30} max={60} />
              </div>
              <input
                style={INPUT_STYLE}
                value={loc("metaTitle")}
                onChange={(e) => onChange("metaTitleEn", e.target.value)}
                placeholder="Phantom Strike Aimbot for CS2 — Undetectable | Golden Cheat"
                maxLength={80}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(201,150,58,0.6)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(201,150,58,0.2)"; }}
              />
              {loc("metaTitle") && (
                <div style={{
                  marginTop: "0.5rem", background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px",
                  padding: "0.6rem 0.75rem",
                }}>
                  <p style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", fontFamily: "'Inter'", marginBottom: "0.2rem" }}>
                    Google SERP Preview:
                  </p>
                  <p style={{
                    color: "#8AB4F8", fontSize: "0.88rem", fontFamily: "Arial, sans-serif",
                    overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                  }}>{loc("metaTitle")}</p>
                  <p style={{ color: "#5F6368", fontSize: "0.72rem", fontFamily: "Arial, sans-serif" }}>
                    goldencheat.com/{isFa ? "fa" : "en"}/products/{loc("slug") || "product-slug"}
                  </p>
                  <p style={{
                    color: "#BDC1C6", fontSize: "0.78rem", fontFamily: "Arial, sans-serif",
                    overflow: "hidden", display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
                  }}>
                    {loc("metaDescription") || "Meta description will appear here..."}
                  </p>
                </div>
              )}
            </div>

            {/* FA Meta Title */}
            <div>
              <div style={{ ...LABEL_STYLE, direction: "rtl" }}>
                <span>عنوان متا (فارسی)</span>
                <CharCounter value={get("metaTitleFa")} min={20} max={70} />
              </div>
              <input
                style={{ ...INPUT_STYLE, direction: "rtl", fontFamily: "'Vazirmatn', sans-serif" }}
                value={get("metaTitleFa")}
                onChange={(e) => onChange("metaTitleFa", e.target.value)}
                placeholder="فانتوم استرایک | بهترین ایم‌بات CS2 غیرقابل شناسایی"
                maxLength={90}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(201,150,58,0.6)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(201,150,58,0.2)"; }}
              />
            </div>

            {/* EN Meta Description */}
            <div>
              <div style={LABEL_STYLE}>
                <span>Meta Description (EN)</span>
                <CharCounter value={loc("metaDescription")} min={120} max={160} />
              </div>
              <textarea
                style={{ ...INPUT_STYLE, height: "80px", resize: "vertical", lineHeight: 1.6 } as React.CSSProperties}
                value={loc("metaDescription")}
                onChange={(e) => onChange("metaDescriptionEn", e.target.value)}
                placeholder="Get undetectable Phantom Strike aimbot for CS2. Silent aim, no recoil, FOV control. Instant delivery. Try now →"
                maxLength={180}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(201,150,58,0.6)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(201,150,58,0.2)"; }}
              />
            </div>

            {/* FA Meta Description */}
            <div>
              <div style={{ ...LABEL_STYLE, direction: "rtl" }}>
                <span>توضیحات متا (فارسی)</span>
                <CharCounter value={get("metaDescriptionFa")} min={50} max={170} />
              </div>
              <textarea
                style={{
                  ...INPUT_STYLE, height: "80px", resize: "vertical",
                  direction: "rtl", fontFamily: "'Vazirmatn', sans-serif", lineHeight: 1.7,
                } as React.CSSProperties}
                value={get("metaDescriptionFa")}
                onChange={(e) => onChange("metaDescriptionFa", e.target.value)}
                placeholder="ایم‌بات فانتوم استرایک برای CS2 — غیرقابل شناسایی، تحویل فوری"
                maxLength={190}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(201,150,58,0.6)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(201,150,58,0.2)"; }}
              />
            </div>
          </div>
        )}

        {/* SOCIAL */}
        {activeSection === "social" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <div style={LABEL_STYLE}>
                <span>OG Title</span>
                <CharCounter value={loc("ogTitle")} min={40} max={90} />
              </div>
              <input
                style={INPUT_STYLE}
                value={loc("ogTitle")}
                onChange={(e) => onChange("ogTitleEn", e.target.value)}
                placeholder="🎯 Phantom Strike — The Ultimate CS2 Aimbot"
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(201,150,58,0.6)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(201,150,58,0.2)"; }}
              />
            </div>
            <div>
              <div style={LABEL_STYLE}>
                <span>OG Description</span>
                <CharCounter value={loc("ogDescription")} min={50} max={200} />
              </div>
              <textarea
                style={{ ...INPUT_STYLE, height: "70px", resize: "vertical" } as React.CSSProperties}
                value={loc("ogDescription")}
                onChange={(e) => onChange("ogDescriptionEn", e.target.value)}
                placeholder="Dominate CS2 with our undetectable aimbot. Silent aim, no recoil, and more."
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(201,150,58,0.6)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(201,150,58,0.2)"; }}
              />
            </div>
            <div>
              <div style={LABEL_STYLE}><span>OG Image URL</span></div>
              <input
                style={INPUT_STYLE}
                value={get("ogImage")}
                onChange={(e) => onChange("ogImage", e.target.value)}
                placeholder="https://... (1200x630 recommended)"
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(201,150,58,0.6)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(201,150,58,0.2)"; }}
              />
              <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", fontFamily: "'Inter'", marginTop: "0.25rem" }}>
                Recommended: 1200×630px. Leave empty to use product image.
              </p>
            </div>
            <div>
              <div style={LABEL_STYLE}><span>Twitter Card Title</span></div>
              <input
                style={INPUT_STYLE}
                value={loc("twitterTitle")}
                onChange={(e) => onChange("twitterTitleEn", e.target.value)}
                placeholder="Leave empty to use OG Title"
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(201,150,58,0.6)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(201,150,58,0.2)"; }}
              />
            </div>
            <div>
              <div style={LABEL_STYLE}><span>Twitter Card Description</span></div>
              <textarea
                style={{ ...INPUT_STYLE, height: "60px", resize: "vertical" } as React.CSSProperties}
                value={loc("twitterDescription")}
                onChange={(e) => onChange("twitterDescriptionEn", e.target.value)}
                placeholder="Leave empty to use OG Description"
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(201,150,58,0.6)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(201,150,58,0.2)"; }}
              />
            </div>
          </div>
        )}

        {/* KEYWORDS */}
        {activeSection === "keywords" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <KeywordsInput
              label="Keywords (EN)"
              value={locArr("metaKeywords")}
              onChange={(v) => onChange("metaKeywordsEn", v)}
              placeholder="Add keyword and press Enter"
              isFa={isFa}
            />
            <KeywordsInput
              label="کلمات کلیدی (فارسی)"
              value={getArr("metaKeywordsFa")}
              onChange={(v) => onChange("metaKeywordsFa", v)}
              placeholder="کلمه کلیدی را وارد کنید و Enter بزنید"
              isFa={isFa}
              rtl
            />
          </div>
        )}
      </div>
    </div>
  );
}
