"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SEOAnalysisResult, SEOCheckItem } from "@/lib/seo/analyzer";

interface SEOAnalyzerProps {
  formData: Record<string, unknown>;
  onAIFill: (field: string, value: unknown) => void;
  locale?: "en" | "fa";
}

// ── Score color ──────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return "#06C864";
  if (score >= 60) return "#F0C060";
  if (score >= 40) return "#FF8C00";
  return "#E05050";
}

function scoreLabel(score: number, isFa: boolean): string {
  if (score >= 80) return isFa ? "عالی" : "Excellent";
  if (score >= 60) return isFa ? "خوب" : "Good";
  if (score >= 40) return isFa ? "قابل قبول" : "Fair";
  return isFa ? "ضعیف" : "Poor";
}

// ── Circular progress ────────────────────────────────────────────────────────

function CircularScore({ score }: { score: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
      <motion.circle
        cx="50" cy="50" r={radius}
        fill="none" stroke={color} strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: strokeDash }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
      />
      <text x="50" y="46" textAnchor="middle" fill={color} fontSize="18" fontWeight="bold" fontFamily="'Rajdhani', sans-serif">
        {score}
      </text>
      <text x="50" y="60" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="'Inter', sans-serif">
        / 100
      </text>
    </svg>
  );
}

// ── Check item row ───────────────────────────────────────────────────────────

