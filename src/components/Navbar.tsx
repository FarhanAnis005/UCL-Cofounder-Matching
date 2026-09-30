'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Profile } from '@/lib/types';
import { getCurrentUserProfile, signOutUser, getCurrentUserEmail } from '@/lib/profile-service';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Users, LogOut, UserCircle, PlusCircle } from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // 1. Initial load
    getCurrentUserProfile().then((user) => {
      setCurrentUser(user);
    });
    getCurrentUserEmail().then((email) => {
      setUserEmail(email);
    });

    // 2. Real-time auth state listener
    const supabase = createClient();
    if (supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.email) {
          setUserEmail(user.email);
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setUserEmail(session.user.email || null);
          const profile = await getCurrentUserProfile();
          setCurrentUser(profile);
        } else {
          setUserEmail(null);
          setCurrentUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
    setUserEmail(null);
    router.push('/');
    router.refresh();
  };

  const isLoggedIn = Boolean(currentUser || userEmail);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & UCL Cohort Title */}
        <Link href="/feed" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-400 p-[1px] shadow-lg shadow-indigo-950/40">
            <div className="h-full w-full rounded-[11px] bg-slate-950 flex items-center justify-center group-hover:bg-slate-900 transition-colors">
              <span className="font-extrabold text-xs text-sky-400 tracking-wider">UCL</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-white tracking-tight">
                Cohort Network
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                80 Cohort
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Direct WhatsApp Co-founder Matching
            </p>
          </div>
        </Link>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Directory Link */}
          <Link href="/feed">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex gap-1.5 text-xs text-slate-300 hover:text-white">
              <Users className="h-4 w-4 text-slate-400" />
              <span>Directory</span>
            </Button>
          </Link>

          {/* Profile / Edit or Complete */}
          {currentUser ? (
            <Link href="/setup-profile">
              <Button variant="outline" size="sm" className="gap-1.5 border-slate-700 text-xs">
                <UserCircle className="h-3.5 w-3.5 text-sky-400" />
                <span className="hidden sm:inline">Edit Profile:</span>
                <span className="max-w-[80px] sm:max-w-[110px] truncate font-medium">
                  {currentUser.full_name?.split(' ')[0] || 'Profile'}
                </span>
              </Button>
            </Link>
          ) : isLoggedIn ? (
            <Link href="/setup-profile">
              <Button size="sm" className="gap-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs">
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Complete Profile</span>
              </Button>
            </Link>
          ) : null}

          {/* Always Available Log Out Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="gap-1.5 border-slate-700/80 bg-slate-900/60 hover:bg-rose-950/40 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 text-xs font-semibold rounded-xl transition-all"
            title={`Log out (${userEmail || currentUser?.email || 'session'})`}
          >
            <LogOut className="h-3.5 w-3.5 text-rose-400" />
            <span>Log Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
