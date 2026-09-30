'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  LogOut,
  UserPlus,
  LogIn,
  KeyRound,
  Info,
} from 'lucide-react';
import { AvatarUpload } from '@/components/ui/avatar-upload';

type AuthMode = 'signup' | 'signin';

export default function LandingPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loggedInUser, setLoggedInUser] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (supabase) {
      // Check current session
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.email) {
          setLoggedInUser({ id: user.id, email: user.email });
        }
      });

      // Listen for auth state changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setLoggedInUser({ id: session.user.id, email: session.user.email || '' });
        } else {
          setLoggedInUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Check if user has an existing saved profile in localStorage
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
    setEmail('');
    setPassword('');
    setErrorMessage('');
    setInfoMessage('');
    router.refresh();
  };

  const validateInputs = (): boolean => {
    const emailErr = getUclEmailError(email);
    if (emailErr) {
      setErrorMessage(emailErr);
      return false;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  // Route user based on whether they have completed their profile
  // Route user based on whether they have completed their profile
  const handlePostAuthRouting = async (userId: string, userEmail: string) => {
    // 1. Check Supabase profiles table
    const supabase = createClient();
    if (supabase) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, phone')
          .or(`id.eq.${userId},email.eq.${userEmail}`)
          .maybeSingle();

        if (profile && profile.phone) {
          router.push('/feed');
          return;
        }
      } catch {}
    }

    // 2. Check Prisma API
    try {
      const res = await fetch('/api/profiles');
      if (res.ok) {
        const { profiles } = await res.json();
        const found = profiles?.find((p: any) => p.id === userId || (p.email && p.email.toLowerCase() === userEmail.toLowerCase()));
        if (found && found.phone) {
          router.push('/feed');
          return;
        }
      }
    } catch {}

    // Existing users go directly to directory feed
    router.push('/feed');
  };

  // Handle Sign Up (with smart auto-login for existing users)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    setErrorMessage('');
    setInfoMessage('');

    if (avatarUrl && typeof window !== 'undefined') {
      localStorage.setItem('ucl_pending_avatar', avatarUrl);
    }

    const supabase = createClient();

    if (!supabase) {
      setLoading(false);
      router.push('/feed');
      return;
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            avatar_url: avatarUrl || undefined,
          },
        },
      });

      // Detect if user already exists (by error message, error code, or empty identities)
      const isAlreadyRegistered =
        (error && (
          error.message.toLowerCase().includes('already registered') ||
          error.message.toLowerCase().includes('user already exists') ||
          (error as any)?.code === 'user_already_exists'
        )) ||
        (data?.user && (!data.user.identities || data.user.identities.length === 0));

      if (isAlreadyRegistered) {
        // Automatically sign them in and send to dashboard!
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (!signInError && signInData.user) {
          setLoggedInUser({ id: signInData.user.id, email: signInData.user.email || cleanEmail });
          router.push('/feed');
          return;
        } else if (signInError) {
          setErrorMessage('This UCL email is already registered. Please check your password or switch to Sign In.');
          setAuthMode('signin');
          return;
        }
      }

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.session && data.user) {
        setLoggedInUser({ id: data.user.id, email: data.user.email || cleanEmail });
        router.push(`/setup-profile?email=${encodeURIComponent(cleanEmail)}`);
      } else if (data.user) {
        setInfoMessage(
          'Account created! Directing to directory...'
        );
        router.push('/feed');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    setErrorMessage('');
    setInfoMessage('');

    const supabase = createClient();

    if (!supabase) {
      setLoading(false);
      router.push('/feed');
      return;
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          setErrorMessage('Invalid UCL email or password. Please verify your details or create an account.');
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          setErrorMessage('Email not confirmed. Turn off "Confirm email" in your Supabase Auth settings for instant access.');
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      if (data.user) {
        setLoggedInUser({ id: data.user.id, email: data.user.email || cleanEmail });
        router.push('/feed');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to sign in.');
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
          The verified directory for UCL founders, designers, and engineers.
          All introductions route directly to WhatsApp with zero in-app friction.
        </p>

        {/* Dedicated UCL Auth Card */}
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
              {/* Tab Switcher: Join Cohort vs Sign In */}
              <div className="flex rounded-2xl bg-slate-950/80 p-1 border border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMessage('');
                    setInfoMessage('');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    authMode === 'signup'
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Join Cohort (Sign Up)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorMessage('');
                    setInfoMessage('');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    authMode === 'signin'
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </button>
              </div>

              {/* Subheader */}
              <div className="text-center pt-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-400 mb-1">
                  <ShieldCheck className="h-4 w-4" />
                  <span>UCL Verification Required</span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  {authMode === 'signup' ? 'Create UCL Founder Account' : 'Welcome Back'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Restricted to verified <strong className="text-slate-200">@ucl.ac.uk</strong> emails
                </p>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-300 flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Info Banner */}
              {infoMessage && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-xs text-emerald-300 flex items-start gap-2 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{infoMessage}</span>
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={authMode === 'signup' ? handleSignUp : handleSignIn} className="space-y-4">
                {/* Photo Upload ONLY during Sign Up */}
                {authMode === 'signup' && (
                  <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/70">
                    <AvatarUpload
                      value={avatarUrl}
                      onChange={setAvatarUrl}
                    />
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      UCL Email *
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
                        setInfoMessage('');
                      }}
                      placeholder="zcabfqu@ucl.ac.uk"
                      required
                      autoFocus
                      className="pl-10 h-11 bg-slate-950/80 border-slate-800 text-sm font-mono"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Password *
                    </label>
                    {authMode === 'signup' && (
                      <span className="text-[11px] text-slate-400">
                        Min. 6 characters
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMessage('');
                        setInfoMessage('');
                      }}
                      placeholder="••••••••••••"
                      required
                      minLength={6}
                      className="pl-10 pr-10 h-11 bg-slate-950/80 border-slate-800 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold gap-2 text-sm shadow-md mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{authMode === 'signup' ? 'Creating Account...' : 'Signing In...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{authMode === 'signup' ? 'Create Account & Continue' : 'Sign In to Directory'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Toggle Switch Prompt */}
              <div className="pt-2 text-center text-xs text-slate-400">
                {authMode === 'signup' ? (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setErrorMessage('');
                        setInfoMessage('');
                      }}
                      className="text-sky-400 hover:underline font-semibold"
                    >
                      Sign In here
                    </button>
                  </span>
                ) : (
                  <span>
                    New to UCL Cohort?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setErrorMessage('');
                        setInfoMessage('');
                      }}
                      className="text-sky-400 hover:underline font-semibold"
                    >
                      Join Cohort here
                    </button>
                  </span>
                )}
              </div>

              {/* Quick Direct Links */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <Link
                  href="/setup-profile"
                  className="text-sky-400 hover:text-sky-300 font-medium inline-flex items-center gap-1"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Direct Profile Setup &rarr;</span>
                </Link>
                <Link href="/feed" className="hover:text-white transition-colors">
                  Browse Directory &rarr;
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
        </p>
      </footer>
    </div>
  );
}
