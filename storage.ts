import { Member, Team, TeamInvitation } from '../types';
import { INITIAL_MEMBERS, INITIAL_TEAMS } from './mockData';

const STORAGE_KEYS = {
  MEMBERS: 'tuwaiq_teammatch_profiles_v3',
  CURRENT_USER_ID: 'tuwaiq_teammatch_user_id_v3',
  TEAMS: 'tuwaiq_teammatch_squads_v3',
  INVITATIONS: 'tuwaiq_teammatch_invitations_v3',
  BOOKMARKS: 'tuwaiq_teammatch_bookmarks_v3',
};

export function getStoredMembers(): Member[] {
  try {
    // Clear legacy mock data keys
    ['tuwaiq_teammatch_members_v1', 'tuwaiq_teammatch_teams_v1', 'tuwaiq_teammatch_current_user_id_v2'].forEach(
      (k) => {
        try {
          localStorage.removeItem(k);
        } catch {
          // ignore
        }
      }
    );

    const raw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map((m: any) => ({
      ...m,
      skills: Array.isArray(m.skills) ? m.skills : [],
      skillCategories: Array.isArray(m.skillCategories) ? m.skillCategories : ['TECH'],
      interests: Array.isArray(m.interests) ? m.interests : [],
      competitionInterests: Array.isArray(m.competitionInterests) ? m.competitionInterests : [],
      isAvailableForTeam: typeof m.isAvailableForTeam === 'boolean' ? m.isAvailableForTeam : true,
    }));
  } catch (e) {
    console.error('Failed to load members from localStorage', e);
    return [];
  }
}

export function saveStoredMembers(members: Member[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  } catch (e) {
    console.error('Failed to save members to localStorage', e);
  }
}

export function getCurrentUserId(): string | null {
  try {
    const id = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return id || null;
  } catch {
    return null;
  }
}

export function setCurrentUserId(id: string | null): void {
  try {
    if (!id) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
    }
  } catch (e) {
    console.error('Failed to set current user id', e);
  }
}

export function getStoredCurrentUser(): Member | null {
  const currentId = getCurrentUserId();
  if (!currentId) return null;
  const members = getStoredMembers();
  return members.find((m) => m.id === currentId) || null;
}

export function removeStoredCurrentUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  } catch (e) {
    console.error('Failed to remove current user', e);
  }
}

export function getMemberOwnerKey(memberId: string): string | null {
  try {
    return localStorage.getItem(`tuwaiq_owner_key_${memberId}`) || null;
  } catch {
    return null;
  }
}

export function setMemberOwnerKey(memberId: string, key: string): void {
  try {
    localStorage.setItem(`tuwaiq_owner_key_${memberId}`, key);
  } catch (e) {
    console.error('Failed to set member owner key', e);
  }
}

export function generateOwnerKey(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'key_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function saveStoredCurrentUser(user: Member): void {
  setCurrentUserId(user.id);
  const members = getStoredMembers();
  const updated = members.map((m) => (m.id === user.id ? user : m));
  if (!members.some((m) => m.id === user.id)) {
    updated.push(user);
  }
  saveStoredMembers(updated);
}

export function getStoredTeams(): Team[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEAMS);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map((t: any) => ({
      ...t,
      members: Array.isArray(t.members) ? t.members : [],
      requiredSkills: Array.isArray(t.requiredSkills) ? t.requiredSkills : [],
    }));
  } catch (e) {
    console.error('Failed to load teams from localStorage', e);
    return [];
  }
}

export function saveStoredTeams(teams: Team[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
  } catch (e) {
    console.error('Failed to save teams to localStorage', e);
  }
}

export function getStoredInvitations(): TeamInvitation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVITATIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load invitations', e);
    return [];
  }
}

export function saveStoredInvitations(invites: TeamInvitation[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(invites));
  } catch (e) {
    console.error('Failed to save invitations', e);
  }
}

export function getStoredBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredBookmarks(bookmarks: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  } catch (e) {
    console.error('Failed to save bookmarks', e);
  }
}

export function resetAllToDefaults(): void {
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify([]));
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  localStorage.removeItem(STORAGE_KEYS.INVITATIONS);
  localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
}
