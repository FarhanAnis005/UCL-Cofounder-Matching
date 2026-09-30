export type CurrentFocus =
  | 'Building a Startup'
  | 'Looking to Join a Startup'
  | 'Hunting for VC/Roles'
  | 'Academic Projects/Hackathons';

export type Superpower =
  | 'Engineering/AI'
  | 'Product/Design'
  | 'Business/Ops'
  | 'Sales/GTM'
  | 'Finance/VC'
  | string;

export type LookingFor =
  | 'Technical Co-founder'
  | 'Business/GTM Co-founder'
  | 'Teammates for Hackathons'
  | 'VC/Finance connections'
  | 'Brainstorming partners'
  | string;

export type Industry =
  | 'AI'
  | 'FinTech'
  | 'HealthTech'
  | 'Consumer'
  | 'DeepTech'
  | 'Climate'
  | string;

export interface Profile {
  id: string;
  user_id?: string;
  full_name: string;
  email?: string;
  avatar_url?: string;
  phone: string;
  bio: string; // The One-Liner (Max 100 chars)
  current_focus: CurrentFocus;
  superpowers: string[];
  looking_for: string[];
  industries: string[];
  ucl_department?: string;
  graduation_year?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  pitch_deck_url?: string;
  custom_fields?: Record<string, string>; // Arbitrary custom key-values (e.g. "Availability": "Full-time", "Previous Exit": "Yes")
  custom_tags?: string[]; // Custom badges
  created_at?: string;
  updated_at?: string;
}

export interface OnboardingFormData {
  full_name: string;
  avatar_url?: string;
  current_focus: CurrentFocus | '';
  superpowers: string[];
  bio: string;
  looking_for: string[];
  industries: string[];
  phone: string;
  ucl_department?: string;
  graduation_year?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  pitch_deck_url?: string;
  custom_fields?: Record<string, string>;
  custom_tags?: string[];
}
