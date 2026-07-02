/**
 * HTML Sanitizer — allows safe HTML tags/attributes, strips dangerous ones.
 * Used for rich text content from Quill editor (product descriptions, etc.).
 *
 * Strategy: Allowlist-based. Only known-safe tags and attributes pass through.
 * Event handlers (on*), javascript: URLs, and dangerous tags are always removed.
 */

// Tags that are completely safe to render
const ALLOWED_TAGS = new Set([
  // Text structure
  "p", "br", "hr",
  // Headings
  "h1", "h2", "h3", "h4", "h5", "h6",
  // Text formatting
  "strong", "b", "em", "i", "u", "s", "strike", "del", "sub", "sup",
  // Links
  "a",
  // Lists
  "ul", "ol", "li",
  // Block elements
  "blockquote", "pre", "code",
  // Media
  "img", "iframe", "video", "audio", "source",
  // Tables
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
  // Containers
  "div", "span", "figure", "figcaption",
  // Line breaks
  "br",
]);

// Attributes allowed per tag (empty set = no attributes allowed)
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel", "class"]),
  img: new Set(["src", "alt", "title", "width", "height", "class", "style"]),
  iframe: new Set(["src", "width", "height", "frameborder", "allowfullscreen", "allow", "title", "class"]),
  video: new Set(["src", "width", "height", "controls", "autoplay", "loop", "muted", "poster", "class"]),
  audio: new Set(["src", "controls", "autoplay", "loop", "muted", "class"]),
  source: new Set(["src", "type", "media"]),
  table: new Set(["class"]),
  th: new Set(["colspan", "rowspan", "scope", "class"]),
  td: new Set(["colspan", "rowspan", "class"]),
  div: new Set(["class", "style"]),
  span: new Set(["class", "style"]),
  p: new Set(["class", "style"]),
  h1: new Set(["class"]),
  h2: new Set(["class"]),
  h3: new Set(["class"]),
  h4: new Set(["class"]),
  h5: new Set(["class"]),
  h6: new Set(["class"]),
  blockquote: new Set(["class"]),
  pre: new Set(["class"]),
  code: new Set(["class"]),
  figure: new Set(["class"]),
  figcaption: new Set(["class"]),
  ul: new Set(["class"]),
  ol: new Set(["class"]),
  li: new Set(["class"]),
  strong: new Set(["class"]),
  em: new Set(["class"]),
  b: new Set(["class"]),
  i: new Set(["class"]),
  u: new Set(["class"]),
  s: new Set(["class"]),
  strike: new Set(["class"]),
  del: new Set(["class"]),
  sub: new Set(["class"]),
  sup: new Set(["class"]),
  caption: new Set(["class"]),
  thead: new Set(["class"]),
  tbody: new Set(["class"]),
  tfoot: new Set(["class"]),
  tr: new Set(["class"]),
};

// CSS properties allowed in style attributes
const ALLOWED_CSS_PROPS = new Set([
  "color", "background-color", "font-size", "font-weight", "font-style",
  "text-align", "text-decoration", "text-transform",
  "width", "height", "max-width", "max-height",
  "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
  "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "border", "border-radius",
  "display", "vertical-align",
]);

// Dangerous URL schemes
const DANGEROUS_SCHEMES = new Set([
  "javascript:", "data:", "vbscript:", "mhtml:", "file:",
]);

/**
 * Check if a URL is safe (no dangerous schemes).
 */
function isSafeUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  for (const scheme of DANGEROUS_SCHEMES) {
    if (trimmed.startsWith(scheme)) return false;
  }
  return true;
}

/**
 * Sanitize a single CSS value — remove expression(), url(), etc.
 */
function sanitizeCssValue(prop: string, value: string): string | null {
  const lower = value.toLowerCase().trim();
  // Block dangerous CSS functions
  if (lower.includes("expression(") || lower.includes("url(") || lower.includes("javascript:")) {
    return null;
  }
  // Block -moz-binding and behavior (XBL/HTA attacks)
  if (lower.includes("-moz-binding") || lower.includes("behavior:")) {
    return null;
  }
  return value.trim();
}

/**
 * Sanitize a style attribute string.
 */
function sanitizeStyle(styleStr: string): string {
  const declarations = styleStr.split(";");
  const safe: string[] = [];
  for (const decl of declarations) {
    const colonIdx = decl.indexOf(":");
    if (colonIdx === -1) continue;
    const prop = decl.slice(0, colonIdx).trim().toLowerCase();
    const value = decl.slice(colonIdx + 1).trim();
    if (!ALLOWED_CSS_PROPS.has(prop)) continue;
    const safeVal = sanitizeCssValue(prop, value);
    if (safeVal !== null) {
      safe.push(`${prop}: ${safeVal}`);
    }
  }
  return safe.join("; ");
}

/**
 * Sanitize a single attribute value.
 */
