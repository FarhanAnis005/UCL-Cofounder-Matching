import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { type EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  // Safely extract public origin for Vercel edge/serverless proxy and custom domains
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : requestUrl.origin;

  const supabase = await createClient();

  if (supabase) {
    let authUser = null;

    // 1. If PKCE code is provided
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data.user) {
        authUser = data.user;
      }
    }
    // 2. If token_hash and type are provided (Supabase magic link email flow)
    else if (token_hash && type) {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type,
      });
      if (!error && data.user) {
        authUser = data.user;
      }
    }

    // If authenticated, check profile status
    if (authUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, phone')
        .eq('id', authUser.id)
        .single();

      if (profile && profile.phone) {
        return NextResponse.redirect(`${origin}/feed`);
      } else {
        return NextResponse.redirect(`${origin}/setup-profile?email=${encodeURIComponent(authUser.email || '')}`);
      }
    }
  }

  // Fallback redirect
  return NextResponse.redirect(`${origin}/setup-profile`);
}
