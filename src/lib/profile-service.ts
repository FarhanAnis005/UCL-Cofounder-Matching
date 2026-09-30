import { createClient, isSupabaseConfigured } from './supabase/client';
import { SEED_PROFILES } from './constants';
import { Profile, OnboardingFormData } from './types';

const LOCAL_STORAGE_PROFILES_KEY = 'ucl_cohort_profiles_v1';
const LOCAL_STORAGE_CURRENT_USER_KEY = 'ucl_current_user_v1';

export async function getProfiles(): Promise<Profile[]> {
  // 1. Primary: Fetch via Prisma API endpoint
  try {
    const res = await fetch('/api/profiles', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data?.profiles && Array.isArray(data.profiles)) {
        return data.profiles as Profile[];
      }
    }
  } catch (apiErr) {
    console.warn('Prisma API fetch error, checking Supabase client:', apiErr);
  }

  // 2. Direct Supabase client
  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return (data as Profile[]).filter((p) => !p.id.startsWith('ucl-seed-'));
      }
    } catch (err) {
      console.warn('Could not fetch from Supabase, checking local storage:', err);
    }
  }

  // Fallback to local storage (only real user signups saved in browser)
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(LOCAL_STORAGE_PROFILES_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Profile[];
        // Filter out any legacy seed IDs
        const realProfiles = parsed.filter((p) => !p.id.startsWith('ucl-seed-'));
        return realProfiles;
      } catch (e) {
        console.error('Failed to parse local profiles', e);
      }
    }
  }

  return [];
}

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = createClient();
  let authUser: { id: string; email?: string } | null = null;

  if (supabase) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        authUser = user;
      } else {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          authUser = session.user;
        }
      }

      if (authUser) {
        // 1. Try fetching profile by Supabase auth ID
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (!error && data) {
          const profile = data as Profile;
          if (authUser.email && !profile.email) profile.email = authUser.email;
          return profile;
        }

        // 2. Try fetching profile by email in case ID differed
        if (authUser.email) {
          const { data: dataByEmail, error: emailErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', authUser.email)
            .maybeSingle();

          if (!emailErr && dataByEmail) {
            return dataByEmail as Profile;
          }
        }

        // 3. Fallback to Prisma API endpoint
        try {
          const res = await fetch('/api/profiles', { cache: 'no-store' });
          if (res.ok) {
            const apiData = await res.json();
            if (apiData?.profiles && Array.isArray(apiData.profiles)) {
              const matched = (apiData.profiles as Profile[]).find(
                (p) =>
                  p.id === authUser!.id ||
                  (p.email &&
                    authUser!.email &&
                    p.email.toLowerCase() === authUser!.email.toLowerCase())
              );
              if (matched) return matched;
            }
          }
        } catch {}
      }
    } catch (err) {
      console.warn('Error fetching Supabase user profile:', err);
    }
  }

  // 3. Fallback to local storage (covers demo mode and offline cache)
  if (typeof window !== 'undefined') {
    const cachedUser = localStorage.getItem(LOCAL_STORAGE_CURRENT_USER_KEY);
    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser) as Profile;
        if (authUser) {
          if (!parsed.email && authUser.email) parsed.email = authUser.email;
          if (parsed.id.startsWith('ucl-user-')) parsed.id = authUser.id;
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse cached user', e);
      }
    }

    // 4. Check if any profile in local cohort list matches auth user's email
    if (authUser?.email) {
      const savedProfiles = localStorage.getItem(LOCAL_STORAGE_PROFILES_KEY);
      if (savedProfiles) {
        try {
          const list = JSON.parse(savedProfiles) as Profile[];
          const match = list.find(
            (p) => p.email && p.email.toLowerCase() === authUser.email!.toLowerCase()
          );
          if (match) return match;
        } catch {}
      }
    }
  }

  return null;
}

