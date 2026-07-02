/**
 * Project memory scanner.
 *
 * Walks the source tree + schema + package.json and emits
 *   memory/project.md
 *   memory/schema.md
 *   memory/routes.md
 *   memory/components.md
 *   memory/stores.md
 *
 * Pure filesystem read + text regex. No Prisma generation, no DB, no build.
 * Idempotent. Run via `npm run scan` (wired in package.json).
 *
 * The stamp header at the top of project.md is the heartbeat for the
 * mtime gate described in CLAUDE.md — the startup compares those mtimes
 * against the live `package.json` and `prisma/schema.prisma`.
 */

import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const rel = (p: string) => relative(ROOT, p).replace(/\\/g, "/");

// ─── tiny helpers ──────────────────────────────────────────────────────────

function readSafe(p: string): string {
  try { return readFileSync(p, "utf8"); } catch { return ""; }
}

function walk(dir: string, pred: (f: string) => boolean): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  const go = (d: string) => {
    for (const ent of readdirSync(d)) {
      if (ent === "node_modules" || ent === ".next") continue;
      const full = join(d, ent);
      const s = statSync(full);
      if (s.isDirectory()) go(full);
      else if (pred(full)) out.push(full);
    }
  };
  go(dir);
  return out.sort();
}

const isPageFile = (f: string) => /[\\/](page|layout|route|loading|error|not-found)\.(ts|tsx)$/.test(f);
const isTsx = (f: string) => /\.(ts|tsx)$/.test(f) && !/\.d\.ts$/.test(f);

/** Pull a one-liner purpose from a file: first `//` comment or export name. */
function purpose(f: string): string {
  const src = readSafe(f);
  const cm = src.match(/^\s*\/\/\s*(.+)/m);
  if (cm) return cm[1].trim();
  const exp = src.match(/export\s+(?:default\s+)?function\s+([A-Z]\w+)/);
  if (exp) return exp[1];
  return "";
}

// ────────────────────────────────────────────────────────────────────────────
// 1. project.md  — stack + layout + middleware + env names
// ────────────────────────────────────────────────────────────────────────────

