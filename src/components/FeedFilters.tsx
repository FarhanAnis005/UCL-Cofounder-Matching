'use client';

import React from 'react';
import { LookingFor, CurrentFocus, Superpower } from '@/lib/types';
import { LOOKING_FOR_OPTIONS, FOCUS_OPTIONS, SUPERPOWER_OPTIONS } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Search, X, Filter, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeedFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedLookingFor: LookingFor | null;
  onSelectLookingFor: (tag: LookingFor | null) => void;
  selectedFocus: CurrentFocus | 'ALL';
  onSelectFocus: (focus: CurrentFocus | 'ALL') => void;
  selectedSuperpower: Superpower | 'ALL';
  onSelectSuperpower: (sp: Superpower | 'ALL') => void;
  totalCount: number;
  filteredCount: number;
  onReset: () => void;
}

export function FeedFilters({
  searchQuery,
  onSearchChange,
  selectedLookingFor,
  onSelectLookingFor,
  selectedFocus,
  onSelectFocus,
  selectedSuperpower,
  onSelectSuperpower,
  totalCount,
  filteredCount,
  onReset,
}: FeedFiltersProps) {
  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedLookingFor !== null ||
    selectedFocus !== 'ALL' ||
    selectedSuperpower !== 'ALL';

  return (
    <div className="space-y-5 rounded-2xl border border-slate-800/90 bg-slate-900/70 p-5 backdrop-blur-xl shadow-xl">
      {/* Top Row: Search and Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search cohort by name, skill, industry, or bio..."
            className="pl-10 h-10 bg-slate-950/60 border-slate-800 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Counter and Clear filters button */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="text-xs text-slate-400">
            Showing <strong className="text-sky-400 font-semibold">{filteredCount}</strong> of {totalCount} cohort members
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 text-xs text-slate-400 hover:text-white gap-1 px-2.5"
            >
              <X className="h-3 w-3" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* CORE SPEC: Simple toggle buttons to filter users by their "I am looking to meet" tags */}
      <div className="space-y-2 border-t border-slate-800/80 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              ⚡ Find Demand For Your Skills ("Looking to meet"):
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Click to see who needs your skillset
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {LOOKING_FOR_OPTIONS.map((opt) => {
            const isSelected = selectedLookingFor === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onSelectLookingFor(isSelected ? null : opt.value)}
                className={`group inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  isSelected
                    ? 'border-indigo-400 bg-indigo-600/30 text-indigo-200 ring-2 ring-indigo-500/30 shadow-md shadow-indigo-950/40'
                    : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-indigo-500/40 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Quick Filters: Focus & Superpowers */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60 text-xs">
        <span className="text-slate-400 font-medium">Focus:</span>
        <button
          onClick={() => onSelectFocus('ALL')}
          className={`px-2.5 py-1 rounded-lg border transition-colors ${
            selectedFocus === 'ALL'
              ? 'border-sky-500/40 bg-sky-950/50 text-sky-300 font-semibold'
              : 'border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          All
        </button>
        {FOCUS_OPTIONS.map((f) => (
          <button
            key={f.value}
            onClick={() => onSelectFocus(selectedFocus === f.value ? 'ALL' : f.value)}
            className={`px-2.5 py-1 rounded-lg border transition-colors ${
              selectedFocus === f.value
                ? 'border-sky-500/40 bg-sky-950/50 text-sky-300 font-semibold'
                : 'border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
