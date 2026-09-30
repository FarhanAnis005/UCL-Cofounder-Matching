'use client';

import React from 'react';
import { OnboardingFormData, CurrentFocus } from '@/lib/types';
import { FOCUS_OPTIONS } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { ArrowRight, User, Briefcase } from 'lucide-react';

interface OnboardingStep1Props {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  onNext: () => void;
}

export function OnboardingStep1({ formData, updateFormData, onNext }: OnboardingStep1Props) {
  const isValid = formData.full_name.trim().length > 1 && Boolean(formData.current_focus);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 border border-sky-500/30 px-3 py-1 text-xs font-semibold text-sky-400 mb-2">
          <span>Step 1 of 4</span>
          <span>•</span>
          <span>The Basics</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Welcome to the UCL Cohort!
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Let's get your peer card set up in under 60 seconds.
        </p>
      </div>

      <div className="space-y-5 pt-2">
        {/* Profile Photo Upload */}
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60">
          <AvatarUpload
            value={formData.avatar_url}
            onChange={(url) => updateFormData({ avatar_url: url })}
          />
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-sky-400" />
            What is your name?
          </label>
          <Input
            value={formData.full_name}
            onChange={(e) => updateFormData({ full_name: e.target.value })}
            placeholder="e.g. Alexander Sterling"
            autoFocus
            className="h-12 bg-slate-950/80 border-slate-700 text-base text-white px-4"
          />
        </div>

        {/* Current Focus Cards */}
        <div className="space-y-2.5 pt-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-sky-400" />
            What is your current focus?
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FOCUS_OPTIONS.map((opt) => {
              const isSelected = formData.current_focus === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateFormData({ current_focus: opt.value })}
                  className={`text-left rounded-2xl border p-4 transition-all duration-200 select-none ${
                    isSelected
                      ? 'border-sky-400 bg-sky-500/15 ring-2 ring-sky-500/30 shadow-lg shadow-sky-950/40 text-white'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="text-2xl mb-1.5">{opt.icon}</div>
                  <div className="font-bold text-sm text-white mb-0.5">{opt.label}</div>
                  <div className="text-xs text-slate-400 leading-relaxed">{opt.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Continue */}
      <div className="pt-4 border-t border-slate-800 flex justify-end">
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-7 h-12 rounded-xl disabled:opacity-40"
        >
          <span>Continue</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
