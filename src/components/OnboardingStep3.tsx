'use client';

import React from 'react';
import { OnboardingFormData, LookingFor, Industry } from '@/lib/types';
import { LOOKING_FOR_OPTIONS, INDUSTRY_OPTIONS } from '@/lib/constants';
import { MultiSelectPills } from '@/components/ui/multi-select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Target, Globe2 } from 'lucide-react';

interface OnboardingStep3Props {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingStep3({
  formData,
  updateFormData,
  onNext,
  onBack,
}: OnboardingStep3Props) {
  const isValid =
    formData.looking_for.length > 0 &&
    formData.looking_for.length <= 2 &&
    formData.industries.length > 0 &&
    formData.industries.length <= 3;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-400 mb-2">
          <span>Step 3 of 4</span>
          <span>•</span>
          <span>The Demand</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Who do you want to meet?
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Tell peers what kind of co-founders or teammates you're looking for.
        </p>
      </div>

      <div className="space-y-6 pt-2">
        {/* Looking For */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-indigo-400" />
              I am looking to meet (Pick up to 2)
            </label>
            <span className="text-xs text-indigo-400 font-medium">
              {formData.looking_for.length}/2 selected
            </span>
          </div>

          <MultiSelectPills<LookingFor>
            options={LOOKING_FOR_OPTIONS}
            selected={formData.looking_for}
            onChange={(selected) => updateFormData({ looking_for: selected })}
            max={2}
            variant="lookingFor"
            allowCustom={true}
            customPlaceholder="Type your own (e.g. Angel Investor, Grant Writer) & press Enter..."
          />
        </div>

        {/* Industry Interests */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Globe2 className="h-3.5 w-3.5 text-sky-400" />
              Industry Interests (Pick up to 3)
            </label>
            <span className="text-xs text-sky-400 font-medium">
              {formData.industries.length}/3 selected
            </span>
          </div>

          <MultiSelectPills<Industry>
            options={INDUSTRY_OPTIONS}
            selected={formData.industries}
            onChange={(selected) => updateFormData({ industries: selected })}
            max={3}
            variant="industry"
            allowCustom={true}
            customPlaceholder="Type your own (e.g. EdTech, Defence, SpaceTech) & press Enter..."
          />
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
