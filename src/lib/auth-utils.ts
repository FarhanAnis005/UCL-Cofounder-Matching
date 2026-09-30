/**
 * UCL Cohort Network - Email & Authentication Utilities
 * Enforces strict verification for University College London domains.
 */

export const UCL_DOMAINS = ['ucl.ac.uk', 'uclmail.net'];

/**
 * Strict regex matching:
 * - name@ucl.ac.uk
 * - name.24@ucl.ac.uk
 * - user@cs.ucl.ac.uk (Computer Science)
 * - user@alumni.ucl.ac.uk
 * - user@medsch.ucl.ac.uk
 * - user@uclmail.net
 */
export const UCL_EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.)?(ucl\.ac\.uk|uclmail\.net)$/i;

export function isUclEmail(email: string): boolean {
  if (!email) return false;
  return UCL_EMAIL_REGEX.test(email.trim());
}

export function getUclEmailError(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Please enter your UCL email address.';
  }

  if (!trimmed.includes('@')) {
    return 'Please enter a valid email address with @.';
  }

  if (!isUclEmail(trimmed)) {
    const domain = trimmed.split('@')[1] || '';
    return `Access restricted: "@${domain}" is not recognized. Please use your official @ucl.ac.uk email.`;
  }

  return null;
}

/**
 * Infers student name from UCL email formats:
 * - "alexander.sterling.24@ucl.ac.uk" -> "Alexander Sterling"
 * - "priya.sharma@cs.ucl.ac.uk" -> "Priya Sharma"
 */
export function inferNameFromUclEmail(email: string): string {
  if (!email || !email.includes('@')) return '';
  const prefix = email.split('@')[0];
  // Remove trailing year digits like .24 or 2024
  const cleaned = prefix.replace(/\.?\d+$/, '');
  const parts = cleaned.split(/[._-]/).filter(Boolean);

  if (parts.length === 0) return '';
  return parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Infers department from subdomain if present (e.g. alex@cs.ucl.ac.uk -> Computer Science)
 */
export function inferDeptFromUclEmail(email: string): string | null {
  if (!email) return null;
  const lower = email.toLowerCase();
  if (lower.includes('@cs.ucl.ac.uk')) return 'Computer Science';
  if (lower.includes('@mgmt.ucl.ac.uk') || lower.includes('@som.ucl.ac.uk')) return 'School of Management';
  if (lower.includes('@medsch.ucl.ac.uk')) return 'Medical Sciences & Neuroscience';
  if (lower.includes('@bartlett.ucl.ac.uk')) return 'Bartlett School of Architecture/Planning';
  if (lower.includes('@econ.ucl.ac.uk')) return 'Economics';
  if (lower.includes('@math.ucl.ac.uk') || lower.includes('@stats.ucl.ac.uk')) return 'Mathematics & Statistics';
  return null;
}
