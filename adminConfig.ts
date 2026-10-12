import type { User } from 'firebase/auth';

/**
 * Admin accounts. This list only controls what the UI shows.
 * The real enforcement is in firestore.rules (isAdmin()), which must list the same emails.
 * Admin requires a VERIFIED email (Google sign-in is always verified).
 */
export const ADMIN_EMAILS: string[] = ['blqees10001@gmail.com'];

export function isAdminUser(user: User | null | undefined): boolean {
  if (!user || !user.email || !user.emailVerified) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}