function buildProject(): string {
  const pkg = JSON.parse(readSafe(join(ROOT, "package.json")));
  const deps = Object.keys(pkg.dependencies ?? {});
  const allScripts = Object.keys(pkg.scripts ?? {});

  const mwSrc = readSafe(join(ROOT, "src/middleware.ts"));
  const matcher = mwSrc.match(/matcher:\s*\[[\s\S]*?\n\s*\]/)?.[0]
    ?.split("\n").slice(1).map((l) => "  " + l).join("\n") ?? "  (see src/middleware.ts)";

  // grep process.env usage across src for a names-only list
  const envNames = new Set<string>();
  const libFiles = walk(join(ROOT, "src"), isTsx);
  const re = /process\.env\.([A-Z_][A-Z0-9_]*)/g;
  for (const f of libFiles) {
    const src = readSafe(f);
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) envNames.add(m[1]);
  }
  const envNamesList = [...envNames].map((n) => "`" + n + "`").sort();

  // lib surface (one-liner per top-level file; grouped dirs only named)
  const libDirs = ["admin", "api", "license", "pricing", "repositories", "seo", "services"];
  const libFilesTop = readdirSync(join(ROOT, "src/lib"))
    .filter((n) => n.endsWith(".ts"))
    .map((n) => "`lib/" + n + "`")
    .sort();

  const lines: string[] = [
    "# Project",
    "",
    "## Stack",
    "",
    `Next.js ${pkg.dependencies.next} · React ${pkg.dependencies.react} · Prisma ${pkg.devDependencies.prisma} · Tailwind 4 · Framer Motion ${pkg.devDependencies["babel-plugin-react-compiler"] ? "12" : pkg.dependencies["framer-motion"]} · TypeScript ${pkg.devDependencies.typescript}`,
    "",
    "Key deps: " + deps.slice(0, 12).map((d) => "`" + d + "`").join(", ") + (deps.length > 12 ? ` (+${deps.length - 12} more)` : "") + ".",
    "",
    "### Run scripts",
    "",
    allScripts.map((s) => `- \`${s}\``).join("\n"),
    "",
    "## Provider tree (root layout)",
    "",
    "`LangProvider > AuthProvider > AppProvider > ToastProvider`. See `src/app/layout.tsx`.",
    "",
    "- LangContext — URL-based locale (`/en/*` → en, else fa), sets `lang` cookie, syncs `<html lang|dir>`. `src/context/LangContext.tsx`",
    "- AuthProvider — receives `initialUser` from server, calls `refetch()` on mount to verify session. `src/context/AuthContext.tsx`",
    "- AppContext — legacy client state (cart/licenses/tickets/toasts/session). `src/context/AppContext.tsx`",
    "",
    "## Middleware matcher",
    "",
    "```",
    "matcher: [ ... ]",
    matcher.trim(),
    "```",
    "",
    "## Layout duties (`src/app/layout.tsx`)",
    "",
    "- resolves initial user from `gc_session` httpOnly cookie via `getInitialUser()`",
    "- derives `lang` from URL, emits hreflang/canonical via `x-url` header",
    "",
    "## Lib surface (`src/lib`)",
    "",
    libFilesTop.join(", ") + ".",
    "",
    "Sub-modules: " + libDirs.map((d) => "`lib/" + d + "/`").join(", ") + ".",
    "",
    "## Env vars (names only — live values in `.env`)",
    "",
    envNamesList.join(", ") + ".",
    "",
    "## Local scratch (NOT committed / regenerated)",
    "",
    "- `graphify-out/` — AST cache of the graphify skill; regenerated on each skill run (.gitignored)",
    "",
    "---",
    "",
    "_Regenerated by `scripts/scan-project.ts`. Do not edit by hand._",
  ];
  return lines.join("\n") + "\n";
}

// ────────────────────────────────────────────────────────────────────────────
// 2. schema.md  — Prisma models
// ────────────────────────────────────────────────────────────────────────────

function buildSchema(): string {
  const src = readSafe(join(ROOT, "prisma/schema.prisma"));
  const models: string[] = [];
  const re = /^model\s+(\w+)\s*\{([\s\S]*?)\n\}/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const name = m[1];
    const body = m[2];
    const fields = body
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("//") && !l.startsWith("@@") && !l.startsWith("@relation"))
      .map((l) => {
        // mark relation fields: capitalized type that is NOT a Prisma scalar
        const m = l.match(/^(\w+)\s+(\??\[?\w+\]?)\s/);
        const scalars = new Set(["String", "Int", "Float", "Boolean", "DateTime", "Json", "Bytes", "BigInt", "Decimal"]);
        const isRel = m && /^[A-Z]/.test(m[2]) && !scalars.has(m[2].replace("?", "").replace("[]", ""));
        return "- `" + l.replace(/\s+/g, " ") + "`" + (isRel ? " → relation" : "");
      });
    models.push(`### \`${name}\`\n\n` + fields.join("\n"));
  }
  return [
    "# Prisma Schema",
    "",
    "Prisma + SQLite (`prisma/dev.db`). Provider: `prisma-client-js`. " + models.length + " models.",
    "",
    models.join("\n\n"),
    "",
    "---",
    "",
    "_Regenerated from `prisma/schema.prisma`._",
  ].join("\n") + "\n";
}

// ────────────────────────────────────────────────────────────────────────────
// 3. routes.md  — App routes + API routes
// ────────────────────────────────────────────────────────────────────────────

