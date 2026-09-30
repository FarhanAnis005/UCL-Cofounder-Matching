'use client';

import React from 'react';
import { Profile } from '@/lib/types';
import { getWhatsAppUrl, getInitials } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { SUPERPOWER_OPTIONS, LOOKING_FOR_OPTIONS } from '@/lib/constants';
import {
  GraduationCap,
  Pencil,
  Globe,
  FileText,
  Tag,
} from 'lucide-react';
import { LinkedInIcon, GitHubIcon } from '@/components/ui/social-icons';

interface ProfileCardProps {
  profile: Profile;
  highlightLookingFor?: string | null;
  isOwner?: boolean;
  onEdit?: () => void;
}

export function ProfileCard({
  profile,
  highlightLookingFor,
  isOwner,
  onEdit,
}: ProfileCardProps) {
  const whatsappUrl = getWhatsAppUrl(profile.phone, profile.full_name, {
    bio: profile.bio,
    lookingFor: profile.looking_for,
    superpowers: profile.superpowers,
  });

  const getSuperpowerIcon = (sp: string) => {
    return SUPERPOWER_OPTIONS.find((o) => o.value === sp)?.icon || '⚡';
  };

  const getLookingForIcon = (lf: string) => {
    return LOOKING_FOR_OPTIONS.find((o) => o.value === lf)?.icon || '🎯';
  };

  const hasCustomFields = profile.custom_fields && Object.keys(profile.custom_fields).length > 0;
  const hasLinks = Boolean(profile.linkedin_url || profile.github_url || profile.website_url || profile.pitch_deck_url);

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden border-slate-800/80 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700/80 transition-all duration-300 hover:shadow-2xl hover:shadow-sky-950/20 hover:-translate-y-1">
      {/* Top accent glow line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sky-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <CardContent className="p-6 space-y-4">
        {/* User Info Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar or Initials */}
            <div className="relative">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="h-12 w-12 rounded-xl object-cover border border-slate-700/80 shadow-md"
                />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 border border-slate-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {getInitials(profile.full_name)}
                </div>
              )}
              {/* UCL mini badge */}
              <div className="absolute -bottom-1 -right-1 h-4 px-1 rounded-full bg-blue-950 border border-sky-400/40 text-[9px] font-extrabold text-sky-400 flex items-center justify-center leading-none">
                UCL
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base leading-snug group-hover:text-sky-300 transition-colors">
                  {profile.full_name}
                </h3>
                {isOwner && (
                  <span className="rounded-full bg-sky-500/20 border border-sky-400/40 px-2 py-0.2 text-[10px] font-semibold text-sky-300">
                    You
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <span className="text-slate-400">UCL Cohort</span>
                {profile.graduation_year && (
                  <span className="text-slate-500">• '{profile.graduation_year.slice(-2)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Current Focus Badge or Edit Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isOwner && onEdit && (
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:border-sky-400 transition-colors"
                title="Edit your profile"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            {profile.current_focus && (
              <span className="rounded-full border border-sky-500/25 bg-sky-950/40 px-2.5 py-1 text-[11px] font-medium text-sky-300">
                {profile.current_focus}
              </span>
            )}
          </div>
        </div>

        {/* The One-Liner */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3 relative">
          <p className="text-sm text-slate-200 leading-relaxed font-normal">
            "{profile.bio || 'Ready to build impactful ventures with fellow UCL cohort members.'}"
          </p>
        </div>

        {/* Distinct Pill-shaped Tags */}
        <div className="space-y-3 pt-1">
          {/* "I Bring:" (Superpowers) */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-400 mb-1.5">
              <span>⚡ I Bring:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.superpowers && profile.superpowers.length > 0 ? (
                profile.superpowers.map((sp) => (
                  <span
                    key={sp}
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 text-xs font-medium text-emerald-300 shadow-sm shadow-emerald-950/30"
                  >
                    <span>{getSuperpowerIcon(sp)}</span>
                    <span>{sp}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">None specified</span>
              )}
            </div>
          </div>

          {/* "I Need:" (Looking to meet) */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-400 mb-1.5">
              <span>🎯 I Need:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.looking_for && profile.looking_for.length > 0 ? (
                profile.looking_for.map((lf) => {
                  const isHighlighted = highlightLookingFor === lf;
                  return (
                    <span
                      key={lf}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all shadow-sm ${
                        isHighlighted
                          ? 'border-indigo-400 bg-indigo-600/30 text-white ring-2 ring-indigo-400/40 font-semibold'
                          : 'border-indigo-500/30 bg-indigo-950/40 text-indigo-300 shadow-indigo-950/30'
                      }`}
                    >
                      <span>{getLookingForIcon(lf)}</span>
                      <span>{lf}</span>
                    </span>
                  );
                })
              ) : (
                <span className="text-xs text-slate-400 italic">Open to all connections</span>
              )}
            </div>
          </div>

          {/* Custom Fields (Dynamic Key-Values) */}
          {hasCustomFields && (
            <div className="pt-1 space-y-1">
              <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-sky-400">
                <Tag className="h-3 w-3" />
                <span>Custom Attributes:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(profile.custom_fields!).map(([key, val]) => (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-700/80 bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-300"
                  >
                    <span className="text-sky-300 font-semibold">{key}:</span>
                    <span>{val}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social / Portfolio Links */}
          {hasLinks && (
            <div className="flex items-center gap-2 pt-1">
              {profile.linkedin_url && (
                <a
                  href={
                    profile.linkedin_url.startsWith('http')
                      ? profile.linkedin_url
                      : `https://${profile.linkedin_url}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-sky-400 hover:border-slate-700 transition-colors"
                  title="LinkedIn Profile"
                >
                  <LinkedInIcon className="h-3.5 w-3.5" />
                </a>
              )}
              {profile.github_url && (
                <a
                  href={
                    profile.github_url.startsWith('http')
                      ? profile.github_url
                      : `https://${profile.github_url}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                  title="GitHub Profile"
                >
                  <GitHubIcon className="h-3.5 w-3.5" />
                </a>
              )}
              {profile.website_url && (
                <a
                  href={
                    profile.website_url.startsWith('http')
                      ? profile.website_url
                      : `https://${profile.website_url}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-emerald-400 hover:border-slate-700 transition-colors"
                  title="Portfolio / Website"
                >
                  <Globe className="h-3.5 w-3.5" />
                </a>
              )}
              {profile.pitch_deck_url && (
                <a
                  href={
                    profile.pitch_deck_url.startsWith('http')
                      ? profile.pitch_deck_url
                      : `https://${profile.pitch_deck_url}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-amber-400 hover:border-slate-700 transition-colors"
                  title="Pitch Deck / Notion"
                >
                  <FileText className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Industries */}
          {profile.industries && profile.industries.length > 0 && (
            <div className="pt-1 flex flex-wrap gap-1">
              {profile.industries.map((ind) => (
                <span
                  key={ind}
                  className="rounded-md border border-slate-800 bg-slate-900/80 px-2 py-0.5 text-[11px] text-slate-400"
                >
                  #{ind}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* The Call to Action: Connect on WhatsApp */}
      <div className="p-6 pt-0">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-semibold text-white whatsapp-cta"
        >
          <svg
            className="h-4 w-4 fill-current shrink-0"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12.031 2C6.495 2 2 6.495 2 12.031c0 1.93.551 3.737 1.506 5.275L2 22l4.836-1.465a10.027 10.027 0 0 0 5.195 1.496h.005c5.535 0 10.03-4.495 10.03-10.031C22.066 6.495 17.57 2 12.031 2Zm-.005 18.067h-.004a8.04 8.04 0 0 1-4.089-1.121l-.293-.174-3.042.92.92-2.955-.192-.305a8.016 8.016 0 0 1-1.233-4.401c0-4.444 3.616-8.06 8.064-8.06 2.155 0 4.18.84 5.702 2.364a8.017 8.017 0 0 1 2.361 5.7c0 4.445-3.617 8.062-8.065 8.062Zm4.42-6.027c-.242-.121-1.433-.707-1.656-.788-.222-.08-.383-.121-.544.121-.161.242-.625.788-.766.95-.141.161-.282.181-.524.06-.242-.121-1.02-.376-1.944-1.2-.718-.64-1.203-1.431-1.344-1.673-.141-.242-.015-.373.106-.493.109-.108.242-.282.363-.423.121-.141.161-.242.242-.403.08-.161.04-.302-.02-.423-.06-.121-.544-1.31-.746-1.794-.196-.472-.395-.407-.544-.415-.141-.008-.302-.01-.463-.01s-.423.06-.645.302c-.222.242-.846.827-.846 2.016s.867 2.338.988 2.5c.121.161 1.706 2.604 4.132 3.652.577.25 1.028.399 1.38.511.58.184 1.108.158 1.526.096.465-.07 1.433-.586 1.635-1.152.202-.565.202-1.05.141-1.151-.06-.1-.222-.161-.464-.282Z" />
          </svg>
          <span>Connect on WhatsApp</span>
        </a>
      </div>
    </Card>
  );
}
