import { CurrentFocus, Superpower, LookingFor, Industry, Profile } from './types';

export const FOCUS_OPTIONS: { value: CurrentFocus; label: string; icon: string; description: string }[] = [
  {
    value: 'Building a Startup',
    label: 'Building a Startup',
    icon: '🚀',
    description: 'Active founder building an MVP or already incorporated.',
  },
  {
    value: 'Looking to Join a Startup',
    label: 'Looking to Join a Startup',
    icon: '🤝',
    description: 'Ready to commit as an early co-founder or core team member.',
  },
  {
    value: 'Hunting for VC/Roles',
    label: 'Hunting for VC/Roles',
    icon: '💼',
    description: 'Exploring venture capital, angel syndicates, or tier-1 tech roles.',
  },
  {
    value: 'Academic Projects/Hackathons',
    label: 'Academic Projects/Hackathons',
    icon: '⚡',
    description: 'Seeking partners for upcoming hackathons, UCL Hatchery, or papers.',
  },
];

export const SUPERPOWER_OPTIONS: { value: Superpower; label: string; icon: string; badgeColor: string }[] = [
  { value: 'Engineering/AI', label: 'Engineering/AI', icon: '💻', badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  { value: 'Product/Design', label: 'Product/Design', icon: '🎨', badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  { value: 'Business/Ops', label: 'Business/Ops', icon: '📈', badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  { value: 'Sales/GTM', label: 'Sales/GTM', icon: '📣', badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30' },
  { value: 'Finance/VC', label: 'Finance/VC', icon: '💰', badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
];

export const LOOKING_FOR_OPTIONS: { value: LookingFor; label: string; icon: string; badgeColor: string }[] = [
  { value: 'Technical Co-founder', label: 'Technical Co-founder', icon: '🛠️', badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' },
  { value: 'Business/GTM Co-founder', label: 'Business/GTM Co-founder', icon: '🎯', badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' },
  { value: 'Teammates for Hackathons', label: 'Teammates for Hackathons', icon: '🏆', badgeColor: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30' },
  { value: 'VC/Finance connections', label: 'VC/Finance connections', icon: '🌐', badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' },
  { value: 'Brainstorming partners', label: 'Brainstorming partners', icon: '💡', badgeColor: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30' },
];

export const INDUSTRY_OPTIONS: { value: Industry; label: string; icon: string }[] = [
  { value: 'AI', label: 'AI & Machine Learning', icon: '🧠' },
  { value: 'FinTech', label: 'FinTech & Payments', icon: '💳' },
  { value: 'HealthTech', label: 'HealthTech & Bio', icon: '🧬' },
  { value: 'Consumer', label: 'Consumer & Social', icon: '📱' },
  { value: 'DeepTech', label: 'DeepTech & Robotics', icon: '🔬' },
  { value: 'Climate', label: 'Climate & Sustainability', icon: '🌱' },
];

export const UCL_DEPARTMENTS = [
  'Computer Science',
  'School of Management',
  'Mathematics & Statistics',
  'Electronic & Electrical Engineering',
  'Bartlett School of Architecture/Planning',
  'Medical Sciences & Neuroscience',
  'Economics',
  'Mechanical Engineering',
  'Law',
  'Other UCL Department',
];

// Seed profiles: empty array so only real signups appear
export const SEED_PROFILES: Profile[] = [];
