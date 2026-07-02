import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Detect language from URL path:
  // /fa/* routes → "fa" (explicit FA prefix)
  // /en/* routes → "en"
  // Everything else (root /, /cart, /admin, etc.) → defaults to "fa"
  let lang: "fa" | "en" = "fa";
  if (pathname.startsWith("/en")) {
    lang = "en";
  } else if (pathname.startsWith("/fa")) {
    lang = "fa";
  }

  // Set lang cookie if not already set or different
  const response = NextResponse.next();
  const currentLang = request.cookies.get("lang")?.value;

  if (currentLang !== lang) {
    response.cookies.set("lang", lang, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });
  }

  // Pass the original pathname to the server via header (used by layout for hreflang/canonical)
  response.headers.set("x-url", pathname);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes
     * - static files (images, fonts, css, js)
     * - _next internals
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|uploads).*)",
  ],
};
