'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Profile, LookingFor, CurrentFocus, Superpower } from '@/lib/types';
import { getProfiles, getCurrentUserProfile } from '@/lib/profile-service';
import { createClient } from '@/lib/supabase/client';
import { isSameUser } from '@/lib/utils';
import { Navbar } from '@/components/Navbar';
import { FeedFilters } from '@/components/FeedFilters';
import { ProfileCard } from '@/components/ProfileCard';
import { DatingDeck } from '@/components/DatingDeck';
import { EditProfileModal } from '@/components/EditProfileModal';
import { Button } from '@/components/ui/button';
import {
  Users,
  Sparkles,
  Search,
  FilterX,
  MessageCircle,
  PlusCircle,
  CheckCircle2,
  Rocket,
  Code2,
  Briefcase,
  Pencil,
  UserCircle,
  Flame,
  LayoutGrid,
  SlidersHorizontal,
} from 'lucide-react';
import Link from 'next/link';

function FeedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showWelcome = searchParams.get('welcome') === 'true';

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'deck' | 'grid'>('deck');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLookingFor, setSelectedLookingFor] = useState<LookingFor | null>(null);
  const [selectedFocus, setSelectedFocus] = useState<CurrentFocus | 'ALL'>('ALL');
  const [selectedSuperpower, setSelectedSuperpower] = useState<Superpower | 'ALL'>('ALL');
  const [dismissWelcome, setDismissWelcome] = useState(false);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<Profile | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkAuthAndLoad() {
      const supabase = createClient();
      let authUserId = '';
      let authUserEmail = '';

      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          // Unauthenticated! Redirect directly to landing page
          router.replace('/');
          return;
        }
        authUserId = user.id;
        authUserEmail = user.email || '';
      }

      // Check user profile
      const userProfile = await getCurrentUserProfile();

      if (!isMounted) return;

      if (userProfile) {
        setCurrentUser(userProfile);
      } else if (authUserId) {
        setCurrentUser({
          id: authUserId,
          full_name: 'UCL Member',
          email: authUserEmail,
          phone: '',
          bio: '',
          current_focus: 'Building a Startup',
          superpowers: [],
          looking_for: [],
          industries: [],
        });
      } else {
        // Fallback: Not logged in
        router.replace('/');
        return;
      }

      // Load cohort profiles
      const cohort = await getProfiles();
      if (isMounted) {
        setProfiles(cohort);
        setLoading(false);
      }
    }

    checkAuthAndLoad();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleOpenEdit = (profile?: Profile) => {
    setProfileToEdit(profile || currentUser || profiles[0] || null);
    setIsEditModalOpen(true);
  };

  const handleProfileUpdated = (updated: Profile) => {
    // If it was currentUser or matches ID, update state
    if (currentUser && isSameUser(currentUser, updated)) {
      setCurrentUser(updated);
    }
    setProfiles((prev) => {
      const idx = prev.findIndex((p) => isSameUser(p, updated));
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [updated, ...prev];
    });
  };

  const handleProfileDeleted = (deletedId: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== deletedId));
    if (currentUser?.id === deletedId) {
      setCurrentUser(null);
    }
  };

  // Filter logic
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      // 0. EXCLUDE CURRENT USER - Never show own profile in the co-founder match deck or peer feed
      if (currentUser && isSameUser(p, currentUser)) {
        return false;
      }

      // 1. Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.full_name?.toLowerCase().includes(query);
        const matchesBio = p.bio?.toLowerCase().includes(query);
        const matchesDept = p.ucl_department?.toLowerCase().includes(query);
        const matchesSp = p.superpowers?.some((s) => s.toLowerCase().includes(query));
        const matchesInd = p.industries?.some((i) => i.toLowerCase().includes(query));
        const matchesLf = p.looking_for?.some((l) => l.toLowerCase().includes(query));
        const matchesCustom = p.custom_fields && Object.entries(p.custom_fields).some(
          ([k, v]) => k.toLowerCase().includes(query) || v.toLowerCase().includes(query)
        );

        if (!matchesName && !matchesBio && !matchesDept && !matchesSp && !matchesInd && !matchesLf && !matchesCustom) {
          return false;
        }
      }

      // 2. Filter by "I am looking to meet" tags
      if (selectedLookingFor) {
        if (!p.looking_for?.includes(selectedLookingFor)) {
          return false;
        }
      }

      // 3. Filter by current focus
      if (selectedFocus !== 'ALL') {
        if (p.current_focus !== selectedFocus) {
          return false;
        }
      }

      // 4. Filter by superpower
      if (selectedSuperpower !== 'ALL') {
        if (!p.superpowers?.includes(selectedSuperpower)) {
          return false;
        }
      }

      return true;
    });
  }, [profiles, currentUser, searchQuery, selectedLookingFor, selectedFocus, selectedSuperpower]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedLookingFor(null);
    setSelectedFocus('ALL');
    setSelectedSuperpower('ALL');
  };

  // Cohort Stats - calculate metrics for peer candidates
  const cohortStats = useMemo(() => {
    const peerCohort = profiles.filter((p) => !isSameUser(p, currentUser));
    const total = peerCohort.length;
    const founders = peerCohort.filter((p) => p.current_focus === 'Building a Startup').length;
    const tech = peerCohort.filter((p) => p.superpowers?.some((sp) => sp.includes('Engineering') || sp.includes('AI'))).length;
    const hackathons = peerCohort.filter((p) =>
      p.looking_for?.includes('Teammates for Hackathons')
    ).length;

    return { total, founders, tech, hackathons };
  }, [profiles, currentUser]);

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Welcome Banner after Onboarding */}
        {showWelcome && !dismissWelcome && (
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-blue-950/80 p-5 backdrop-blur-xl shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base">
                  You're in! Welcome to UCL Cohort Matching.
                </h3>
                <p className="text-xs text-slate-300">
                  Your peer card is live. Discover cohort candidates and start matching directly on WhatsApp.
                </p>
              </div>
            </div>
            <button
              onClick={() => setDismissWelcome(true)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Directory Header & Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-950/40 px-3 py-1 text-xs font-semibold text-rose-300 mb-2 shadow-sm">
              <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400 animate-pulse" />
              <span>UCL Co-Founder Matching</span>
              <span>•</span>
              <span className="text-slate-300">{cohortStats.total} {cohortStats.total === 1 ? 'Peer Match' : 'Peer Matches'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Co-Founder Matching
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Discover your ideal co-founder, partner, or teammate. Like, pass, and connect directly on WhatsApp with zero in-app friction.
            </p>
          </div>

          {/* Quick Metrics Bar & Edit Button */}
          <div className="flex flex-wrap items-center gap-3">
            {currentUser ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEdit(currentUser)}
                className="h-11 rounded-xl border-sky-500/40 bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 gap-2.5 font-semibold shadow-md px-3.5"
              >
                {currentUser.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.full_name}
                    className="h-6 w-6 rounded-full object-cover border border-sky-400/50"
                  />
                ) : (
                  <Pencil className="h-4 w-4" />
                )}
                <span>My Profile (You)</span>
              </Button>
            ) : (
              <Link href="/setup-profile">
                <Button
                  size="sm"
                  className="h-11 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold gap-2 shadow-md px-3.5"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Join Cohort</span>
                </Button>
              </Link>
            )}

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-1.5">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Users className="h-3 w-3 text-sky-400" />
                <span>Cohort</span>
              </div>
              <div className="text-sm font-bold text-white">
                {cohortStats.total}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-1.5">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Rocket className="h-3 w-3 text-emerald-400" />
                <span>Founders</span>
              </div>
              <div className="text-sm font-bold text-emerald-400">
                {cohortStats.founders}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-1.5">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Code2 className="h-3 w-3 text-indigo-400" />
                <span>AI/Tech</span>
              </div>
              <div className="text-sm font-bold text-indigo-400">
                {cohortStats.tech}
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher & Filter Trigger Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          {/* Mode Switcher */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
            <button
              type="button"
              onClick={() => setViewMode('deck')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'deck'
                  ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-500 text-white shadow-md shadow-rose-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="h-4 w-4 text-amber-300" />
              <span>Match Deck</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Browse Grid</span>
            </button>
          </div>

          {/* Filter toggle button */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
              showFilters || selectedLookingFor || selectedFocus !== 'ALL' || selectedSuperpower !== 'ALL' || searchQuery
                ? 'border-sky-500/40 bg-sky-950/40 text-sky-300'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filter Peers</span>
            {(selectedLookingFor || selectedFocus !== 'ALL' || selectedSuperpower !== 'ALL' || searchQuery) && (
              <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Collapsible / Expandable Filters */}
        {showFilters && (
          <FeedFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedLookingFor={selectedLookingFor}
            onSelectLookingFor={setSelectedLookingFor}
            selectedFocus={selectedFocus}
            onSelectFocus={setSelectedFocus}
            selectedSuperpower={selectedSuperpower}
            onSelectSuperpower={setSelectedSuperpower}
            totalCount={profiles.length}
            filteredCount={filteredProfiles.length}
            onReset={handleResetFilters}
          />
        )}

        {/* Main Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <div className="h-10 w-10 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
            <p className="text-xs font-medium">Finding UCL matches...</p>
          </div>
        ) : viewMode === 'deck' ? (
          /* THE DATING SITE MATCH DECK */
          <div className="py-2">
            <DatingDeck
              profiles={filteredProfiles}
              currentUser={currentUser}
              onOpenEdit={handleOpenEdit}
            />
          </div>
        ) : filteredProfiles.length > 0 ? (
          /* TRADITIONAL DIRECTORY GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => {
              const isOwner = Boolean(currentUser && isSameUser(currentUser, profile));
              return (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  highlightLookingFor={selectedLookingFor}
                  isOwner={isOwner}
                  onEdit={() => handleOpenEdit(profile)}
                />
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md space-y-4 max-w-lg mx-auto">
            <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              {profiles.length === 0 ? <Users className="h-6 w-6 text-sky-400" /> : <FilterX className="h-6 w-6 text-slate-400" />}
            </div>
            <h3 className="text-lg font-bold text-white">
              {profiles.length === 0 ? 'No Peer Signups Yet' : 'No Matching Cohort Profiles'}
            </h3>
            <p className="text-xs text-slate-400">
              {profiles.length === 0
                ? "You're one of the earliest UCL founders here! Share the link with your cohort or check back as more students join."
                : 'No one in the directory matches your current filter combination. Try resetting filters or adjusting search keywords.'}
            </p>
            {profiles.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="border-slate-700 text-sky-400 hover:text-white"
              >
                Reset All Filters
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentProfile={profileToEdit}
        onSaved={handleProfileUpdated}
        onDeleted={handleProfileDeleted}
      />

      <footer className="py-6 border-t border-slate-800/60 text-center text-xs text-slate-500">
        UCL Cohort Network • Connecting builders, researchers, and innovators
      </footer>
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-white">
          <div className="text-center space-y-2">
            <div className="h-8 w-8 rounded-full border-2 border-sky-400 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading UCL Cohort Directory...</p>
          </div>
        </div>
      }
    >
      <FeedContent />
    </Suspense>
  );
}