function buildRoutes(): string {
  const appRoot = join(ROOT, "src/app");

  // --- App pages (non-api) -----------------------------------------------
  const apiDir = join(appRoot, "api");
  const pages = walk(appRoot, (f) => isPageFile(f) && !f.startsWith(apiDir + "/") && f !== apiDir);
  const appLines: string[] = [];
  for (const f of pages) {
    let route = relative(appRoot, f).replace(/\\/g, "/")
      .replace(/\/(page|layout|loading|error|not-found|route)\.(ts|tsx)$/, "");
    // route-group folders (auth) / (storefront) → strip from URL but mark
    route = route.replace(/\/\(([^)]+)\)/g, "» ($1)");
    // normalize: ensure single leading slash, no double slashes
    route = "/" + route.replace(/^\/+/, "").replace(/\/{2,}/g, "/");
    // dynamic slugs already literal: [lang], [slug], [id]
    const kind = /[\\/]route\.(ts|tsx)$/.test(f) ? "route-handler" : "page";
    const p = purpose(f);
    appLines.push(`\`${route}\` — \`${rel(f)}\` — ${p || kind}`);
  }

  // --- API routes ----------------------------------------------------------
  const apiRoot = join(appRoot, "api");
  const apiFiles = walk(apiRoot, (f) => /[\\/]route\.(ts|tsx)$/.test(f));
  const apiDomain = new Map<string, string[]>();
  for (const f of apiFiles) {
    let apiPath = relative(apiRoot, f).replace(/\\/g, "/").replace(/\/route\.(ts|tsx)$/, "");
    apiPath = "/" + apiPath.replace(/^\/+/, "").replace(/\/{2,}/g, "/");
    const src = readSafe(f);
    const methods = [...new Set((src.match(/export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)/g) ?? [])
      .map((s) => s.replace(/.*function\s+/, "")))];
    const methodStr = methods.length ? methods.join("|") : "GET";
    const seg = apiPath.split("/").filter(Boolean)[1] ?? "root"; // e.g. auth, admin, products
    const domain = apiPath.startsWith("/admin") ? "admin/*" : seg;
    const line = `\`${methodStr} /api${apiPath}\` — \`${rel(f)}\` — ${purpose(f) || "endpoint"}`;
    if (!apiDomain.has(domain)) apiDomain.set(domain, []);
    apiDomain.get(domain)!.push(line);
  }
  const apiDomainsSorted = [...apiDomain.keys()].sort();
  const adminLast = apiDomainsSorted.filter((d) => d !== "admin/*").concat(
    apiDomainsSorted.includes("admin/*") ? ["admin/*"] : []
  );

  const appSection = [
    "# Routes",
    "",
    "## App pages (`src/app`)",
    "",
    "» folders in parentheses are **route groups** — they shape layout, not URL. `[…]` are dynamic slugs.",
    "",
    appLines.join("\n"),
  ];

  const apiSection = [
    "",
    "## API routes (`src/app/api`)",
    "",
    [...adminLast.flatMap((d) => [`### \`${d}\``, "", ...(apiDomain.get(d) ?? []), ""])].join("\n"),
  ];

  return appSection.join("\n") + "\n" + apiSection.join("\n") +
    "\n---\n\n_Regenerated from `src/app/**/*.tsx|ts`._\n";
}

// ────────────────────────────────────────────────────────────────────────────
// 4. components.md
// ────────────────────────────────────────────────────────────────────────────

function buildComponents(): string {
  const compRoot = join(ROOT, "src/components");
  const topFiles = readdirSync(compRoot).filter((n) => /\.(ts|tsx)$/.test(n)).sort();
  const dirs = readdirSync(compRoot).filter((n) => statSync(join(compRoot, n)).isDirectory()).sort();

  const out: string[] = ["# Components", "", "## Top-level (`src/components/*.tsx`)", ""];
  for (const f of topFiles) {
    const p = purpose(join(compRoot, f));
    out.push(`- \`${f}\` — ${p || "component"}`);
  }

  for (const d of dirs) {
    const p = join(compRoot, d);
    const files = readdirSync(p).filter((n) => /\.(ts|tsx)$/.test(n)).sort();
    out.push("", `## \`components/${d}\``, "");
    if (!files.length) { out.push("(empty / reserved)"); continue; }
    for (const f of files) {
      const fp = join(p, f);
      out.push(`- \`${d}/${f}\` — ${purpose(fp) || "component"}`);
    }
  }

  return out.join("\n") + "\n\n---\n\n_Regenerated from `src/components/**`._\n";
}

