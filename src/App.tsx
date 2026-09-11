import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Member, Team, TeamInvitation } from './types';
import {
  getStoredMembers,
  getStoredTeams,
  getStoredCurrentUser,
  getStoredInvitations,
  getStoredBookmarks,
  getCurrentUserId,
  setCurrentUserId,
  removeStoredCurrentUser,
  saveStoredMembers,
  saveStoredTeams,
  saveStoredCurrentUser,
  saveStoredInvitations,
  saveStoredBookmarks,
} from './data/storage';
import {
  subscribeToMembers,
  saveMemberProfile,
  subscribeToTeams,
  saveTeamToFirestore,
  saveTeamsBatchToFirestore,
  subscribeToInvitations,
  saveInvitationToFirestore,
  subscribeToBookmarks,
  saveBookmarksToFirestore,
  syncLocalToFirestoreIfEmpty,
} from './lib/firestoreService';
import {
  subscribeToAuth,
  signOutCurrentUser,
} from './lib/authService';
import { Navbar, NavSection } from './components/Navbar';
import { HeroDashboard } from './components/HeroDashboard';
import { MemberDirectory } from './components/MemberDirectory';
import { FindMyTeam } from './components/FindMyTeam';
import { TeamBuilder } from './components/TeamBuilder';
import { TeamGeneratorView } from './components/TeamGeneratorView';
import { SkillMap } from './components/SkillMap';
import { MyTeamsView } from './components/MyTeamsView';
import { OrganizerDashboard } from './components/OrganizerDashboard';
import { MemberProfileModal } from './components/MemberProfileModal';
import { ProfileSetupModal } from './components/ProfileSetupModal';
import { InviteModal } from './components/InviteModal';
import { SignInModal } from './components/SignInModal';
import { TuwaiqLogo } from './components/TuwaiqLogo';
import {
  Heart,
  Sparkles,
  Layers,
  Users,
  Compass,
  Trophy,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  // Navigation State
  const [currentSection, setCurrentSection] = useState<NavSection>('home');

  // Core Data States
  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Modals & Overlay States
  const [viewingProfileMember, setViewingProfileMember] = useState<Member | null>(null);
  const [invitingMember, setInvitingMember] = useState<Member | null>(null);
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize Data: Firestore & Firebase Auth
  useEffect(() => {
    // 1. Load active member session & bookmarks for this device
    const loadedUser = getStoredCurrentUser();
    const loadedBookmarks = getStoredBookmarks();
    if (loadedUser) setCurrentUser(loadedUser);
    setBookmarks(loadedBookmarks);

    // 2. Initialize Firestore collections if freshly provisioned
    syncLocalToFirestoreIfEmpty();

    // 3. Real-time Firebase Auth state listener
    const unsubAuth = subscribeToAuth((user) => {
      setAuthUser(user);
      if (user) {
        // If authenticated, sync with their Firestore member profile
        setMembers((prevMembers) => {
          const match = prevMembers.find(
            (m) =>
              m.ownerUid === user.uid ||
              (user.email && m.contact?.email?.toLowerCase() === user.email.toLowerCase())
          );
          if (match) {
            setCurrentUser(match);
            setCurrentUserId(match.id);
            saveStoredCurrentUser(match);
          }
          return prevMembers;
        });
      }
    });

    // 4. Real-time Firestore subscriptions for live multi-user sync
    const unsubMembers = subscribeToMembers((remoteMembers) => {
      setMembers(remoteMembers);
      // Synchronize active user state if updated in Firestore
      const currentId = getCurrentUserId();
      if (currentId) {
        const found = remoteMembers.find((m) => m.id === currentId);
        if (found) setCurrentUser(found);
      }
    });

    const unsubTeams = subscribeToTeams((remoteTeams) => {
      setTeams(remoteTeams);
    });

    const unsubInvites = subscribeToInvitations((remoteInvites) => {
      setInvitations(remoteInvites);
    });

    return () => {
      unsubAuth();
      unsubMembers();
      unsubTeams();
      unsubInvites();
    };
  }, []);

  // Sync user-specific bookmarks with Firestore
  useEffect(() => {
    if (!currentUser?.id) return;
    const unsubBookmarks = subscribeToBookmarks(currentUser.id, (remoteBookmarks) => {
      setBookmarks(remoteBookmarks);
      saveStoredBookmarks(remoteBookmarks);
    });
    return () => {
      unsubBookmarks();
    };
  }, [currentUser?.id]);

  // Show quick toast notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Guarded handler to open profile setup/edit modal
  const handleOpenProfileSetup = () => {
    if (!authUser) {
      triggerToast('Please sign in or create an account with Firebase Authentication first.');
      setIsSignInOpen(true);
      return;
    }
    setIsProfileSetupOpen(true);
  };

  // Profile Setup / Edit handler with ownership validation & direct Firestore persistence
  const handleSaveProfile = async (updatedProfile: Member) => {
    if (!authUser) {
      triggerToast('⚠️ You must be signed in with Firebase Authentication to save a profile.');
      setIsSignInOpen(true);
      return;
    }

    // Security restriction: Members can only edit their own profile
    if (updatedProfile.ownerUid && updatedProfile.ownerUid !== authUser.uid) {
      triggerToast('⚠️ Permission Denied: You can only edit your own profile.');
      return;
    }

    // Ensure ownerUid is strictly the authenticated Firebase UID
    const profileToSave: Member = {
      ...updatedProfile,
      ownerUid: authUser.uid,
    };

    try {
      // 1. Direct persistent write to Firebase Firestore
      await saveMemberProfile(profileToSave);

      // 2. Set this member as current active user
      setCurrentUser(profileToSave);
      setCurrentUserId(profileToSave.id);
      saveStoredCurrentUser(profileToSave);

      triggerToast('✓ Profile successfully saved to Firestore!');
    } catch (err: any) {
      console.error('Error saving profile to Firestore:', err);
      triggerToast('⚠️ Could not save profile: ' + (err?.message || 'Permission denied'));
      throw err;
    }
  };

  // Auth Success handler
  const handleAuthSuccess = (user: User) => {
    setAuthUser(user);
    // Check if user has an existing member profile in the directory
    const existing = members.find(
      (m) =>
        m.ownerUid === user.uid ||
        (user.email && m.contact?.email?.toLowerCase() === user.email.toLowerCase())
    );

    if (existing) {
      const activeMember: Member = {
        ...existing,
        ownerUid: user.uid,
      };
      setCurrentUser(activeMember);
      setCurrentUserId(activeMember.id);
      saveStoredCurrentUser(activeMember);
      triggerToast(`Welcome back, ${existing.name}!`);
    } else {
      triggerToast('Signed in successfully! Please complete your Tuwaiq student profile.');
      setIsProfileSetupOpen(true);
    }
  };

  // Sign Out handler
  const handleSignOut = async () => {
    try {
      await signOutCurrentUser();
    } catch (e) {
      console.error('Sign out error:', e);
    }
    setAuthUser(null);
    setCurrentUser(null);
    setCurrentUserId(null);
    removeStoredCurrentUser();
    triggerToast('Signed out of Tuwaiq account.');
  };

  // Toggle Bookmark handler
  const handleToggleBookmark = (memberId: string) => {
    let nextBookmarks: string[];
    if (bookmarks.includes(memberId)) {
      nextBookmarks = bookmarks.filter((id) => id !== memberId);
      triggerToast('Removed from saved members');
    } else {
      nextBookmarks = [...bookmarks, memberId];
      triggerToast('⭐ Saved member to your shortlist!');
    }
    setBookmarks(nextBookmarks);
    saveStoredBookmarks(nextBookmarks);
    if (currentUser?.id) {
      saveBookmarksToFirestore(currentUser.id, nextBookmarks);
    }
  };

  // Send Invitation handler
  const handleSendInvite = (invitationData: Omit<TeamInvitation, 'id' | 'createdAt' | 'status'>) => {
    const newInvitation: TeamInvitation = {
      ...invitationData,
      id: `inv-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'pending',
    };

    const nextInvitations = [newInvitation, ...invitations];
    setInvitations(nextInvitations);
    saveStoredInvitations(nextInvitations);
    saveInvitationToFirestore(newInvitation);

    triggerToast(`🚀 Invitation sent to ${invitationData.receiverName}!`);
  };

  // Accept Invitation handler
  const handleAcceptInvite = (invitationId: string) => {
    const invite = invitations.find((i) => i.id === invitationId);
    if (!invite || !currentUser) return;

    // Update invitation status
    const updatedInvite: TeamInvitation = { ...invite, status: 'accepted' };
    const nextInvites = invitations.map((i) =>
      i.id === invitationId ? updatedInvite : i
    );
    setInvitations(nextInvites);
    saveStoredInvitations(nextInvites);
    saveInvitationToFirestore(updatedInvite);

    // Add user to team
    let updatedTeam: Team | null = null;
    const nextTeams = teams.map((t) => {
      if (t.id === invite.teamId || t.name === invite.teamName) {
        if (!t.members.some((m) => m.memberId === currentUser.id)) {
          const modTeam = {
            ...t,
            members: [
              ...t.members,
              {
                memberId: currentUser.id,
                role: invite.roleProposed,
                category: currentUser.skillCategories[0] || 'TECH',
              },
            ],
          };
          updatedTeam = modTeam;
          return modTeam;
        }
      }
      return t;
    });

    setTeams(nextTeams);
    saveStoredTeams(nextTeams);
    if (updatedTeam) {
      saveTeamToFirestore(updatedTeam);
    }
    triggerToast(`🎉 Joined ${invite.teamName}!`);
  };

  // Decline Invitation handler
  const handleDeclineInvite = (invitationId: string) => {
    const invite = invitations.find((i) => i.id === invitationId);
    if (invite) {
      const updatedInvite: TeamInvitation = { ...invite, status: 'declined' };
      const nextInvites = invitations.map((i) =>
        i.id === invitationId ? updatedInvite : i
      );
      setInvitations(nextInvites);
      saveStoredInvitations(nextInvites);
      saveInvitationToFirestore(updatedInvite);
      triggerToast('Invitation declined');
    }
  };

  // Save Assembled Team
  const handleSaveTeam = (newTeam: Team) => {
    const nextTeams = [newTeam, ...teams.filter((t) => t.id !== newTeam.id)];
    setTeams(nextTeams);
    saveStoredTeams(nextTeams);
    saveTeamToFirestore(newTeam);
    triggerToast(`🏆 Team "${newTeam.name}" assembled and registered!`);
  };

  // Save Generated Teams in Batch
  const handleSaveGeneratedTeams = (generatedTeams: Team[]) => {
    const nextTeams = [...generatedTeams, ...teams];
    setTeams(nextTeams);
    saveStoredTeams(nextTeams);
    saveTeamsBatchToFirestore(generatedTeams);
    triggerToast(`✓ Saved ${generatedTeams.length} balanced teams!`);
  };

  // Open invite modal for a member
  const handleOpenInvite = (member: Member) => {
    setInvitingMember(member);
  };

  // Count pending invitations for user
  const pendingInvites = currentUser
    ? invitations.filter(
        (i) => i.receiverId === currentUser.id && i.status === 'pending'
      )
    : [];
  const pendingInvitesCount = pendingInvites.length;

  return (
    <div className="min-h-screen bg-[#0d051d] text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* GLOBAL TOAST BANNER */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs sm:text-sm shadow-2xl shadow-purple-950 flex items-center gap-2 border border-white/20">
            <Sparkles className="w-4 h-4 text-yellow-300 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* TOP NAVIGATION BAR */}
      <Navbar
        currentSection={currentSection}
        onNavigate={setCurrentSection}
        currentUser={currentUser}
        authUser={authUser}
        allMembers={members}
        onOpenProfileSetup={handleOpenProfileSetup}
        onOpenSignIn={() => setIsSignInOpen(true)}
        onSignOut={handleSignOut}
        pendingInvitations={pendingInvites}
        pendingInvitesCount={pendingInvitesCount}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentSection === 'home' && (
          <HeroDashboard
            members={members}
            teams={teams}
            currentUser={currentUser}
            onNavigate={setCurrentSection}
            onOpenProfileSetup={handleOpenProfileSetup}
            onViewMemberProfile={(m) => setViewingProfileMember(m)}
          />
        )}

        {currentSection === 'directory' && (
          <MemberDirectory
            members={members}
            currentUser={currentUser}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onViewProfile={(m) => setViewingProfileMember(m)}
            onInvite={handleOpenInvite}
            onOpenRegister={handleOpenProfileSetup}
          />
        )}

        {currentSection === 'find_match' && (
          <FindMyTeam
            members={members}
            currentUser={currentUser}
            onViewProfile={(m) => setViewingProfileMember(m)}
            onInvite={handleOpenInvite}
            onOpenProfileSetup={handleOpenProfileSetup}
          />
        )}

        {currentSection === 'build_team' && (
          <TeamBuilder
            members={members}
            currentUser={currentUser}
            existingTeams={teams}
            onSaveTeam={handleSaveTeam}
            onViewProfile={(m) => setViewingProfileMember(m)}
          />
        )}

        {currentSection === 'team_generator' && (
          <TeamGeneratorView
            members={members}
            onSaveGeneratedTeams={handleSaveGeneratedTeams}
            onViewProfile={(m) => setViewingProfileMember(m)}
          />
        )}

        {currentSection === 'skill_map' && (
          <SkillMap
            members={members}
            onViewProfile={(m) => setViewingProfileMember(m)}
            onInvite={handleOpenInvite}
          />
        )}

        {currentSection === 'my_teams' && (
          <MyTeamsView
            currentUser={currentUser}
            allMembers={members}
            teams={teams}
            invitations={invitations}
            bookmarks={bookmarks}
            onAcceptInvite={handleAcceptInvite}
            onDeclineInvite={handleDeclineInvite}
            onNavigate={setCurrentSection}
            onViewProfile={(m) => setViewingProfileMember(m)}
            onOpenProfileSetup={handleOpenProfileSetup}
          />
        )}

        {currentSection === 'organizer' && (
          <OrganizerDashboard
            members={members}
            teams={teams}
            onNavigate={setCurrentSection}
            onViewProfile={(m) => setViewingProfileMember(m)}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-purple-900/40 bg-[#090314] py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <TuwaiqLogo className="w-9 h-9" />
            <div>
              <div className="font-extrabold text-white text-sm">Tuwaiq TeamMatch</div>
              <div className="text-[11px] text-purple-300 font-tajawal">
                نادي طويق • Tuwaiq Club
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold">
            <button
              onClick={() => setCurrentSection('home')}
              className="hover:text-cyan-300 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => setCurrentSection('directory')}
              className="hover:text-cyan-300 transition-colors"
            >
              Member Directory
            </button>
            <button
              onClick={() => setCurrentSection('find_match')}
              className="hover:text-cyan-300 transition-colors"
            >
              Find Teammates
            </button>
            <button
              onClick={() => setCurrentSection('build_team')}
              className="hover:text-cyan-300 transition-colors"
            >
              Team Builder
            </button>
            <button
              onClick={() => setCurrentSection('skill_map')}
              className="hover:text-cyan-300 transition-colors"
            >
              Skill Radar
            </button>
            <button
              onClick={() => setCurrentSection('organizer')}
              className="hover:text-cyan-300 transition-colors"
            >
              Track Leadership
            </button>
          </div>

          <div className="text-center md:text-right space-y-1">
            <div className="text-[11px] text-purple-300/80">
              "مهاراتك. مهاراتهم. فريق واحد."
            </div>
            <div className="text-[10px] text-slate-500">
              Tuwaiq Club © 2026
            </div>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Member Profile Modal */}
      {viewingProfileMember && (
        <MemberProfileModal
          member={viewingProfileMember}
          currentUser={currentUser}
          isOpen={!!viewingProfileMember}
          onClose={() => setViewingProfileMember(null)}
          onInvite={handleOpenInvite}
          onEdit={() => {
            setViewingProfileMember(null);
            handleOpenProfileSetup();
          }}
          isBookmarked={bookmarks.includes(viewingProfileMember.id)}
          onToggleBookmark={handleToggleBookmark}
        />
      )}

      {/* 2. Profile Setup Modal */}
      {isProfileSetupOpen && (
        <ProfileSetupModal
          isOpen={isProfileSetupOpen}
          onClose={() => setIsProfileSetupOpen(false)}
          currentProfile={currentUser}
          initialMember={currentUser}
          authUser={authUser}
          onSaveProfile={handleSaveProfile}
          onSave={handleSaveProfile}
        />
      )}

      {/* 3. Team Invite Modal */}
      {invitingMember && (
        <InviteModal
          isOpen={!!invitingMember}
          onClose={() => setInvitingMember(null)}
          targetMember={invitingMember}
          currentUser={currentUser}
          availableTeams={teams}
          onSendInvitation={handleSendInvite}
          onNavigateToBuildTeam={() => setCurrentSection('build_team')}
        />
      )}

      {/* 4. Member Sign In Modal */}
      {isSignInOpen && (
        <SignInModal
          isOpen={isSignInOpen}
          onClose={() => setIsSignInOpen(false)}
          members={members}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
