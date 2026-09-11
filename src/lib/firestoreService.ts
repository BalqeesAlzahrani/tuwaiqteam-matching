import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Member, Team, TeamInvitation } from '../types';
import {
  saveStoredMembers,
  saveStoredTeams,
  saveStoredInvitations,
  getStoredMembers,
  getStoredTeams,
  getStoredInvitations,
  getMemberOwnerKey,
  setMemberOwnerKey,
  generateOwnerKey,
} from '../data/storage';

const MEMBERS_COL = 'members';
const TEAMS_COL = 'teams';
const INVITATIONS_COL = 'invitations';
const BOOKMARKS_COL = 'bookmarks';

/**
 * Subscribe to real-time changes in Member Profiles
 */
export function subscribeToMembers(
  onUpdate: (members: Member[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    const colRef = collection(db, MEMBERS_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: Member[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Member;
          if (data && data.id) {
            list.push({
              ...data,
              skills: Array.isArray(data.skills) ? data.skills : [],
              skillCategories: Array.isArray(data.skillCategories) ? data.skillCategories : ['TECH'],
              interests: Array.isArray(data.interests) ? data.interests : [],
              competitionInterests: Array.isArray(data.competitionInterests) ? data.competitionInterests : [],
              isAvailableForTeam: typeof data.isAvailableForTeam === 'boolean' ? data.isAvailableForTeam : true,
            });
          }
        });

        // Sort descending by creation
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

        saveStoredMembers(list);
        onUpdate(list);
      },
      (error) => {
        console.warn('Firestore members subscription error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Could not set up members listener:', err);
    return () => {};
  }
}

/**
 * Recursively remove undefined keys so Firestore never throws 'Unsupported field value: undefined'
 */
function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as any;
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

/**
 * Persist or update a member profile in Firestore
 * Enforces authenticated user ownership and prevents undefined values
 */
export async function saveMemberProfile(member: Member): Promise<void> {
  const currentAuthUser = auth.currentUser;
  if (!currentAuthUser || !currentAuthUser.uid) {
    console.error('saveMemberProfile failed: No authenticated user session in Firebase Auth.');
    throw new Error("Your profile couldn't be saved. Please make sure you're signed in and try again.");
  }

  const ownerUid = currentAuthUser.uid;

  // Validation
  if (!member.name || !member.name.trim()) {
    throw new Error("Your profile couldn't be saved. Please enter your name.");
  }
  if (!member.skills || member.skills.length === 0) {
    throw new Error("Your profile couldn't be saved. Please select at least one skill.");
  }

  // Generate or preserve ID
  const memberId = member.id || `mem-${ownerUid.substring(0, 10)}`;
  const docRef = doc(db, MEMBERS_COL, memberId);

  // Retrieve or generate secure device owner token for this profile
  let ownerKey = member.ownerKey || getMemberOwnerKey(memberId);
  if (!ownerKey) {
    ownerKey = generateOwnerKey();
  }

  const payload: Member = {
    id: memberId,
    name: member.name.trim(),
    nameAr: member.nameAr?.trim() || undefined,
    major: member.major?.trim() || 'Technology & Entrepreneurship',
    majorAr: member.majorAr?.trim() || undefined,
    academicYear: member.academicYear || 'Sophomore (Year 2)',
    avatar: member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    bio: member.bio?.trim() || '',
    skills: Array.isArray(member.skills) ? member.skills : [],
    skillCategories: Array.isArray(member.skillCategories) && member.skillCategories.length > 0 ? member.skillCategories : ['TECH'],
    interests: Array.isArray(member.interests) ? member.interests : [],
    experience: member.experience?.trim() || '',
    canHelpWith: member.canHelpWith?.trim() || 'Frontend development and ideation.',
    lookingFor: member.lookingFor?.trim() || 'Teammates with complementary skills.',
    competitionInterests: Array.isArray(member.competitionInterests) && member.competitionInterests.length > 0 ? member.competitionInterests : ['Tuwaiq Innovation Challenge 2026'],
    contact: {
      email: (member.contact?.email?.trim() || currentAuthUser.email || '').trim(),
      github: member.contact?.github?.trim() || undefined,
      linkedin: member.contact?.linkedin?.trim() || undefined,
      portfolio: member.contact?.portfolio?.trim() || undefined,
      telegram: member.contact?.telegram?.trim() || undefined,
    },
    isAvailableForTeam: typeof member.isAvailableForTeam === 'boolean' ? member.isAvailableForTeam : true,
    createdAt: member.createdAt || new Date().toISOString().split('T')[0],
    ownerUid,
    ownerKey,
  };

  const sanitized = sanitizeForFirestore(payload);

  try {
    await setDoc(docRef, sanitized, { merge: true });
    setMemberOwnerKey(memberId, ownerKey);
  } catch (err: any) {
    console.error('Error saving member to Firestore:', err);
    if (err?.code === 'permission-denied') {
      throw new Error("Permission denied. You can only update your own profile.");
    }
    throw new Error("Your profile couldn't be saved. Please make sure you're signed in and try again.");
  }
}

/**
 * Subscribe to real-time changes in Teams
 */
export function subscribeToTeams(
  onUpdate: (teams: Team[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    const colRef = collection(db, TEAMS_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: Team[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Team;
          if (data && data.id) {
            list.push({
              ...data,
              members: Array.isArray(data.members) ? data.members : [],
              requiredSkills: Array.isArray(data.requiredSkills) ? data.requiredSkills : [],
            });
          }
        });

        // Sort descending by creation
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

        saveStoredTeams(list);
        onUpdate(list);
      },
      (error) => {
        console.warn('Firestore teams subscription error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Could not set up teams listener:', err);
    return () => {};
  }
}

/**
 * Persist or update a team in Firestore
 */
export async function saveTeamToFirestore(team: Team): Promise<void> {
  try {
    const docRef = doc(db, TEAMS_COL, team.id);
    await setDoc(docRef, sanitizeForFirestore(team), { merge: true });
  } catch (err) {
    console.error('Error saving team to Firestore:', err);
  }
}

/**
 * Batch save multiple teams
 */
export async function saveTeamsBatchToFirestore(teamsList: Team[]): Promise<void> {
  if (teamsList.length === 0) return;
  try {
    const batch = writeBatch(db);
    teamsList.forEach((team) => {
      const docRef = doc(db, TEAMS_COL, team.id);
      batch.set(docRef, sanitizeForFirestore(team), { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error('Error saving teams batch to Firestore:', err);
  }
}

/**
 * Subscribe to real-time changes in Invitations
 */
export function subscribeToInvitations(
  onUpdate: (invites: TeamInvitation[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    const colRef = collection(db, INVITATIONS_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: TeamInvitation[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as TeamInvitation;
          if (data && data.id) {
            list.push(data);
          }
        });

        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        saveStoredInvitations(list);
        onUpdate(list);
      },
      (error) => {
        console.warn('Firestore invitations subscription error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Could not set up invitations listener:', err);
    return () => {};
  }
}

/**
 * Persist or update an invitation in Firestore
 */
export async function saveInvitationToFirestore(invite: TeamInvitation): Promise<void> {
  try {
    const docRef = doc(db, INVITATIONS_COL, invite.id);
    await setDoc(docRef, sanitizeForFirestore(invite), { merge: true });
  } catch (err) {
    console.error('Error saving invitation to Firestore:', err);
  }
}

/**
 * Subscribe to bookmarks for the active user
 */
export function subscribeToBookmarks(
  userId: string,
  onUpdate: (bookmarks: string[]) => void
): () => void {
  if (!userId) return () => {};
  try {
    const docRef = doc(db, BOOKMARKS_COL, userId);
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const list = Array.isArray(data?.savedMemberIds) ? data.savedMemberIds : [];
          onUpdate(list);
        }
      },
      (err) => {
        console.warn('Firestore bookmarks subscription note:', err);
      }
    );
  } catch {
    return () => {};
  }
}

/**
 * Save bookmarks in Firestore
 */
export async function saveBookmarksToFirestore(
  userId: string,
  savedMemberIds: string[]
): Promise<void> {
  if (!userId) return;
  try {
    const docRef = doc(db, BOOKMARKS_COL, userId);
    await setDoc(
      docRef,
      {
        userId,
        savedMemberIds,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Error saving bookmarks to Firestore:', err);
  }
}

/**
 * Sync any existing local records to Firestore on startup if Firestore is empty
 */
export async function syncLocalToFirestoreIfEmpty(): Promise<void> {
  try {
    const membersSnap = await getDocs(collection(db, MEMBERS_COL));
    const localMembers = getStoredMembers();
    if (membersSnap.empty && localMembers.length > 0) {
      const batch = writeBatch(db);
      localMembers.forEach((m) => {
        batch.set(doc(db, MEMBERS_COL, m.id), m);
      });
      await batch.commit();
    }

    const teamsSnap = await getDocs(collection(db, TEAMS_COL));
    const localTeams = getStoredTeams();
    if (teamsSnap.empty && localTeams.length > 0) {
      const batch = writeBatch(db);
      localTeams.forEach((t) => {
        batch.set(doc(db, TEAMS_COL, t.id), t);
      });
      await batch.commit();
    }
  } catch (err) {
    console.warn('Local-to-Firestore initial sync check:', err);
  }
}