function sanitizeAttr(tag: string, attrName: string, attrValue: string): string | null {
  const lowerName = attrName.toLowerCase();

  // Strip event handlers
  if (lowerName.startsWith("on")) return null;

  // URL attributes — check for dangerous schemes
  if (lowerName === "href" || lowerName === "src" || lowerName === "action" || lowerName === "formaction") {
    if (!isSafeUrl(attrValue)) return null;
    return attrValue;
  }

  // Style attribute — sanitize CSS
  if (lowerName === "style") {
    return sanitizeStyle(attrValue);
  }

  // target="_blank" should have rel="noopener noreferrer"
  if (lowerName === "target" && attrValue.toLowerCase() === "_blank") {
    return "_blank";
  }

  // Allow other whitelisted attributes as-is
  return attrValue;
}

/**
 * Main sanitizer: takes raw HTML string, returns sanitized HTML string.
 * This is a lightweight parser — not a full DOM parser, but sufficient
 * for Quill editor output which is well-structured.
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== "string") return "";

  let result = "";
  let i = 0;
  const len = input.length;

  while (i < len) {
    // Find next tag
    const tagStart = input.indexOf("<", i);
    if (tagStart === -1) {
      // No more tags — append remaining text (escaped)
      result += escapeHtml(input.slice(i));
      break;
    }

    // Append text before tag (escaped)
    if (tagStart > i) {
      result += escapeHtml(input.slice(i, tagStart));
    }

    // Find end of tag
    const tagEnd = input.indexOf(">", tagStart);
    if (tagEnd === -1) {
      // Malformed — escape the rest
      result += escapeHtml(input.slice(tagStart));
      break;
    }

    const fullTag = input.slice(tagStart, tagEnd + 1);
    const tagContent = input.slice(tagStart + 1, tagEnd);

    // Check if it's a closing tag
    const isClosing = tagContent.startsWith("/");
    const isSelfClosing = tagContent.endsWith("/");

    // Extract tag name
    let inner = tagContent.replace(/^\//, "").replace(/\/$/, "").trim();
    const spaceIdx = inner.search(/\s/);
    const tagName = (spaceIdx === -1 ? inner : inner.slice(0, spaceIdx)).toLowerCase();

    // Check if tag is allowed
    if (!ALLOWED_TAGS.has(tagName)) {
      // Strip the tag entirely (don't render, don't show text for script/style)
      if (tagName === "script" || tagName === "style" || tagName === "object" || tagName === "embed" || tagName === "applet" || tagName === "form" || tagName === "input" || tagName === "textarea" || tagName === "select" || tagName === "button") {
        // Skip everything until closing tag
        if (!isClosing && !isSelfClosing) {
          const closeTag = `</${tagName}>`;
          const closeIdx = input.toLowerCase().indexOf(closeTag, tagEnd + 1);
          if (closeIdx !== -1) {
            i = closeIdx + closeTag.length;
            continue;
          }
        }
      }
      // For other disallowed tags, just skip the tag but keep content
      i = tagEnd + 1;
      continue;
    }

    // Parse attributes
    const attrStr = spaceIdx === -1 ? "" : inner.slice(spaceIdx + 1).trim();
    let safeAttrs = parseAndSanitizeAttrs(tagName, attrStr);

    // Special handling: if <a> has target="_blank", add rel="noopener noreferrer"
    if (tagName === "a" && safeAttrs.includes('target="_blank"') && !safeAttrs.includes("rel=")) {
      safeAttrs += ' rel="noopener noreferrer"';
    }

    // Rebuild tag
    if (isClosing) {
      result += `</${tagName}>`;
    } else if (isSelfClosing || tagName === "br" || tagName === "hr" || tagName === "img") {
      result += `<${tagName}${safeAttrs ? " " + safeAttrs : ""}>`;
    } else {
      result += `<${tagName}${safeAttrs ? " " + safeAttrs : ""}>`;
    }

    i = tagEnd + 1;
  }

  return result;
}

/**
 * Parse attribute string and return sanitized attribute string.
 */
function parseAndSanitizeAttrs(tagName: string, attrStr: string): string {
  if (!attrStr) return "";

  const allowedForTag = ALLOWED_ATTRS[tagName];
  if (!allowedForTag) return "";

  const safe: string[] = [];
  // Simple attribute parser — handles key="value", key='value', key=value, and boolean attrs
  const attrRegex = /(\w[\w-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match: RegExpExecArray | null;

  while ((match = attrRegex.exec(attrStr)) !== null) {
    const attrName = match[1].toLowerCase();
    const attrValue = match[2] ?? match[3] ?? match[4] ?? "";

    if (!allowedForTag.has(attrName)) continue;

    const sanitized = sanitizeAttr(tagName, attrName, attrValue);
    if (sanitized === null) continue;

    if (match[2] !== undefined || match[3] !== undefined || match[4] !== undefined) {
      // Has a value
      if (sanitized === "" && attrName !== "alt" && attrName !== "title") continue;
      safe.push(`${attrName}="${escapeAttr(sanitized)}"`);
    } else {
      // Boolean attribute
      safe.push(attrName);
    }
  }

  return safe.join(" ");
}

/**
 * Escape HTML entities in text content.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Escape attribute values.
 */
function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Strip all HTML tags, return plain text.
 * Useful for meta descriptions, excerpts, etc.
 */
export function stripHtml(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .trim();
}
