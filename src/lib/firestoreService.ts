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
 * Persist or update a member profile in Firestore
 */
export async function saveMemberProfile(member: Member): Promise<void> {
  const docRef = doc(db, MEMBERS_COL, member.id);

  // Retrieve or generate secure device owner token for this profile
  let ownerKey = member.ownerKey || getMemberOwnerKey(member.id);
  if (!ownerKey) {
    ownerKey = generateOwnerKey();
  }

  const payload: Member = {
    ...member,
    ownerKey,
    ownerUid: auth.currentUser?.uid || member.ownerUid,
  };

  try {
    await setDoc(docRef, payload, { merge: true });
    setMemberOwnerKey(member.id, ownerKey);
  } catch (err) {
    console.error('Error saving member to Firestore:', err);
    throw err;
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
    await setDoc(docRef, team, { merge: true });
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
      batch.set(docRef, team, { merge: true });
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
    await setDoc(docRef, invite, { merge: true });
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
