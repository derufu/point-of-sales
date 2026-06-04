// // middleware.ts  (place at the root of your Next.js project, next to next.config.ts)
// // Runs on the Edge Runtime — zero cold-start, lightweight.

// import { NextRequest, NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt"; // swap for your auth library if needed

// // ── Route config ──────────────────────────────────────────────────────────
// // Which paths this middleware should protect (Next.js matcher)
// export const config = {
//   matcher: [
//     /*
//      * Match everything EXCEPT:
//      *  - _next/static   (static files)
//      *  - _next/image    (image optimisation)
//      *  - favicon.ico
//      *  - /api/auth/**   (NextAuth sign-in/callback routes)
//      *  - /login         (public login page)
//      */
//     "/((?!_next/static|_next/image|favicon.ico|api/auth|login).*)",
//   ],
// };

// // ── Security headers ──────────────────────────────────────────────────────
// function applySecurityHeaders(response: NextResponse): NextResponse {
//   const h = response.headers;

//   // Prevent clickjacking
//   h.set("X-Frame-Options", "DENY");

//   // Stop MIME-type sniffing
//   h.set("X-Content-Type-Options", "nosniff");

//   // Basic XSS protection (legacy browsers)
//   h.set("X-XSS-Protection", "1; mode=block");

//   // Referrer policy
//   h.set("Referrer-Policy", "strict-origin-when-cross-origin");

//   // HSTS (enable only when you're fully on HTTPS)
//   h.set(
//     "Strict-Transport-Security",
//     "max-age=63072000; includeSubDomains; preload"
//   );

//   // Permissions policy — restrict dangerous browser features
//   h.set(
//     "Permissions-Policy",
//     "camera=(), microphone=(), geolocation=(), interest-cohort=()"
//   );

//   // Content Security Policy — tighten for your own CDN/font origins
//   h.set(
//     "Content-Security-Policy",
//     [
//       "default-src 'self'",
//       "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // tighten after removing inline scripts
//       "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
//       "font-src 'self' https://fonts.gstatic.com",
//       "img-src 'self' data: https:",
//       "connect-src 'self'",
//       "frame-ancestors 'none'",
//     ].join("; ")
//   );

//   return response;
// }

// // ── Rate-limit helper (simple in-memory, edge-compatible) ─────────────────
// // For production use Upstash Redis + @upstash/ratelimit instead.
// const rateMap = new Map<string, { count: number; reset: number }>();
// const RATE_LIMIT = 60;          // requests
// const RATE_WINDOW_MS = 60_000;  // per minute

// function isRateLimited(ip: string): boolean {
//   const now = Date.now();
//   const entry = rateMap.get(ip);

//   if (!entry || now > entry.reset) {
//     rateMap.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
//     return false;
//   }

//   entry.count += 1;
//   if (entry.count > RATE_LIMIT) return true;

//   return false;
// }

// // ── Middleware ─────────────────────────────────────────────────────────────
// export async function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   // 1. Rate limiting (API routes only)
//   if (pathname.startsWith("/api/")) {
//     const ip =
//       req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

//     if (isRateLimited(ip)) {
//       return new NextResponse(JSON.stringify({ error: "Too Many Requests" }), {
//         status: 429,
//         headers: { "Content-Type": "application/json" },
//       });
//     }
//   }

//   // 2. Auth guard — protect /dashboard and /profile routes
//   const protectedPaths = ["/dashboard", "/profile", "/settings", "/admin"];
//   const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

//   if (isProtected) {
//     // next-auth/jwt reads the session token from the cookie automatically.
//     // Replace with your own token-validation logic if not using NextAuth.
//     const token = await getToken({
//       req,
//       secret: process.env.NEXTAUTH_SECRET,
//     });

//     if (!token) {
//       const loginUrl = new URL("/login", req.url);
//       loginUrl.searchParams.set("callbackUrl", pathname);
//       return NextResponse.redirect(loginUrl);
//     }

//     // 3. Role-based access — /admin requires "admin" role
//     if (pathname.startsWith("/admin") && token.role !== "admin") {
//       return NextResponse.redirect(new URL("/403", req.url));
//     }
//   }

//   // 4. CSRF check for mutating API requests (POST / PUT / PATCH / DELETE)
//   if (pathname.startsWith("/api/") && ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
//     const origin = req.headers.get("origin");
//     const host = req.headers.get("host");

//     if (origin && !origin.includes(host ?? "")) {
//       return new NextResponse(JSON.stringify({ error: "CSRF check failed" }), {
//         status: 403,
//         headers: { "Content-Type": "application/json" },
//       });
//     }
//   }

//   // 5. Continue — apply security headers to every response
//   const response = NextResponse.next();
//   return applySecurityHeaders(response);
// }