function CheckRow({ check, isFa }: { check: SEOCheckItem; isFa: boolean }) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig: Record<string, { icon: string; color: string; bg: string }> = {
    pass:    { icon: "✓", color: "#06C864", bg: "rgba(6,200,100,0.10)" },
    fail:    { icon: "✗", color: "#E05050", bg: "rgba(224,80,80,0.10)" },
    warning: { icon: "!", color: "#F0C060", bg: "rgba(240,192,96,0.10)" },
    info:    { icon: "i", color: "#60A8F0", bg: "rgba(96,168,240,0.10)" },
  };

  const cfg = statusConfig[check.status] || statusConfig.info;

  return (
    <div
      onClick={() => setExpanded((e) => !e)}
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.color}22`,
        borderRadius: "6px",
        padding: "0.6rem 0.75rem",
        cursor: "pointer",
        transition: "all 0.2s",
        marginBottom: "0.35rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{
            width: "20px", height: "20px", borderRadius: "50%", background: cfg.color, color: "#000",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.7rem", fontWeight: 800, flexShrink: 0,
          }}>
            {cfg.icon}
          </span>
          <span style={{
            fontFamily: isFa ? "'Vazirmatn'" : "'Rajdhani'",
            fontSize: "0.78rem", color: "rgba(255,255,255,0.85)", fontWeight: 600,
          }}>
            {isFa ? check.titleFa : check.title}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.65rem", color: cfg.color, fontFamily: "'Rajdhani'", fontWeight: 700 }}>
            {check.score}/{check.maxScore}
          </span>
          <span style={{
            fontSize: "0.58rem",
            background: check.category === "critical" ? "rgba(224,80,80,0.2)"
              : check.category === "important" ? "rgba(240,192,96,0.15)" : "rgba(96,168,240,0.15)",
            color: check.category === "critical" ? "#E05050"
              : check.category === "important" ? "#F0C060" : "#60A8F0",
            padding: "0.15rem 0.4rem", borderRadius: "3px",
            fontFamily: "'Rajdhani'", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            {check.category === "critical" ? (isFa ? "حیاتی" : "CRIT")
              : check.category === "important" ? (isFa ? "مهم" : "IMP")
              : (isFa ? "خوب" : "NICE")}
          </span>
          <span style={{
            color: "rgba(255,255,255,0.3)", fontSize: "0.7rem",
            transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s",
          }}>▾</span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <p style={{
              fontFamily: isFa ? "'Vazirmatn'" : "'Inter'",
              fontSize: "0.75rem", color: "rgba(255,255,255,0.55)",
              marginTop: "0.5rem", paddingTop: "0.5rem",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              lineHeight: 1.6, textAlign: isFa ? "right" : "left",
            }}>
              {isFa ? check.descriptionFa : check.description}
              {check.value !== undefined && (
                <span style={{
                  display: "inline-block", marginInlineStart: "0.5rem",
                  background: "rgba(255,255,255,0.08)", padding: "0.1rem 0.4rem",
                  borderRadius: "3px", fontFamily: "'Rajdhani'", fontWeight: 700, color: cfg.color,
                }}>
                  {String(check.value)}
                  {check.target ? ` / target: ${check.target}` : ""}
                </span>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── AI Fill Button ───────────────────────────────────────────────────────────

function AIFillButton({ label, field, loading, onClick }: {
  label: string; field: string; loading: boolean; onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={loading}
      style={{
        display: "flex", alignItems: "center", gap: "0.35rem",
        background: loading
          ? "rgba(201,150,58,0.08)"
          : "linear-gradient(135deg, rgba(201,150,58,0.18), rgba(140,95,20,0.12))",
        border: "1px solid rgba(201,150,58,0.4)",
        color: loading ? "rgba(201,150,58,0.4)" : "#C9963A",
        fontFamily: "'Rajdhani', sans-serif",
        fontWeight: 700, fontSize: "0.7rem",
        letterSpacing: "0.08em", textTransform: "uppercase",
        padding: "0.3rem 0.7rem", borderRadius: "4px",
        cursor: loading ? "not-allowed" : "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {loading ? (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{ display: "inline-block" }}
        >⟳</motion.span>
      ) : "✦"}
      {label}
    </motion.button>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function SEOAnalyzer({ formData, onAIFill, locale = "en" }: SEOAnalyzerProps) {
  const [analysis, setAnalysis] = useState<SEOAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<"score" | "checks" | "ai">("score");
  const [aiLoading, setAILoading] = useState<Record<string, boolean>>({});
  const [aiModel, setAiModel] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "fail" | "warning" | "pass">("all");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFa = locale === "fa";

  const runAnalysis = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/seo/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) setAnalysis(data.data);
    } catch (err) {
      console.error("SEO analysis error:", err);
    }
  }, [formData]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(runAnalysis, 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [runAnalysis]);

  const handleAIFill = async (field: string) => {
    setAILoading((prev) => ({ ...prev, [field]: true }));
    setAiError(null);
    try {
      const res = await fetch("/api/admin/ai/seo-fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, productData: formData }),
      });
      const data = await res.json();
      if (data.success) {
        onAIFill(field, data.data);
        if (data.model) setAiModel(data.model);
      } else {
        setAiError(data.error?.message || "AI generation failed");
      }
    } catch (err) {
      console.error("AI fill error:", err);
      setAiError(err instanceof Error ? err.message : "Network error");
    } finally {
      setAILoading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleAIFillAll = async () => {
    setAILoading((prev) => ({ ...prev, allSEO: true }));
    setAiError(null);
    try {
      const res = await fetch("/api/admin/ai/seo-fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: "allSEO", productData: formData }),
      });
      const data = await res.json();
      if (data.success && typeof data.data === "object" && data.data !== null) {
        Object.entries(data.data as Record<string, unknown>).forEach(([key, val]) => {
          onAIFill(key, val);
        });
        if (data.model) setAiModel(data.model);
      } else {
        setAiError(data.error?.message || "AI generation failed");
      }
    } catch (err) {
      console.error("AI fill all error:", err);
      setAiError(err instanceof Error ? err.message : "Network error");
    } finally {
      setAILoading((prev) => ({ ...prev, allSEO: false }));
    }
  };

  const filteredChecks = analysis?.checks.filter((c) =>
    filter === "all" ? true : c.status === filter
  ) || [];

  const score = analysis?.totalScore || 0;
  const color = scoreColor(score);

  const CARD_STYLE: React.CSSProperties = {
    background: "rgba(8,12,24,0.92)",
    border: "1.5px solid rgba(201,150,58,0.25)",
    borderRadius: "12px",
    padding: "1.25rem",
  };

  const TAB_STYLE = (active: boolean): React.CSSProperties => ({
    fontFamily: "'Rajdhani', sans-serif",
    fontWeight: 700,
    fontSize: "0.75rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s",
    background: active ? "linear-gradient(135deg, #D4A030, #C9963A)" : "transparent",
    color: active ? "#060A14" : "rgba(255,255,255,0.45)",
    flex: 1,
  });

  return (
    <div style={CARD_STYLE} dir={isFa ? "rtl" : "ltr"}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h3 style={{
          fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "0.82rem",
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: "rgba(201,150,58,0.9)", margin: 0,
          display: "flex", alignItems: "center", gap: "0.4rem",
        }}>
          <span>◈</span>
          {isFa ? "تحلیل SEO زنده" : "LIVE SEO ANALYSIS"}
        </h3>
        {score > 0 && (
          <span style={{
            fontFamily: "'Rajdhani'", fontWeight: 800, fontSize: "0.78rem", color,
            border: `1px solid ${color}44`, padding: "0.2rem 0.5rem",
            borderRadius: "4px", background: `${color}15`,
          }}>
            {scoreLabel(score, isFa)}
          </span>
        )}
      </div>

      {/* Score display */}
      {analysis && (
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1rem" }}>
          <CircularScore score={score} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.4rem", marginBottom: "0.6rem" }}>
              {[
                { label: isFa ? "موفق" : "Passed", value: analysis.passCount, color: "#06C864" },
                { label: isFa ? "هشدار" : "Warning", value: analysis.warningCount, color: "#F0C060" },
                { label: isFa ? "خطا" : "Failed", value: analysis.failCount, color: "#E05050" },
              ].map((stat) => (
                <div key={stat.label} style={{
                  textAlign: "center", background: `${stat.color}12`,
                  border: `1px solid ${stat.color}25`, borderRadius: "6px", padding: "0.4rem",
                }}>
                  <div style={{
                    fontFamily: "'Rajdhani'", fontWeight: 800,
                    fontSize: "1.2rem", color: stat.color, lineHeight: 1,
                  }}>{stat.value}</div>
                  <div style={{
                    fontFamily: isFa ? "'Vazirmatn'" : "'Inter'",
                    fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", marginTop: "0.15rem",
                  }}>{stat.label}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>
              <span style={{ fontFamily: isFa ? "'Vazirmatn'" : "'Inter'" }}>
                {isFa ? "خوانایی:" : "Readability:"}
              </span>{" "}
              <span style={{ color: scoreColor(analysis.readabilityScore), fontFamily: "'Rajdhani'", fontWeight: 700 }}>
                {analysis.readabilityScore}/100
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab navigation */}
      <div style={{
        display: "flex", gap: "0.35rem", marginBottom: "1rem",
        background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "0.25rem",
      }}>
        {([
          { id: "score" as const, label: isFa ? "نمره" : "Score" },
          { id: "checks" as const, label: isFa ? "چک‌لیست" : "Checklist" },
          { id: "ai" as const, label: isFa ? "هوش مصنوعی" : "AI Fill" },
        ]).map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} style={TAB_STYLE(activeTab === tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* SCORE TAB */}
      {activeTab === "score" && analysis && (
        <div>
          <div style={{
            background: "rgba(255,255,255,0.06)", borderRadius: "999px",
            height: "8px", marginBottom: "1rem", overflow: "hidden",
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{
                height: "100%", borderRadius: "999px",
                background: `linear-gradient(90deg, ${scoreColor(Math.max(0, score - 20))}, ${color})`,
              }}
            />
          </div>

          {(["critical", "important", "good-to-have"] as const).map((cat) => {
            const catChecks = analysis.checks.filter((c) => c.category === cat);
            const catPass = catChecks.filter((c) => c.status === "pass").length;
            const catTotal = catChecks.length;
            return (
              <div key={cat} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.45rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}>
                <span style={{
                  fontFamily: isFa ? "'Vazirmatn'" : "'Rajdhani'",
                  fontSize: "0.75rem",
                  color: cat === "critical" ? "#E05050" : cat === "important" ? "#F0C060" : "#60A8F0",
                  fontWeight: 600,
                }}>
                  {cat === "critical" ? (isFa ? "🔴 حیاتی" : "🔴 Critical")
                    : cat === "important" ? (isFa ? "🟡 مهم" : "🟡 Important")
                    : (isFa ? "🔵 خوب‌الوجود" : "🔵 Good to have")}
                </span>
                <span style={{
                  fontFamily: "'Rajdhani'", fontWeight: 700, fontSize: "0.78rem",
                  color: catPass === catTotal ? "#06C864" : "rgba(255,255,255,0.5)",
                }}>
                  {catPass}/{catTotal}
                </span>
              </div>
            );
          })}

          {analysis.failCount > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <p style={{
                fontFamily: isFa ? "'Vazirmatn'" : "'Rajdhani'",
                fontSize: "0.72rem", color: "rgba(201,150,58,0.8)",
                fontWeight: 700, marginBottom: "0.4rem",
                textTransform: isFa ? "none" : "uppercase", letterSpacing: "0.08em",
              }}>
                {isFa ? "⚡ اقدامات فوری:" : "⚡ Quick Wins:"}
              </p>
              {(isFa ? analysis.suggestionsFA : analysis.suggestions).slice(0, 3).map((s, i) => (
                <div key={i} style={{ display: "flex", gap: "0.4rem", alignItems: "flex-start", marginBottom: "0.35rem" }}>
                  <span style={{ color: "#E05050", fontSize: "0.7rem" }}>→</span>
                  <span style={{
                    fontFamily: isFa ? "'Vazirmatn'" : "'Inter'",
                    fontSize: "0.72rem", color: "rgba(255,255,255,0.55)",
                    lineHeight: 1.5, textAlign: isFa ? "right" : "left",
                  }}>{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CHECKS TAB */}
      {activeTab === "checks" && analysis && (
        <div>
          <div style={{ display: "flex", gap: "0.3rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
            {([
              { id: "all" as const, label: isFa ? "همه" : "All" },
              { id: "fail" as const, label: isFa ? "خطا" : "Failed" },
              { id: "warning" as const, label: isFa ? "هشدار" : "Warning" },
              { id: "pass" as const, label: isFa ? "موفق" : "Passed" },
            ]).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                style={{
                  fontFamily: "'Rajdhani'", fontWeight: 700, fontSize: "0.68rem",
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  padding: "0.2rem 0.6rem", borderRadius: "4px",
                  border: "none", cursor: "pointer",
                  background: filter === f.id ? "rgba(201,150,58,0.25)" : "rgba(255,255,255,0.06)",
                  color: filter === f.id ? "#C9963A" : "rgba(255,255,255,0.4)",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "0.25rem" }}>
            {filteredChecks.map((check) => (
              <CheckRow key={check.id} check={check} isFa={isFa} />
            ))}
          </div>
        </div>
      )}

      {/* AI FILL TAB */}
      {activeTab === "ai" && (
        <div>
          <p style={{
            fontFamily: isFa ? "'Vazirmatn'" : "'Inter'",
            fontSize: "0.75rem", color: "rgba(255,255,255,0.45)",
            marginBottom: "0.75rem", lineHeight: 1.6, textAlign: isFa ? "right" : "left",
          }}>
            {isFa
              ? "هوش مصنوعی فیلدهای SEO را بر اساس اطلاعات محصول به صورت خودکار پر می‌کند."
              : "AI generates SEO-optimized content based on your product data."}
          </p>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAIFillAll}
            disabled={!!aiLoading["allSEO"]}
            style={{
              width: "100%",
              background: aiLoading["allSEO"]
                ? "rgba(201,150,58,0.1)"
                : "linear-gradient(135deg, #D4A030, #C9963A)",
              border: "none",
              color: aiLoading["allSEO"] ? "#C9963A" : "#060A14",
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 800, fontSize: "0.82rem",
              letterSpacing: "0.15em", textTransform: "uppercase",
              padding: "0.8rem", borderRadius: "8px",
              cursor: aiLoading["allSEO"] ? "not-allowed" : "pointer",
              marginBottom: "0.75rem",
              boxShadow: aiLoading["allSEO"] ? "none" : "0 4px 20px rgba(201,150,58,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            }}
          >
            {aiLoading["allSEO"] ? (
              <>
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>⟳</motion.span>
                {isFa ? "در حال تولید..." : "Generating..."}
              </>
            ) : (
              <>✦ {isFa ? "پر کردن همه فیلدهای SEO با AI" : "AI Fill ALL SEO Fields"}</>
            )}
          </motion.button>

          {/* Status indicators */}
          {aiModel && !aiError && (
            <div style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              padding: "0.4rem 0.6rem", marginBottom: "0.5rem",
              background: "rgba(6,200,100,0.06)", border: "1px solid rgba(6,200,100,0.15)",
              borderRadius: "6px",
            }}>
              <span style={{ fontSize: "0.65rem", color: "#06C864" }}>✓</span>
              <span style={{
                fontFamily: "'Rajdhani'", fontSize: "0.65rem", color: "rgba(6,200,100,0.8)",
              }}>
                {isFa ? "تولید شده توسط:" : "Generated by:"} {aiModel}
              </span>
            </div>
          )}

          {aiError && (
            <div style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              padding: "0.4rem 0.6rem", marginBottom: "0.5rem",
              background: "rgba(224,80,80,0.08)", border: "1px solid rgba(224,80,80,0.2)",
              borderRadius: "6px",
            }}>
              <span style={{ fontSize: "0.65rem", color: "#E05050" }}>✗</span>
              <span style={{
                fontFamily: "'Rajdhani'", fontSize: "0.65rem", color: "rgba(224,80,80,0.9)",
              }}>
                {aiError}
              </span>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {([
              { field: "metaTitle", label: "EN Meta Title", labelFa: "عنوان متا انگلیسی" },
              { field: "metaTitleFa", label: "FA Meta Title", labelFa: "عنوان متا فارسی" },
              { field: "metaDescription", label: "EN Meta Description", labelFa: "توضیحات متا انگلیسی" },
              { field: "metaDescriptionFa", label: "FA Meta Description", labelFa: "توضیحات متا فارسی" },
              { field: "focusKeyphrase", label: "Focus Keyphrase", labelFa: "کلمه کلیدی اصلی" },
              { field: "keywords", label: "EN Keywords", labelFa: "کلمات کلیدی انگلیسی" },
              { field: "keywordsFa", label: "FA Keywords", labelFa: "کلمات کلیدی فارسی" },
              { field: "ogTitle", label: "OG Title", labelFa: "عنوان OG" },
              { field: "ogDescription", label: "OG Description", labelFa: "توضیحات OG" },
              { field: "description", label: "EN Description", labelFa: "توضیحات انگلیسی" },
              { field: "descriptionFa", label: "FA Description", labelFa: "توضیحات فارسی" },
            ] as const).map((item) => (
              <div key={item.field} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.4rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}>
                <span style={{
                  fontFamily: isFa ? "'Vazirmatn'" : "'Rajdhani'",
                  fontSize: "0.75rem", color: "rgba(255,255,255,0.6)",
                }}>
                  {isFa ? item.labelFa : item.label}
                </span>
                <AIFillButton
                  label={isFa ? "تولید" : "Generate"}
                  field={item.field}
                  loading={!!aiLoading[item.field]}
                  onClick={() => handleAIFill(item.field)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
