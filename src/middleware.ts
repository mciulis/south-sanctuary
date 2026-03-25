import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow the login page and auth API
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Fetch site settings from Supabase
  let protectionEnabled = true;
  let sitePassword = process.env.SITE_PASSWORD ?? "";

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const res = await fetch(
      `${supabaseUrl}/rest/v1/site_settings?key=in.(password_protection_enabled,site_password)&select=key,value`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 30 },
      }
    );
    if (res.ok) {
      const rows: { key: string; value: string }[] = await res.json();
      for (const row of rows) {
        if (row.key === "password_protection_enabled") {
          protectionEnabled = row.value === "true";
        }
        if (row.key === "site_password") {
          sitePassword = row.value;
        }
      }
    }
  } catch {
    // Fall back to env var on error
  }

  if (!protectionEnabled) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get("ss_auth");
  if (!authCookie || authCookie.value !== sitePassword) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
