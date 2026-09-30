'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Profile } from '@/lib/types';
import { getWhatsAppUrl, isSameUser } from '@/lib/utils';
import { SUPERPOWER_OPTIONS, LOOKING_FOR_OPTIONS } from '@/lib/constants';
import {
  X,
  RotateCcw,
  Star,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  Globe,
  ExternalLink,
  Pencil,
  FileText,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { LinkedInIcon, GitHubIcon } from '@/components/ui/social-icons';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface DatingDeckProps {
  profiles: Profile[];
  currentUser: Profile | null;
  onOpenEdit?: (profile: Profile) => void;
  onFilterChange?: (filter: string) => void;
}

export function DatingDeck({
  profiles,
  currentUser,
  onOpenEdit,
}: DatingDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [animating, setAnimating] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Swipe & Drag gesture state
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = React.useRef(0);

  // Strictly exclude currentUser from co-founder candidates
  const candidateProfiles = useMemo(() => {
    return profiles.filter((p) => !isSameUser(p, currentUser));
  }, [profiles, currentUser]);

  // Filtered list if viewing shortlisted only
  const activeList = useMemo(() => {
    return showSavedOnly
      ? candidateProfiles.filter((p) => savedIds.includes(p.id))
      : candidateProfiles;
  }, [showSavedOnly, candidateProfiles, savedIds]);

  // Reset index if out of bounds
  useEffect(() => {
    if (currentIndex >= activeList.length && activeList.length > 0) {
      setCurrentIndex(0);
    }
  }, [activeList.length, currentIndex]);

  const currentProfile: Profile | undefined = activeList[currentIndex];

  const handleNext = useCallback(() => {
    if (animating || activeList.length === 0) return;
    setDirection('left');
    setAnimating(true);
    setDragOffset(0);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1 < activeList.length ? prev + 1 : 0));
      setDirection(null);
      setAnimating(false);
    }, 220);
  }, [animating, activeList.length]);

  const handlePrevious = useCallback(() => {
    if (animating || activeList.length === 0) return;
    setDirection('right');
    setAnimating(true);
    setDragOffset(0);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : activeList.length - 1));
      setDirection(null);
      setAnimating(false);
    }, 220);
  }, [animating, activeList.length]);

  const handleConnect = useCallback((url: string) => {
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#25D366', '#128C7E', '#38bdf8', '#ffffff'],
      });
    } catch {}
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const handleSwipeRight = useCallback((url: string) => {
    if (animating || activeList.length === 0) return;
    setDirection('right');
    setAnimating(true);
    setDragOffset(0);
    handleConnect(url);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1 < activeList.length ? prev + 1 : 0));
      setDirection(null);
      setAnimating(false);
    }, 240);
  }, [animating, activeList.length, handleConnect]);

  // Pointer drag event handlers for mouse & touch
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Ignore drags started on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, textarea, select')) return;

    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const diff = e.clientX - dragStartXRef.current;
    setDragOffset(diff);
  };

  const handlePointerEnd = (url: string) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset > 90) {
      handleSwipeRight(url);
    } else if (dragOffset < -90) {
      handleNext();
    } else {
      setDragOffset(0);
    }
  };

  const handleToggleStar = (id: string) => {
    setSavedIds((prev) => {
      const isSaved = prev.includes(id);
      if (!isSaved) {
        try {
          confetti({
            particleCount: 25,
            spread: 45,
            origin: { y: 0.8 },
            colors: ['#38bdf8', '#818cf8', '#34d399', '#f59e0b'],
          });
        } catch {}
        return [...prev, id];
      }
      return prev.filter((item) => item !== id);
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious]);

  const [copiedLink, setCopiedLink] = useState(false);

  if (!currentProfile || activeList.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-6 text-center space-y-5 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
        <div className="h-16 w-16 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mx-auto">
          <Sparkles className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">
            {showSavedOnly
              ? 'No Bookmarks Yet'
              : candidateProfiles.length === 0
              ? 'No Other Peers Yet'
              : 'No Matches Found'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
            {showSavedOnly
              ? "You haven't bookmarked any peers yet. Tap the star button on any profile to save them!"
              : candidateProfiles.length === 0
              ? "You're one of the earliest cohort members! As more UCL students join and create profiles, they will appear right here in your matching deck."
              : 'Try clearing your filters or search keywords to discover more co-founder candidates.'}
          </p>
        </div>
        {showSavedOnly ? (
          <Button
            onClick={() => setShowSavedOnly(false)}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl"
          >
            Show All Profiles
          </Button>
        ) : (
          <Button
            onClick={() => {
              if (typeof window !== 'undefined') {
                navigator.clipboard.writeText(window.location.origin);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2500);
              }
            }}
            variant="outline"
            className="border-sky-500/40 bg-sky-950/30 text-sky-300 hover:bg-sky-900/40 text-xs font-semibold rounded-xl"
          >
            {copiedLink ? '✓ Copied Invite Link!' : 'Share Platform with UCL Peers'}
          </Button>
        )}
      </div>
    );
  }

  const isSaved = savedIds.includes(currentProfile.id);
  const isOwner = isSameUser(currentProfile, currentUser);

  const whatsappUrl = getWhatsAppUrl(currentProfile.phone, currentProfile.full_name, {
    bio: currentProfile.bio,
    lookingFor: currentProfile.looking_for,
    superpowers: currentProfile.superpowers,
  });

  // Calculate synergy with current user
  const hasSynergy =
    currentUser &&
    currentProfile.looking_for?.some((lf) =>
      currentUser.superpowers?.some((sp) =>
        (lf.includes('Technical') && sp.includes('Engineering')) ||
        (lf.includes('Business') && (sp.includes('Business') || sp.includes('Sales'))) ||
        (lf.includes('VC') && sp.includes('Finance'))
      )
    );

  const getSuperpowerIcon = (sp: string) => {
    return SUPERPOWER_OPTIONS.find((o) => o.value === sp)?.icon || '⚡';
  };

  const getLookingForIcon = (lf: string) => {
    return LOOKING_FOR_OPTIONS.find((o) => o.value === lf)?.icon || '🎯';
  };

  const getFocusBadgeColor = (focus: string) => {
    switch (focus) {
      case 'Building a Startup':
        return 'border-rose-500/40 bg-rose-500/15 text-rose-300';
      case 'Looking to Join a Startup':
        return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300';
      case 'Hunting for VC/Roles':
        return 'border-blue-500/40 bg-blue-500/15 text-blue-300';
      default:
        return 'border-amber-500/40 bg-amber-500/15 text-amber-300';
    }
  };

  return (
    <div className="max-w-md mx-auto w-full px-2 sm:px-0">
      {/* Top Deck Stats & Bookmark Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="text-white font-bold">{currentIndex + 1}</span>
          <span>of</span>
          <span>{activeList.length} Cohort Peers</span>
        </div>

        <div className="flex items-center gap-2">
          {savedIds.length > 0 && (
            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                showSavedOnly
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              <Star className="h-3 w-3 fill-current" />
              <span>{savedIds.length} Saved</span>
            </button>
          )}

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Press <kbd className="bg-slate-800 px-1 py-0.5 rounded text-[10px]">Space</kbd> or <kbd className="bg-slate-800 px-1 py-0.5 rounded text-[10px]">&rarr;</kbd> to pass
          </span>
        </div>
      </div>

      {/* Stories Progress Bar */}
      <div className="flex items-center gap-1 mb-3 px-1">
        {activeList.slice(0, Math.min(activeList.length, 30)).map((p, idx) => (
          <div
            key={p.id}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 flex-1 rounded-full cursor-pointer transition-all duration-200 ${
              idx === currentIndex
                ? 'bg-sky-400 shadow-sm shadow-sky-400/50'
                : idx < currentIndex
                ? 'bg-slate-700'
                : 'bg-slate-800/60'
            }`}
            title={`${p.full_name} (${idx + 1})`}
          />
        ))}
      </div>

      {/* THE DATING MATCH CARD */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => handlePointerEnd(whatsappUrl)}
        onPointerCancel={() => handlePointerEnd(whatsappUrl)}
        className={`relative rounded-3xl border border-slate-800/80 bg-slate-900/90 shadow-2xl backdrop-blur-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none transition-all ${
          isDragging
            ? 'transition-none duration-0'
            : animating
            ? direction === 'left'
              ? '-translate-x-16 opacity-0 rotate-[-8deg] duration-200'
              : 'translate-x-16 opacity-0 rotate-[8deg] duration-200'
            : 'translate-x-0 opacity-100 rotate-0 duration-200'
        }`}
        style={{
          minHeight: '580px',
          touchAction: 'pan-y',
          transform: isDragging
            ? `translate3d(${dragOffset}px, 0px, 0px) rotate(${dragOffset * 0.04}deg)`
            : undefined,
        }}
      >
        {/* Tinder-style dynamic swipe stamps */}
        <div
          className="absolute top-8 left-8 z-30 pointer-events-none rounded-2xl border-4 border-emerald-400 bg-emerald-950/85 px-4 py-1.5 font-black uppercase tracking-wider text-emerald-400 shadow-2xl transition-opacity duration-75 rotate-[-12deg]"
          style={{
            opacity: dragOffset > 25 ? Math.min(1, (dragOffset - 25) / 60) : 0,
            display: dragOffset > 25 ? 'block' : 'none',
          }}
        >
          <span className="text-xl sm:text-2xl drop-shadow-md">CONNECT 💬</span>
        </div>

        <div
          className="absolute top-8 right-8 z-30 pointer-events-none rounded-2xl border-4 border-rose-500 bg-rose-950/85 px-4 py-1.5 font-black uppercase tracking-wider text-rose-400 shadow-2xl transition-opacity duration-75 rotate-[12deg]"
          style={{
            opacity: dragOffset < -25 ? Math.min(1, (Math.abs(dragOffset) - 25) / 60) : 0,
            display: dragOffset < -25 ? 'block' : 'none',
          }}
        >
          <span className="text-xl sm:text-2xl drop-shadow-md">PASS ✕</span>
        </div>

        {/* Photo Container */}
        <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-slate-950">
          <img
            src={
              currentProfile.avatar_url ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentProfile.full_name)}&backgroundColor=002855,1e3a8a,0369a1&textColor=ffffff`
            }
            alt={currentProfile.full_name}
            className="h-full w-full object-cover object-center select-none"
          />

          {/* Top Scrim & Focus Tag */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/60 pointer-events-none" />

          {/* Top Focus & UCL Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold backdrop-blur-md shadow-md ${getFocusBadgeColor(
                currentProfile.current_focus
              )}`}
            >
              <span>{currentProfile.current_focus}</span>
            </span>

            {hasSynergy && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/80 px-2.5 py-1 text-[11px] font-bold text-emerald-300 backdrop-blur-md shadow-md animate-pulse">
                <Zap className="h-3 w-3 text-emerald-400 fill-emerald-400" />
                <span>High Synergy</span>
              </span>
            )}
          </div>

          {/* Bottom Photo Overlay: Full Name & Department */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                {currentProfile.full_name}
              </h2>
              <span className="h-5 w-5 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm" title="Verified UCL Cohort">
                <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 font-medium drop-shadow-sm">
              <GraduationCap className="h-3.5 w-3.5 text-sky-400" />
              <span>{currentProfile.ucl_department || 'Computer Science'}</span>
              <span>•</span>
              <span className="text-sky-300">UCL '{currentProfile.graduation_year || '25'}</span>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Pitch / The One-Liner */}
          <div className="relative rounded-2xl border border-slate-800 bg-slate-950/60 p-4 shadow-inner">
            <span className="absolute -top-2.5 left-4 text-xs font-bold uppercase tracking-wider text-sky-400 bg-slate-900 px-2 rounded-full border border-slate-800">
              The Pitch
            </span>
            <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed italic pt-1">
              "{currentProfile.bio}"
            </p>
          </div>

          {/* Superpowers (I Bring) */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span>⚡ I Bring (My Superpowers):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentProfile.superpowers?.map((sp) => (
                <span
                  key={sp}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300"
                >
                  <span>{getSuperpowerIcon(sp)}</span>
                  <span>{sp}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Looking For (I Need) */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <span>🎯 Looking To Meet:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentProfile.looking_for?.map((lf) => (
                <span
                  key={lf}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-200"
                >
                  <span>{getLookingForIcon(lf)}</span>
                  <span>{lf}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Industries & Social Links */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            {/* Industries */}
            <div className="flex flex-wrap gap-1">
              {currentProfile.industries?.map((ind) => (
                <span
                  key={ind}
                  className="inline-flex items-center rounded-lg bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 text-[11px] font-medium text-slate-300"
                >
                  {ind}
                </span>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {currentProfile.linkedin_url && (
                <a
                  href={`https://${currentProfile.linkedin_url.replace(/^https?:\/\//, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
                  title="LinkedIn Profile"
                >
                  <LinkedInIcon className="h-4 w-4" />
                </a>
              )}
              {currentProfile.github_url && (
                <a
                  href={`https://${currentProfile.github_url.replace(/^https?:\/\//, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="GitHub Profile"
                >
                  <GitHubIcon className="h-4 w-4" />
                </a>
              )}
              {currentProfile.website_url && (
                <a
                  href={`https://${currentProfile.website_url.replace(/^https?:\/\//, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                  title="Portfolio / Website"
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
              {currentProfile.pitch_deck_url && (
                <a
                  href={`https://${currentProfile.pitch_deck_url.replace(/^https?:\/\//, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                  title="Pitch Deck"
                >
                  <FileText className="h-4 w-4" />
                </a>
              )}
              {isOwner && onOpenEdit && (
                <button
                  type="button"
                  onClick={() => onOpenEdit(currentProfile)}
                  className="p-1.5 rounded-lg text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 transition-colors"
                  title="Edit your card"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DATING SITE ICONIC BOTTOM ACTION DOCK */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6">
        {/* 1. Rewind Button */}
        <button
          type="button"
          onClick={handlePrevious}
          className="h-12 w-12 rounded-full border border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center shadow-lg transition-all active:scale-95"
          title="Previous profile (ArrowLeft)"
        >
          <RotateCcw className="h-5 w-5" />
        </button>

        {/* 2. Pass Button (X) */}
        <button
          type="button"
          onClick={handleNext}
          className="h-14 w-14 rounded-full border border-rose-500/40 bg-slate-900 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 flex items-center justify-center shadow-lg hover:shadow-rose-950/40 transition-all active:scale-95"
          title="Pass / Next candidate (ArrowRight or Space)"
        >
          <X className="h-7 w-7 stroke-[2.5]" />
        </button>

        {/* 3. Primary WhatsApp Match Button (The Heart / Super Match) */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            try {
              confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.7 },
                colors: ['#25D366', '#128C7E', '#38bdf8', '#ffffff'],
              });
            } catch {}
          }}
          className="inline-flex items-center justify-center gap-2 h-14 px-6 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-black text-sm shadow-xl shadow-emerald-950/50 hover:shadow-emerald-500/30 transition-all transform hover:scale-105 active:scale-95"
          title="Match directly on WhatsApp"
        >
          <MessageSquare className="h-5 w-5 fill-current stroke-none" />
          <span>Connect on WhatsApp</span>
        </a>

        {/* 4. Star / Bookmark Button */}
        <button
          type="button"
          onClick={() => handleToggleStar(currentProfile.id)}
          className={`h-12 w-12 rounded-full border flex items-center justify-center shadow-lg transition-all active:scale-95 ${
            isSaved
              ? 'border-amber-400 bg-amber-500/20 text-amber-300'
              : 'border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-amber-400'
          }`}
          title={isSaved ? 'Remove from saved' : 'Save profile for later'}
        >
          <Star className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
}
