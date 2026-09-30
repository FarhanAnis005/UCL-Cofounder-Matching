'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OnboardingFormData } from '@/lib/types';
import { getCurrentUserProfile, saveProfile, signOutUser, deleteProfile } from '@/lib/profile-service';
import { createClient } from '@/lib/supabase/client';
import { inferNameFromUclEmail } from '@/lib/auth-utils';
import { OnboardingStep1 } from '@/components/OnboardingStep1';
import { OnboardingStep2 } from '@/components/OnboardingStep2';
import { OnboardingStep3 } from '@/components/OnboardingStep3';
import { OnboardingStep4 } from '@/components/OnboardingStep4';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';

function SetupProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [existingUserId, setExistingUserId] = useState<string | undefined>(undefined);
  const [userEmail, setUserEmail] = useState<string>(emailParam);

  const [formData, setFormData] = useState<OnboardingFormData>({
    full_name: '',
    avatar_url: '',
    current_focus: '',
    superpowers: [],
    bio: '',
    looking_for: [],
    industries: [],
    phone: '',
    graduation_year: '2025',
  });

  // Prepopulate only if user already has an existing saved profile from auth
  useEffect(() => {
    async function loadInitialData() {
      // 1. Check existing saved profile
      const profile = await getCurrentUserProfile();
      if (profile && profile.full_name) {
        setExistingUserId(profile.id);
        setFormData({
          full_name: profile.full_name || '',
          avatar_url: profile.avatar_url || '',
          current_focus: profile.current_focus || '',
          superpowers: profile.superpowers || [],
          bio: profile.bio || '',
          looking_for: profile.looking_for || [],
          industries: profile.industries || [],
          phone: profile.phone || '',
          graduation_year: profile.graduation_year || '2025',
          linkedin_url: profile.linkedin_url || '',
          github_url: profile.github_url || '',
          website_url: profile.website_url || '',
          pitch_deck_url: profile.pitch_deck_url || '',
          custom_fields: profile.custom_fields || {},
        });
        return;
      }

      // 2. Otherwise check Supabase session or URL query email
      let userEmail = emailParam;
      let userAvatar = '';
      let userName = '';

      const supabase = createClient();
      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.email) {
          userEmail = user.email;
          setExistingUserId(user.id);
          userAvatar = user.user_metadata?.avatar_url || '';
          userName = user.user_metadata?.full_name || '';
        }
      }

      // Check pending avatar saved during landing page signup
      if (!userAvatar && typeof window !== 'undefined') {
        userAvatar = localStorage.getItem('ucl_pending_avatar') || '';
      }
      if (!userName && typeof window !== 'undefined') {
        userName = localStorage.getItem('ucl_pending_name') || '';
      }

      if (userEmail) {
        setUserEmail(userEmail);
        const inferredName = userName || inferNameFromUclEmail(userEmail);
        setFormData((prev) => ({
          ...prev,
          full_name: inferredName || prev.full_name,
          avatar_url: userAvatar || prev.avatar_url,
        }));
      } else if (userAvatar) {
        setFormData((prev) => ({
          ...prev,
          avatar_url: userAvatar || prev.avatar_url,
        }));
      } else {
        // Not authenticated
        router.replace('/');
        return;
      }
    }

    loadInitialData();
  }, [emailParam, router]);

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/');
    router.refresh();
  };

  const updateFormData = (data: Partial<OnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await saveProfile(formData, existingUserId);
      if (res.success) {
        setTimeout(() => {
          router.push('/feed?welcome=true');
        }, 500);
      } else {
        setSubmitError(res.error || 'Failed to save profile to Supabase database.');
        setIsSubmitting(false);
      }
    } catch (e: any) {
      console.error('Failed to save profile:', e);
      setSubmitError(e?.message || 'Failed to save profile.');
      setIsSubmitting(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!existingUserId) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      const res = await deleteProfile(existingUserId);
      if (res.success) {
        await handleSignOut();
      } else {
        setDeleteError(res.error || 'Failed to delete profile.');
        setIsDeleting(false);
      }
    } catch (e: any) {
      setDeleteError(e?.message || 'Failed to delete profile.');
      setIsDeleting(false);
    }
  };

  const stepTitles = [
    '1. The Basics',
    '2. Superpowers',
    '3. The Demand',
    '4. WhatsApp Handoff',
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Progress Bar & Micro Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold mb-2.5">
            {stepTitles.map((title, idx) => (
              <span
                key={title}
                className={
                  step >= idx + 1
                    ? 'text-sky-400 font-bold'
                    : 'text-slate-600 hidden sm:inline'
                }
              >
                {title}
              </span>
            ))}
            <span className="sm:hidden text-sky-400 font-bold">
              Step {step} of 4
            </span>
          </div>

          {/* Stepper bar */}
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Card */}
        <div className="p-6 sm:p-9 rounded-3xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-2xl shadow-2xl">
          {/* Active Session & Log Out bar */}
          {(userEmail || existingUserId) && (
            <div className="flex items-center justify-between text-xs text-slate-400 pb-4 mb-6 border-b border-slate-800/80">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Signed in as <strong className="text-white font-medium">{userEmail || 'UCL Member'}</strong></span>
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-rose-400 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-rose-500/40 hover:bg-rose-500/10 transition-colors font-medium"
                title="Sign out of this session"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-400" />
                <span>Log Out</span>
              </button>
            </div>
          )}

          {step === 1 && (
            <OnboardingStep1
              formData={formData}
              updateFormData={updateFormData}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <OnboardingStep2
              formData={formData}
              updateFormData={updateFormData}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <OnboardingStep3
              formData={formData}
              updateFormData={updateFormData}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && (
            <div className="space-y-4">
              {submitError && (
                <div className="p-3.5 rounded-xl border border-rose-500/40 bg-rose-950/30 text-xs text-rose-300">
                  <p className="font-semibold text-rose-200">Supabase Error:</p>
                  <p className="mt-0.5">{submitError}</p>
                </div>
              )}
              <OnboardingStep4
                formData={formData}
                updateFormData={updateFormData}
                onBack={() => setStep(3)}
                onSubmit={handleFinalSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          )}
        </div>

        {/* Danger Zone: Delete Profile */}
        {existingUserId && (
          <div className="mt-8 p-5 rounded-2xl border border-rose-900/30 bg-rose-950/15 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
            <div>
              <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                <span>Delete Profile</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Permanently delete your profile and remove your card from the UCL Cohort Directory.
              </p>
              {deleteError && (
                <p className="text-xs text-rose-400 mt-1 font-medium">{deleteError}</p>
              )}
            </div>

            {showDeleteConfirm ? (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteProfile}
                  disabled={isDeleting}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-9 px-3.5 rounded-xl font-bold gap-1.5"
                >
                  {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  <span>Confirm Delete</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="text-xs text-slate-400 hover:text-white h-9 px-2"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="shrink-0 border-rose-900/50 hover:border-rose-500/50 hover:bg-rose-950/30 text-rose-300 text-xs h-9 px-3.5 rounded-xl transition-colors font-medium gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                <span>Delete My Profile</span>
              </Button>
            )}
          </div>
        )}

        {/* Return to feed */}
        <div className="mt-6 text-center">
          <Link
            href="/feed"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Cancel and return to Directory Feed</span>
          </Link>
        </div>
      </main>

      <footer className="py-6 border-t border-slate-800/60 text-center text-xs text-slate-500">
        UCL Cohort Network • Designed to eliminate co-founder search friction
      </footer>
    </div>
  );
}

export default function SetupProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-white">
          <div className="h-8 w-8 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
        </div>
      }
    >
      <SetupProfileContent />
    </Suspense>
  );
}