// ────────────────────────────────────────────────────────────────────────────
// 5. stores.md  — Zustand + Context + Hooks
// ────────────────────────────────────────────────────────────────────────────

function extractStoreBlock(file: string): string {
  const src = readSafe(file);
  const name = file.split(/[\\/]/).pop()!.replace(/\.ts$/, "");
  // grab first interface XState { ... }
  const iMatch = src.match(/interface\s+\w*State\s*\{([\s\S]*?)\n\}/);
  const iface = iMatch?.[1] ?? "";
  const keys = iface.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("//"));
  const persist = src.match(/persist\(\s*[\s\S]*?name:\s*["'`]([^"'`]+)["'`]/)?.[1];
  return [
    `### \`${name}\``,
    "",
    "State: " + (keys.length ? keys.map((k) => "`" + k.split(":")[0].trim() + "`").join(", ") : "(no State interface found)") + ".",
    persist ? `Persist: \`${persist}\`` : "",
  ].filter(Boolean).join("\n");
}

function buildStores(): string {
  const storeRoot = join(ROOT, "src/store");
  const ctxRoot = join(ROOT, "src/context");
  const hookRoot = join(ROOT, "src/hooks");

  const storeBlocks = walk(storeRoot, (f) => f.endsWith(".ts") && !f.endsWith(".d.ts"))
    .map(extractStoreBlock);

  const ctxFiles = walk(ctxRoot, (f) => f.endsWith(".tsx"));
  const ctxLines = ctxFiles.map((f) => {
    const n = f.split(/[\\/]/).pop()!;
    return `- \`${n}\` — ${purpose(f) || "context provider"}`;
  });

  const hookFiles = walk(hookRoot, (f) => /\.(ts|tsx)$/.test(f) && !f.endsWith(".d.ts"));
  const hookLines = hookFiles.map((f) => {
    const n = f.split(/[\\/]/).pop()!;
    return `- \`${n}\` — ${purpose(f) || "hook"}`;
  });

  return [
    "# State",
    "",
    "## Zustand stores (`src/store`)",
    "",
    storeBlocks.join("\n\n"),
    "",
    "## Context providers (`src/context`)",
    "",
    ctxLines.join("\n"),
    "",
    "## Hooks (`src/hooks`)",
    "",
    hookLines.join("\n"),
    "",
    "---",
    "",
    "_Regenerated from `src/store`, `src/context`, `src/hooks`._",
  ].join("\n") + "\n";
}

// ────────────────────────────────────────────────────────────────────────────
// main
// ────────────────────────────────────────────────────────────────────────────

function main() {
  if (!existsSync(join(ROOT, "src"))) {
    console.error("[scan] No src/ found. Run from project root.");
    process.exit(1);
  }

  const pkgMtime = statSync(join(ROOT, "package.json")).mtime.toISOString();
  const schemaMtime = statSync(join(ROOT, "prisma/schema.prisma")).mtime.toISOString();
  const stamp = new Date().toISOString();

  const project = [
    `> Scan stamp: ${stamp}`,
    `> package.json mtime: ${pkgMtime}`,
    `> schema.prisma mtime: ${schemaMtime}`,
    "",
    buildProject(),
  ].join("\n");

  const out = {
    "memory/project.md": project,
    "memory/schema.md": buildSchema(),
    "memory/routes.md": buildRoutes(),
    "memory/components.md": buildComponents(),
    "memory/stores.md": buildStores(),
  };

  let bytes = 0;
  for (const [p, body] of Object.entries(out)) {
    writeFileSync(join(ROOT, p), body, "utf8");
    bytes += body.length;
    console.log(`[scan] wrote ${p} (${body.length} bytes)`);
  }
  console.log(`[scan] done — ${Object.keys(out).length} files, ${Math.round(bytes / 1024)}KB, stamp ${stamp}`);
}

main();