export async function saveProfile(formData: OnboardingFormData, existingId?: string): Promise<{ success: boolean; profile?: Profile; error?: string }> {
  const supabase = createClient();

  let targetId = existingId;
  let userEmail = '';
  let avatarUrl = '';

  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        targetId = user.id;
        userEmail = user.email || '';
        avatarUrl = user.user_metadata?.avatar_url || '';
      }
    } catch (e) {
      console.warn('Could not get auth user:', e);
    }
  }

  if (!targetId) {
    targetId = existingId || `ucl-user-${Date.now()}`;
  }

  const profileRecord: Profile = {
    id: targetId,
    full_name: formData.full_name || 'UCL Cohort Member',
    email: userEmail,
    avatar_url: formData.avatar_url || avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.full_name || 'UCL')}&backgroundColor=002855,1e3a8a,0369a1&textColor=ffffff`,
    phone: formData.phone,
    bio: formData.bio,
    current_focus: formData.current_focus || 'Building a Startup',
    superpowers: formData.superpowers,
    looking_for: formData.looking_for,
    industries: formData.industries,
    ucl_department: formData.ucl_department || 'Computer Science',
    graduation_year: formData.graduation_year || '2025',
    linkedin_url: formData.linkedin_url,
    github_url: formData.github_url,
    website_url: formData.website_url,
    pitch_deck_url: formData.pitch_deck_url,
    custom_fields: formData.custom_fields || {},
    custom_tags: formData.custom_tags || [],
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  // 1. Primary: Save via Prisma API endpoint
  try {
    const res = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileRecord),
    });

    if (res.ok) {
      const json = await res.json();
      if (json?.profile) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, JSON.stringify(json.profile));
        }
        return { success: true, profile: json.profile };
      }
    } else {
      const errJson = await res.json().catch(() => null);
      if (errJson?.error && !errJson.error.includes('DATABASE_URL')) {
        return { success: false, error: errJson.error };
      }
    }
  } catch (apiErr) {
    console.warn('Prisma API save failed, trying Supabase direct:', apiErr);
  }

  // 2. Direct Supabase client
  if (supabase) {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: profileRecord.id,
          full_name: profileRecord.full_name,
          avatar_url: profileRecord.avatar_url,
          phone: profileRecord.phone,
          bio: profileRecord.bio,
          current_focus: profileRecord.current_focus,
          superpowers: profileRecord.superpowers,
          looking_for: profileRecord.looking_for,
          industries: profileRecord.industries,
          ucl_department: profileRecord.ucl_department,
          graduation_year: profileRecord.graduation_year,
          linkedin_url: profileRecord.linkedin_url,
          github_url: profileRecord.github_url,
          website_url: profileRecord.website_url,
          pitch_deck_url: profileRecord.pitch_deck_url,
          custom_fields: profileRecord.custom_fields,
          custom_tags: profileRecord.custom_tags,
          updated_at: profileRecord.updated_at,
        });

      if (error) {
        console.error('Supabase upsert failed:', error.message);
        return {
          success: false,
          error: error.message.includes('schema cache') || error.code === 'PGRST205'
            ? "Table 'profiles' not found in Supabase. Please configure DATABASE_URL in .env to run prisma db push, or run schema.sql in Supabase SQL editor."
            : error.message,
        };
      }
    } catch (err: any) {
      console.error('Supabase profile save error:', err);
      return { success: false, error: err?.message || 'Failed to save to Supabase database.' };
    }
  }

  // Always persist locally for snappy UX and demo mode
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, JSON.stringify(profileRecord));

    const saved = localStorage.getItem(LOCAL_STORAGE_PROFILES_KEY);
    let list: Profile[] = [];
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch {
        list = [];
      }
    }
    const idx = list.findIndex(p => p.id === profileRecord.id);
    if (idx >= 0) {
      list[idx] = profileRecord;
    } else {
      list.unshift(profileRecord);
    }
    localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify(list));
  }

  return { success: true, profile: profileRecord };
}

export async function getCurrentUserEmail(): Promise<string | null> {
  const supabase = createClient();
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) return user.email;
    } catch (e) {
      // ignore
    }
  }
  return null;
}

export async function signOutUser(): Promise<void> {
  const supabase = createClient();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Supabase signOut error', e);
    }
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER_KEY);
    localStorage.removeItem('ucl_auth_email_sent');
    localStorage.removeItem('ucl_email_otp');
    localStorage.removeItem('ucl_onboarding_temp');
    localStorage.removeItem('ucl_pending_avatar');
    localStorage.removeItem('ucl_pending_name');
    sessionStorage.clear();
  }
}

export async function deleteProfile(profileId: string): Promise<{ success: boolean; error?: string }> {
  // 1. Primary: Delete via Prisma API endpoint
  try {
    const res = await fetch(`/api/profiles?id=${encodeURIComponent(profileId)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      // deleted successfully via Prisma
    }
  } catch (apiErr) {
    console.warn('Prisma API delete error:', apiErr);
  }

  const supabase = createClient();
  let supabaseError: string | undefined;

  if (supabase) {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);

      if (error) {
        console.warn('Supabase profile delete error:', error.message);
        supabaseError = error.message;
      }
    } catch (err: any) {
      console.warn('Failed to delete profile from Supabase:', err);
      supabaseError = err?.message;
    }
  }

  // Remove from localStorage
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(LOCAL_STORAGE_PROFILES_KEY);
    if (saved) {
      try {
        const list = JSON.parse(saved) as Profile[];
        const updated = list.filter((p) => p.id !== profileId);
        localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update local storage profiles:', e);
      }
    }

    const cachedUser = localStorage.getItem(LOCAL_STORAGE_CURRENT_USER_KEY);
    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser) as Profile;
        if (parsed.id === profileId) {
          localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER_KEY);
        }
      } catch (e) {
        console.error('Failed to clear cached user:', e);
      }
    }
  }

  return { success: !supabaseError, error: supabaseError };
}

export function clearLocalTestProfiles(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_PROFILES_KEY);
    localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER_KEY);
    localStorage.removeItem('ucl_pending_avatar');
    localStorage.removeItem('ucl_pending_name');
  }
}
