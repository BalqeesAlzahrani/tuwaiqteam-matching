import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  writeBatch,
  getDocs,
  query,
  where,
  getDocFromServer,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Member, Team, TeamInvitation } from '../types';
import {
  saveStoredMembers,
  saveStoredTeams,
  saveStoredInvitations,
  getStoredMembers,
  getStoredTeams,
  getMemberOwnerKey,
  setMemberOwnerKey,
  generateOwnerKey,
} from '../data/storage';

const MEMBERS_COL = 'members';
const TEAMS_COL = 'teams';
const INVITATIONS_COL = 'invitations';
const BOOKMARKS_COL = 'bookmarks';

/**
 * Verify network and database connectivity to the provisioned Firestore database
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, MEMBERS_COL, 'connection_probe'));
    return true;
  } catch (err: any) {
    if (err?.message?.includes('the client is offline')) {
      console.warn('Firestore is offline. Check Firebase configuration and network connection.');
      return false;
    }
    return true;
  }
}

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
export function sanitizeForFirestore<T>(data: T): T {
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
 * Persist or update a team in Firestore.
 * Propagates errors to the caller so UI can report confirmed writes or handle failures.
 */
export async function saveTeamToFirestore(team: Team): Promise<void> {
  const currentAuthUser = auth.currentUser;
  if (!currentAuthUser) {
    throw new Error('You must be signed in to save or update a team.');
  }

  const teamWithCreator: Team = {
    ...team,
    creatorUid: team.creatorUid || currentAuthUser.uid,
  };

  try {
    const docRef = doc(db, TEAMS_COL, team.id);
    await setDoc(docRef, sanitizeForFirestore(teamWithCreator), { merge: true });
  } catch (err: any) {
    console.error('Error saving team to Firestore:', err);
    throw err;
  }
}

/**
 * Batch save multiple teams.
 * Propagates errors to the caller so UI only reports success after a confirmed write.
 */
export async function saveTeamsBatchToFirestore(teamsList: Team[]): Promise<void> {
  if (teamsList.length === 0) return;
  const currentAuthUser = auth.currentUser;
  if (!currentAuthUser) {
    throw new Error('You must be signed in to save teams.');
  }

  try {
    const batch = writeBatch(db);
    teamsList.forEach((team) => {
      const docRef = doc(db, TEAMS_COL, team.id);
      const teamWithCreator: Team = {
        ...team,
        creatorUid: team.creatorUid || currentAuthUser.uid,
      };
      batch.set(docRef, sanitizeForFirestore(teamWithCreator), { merge: true });
    });
    await batch.commit();
  } catch (err: any) {
    console.error('Error saving teams batch to Firestore:', err);
    throw err;
  }
}

/**
 * Subscribe to real-time changes in Invitations scoped to the authenticated user
 */
export function subscribeToInvitations(
  onUpdate: (invites: TeamInvitation[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    const currentAuthUser = auth.currentUser;
    if (!currentAuthUser) {
      onUpdate([]);
      return () => {};
    }

    const colRef = collection(db, INVITATIONS_COL);
    const q = query(
      colRef,
      where('participants', 'array-contains', currentAuthUser.uid)
    );

    return onSnapshot(
      q,
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
 * Persist or update an invitation in Firestore.
 * Automatically derives sender ownership, builds participants list, and propagates errors.
 */
export async function saveInvitationToFirestore(invite: TeamInvitation): Promise<void> {
  const currentAuthUser = auth.currentUser;
  if (!currentAuthUser) {
    throw new Error('You must be signed in to send or update an invitation.');
  }

  const senderUid = invite.senderUid || currentAuthUser.uid;
  const participants = Array.from(
    new Set(
      [
        senderUid,
        invite.senderId,
        invite.receiverId,
        invite.receiverUid,
        currentAuthUser.uid,
      ].filter(Boolean) as string[]
    )
  );

  const payload: TeamInvitation = {
    ...invite,
    senderUid,
    participants,
  };

  try {
    const docRef = doc(db, INVITATIONS_COL, invite.id);
    await setDoc(docRef, sanitizeForFirestore(payload), { merge: true });
  } catch (err: any) {
    console.error('Error saving invitation to Firestore:', err);
    throw err;
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
 * Save bookmarks in Firestore.
 * Requires authenticated session, sanitizes payload, and propagates errors.
 */
export async function saveBookmarksToFirestore(
  userId: string,
  savedMemberIds: string[]
): Promise<void> {
  if (!userId) return;
  const currentAuthUser = auth.currentUser;
  if (!currentAuthUser) {
    return;
  }

  try {
    const docRef = doc(db, BOOKMARKS_COL, userId);
    await setDoc(
      docRef,
      sanitizeForFirestore({
        userId,
        savedMemberIds,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
  } catch (err: any) {
    console.error('Error saving bookmarks to Firestore:', err);
    throw err;
  }
}

/**
 * Safely migrate local user data to Firestore on startup.
 * Enforces authenticated user ownership, validates required fields,
 * and sanitizes all payload data to prevent undefined errors or unauthorized writes.
 */
export async function syncLocalToFirestoreIfEmpty(): Promise<void> {
  const currentAuthUser = auth.currentUser;
  if (!currentAuthUser || !currentAuthUser.uid) {
    // Unauthenticated sessions must never write to Firestore
    return;
  }

  try {
    const userUid = currentAuthUser.uid;
    const userEmail = currentAuthUser.email?.toLowerCase();

    // 1. Safe migration for user's own member profile if not yet in Firestore
    const localMembers = getStoredMembers();
    const userLocalProfile = localMembers.find(
      (m) =>
        m.ownerUid === userUid ||
        (userEmail && m.contact?.email?.toLowerCase() === userEmail)
    );

    if (userLocalProfile && userLocalProfile.name?.trim() && Array.isArray(userLocalProfile.skills) && userLocalProfile.skills.length > 0) {
      const profileToSync: Member = {
        ...userLocalProfile,
        ownerUid: userUid,
      };
      const memberId = profileToSync.id || `mem-${userUid.substring(0, 10)}`;
      await setDoc(doc(db, MEMBERS_COL, memberId), sanitizeForFirestore(profileToSync), { merge: true });
    }

    // 2. Safe migration for teams created by this user
    const localTeams = getStoredTeams();
    const userCreatedTeams = localTeams.filter(
      (t) =>
        (t.creatorUid === userUid || (userLocalProfile && t.creatorId === userLocalProfile.id)) &&
        t.name &&
        t.id
    );

    if (userCreatedTeams.length > 0) {
      for (const t of userCreatedTeams) {
        const teamToSync: Team = {
          ...t,
          creatorUid: userUid,
        };
        await setDoc(doc(db, TEAMS_COL, t.id), sanitizeForFirestore(teamToSync), { merge: true });
      }
    }
  } catch (err) {
    console.warn('Local-to-Firestore safe migration note:', err);
  }
}
