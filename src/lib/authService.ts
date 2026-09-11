import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Sign in using Google popup
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Firebase Google sign in error:', error);
    throw new Error(getFriendlyAuthErrorMessage(error));
  }
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email: string, pass: string): Promise<User> {
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return result.user;
  } catch (error: any) {
    console.error('Firebase Email sign in error:', error);
    throw new Error(getFriendlyAuthErrorMessage(error));
  }
}

/**
 * Sign up a new account with Email and Password
 */
export async function registerWithEmail(email: string, pass: string): Promise<User> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    return result.user;
  } catch (error: any) {
    console.error('Firebase Register error:', error);
    throw new Error(getFriendlyAuthErrorMessage(error));
  }
}

/**
 * Sign out current user
 */
export async function signOutCurrentUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Firebase Sign out error:', error);
  }
}

/**
 * Subscribe to auth state changes
 */
export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

/**
 * Get current authenticated user
 */
export function getCurrentAuthUser(): User | null {
  return auth.currentUser;
}

/**
 * Convert technical Firebase Auth error codes into user-friendly messages
 */
export function getFriendlyAuthErrorMessage(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Sign in was cancelled (popup window was closed).';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Please use Google Sign In or contact an administrator.';
    default:
      return error?.message || 'Authentication failed. Please try again.';
  }
}
