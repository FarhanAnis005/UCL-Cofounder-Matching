import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates international phone format with country code (e.g. +447123456789)
 */
export function isValidE164(phone: string): boolean {
  if (!phone) return false;
  // Must start with + followed by country code (1-3 digits) and remaining 7-14 digits
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const e164Regex = /^\+[1-9]\d{7,14}$/;
  return e164Regex.test(cleaned);
}

/**
 * Strips all non-digit characters except the leading plus, or returns clean digits for wa.me
 */
export function sanitizePhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  // wa.me requires country code without '+' or special characters
  return phone.replace(/\D/g, '');
}

/**
 * Builds the WhatsApp deep link with contextual personalized introductory message
 */
export function getWhatsAppUrl(
  phone: string,
  recipientName: string,
  context?: {
    bio?: string;
    lookingFor?: string[];
    superpowers?: string[];
  }
): string {
  const cleanPhone = sanitizePhoneForWhatsApp(phone);
  
  let greeting = `Hey ${recipientName.split(' ')[0] || ''}, saw your profile on the UCL matching app!`;
  
  if (context?.lookingFor && context.lookingFor.length > 0) {
    greeting += ` Saw you're looking for a ${context.lookingFor[0]} — would love to connect and chat about what you're building.`;
  } else {
    greeting += ` Would love to connect and grab a coffee around campus or chat!`;
  }

  const encodedText = encodeURIComponent(greeting);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function getInitials(name: string): string {
  if (!name) return 'UCL';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Checks if two profile records represent the same user (by id, email, phone, or full name)
 */
export function isSameUser(
  a: { id?: string; email?: string; phone?: string; full_name?: string } | null | undefined,
  b: { id?: string; email?: string; phone?: string; full_name?: string } | null | undefined
): boolean {
  if (!a || !b) return false;

  // 1. Direct ID match
  if (a.id && b.id && a.id === b.id) return true;

  // 2. Email match (case-insensitive)
  if (
    a.email &&
    b.email &&
    a.email.trim().toLowerCase() === b.email.trim().toLowerCase()
  ) {
    return true;
  }

  // 3. Phone match (normalized digits)
  if (a.phone && b.phone) {
    const phoneA = a.phone.replace(/\D/g, '');
    const phoneB = b.phone.replace(/\D/g, '');
    if (phoneA.length >= 7 && phoneB.length >= 7 && phoneA === phoneB) {
      return true;
    }
  }

  // 4. Full Name match if non-empty and non-trivial
  if (
    a.full_name &&
    b.full_name &&
    a.full_name.trim().toLowerCase() === b.full_name.trim().toLowerCase() &&
    a.full_name.trim().length > 2
  ) {
    return true;
  }

  return false;
}

