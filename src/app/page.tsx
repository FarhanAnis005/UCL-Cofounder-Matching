'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getCurrentUserProfile, signOutUser } from '@/lib/profile-service';
import { isUclEmail, getUclEmailError } from '@/lib/auth-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Database,
  Mail,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { SupabaseSetupModal } from '@/components/SupabaseSetupModal';
import { AvatarUpload } from '@/components/ui/avatar-upload';

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [linkSent, setLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured());

    const supabase = createClient();
    if (supabase) {
      // Check current session
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.email) {
          setLoggedInUser({ id: user.id, email: user.email });
        }
      });

      // Listen for auth changes: if the student clicks the Magic Link in any tab/window,
      // this tab automatically detects the session and advances!
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setLoggedInUser({ id: session.user.id, email: session.user.email || '' });
          await handlePostAuthRouting(session.user.id, session.user.email || '');
        } else {
          setLoggedInUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Check if user is already logged in
      getCurrentUserProfile().then((profile) => {
        if (profile && profile.phone) {
          router.push('/feed');
        }
      });
    }
  }, [router]);

  const handleSignOut = async () => {
    await signOutUser();
    setLoggedInUser(null);
    setLinkSent(false);
    setEmail('');
    router.refresh();
  };

  const validateInput = (): boolean => {
    const error = getUclEmailError(email);
    if (error) {
      setErrorMessage(error);
      return false;
    }
    setErrorMessage('');
    return true;
  };

  // Route user based on whether they have completed their profile
  const handlePostAuthRouting = async (userId: string, userEmail: string) => {
    const supabase = createClient();
    if (supabase) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, phone')
        .eq('id', userId)
        .single();

      if (profile && profile.phone) {
        router.push('/feed');
        return;
      }
    }
    // New student without completed profile
    router.push(`/setup-profile?email=${encodeURIComponent(userEmail)}`);
  };

  // Send One-Click Magic Link
  const handleSendMagicLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateInput()) return;

    setLoading(true);
    setErrorMessage('');

    if (avatarUrl && typeof window !== 'undefined') {
      localStorage.setItem('ucl_pending_avatar', avatarUrl);
    }

    const supabase = createClient();

    if (!supabase) {
      // Demo / Preview Mode when Supabase is not linked
      setLoading(false);
      setLinkSent(true);
      return;
    }

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${origin}/auth/callback`,
          data: {
            avatar_url: avatarUrl || undefined,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setLinkSent(true);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to send login link.');
    } finally {
      setLoading(false);
    }
  };

  const emailIsValidUcl = isUclEmail(email);

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#090d16] text-white">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 ambient-glow-navy pointer-events-none" />
      <div className="absolute top-0 right-0 ambient-glow-cyan pointer-events-none" />
      <div className="absolute bottom-0 left-0 ambient-glow-emerald pointer-events-none" />

      {/* Grid texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top Navbar */}
      <header className="relative z-20 max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-400 p-[1px] shadow-lg shadow-indigo-950/40">
            <div className="h-full w-full rounded-[11px] bg-slate-950 flex items-center justify-center">
              <span className="font-extrabold text-xs text-sky-400 tracking-wider">UCL</span>
            </div>
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white">
              Cohort Network
            </span>
            <span className="block text-[11px] text-slate-400">
              University College London
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDbModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
          >
            <Database className="h-3.5 w-3.5 text-sky-400" />
            <span className="hidden sm:inline">Supabase:</span>
            <span className={isConfigured ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
              {isConfigured ? 'Live' : 'Ready / Schema'}
            </span>
          </button>

          <Link href="/feed">
            <Button variant="ghost" size="sm" className="text-xs text-slate-300 hover:text-white">
              Browse Directory &rarr;
            </Button>
          </Link>

          {loggedInUser && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-1.5 border-slate-700/80 bg-slate-900/60 hover:bg-rose-950/40 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 text-xs font-semibold rounded-xl transition-all"
              title={`Log out (${loggedInUser.email})`}
            >
              <LogOut className="h-3.5 w-3.5 text-rose-400" />
              <span>Log Out</span>
            </Button>
          )}
        </div>
      </header>

      {/* Main Hero & Auth Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10 max-w-4xl mx-auto text-center">
        {/* UCL Cohort Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-950/40 px-3.5 py-1.5 text-xs font-semibold text-sky-300 mb-6 shadow-sm shadow-sky-950/50 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
          <span>Restricted to Verified UCL Students & Alumni</span>
          <span className="text-slate-400">•</span>
          <span className="text-emerald-400 font-medium">WhatsApp Handoff</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.12]">
          Find Your UCL Co-Founder{' '}
          <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
            Within The UCL Cohort
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
          The lightweight directory for UCL founders, designers, and engineers.
          All introductions route directly to WhatsApp with zero in-app friction.
        </p>

        {/* Dedicated UCL Auth Card: 100% Focused on Magic Link */}
        <div className="mt-8 w-full max-w-md p-6 sm:p-8 rounded-3xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-2xl shadow-2xl space-y-5 text-left">
          {loggedInUser ? (
            <div className="space-y-4 text-center py-2">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Active Session Detected</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Signed in as <strong className="text-white font-medium">{loggedInUser.email}</strong>
                </p>
              </div>
              <div className="space-y-2.5 pt-2">
                <Button
                  onClick={() => handlePostAuthRouting(loggedInUser.id, loggedInUser.email)}
                  className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold h-12 rounded-xl text-sm shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
                >
                  <span>Continue to Cohort Directory</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="w-full border-slate-800 hover:border-rose-500/50 hover:bg-rose-950/30 text-slate-300 hover:text-rose-300 h-10 rounded-xl text-xs gap-1.5 font-medium flex items-center justify-center"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-400" />
                  <span>Log Out ({loggedInUser.email.split('@')[0]})</span>
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-400 mb-1">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Official Student Portal</span>
                </div>
                <h2 className="text-xl font-bold text-white">Sign In with UCL Email</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Strictly restricted to <strong className="text-slate-200">@ucl.ac.uk</strong> addresses
                </p>
              </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-300 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SCREEN 1: Enter UCL Email & Photo */}
          {!linkSent ? (
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              {/* Photo Upload during Sign Up */}
              <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/70">
                <AvatarUpload
                  value={avatarUrl}
                  onChange={setAvatarUrl}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    UCL Student Email *
                  </label>
                  {email && (
                    <span className={`text-[11px] font-medium ${emailIsValidUcl ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {emailIsValidUcl ? '✓ Valid UCL Domain' : 'Must be @ucl.ac.uk'}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="zcabfqu@ucl.ac.uk"
                    required
                    autoFocus
                    className="pl-10 h-12 bg-slate-950/80 border-slate-800 text-sm font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Accepts @ucl.ac.uk and departmental subdomains (e.g. @cs.ucl.ac.uk).
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold gap-2 text-sm shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending Login Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send One-Click Login Link</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            /* SCREEN 2: Magic Link Sent - Pure Click-to-Login */
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-5 space-y-3 text-center">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                  <Mail className="h-6 w-6 animate-bounce" />
                </div>

                {avatarUrl && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 mx-auto">
                    <img src={avatarUrl} alt="Photo attached" className="h-5 w-5 rounded-full object-cover border border-sky-400" />
                    <span>Photo attached to profile</span>
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-white text-base">Check Your UCL Inbox</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    We just sent a login link to:
                  </p>
                  <p className="font-mono text-xs text-emerald-400 font-semibold mt-0.5 break-all">
                    {email}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 text-left space-y-1.5">
                  <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Next step:</span>
                  </div>
                  <p className="text-slate-300">
                    Click the <strong className="text-white">"Log In"</strong> button inside the email.
                  </p>
                  <p className="text-[11px] text-slate-400 pt-1">
                    💡 This tab will automatically detect your login and advance immediately!
                  </p>
                </div>

                {/* Radar pulse indicator */}
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Waiting for login link click...</span>
                </div>
              </div>

              {/* Actions: Resend or Change Email */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setLinkSent(false);
                    setErrorMessage('');
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  &larr; Use different email
                </button>

                <button
                  type="button"
                  onClick={() => handleSendMagicLink()}
                  disabled={loading}
                  className="text-sky-400 hover:underline inline-flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Resend link</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Setup or Feed Entry */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <Link
              href="/setup-profile"
              className="text-sky-400 hover:text-sky-300 font-medium inline-flex items-center gap-1"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Direct Setup Funnel &rarr;</span>
            </Link>
            <Link href="/feed" className="hover:text-white transition-colors">
              Browse Cohort Directory &rarr;
            </Link>
          </div>
            </>
          )}
        </div>

        {/* Feature Pills */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl text-left">
          <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2.5">
              <Zap className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-sm text-white">Direct WhatsApp Routing</h3>
            <p className="text-xs text-slate-400 mt-1">
              Skip in-app messaging silos. Every card opens a direct WhatsApp chat to coordinate in seconds.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2.5">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-sm text-white">Verified UCL Cohort</h3>
            <p className="text-xs text-slate-400 mt-1">
              Strictly restricted to @ucl.ac.uk members across Computer Science, Management, Bartlett, and Medicine.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm">
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-2.5">
              <Users className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-sm text-white">Supply & Demand Matching</h3>
            <p className="text-xs text-slate-400 mt-1">
              Toggle buttons filter directly by who is seeking your exact technical or business superpowers.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto px-6 py-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <p>© UCL Cohort Network • Built for UCL Founders & Builders</p>
        <p className="flex items-center gap-2">
          <span>Powered by Next.js & Supabase</span>
          <span>•</span>
          <button onClick={() => setShowDbModal(true)} className="text-sky-400 hover:underline">
            View Supabase Schema
          </button>
        </p>
      </footer>

      {/* Supabase modal */}
      <SupabaseSetupModal isOpen={showDbModal} onClose={() => setShowDbModal(false)} isConfigured={isConfigured} />
    </div>
  );
}
