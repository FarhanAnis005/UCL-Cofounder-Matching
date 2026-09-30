'use client';

import React, { useState, useEffect } from 'react';
import { Profile, CurrentFocus, Superpower, LookingFor, Industry } from '@/lib/types';
import { saveProfile } from '@/lib/profile-service';
import { isValidE164, sanitizePhoneForWhatsApp } from '@/lib/utils';
import { FOCUS_OPTIONS, SUPERPOWER_OPTIONS, LOOKING_FOR_OPTIONS, INDUSTRY_OPTIONS, UCL_DEPARTMENTS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MultiSelectPills } from '@/components/ui/multi-select';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import {
  X,
  Sparkles,
  Save,
  Plus,
  Trash2,
  Globe,
  FileText,
  Phone,
  Check,
  Loader2,
  Tag,
} from 'lucide-react';
import { LinkedInIcon, GitHubIcon } from '@/components/ui/social-icons';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: Profile | null;
  onSaved: (updated: Profile) => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  currentProfile,
  onSaved,
}: EditProfileModalProps) {
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [department, setDepartment] = useState(UCL_DEPARTMENTS[0]);
  const [gradYear, setGradYear] = useState('2025');
  const [focus, setFocus] = useState<CurrentFocus>('Building a Startup');
  const [superpowers, setSuperpowers] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('+44');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [pitchDeckUrl, setPitchDeckUrl] = useState('');

  // Custom fields: Array of { key, value }
  const [customKeyValues, setCustomKeyValues] = useState<{ key: string; value: string }[]>([]);
  const [newCustomKey, setNewCustomKey] = useState('');
  const [newCustomVal, setNewCustomVal] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (currentProfile) {
      setFullName(currentProfile.full_name || '');
      setAvatarUrl(currentProfile.avatar_url || '');
      setDepartment(currentProfile.ucl_department || UCL_DEPARTMENTS[0]);
      setGradYear(currentProfile.graduation_year || '2025');
      setFocus(currentProfile.current_focus || 'Building a Startup');
      setSuperpowers(currentProfile.superpowers || []);
      setLookingFor(currentProfile.looking_for || []);
      setIndustries(currentProfile.industries || []);
      setBio(currentProfile.bio || '');
      setPhone(currentProfile.phone || '+44');
      setLinkedinUrl(currentProfile.linkedin_url || '');
      setGithubUrl(currentProfile.github_url || '');
      setWebsiteUrl(currentProfile.website_url || '');
      setPitchDeckUrl(currentProfile.pitch_deck_url || '');

      if (currentProfile.custom_fields) {
        const entries = Object.entries(currentProfile.custom_fields).map(([k, v]) => ({
          key: k,
          value: v,
        }));
        setCustomKeyValues(entries);
      } else {
        setCustomKeyValues([]);
      }
    }
  }, [currentProfile, isOpen]);

  if (!isOpen) return null;

  const handleAddCustomKeyValue = () => {
    if (!newCustomKey.trim() || !newCustomVal.trim()) return;
    setCustomKeyValues([...customKeyValues, { key: newCustomKey.trim(), value: newCustomVal.trim() }]);
    setNewCustomKey('');
    setNewCustomVal('');
  };

  const handleRemoveCustomKeyValue = (index: number) => {
    setCustomKeyValues(customKeyValues.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }
    if (!isValidE164(phone)) {
      setErrorMsg('Phone must start with a valid country code (e.g. +44...).');
      return;
    }
    if (!bio.trim()) {
      setErrorMsg('Please enter a brief one-liner.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    // Transform key-values into Record<string, string>
    const customFieldsObj: Record<string, string> = {};
    customKeyValues.forEach(({ key, value }) => {
      if (key.trim()) {
        customFieldsObj[key.trim()] = value.trim();
      }
    });

    try {
      const res = await saveProfile(
        {
          full_name: fullName.trim(),
          avatar_url: avatarUrl,
          current_focus: focus,
          superpowers,
          bio: bio.trim(),
          looking_for: lookingFor,
          industries,
          phone: phone.trim(),
          ucl_department: department,
          graduation_year: gradYear,
          linkedin_url: linkedinUrl.trim(),
          github_url: githubUrl.trim(),
          website_url: websiteUrl.trim(),
          pitch_deck_url: pitchDeckUrl.trim(),
          custom_fields: customFieldsObj,
        },
        currentProfile?.id
      );

      if (res.success && res.profile) {
        onSaved(res.profile);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Edit Your Cohort Profile</h2>
              <p className="text-xs text-slate-400">Update your superpowers, demand, and custom links</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-sm text-slate-200">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/40 text-xs text-red-300">
              {errorMsg}
            </div>
          )}

          {/* Profile Photo Uploader */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60">
            <AvatarUpload value={avatarUrl} onChange={setAvatarUrl} userId={currentProfile?.id} />
          </div>

          {/* Section 1: Basic Info */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-400">Full Name *</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alexander Sterling"
              className="h-11 bg-slate-950/80 border-slate-700 text-white"
            />
          </div>

          {/* Section 2: Focus & One-Liner */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-400">My Current Focus</label>
              <select
                value={focus}
                onChange={(e) => setFocus(e.target.value as CurrentFocus)}
                className="flex h-11 w-full rounded-xl border border-slate-700/80 bg-slate-900/60 px-3.5 py-2 text-sm text-slate-100 shadow-inner"
              >
                {FOCUS_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value} className="bg-slate-900 text-white">
                    {f.icon} {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase text-slate-400">The One-Liner (Max 100 chars)</label>
                <span className="text-xs text-slate-400 font-mono">{bio.length}/100</span>
              </div>
              <Input
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 100))}
                placeholder="Ex-DeepMind intern building AI for clinical trials."
              />
            </div>
          </div>

          {/* Section 3: Superpowers */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-bold uppercase text-emerald-400 flex items-center justify-between">
              <span>⚡ My Superpowers (Pick up to 3)</span>
              <span className="text-xs font-normal text-slate-400">{superpowers.length}/3 selected</span>
            </label>
            <MultiSelectPills<any>
              options={SUPERPOWER_OPTIONS}
              selected={superpowers}
              onChange={setSuperpowers}
              max={3}
              variant="superpower"
              allowCustom={true}
              customPlaceholder="Type custom superpower & press Enter..."
            />
          </div>

          {/* Section 4: Looking For */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-bold uppercase text-indigo-400 flex items-center justify-between">
              <span>🎯 I am looking to meet (Pick up to 2)</span>
              <span className="text-xs font-normal text-slate-400">{lookingFor.length}/2 selected</span>
            </label>
            <MultiSelectPills<any>
              options={LOOKING_FOR_OPTIONS}
              selected={lookingFor}
              onChange={setLookingFor}
              max={2}
              variant="lookingFor"
              allowCustom={true}
              customPlaceholder="Type custom role (e.g. Angel, Grant Writer) & press Enter..."
            />
          </div>

          {/* Section 4b: Industry Interests */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-bold uppercase text-sky-400 flex items-center justify-between">
              <span>🌐 Industry Interests (Pick up to 3)</span>
              <span className="text-xs font-normal text-slate-400">{industries.length}/3 selected</span>
            </label>
            <MultiSelectPills<any>
              options={INDUSTRY_OPTIONS}
              selected={industries}
              onChange={setIndustries}
              max={3}
              variant="industry"
              allowCustom={true}
              customPlaceholder="Type custom industry (e.g. EdTech, Defence) & press Enter..."
            />
          </div>

          {/* Section 5: WhatsApp Contact */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <label className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              WhatsApp Number (Country Code Required) *
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value.trim())}
              placeholder="+447700900123"
              className="font-mono text-sm"
            />
          </div>

          {/* Section 6: Custom Links & Portfolio */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <label className="text-xs font-bold uppercase text-slate-300 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-sky-400" />
              Links & Portfolio (Optional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-1">
                <LinkedInIcon className="h-4 w-4 text-sky-400 shrink-0" />
                <input
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className="w-full bg-transparent text-xs text-white focus:outline-none placeholder:text-slate-500 py-1.5"
                />
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-1">
                <GitHubIcon className="h-4 w-4 text-slate-300 shrink-0" />
                <input
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="github.com/username"
                  className="w-full bg-transparent text-xs text-white focus:outline-none placeholder:text-slate-500 py-1.5"
                />
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-1">
                <Globe className="h-4 w-4 text-emerald-400 shrink-0" />
                <input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="Portfolio / Website URL"
                  className="w-full bg-transparent text-xs text-white focus:outline-none placeholder:text-slate-500 py-1.5"
                />
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-1">
                <FileText className="h-4 w-4 text-amber-400 shrink-0" />
                <input
                  value={pitchDeckUrl}
                  onChange={(e) => setPitchDeckUrl(e.target.value)}
                  placeholder="Pitch Deck / Notion link"
                  className="w-full bg-transparent text-xs text-white focus:outline-none placeholder:text-slate-500 py-1.5"
                />
              </div>
            </div>
          </div>

          {/* Section 7: Custom Key-Value Fields (JSONB) */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-sky-400 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                Custom Fields (Arbitrary Key-Value Pairs)
              </label>
              <span className="text-[11px] text-slate-400">e.g. Stage, Equity, Availability</span>
            </div>

            {/* List of existing custom fields */}
            {customKeyValues.length > 0 && (
              <div className="space-y-2">
                {customKeyValues.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-800 bg-slate-950/50 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-sky-300">{item.key}:</span>{' '}
                      <span className="text-slate-300">{item.value}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomKeyValue(index)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new custom field row */}
            <div className="flex items-center gap-2">
              <Input
                value={newCustomKey}
                onChange={(e) => setNewCustomKey(e.target.value)}
                placeholder="Field name (e.g. Stage, Equity)"
                className="h-9 text-xs w-1/3"
              />
              <Input
                value={newCustomVal}
                onChange={(e) => setNewCustomVal(e.target.value)}
                placeholder="Value (e.g. MVP Live, 50/50)"
                className="h-9 text-xs flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomKeyValue();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCustomKeyValue}
                className="h-9 text-xs border-slate-700 hover:border-sky-400 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Field
              </Button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving} className="text-slate-400">
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-6 h-10 rounded-xl"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
