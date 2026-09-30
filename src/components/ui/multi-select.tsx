'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, Plus, X, Sparkles } from 'lucide-react';

interface MultiSelectOption<T extends string> {
  value: T;
  label: string;
  icon?: string;
  description?: string;
}

interface MultiSelectPillsProps<T extends string> {
  options: MultiSelectOption<T>[];
  selected: T[];
  onChange: (selected: T[]) => void;
  max?: number;
  variant?: 'superpower' | 'lookingFor' | 'industry' | 'default';
  allowCustom?: boolean;
  customPlaceholder?: string;
  className?: string;
}

export function MultiSelectPills<T extends string>({
  options,
  selected,
  onChange,
  max,
  variant = 'default',
  allowCustom = true,
  customPlaceholder,
  className,
}: MultiSelectPillsProps<T>) {
  const [customInput, setCustomInput] = useState('');
  const [error, setError] = useState('');

  const isMaxReached = Boolean(max && selected.length >= max);

  const toggleOption = (val: T) => {
    if (selected.includes(val)) {
      onChange(selected.filter((item) => item !== val));
      setError('');
    } else {
      if (max && selected.length >= max) {
        setError(`Limit reached: you can only pick up to ${max}.`);
        return;
      }
      onChange([...selected, val]);
      setError('');
    }
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;

    if (max && selected.length >= max) {
      setError(`Maximum limit of ${max} reached. Deselect an option above first.`);
      return;
    }

    // Check if already selected (case-insensitive)
    const alreadySelected = selected.some(
      (item) => item.toLowerCase() === trimmed.toLowerCase()
    );
    if (alreadySelected) {
      setError(`"${trimmed}" is already selected.`);
      return;
    }

    // Check if it matches an existing predefined option
    const matchedOption = options.find(
      (o) =>
        o.value.toLowerCase() === trimmed.toLowerCase() ||
        o.label.toLowerCase() === trimmed.toLowerCase()
    );

    if (matchedOption) {
      onChange([...selected, matchedOption.value]);
    } else {
      onChange([...selected, trimmed as T]);
    }

    setCustomInput('');
    setError('');
  };

  const handleRemoveItem = (val: T) => {
    onChange(selected.filter((item) => item !== val));
    setError('');
  };

  const getActiveStyles = (isSelected: boolean, isMaxReached: boolean) => {
    if (isSelected) {
      if (variant === 'superpower') {
        return 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/30 font-semibold shadow-md shadow-emerald-950/40';
      }
      if (variant === 'lookingFor') {
        return 'bg-indigo-500/25 border-indigo-400 text-indigo-200 ring-2 ring-indigo-500/30 font-semibold shadow-md shadow-indigo-950/40';
      }
      if (variant === 'industry') {
        return 'bg-sky-500/25 border-sky-400 text-sky-200 ring-2 ring-sky-500/30 font-semibold shadow-md shadow-sky-950/40';
      }
      return 'bg-sky-500/20 border-sky-400 text-sky-200 ring-2 ring-sky-500/30';
    }

    if (isMaxReached) {
      return 'bg-slate-900/40 border-slate-800/80 text-slate-500 cursor-not-allowed opacity-60';
    }

    return 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/80 hover:text-white cursor-pointer';
  };

  // Predefined options
  const standardValues = new Set(options.map((o) => o.value));
  // Custom items typed by the user
  const customSelectedItems = selected.filter((item) => !standardValues.has(item));

  const placeholderText =
    customPlaceholder ||
    (variant === 'lookingFor'
      ? 'Type custom role (e.g. Angel, Grant Writer) & press Enter...'
      : variant === 'industry'
      ? 'Type custom industry (e.g. EdTech, Robotics) & press Enter...'
      : 'Type your own & press Enter...');

  return (
    <div className={cn('space-y-3', className)}>
      {/* Pills Area: Predefined + User Added */}
      <div className="flex flex-wrap items-center gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.value);
          const disabled = !isSelected && isMaxReached;

          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => toggleOption(opt.value)}
              className={cn(
                'group relative inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm transition-all duration-200 select-none text-left',
                getActiveStyles(isSelected, isMaxReached)
              )}
            >
              {opt.icon && <span className="text-base leading-none">{opt.icon}</span>}
              <span>{opt.label}</span>
              {isSelected ? (
                <Check className="h-4 w-4 shrink-0 stroke-[2.5]" />
              ) : null}
            </button>
          );
        })}

        {/* Custom Selected Items (Typed and added by user) */}
        {customSelectedItems.map((customItem) => (
          <div
            key={customItem}
            className={cn(
              'group relative inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm transition-all duration-200 select-none text-left',
              getActiveStyles(true, false)
            )}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300 shrink-0" />
            <span className="font-medium">{customItem}</span>
            <button
              type="button"
              onClick={() => handleRemoveItem(customItem)}
              className="p-0.5 rounded-full hover:bg-white/20 text-current transition-colors ml-0.5"
              title="Remove custom tag"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Prominent Always-Visible "Type Your Own" Input Bar */}
      {allowCustom && (
        <div className="space-y-1.5 pt-1">
          <div
            className={cn(
              'flex items-center gap-2 rounded-xl border px-3 py-1.5 transition-all duration-200',
              isMaxReached
                ? 'border-slate-800 bg-slate-900/30 opacity-60 cursor-not-allowed'
                : 'border-slate-700/80 bg-slate-950/70 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-500/20 shadow-inner'
            )}
          >
            <Plus className="h-4 w-4 text-sky-400 shrink-0" />
            <input
              type="text"
              value={customInput}
              onChange={(e) => {
                if (e.target.value.length <= 40) {
                  setCustomInput(e.target.value);
                  setError('');
                }
              }}
              disabled={isMaxReached}
              placeholder={
                isMaxReached
                  ? `Limit of ${max} reached — remove a tag above to add another`
                  : placeholderText
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustom();
                }
              }}
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={handleAddCustom}
              disabled={isMaxReached || !customInput.trim()}
              className={cn(
                'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all shrink-0',
                customInput.trim() && !isMaxReached
                  ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
              )}
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Add</span>
            </button>
          </div>

          {error && (
            <p className="text-xs text-rose-400 pl-1 font-medium animate-in fade-in duration-150">
              {error}
            </p>
          )}
        </div>
      )}

      {max && (
        <div className="text-xs text-slate-400 font-medium flex items-center justify-between pt-0.5">
          <span>
            {selected.length === max ? (
              <span className="text-amber-400 font-semibold">Maximum ({max}) reached</span>
            ) : (
              <span className="text-slate-400">Select above or type your own (up to {max})</span>
            )}
          </span>
          <span className={cn('font-mono font-semibold', selected.length === max ? 'text-amber-400' : 'text-slate-400')}>
            {selected.length}/{max} selected
          </span>
        </div>
      )}
    </div>
  );
}
