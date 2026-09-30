'use client';

import React from 'react';
import { OnboardingFormData, Superpower } from '@/lib/types';
import { SUPERPOWER_OPTIONS } from '@/lib/constants';
import { MultiSelectPills } from '@/components/ui/multi-select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Sparkles, MessageSquare } from 'lucide-react';

interface OnboardingStep2Props {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingStep2({
  formData,
  updateFormData,
  onNext,
  onBack,
}: OnboardingStep2Props) {
  const maxChars = 100;
  const currentLength = formData.bio?.length || 0;

  const isValid =
    formData.superpowers.length > 0 &&
    formData.superpowers.length <= 2 &&
    formData.bio.trim().length >= 3 &&
    currentLength <= maxChars;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400 mb-2">
          <span>Step 2 of 4</span>
          <span>•</span>
          <span>The Supply</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          What are your superpowers?
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Tell peers what you excel at and summarize your pitch in one sentence.
        </p>
      </div>

      <div className="space-y-6 pt-2">
        {/* Superpowers */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              My Superpowers (Pick up to 2)
            </label>
            <span className="text-xs text-emerald-400 font-medium">
              {formData.superpowers.length}/2 selected
            </span>
          </div>

          <MultiSelectPills<Superpower>
            options={SUPERPOWER_OPTIONS}
            selected={formData.superpowers}
            onChange={(selected) => updateFormData({ superpowers: selected })}
            max={2}
            variant="superpower"
            allowCustom={true}
            customPlaceholder="Type your own (e.g. Robotics, Quantitative Modeling) & press Enter..."
          />
        </div>

        {/* The One-Liner */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-sky-400" />
              The One-Liner (Max 100 chars)
            </label>
            <span
              className={`text-xs font-mono font-medium ${
                currentLength > maxChars ? 'text-red-400' : 'text-slate-400'
              }`}
            >
              {currentLength}/{maxChars}
            </span>
          </div>

          <Input
            value={formData.bio}
            onChange={(e) => {
              if (e.target.value.length <= maxChars) {
                updateFormData({ bio: e.target.value });
              }
            }}
            placeholder="e.g. Ex-DeepMind intern building AI for clinical trials. Need GTM co-founder."
            maxLength={maxChars}
            className="h-12 bg-slate-950/80 border-slate-700 text-sm text-white px-4"
          />
          <p className="text-[11px] text-slate-500">
            A punchy sentence explaining your venture, project, or what you're building.
          </p>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="gap-2 border-slate-700 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>

        <Button
          type="button"
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
