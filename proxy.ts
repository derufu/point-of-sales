import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function proxy(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect profile and dashboard routes
  if (request.nextUrl.pathname.startsWith("/profile")) {
    if (!user) {
      return Response.redirect(new URL("/auth/login", request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith("/auth")) {
    if (user) {
      return Response.redirect(new URL("/", request.url));
    }
  }
}

export const config = {
  matcher: ["/profile/:path*", "/auth/:path*"],
};
