'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Copy, Database, ExternalLink, X, ShieldCheck } from 'lucide-react';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConfigured: boolean;
}

const SQL_SNIPPET = `-- Run this in your Supabase SQL Editor:
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  phone text not null,
  bio text not null default '',
  current_focus text not null default 'Building a Startup',
  superpowers text[] not null default '{}',
  looking_for text[] not null default '{}',
  industries text[] not null default '{}',
  ucl_department text default 'Computer Science',
  graduation_year text default '2025',
  linkedin_url text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Authenticated users can view all profiles"
  on public.profiles for select to authenticated using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "Public can read profiles"
  on public.profiles for select to anon using (true);`;

export function SupabaseSetupModal({ isOpen, onClose, isConfigured }: SupabaseSetupModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Supabase Setup & Schema</h2>
              <p className="text-xs text-slate-400">Database connection and RLS configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-sm text-slate-300">
          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
            <div className={`h-3 w-3 rounded-full ${isConfigured ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <div>
              <p className="font-semibold text-white">
                Status: {isConfigured ? 'Connected to Live Supabase' : 'Running in Interactive Preview Mode'}
              </p>
              <p className="text-xs text-slate-400">
                {isConfigured
                  ? 'Your app is syncing directly with Postgres and Supabase Auth.'
                  : 'Currently showing realistic seed profiles and caching locally. Add keys in .env.local to link live Supabase.'}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white text-xs uppercase tracking-wider">
                Postgres SQL Schema (`profiles` table + RLS)
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-8 gap-1.5 text-xs border-slate-700 hover:border-sky-400 text-sky-400"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied to Clipboard!' : 'Copy SQL'}
              </Button>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-56 leading-relaxed">
              {SQL_SNIPPET}
            </pre>
          </div>

          <div className="space-y-2 border-t border-slate-800 pt-3">
            <p className="text-xs font-semibold text-slate-200">How to activate in 60 seconds:</p>
            <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1.5">
              <li>Create a free project at <span className="text-sky-400">supabase.com</span>.</li>
              <li>Open <strong className="text-white">SQL Editor</strong>, paste the snippet above, and click <strong className="text-white">Run</strong>.</li>
              <li>Go to <strong className="text-white">Project Settings &gt; API</strong>, copy URL and Anon Key into <code className="text-sky-300">.env.local</code>.</li>
              <li>Enable <strong className="text-white">Google</strong> or <strong className="text-white">LinkedIn</strong> under Authentication &gt; Providers.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
