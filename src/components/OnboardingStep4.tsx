'use client';

import React, { useState } from 'react';
import { OnboardingFormData } from '@/lib/types';
import { isValidE164, sanitizePhoneForWhatsApp, getWhatsAppUrl } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Phone,
  Sparkles,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OnboardingStep4Props {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  onBack: () => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

const COMMON_COUNTRY_CODES = [
  { flag: '🇬🇧', code: '+44', label: 'UK' },
  { flag: '🇺🇸', code: '+1', label: 'US' },
  { flag: '🇮🇳', code: '+91', label: 'IN' },
  { flag: '🇪🇺', code: '+33', label: 'EU' },
  { flag: '🇸🇬', code: '+65', label: 'SG' },
];

export function OnboardingStep4({
  formData,
  updateFormData,
  onBack,
  onSubmit,
  isSubmitting,
}: OnboardingStep4Props) {
  const [touched, setTouched] = useState(false);

  const phoneValid = isValidE164(formData.phone);
  const cleanPhone = sanitizePhoneForWhatsApp(formData.phone);

  const handleApplyPrefix = (code: string) => {
    if (!formData.phone.startsWith('+')) {
      const remaining = formData.phone.replace(/^0+/, '');
      updateFormData({ phone: `${code}${remaining}` });
    } else {
      updateFormData({ phone: `${code}` });
    }
    setTouched(true);
  };

  const handleSubmit = async () => {
    setTouched(true);
    let currentPhone = formData.phone.trim();
    if (currentPhone.startsWith('07') && currentPhone.replace(/\D/g, '').length === 11) {
      currentPhone = '+44' + currentPhone.replace(/^0+/, '');
      updateFormData({ phone: currentPhone });
    }
    if (!isValidE164(currentPhone)) return;

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    await onSubmit();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400 mb-2">
          <span>Step 4 of 4</span>
          <span>•</span>
          <span>The Handoff</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Where should peers message you?
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          When fellow cohort members click your card, it opens a direct WhatsApp chat with you.
        </p>
      </div>

      <div className="space-y-5 pt-2">
        {/* WhatsApp Phone */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-emerald-400" />
              WhatsApp Number (Country Code Required)
            </label>
            <span className="text-xs text-slate-400 font-mono">e.g. +447700900123</span>
          </div>

          {/* Quick country code helper chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1">Prefix:</span>
            {COMMON_COUNTRY_CODES.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => handleApplyPrefix(item.code)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950 text-xs text-slate-300 hover:border-emerald-500/40 hover:text-white transition-colors"
              >
                <span>{item.flag}</span>
                <span>{item.code}</span>
              </button>
            ))}
          </div>

          <div className="relative">
            <Input
              value={formData.phone}
              onChange={(e) => {
                setTouched(true);
                updateFormData({ phone: e.target.value.trim() });
              }}
              onBlur={() => {
                const val = formData.phone.trim();
                if (val.startsWith('07') && val.replace(/\D/g, '').length === 11) {
                  updateFormData({ phone: '+44' + val.replace(/^0+/, '') });
                }
              }}
              placeholder="+447700900123"
              className={`h-12 pl-4 pr-10 text-base font-mono bg-slate-950/80 ${
                touched && !phoneValid
                  ? 'border-red-500/80 focus-visible:ring-red-500/30'
                  : phoneValid
                  ? 'border-emerald-500/80 focus-visible:ring-emerald-500/30'
                  : 'border-slate-700'
              }`}
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              {phoneValid ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : touched && formData.phone ? (
                <AlertCircle className="h-5 w-5 text-red-400" />
              ) : null}
            </div>
          </div>

          {/* Validation Feedback */}
          {touched && !phoneValid && (
            <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
              <div>
                <p className="font-semibold">Invalid International Number</p>
                <p className="text-red-400/90 mt-0.5">
                  Must start with '+' followed by country code (e.g. +44 for UK, +1 for US).
                </p>
              </div>
            </div>
          )}

          {phoneValid && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs text-slate-300 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Direct WhatsApp deep link verified: <strong className="font-mono text-emerald-300">wa.me/{cleanPhone}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="gap-2 border-slate-700 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!phoneValid || isSubmitting}
          className="gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 h-12 rounded-xl shadow-lg shadow-emerald-950/40 disabled:opacity-40"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Joining Cohort...</span>
            </>
          ) : (
            <>
              <span>Join UCL Cohort Feed</span>
              <Sparkles className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
