import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project') &&
    supabaseUrl.startsWith('https://')
  ) {
    try {
      const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value)
              );
              response = NextResponse.next({
                request,
              });
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              );
            },
          },
        }
      );

      // Refresh session if expired
      const { data: { user } } = await supabase.auth.getUser();

      // Protect /feed and /setup-profile: Require login
      const pathname = request.nextUrl.pathname;
      if (!user && (pathname.startsWith('/feed') || pathname.startsWith('/setup-profile'))) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/';
        return NextResponse.redirect(redirectUrl);
      }
    } catch (e) {
      // Ignore proxy cookie refresh errors
    }
  } else {
    // If Supabase is not configured, protect routes as well
    const pathname = request.nextUrl.pathname;
    if (pathname.startsWith('/feed') || pathname.startsWith('/setup-profile')) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
