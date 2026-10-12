import React, { useState } from 'react';
import { Member, Team, TeamInvitation } from '../types';
import { NavSection } from './Navbar';
import {
  Users,
  Trophy,
  Mail,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowUpRight,
  Clock,
  Sparkles,
  Bookmark,
  Share2,
} from 'lucide-react';

interface MyTeamsViewProps {
  currentUser: Member | null;
  allMembers: Member[];
  teams: Team[];
  invitations: TeamInvitation[];
  bookmarks: string[];
  onAcceptInvite: (invitationId: string) => void;
  onDeclineInvite: (invitationId: string) => void;
  onNavigate: (section: NavSection) => void;
  onViewProfile: (member: Member) => void;
  onOpenProfileSetup?: () => void;
}

export const MyTeamsView: React.FC<MyTeamsViewProps> = ({
  currentUser,
  allMembers,
  teams,
  invitations,
  bookmarks,
  onAcceptInvite,
  onDeclineInvite,
  onNavigate,
  onViewProfile,
  onOpenProfileSetup,
}) => {
  const [activeTab, setActiveTab] = useState<'my_teams' | 'invitations' | 'bookmarks'>('my_teams');

  // Teams created by current user
  const createdTeams = currentUser ? teams.filter((t) => t.creatorId === currentUser.id) : [];

  // Teams user is a member of (including created)
  const joinedTeams = currentUser
    ? teams.filter((t) => t.members.some((m) => m.memberId === currentUser.id))
    : [];

  // Received invitations for current user
  const receivedInvites = currentUser
    ? invitations.filter((inv) => inv.receiverId === currentUser.id)
    : [];

  // Sent invitations from current user
  const sentInvites = currentUser
    ? invitations.filter((inv) => inv.senderId === currentUser.id)
    : [];

  // Bookmarked members
  const bookmarkedMembers = allMembers.filter((m) => bookmarks.includes(m.id));

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-200">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 p-6 sm:p-8 border border-purple-500/40 shadow-xl shadow-purple-950/60">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>Personal Collaboration Hub</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            My Teams & Connections
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Manage squads you lead, review incoming invitations, and check your saved teammate shortlists.
          </p>
        </div>
      </div>

      {/* Guest Banner if no user profile yet */}
      {!currentUser && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#1d0e3a] border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Browsing as Guest</h4>
              <p className="text-xs text-slate-300">Create your student profile to lead teams, receive squad invites, and bookmark teammates.</p>
            </div>
          </div>
          {onOpenProfileSetup && (
            <button
              onClick={onOpenProfileSetup}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs whitespace-nowrap shadow-lg active:scale-95"
            >
              + Create Student Profile
            </button>
          )}
        </div>
      )}

      {/* TABS */}
      <div className="flex border-b border-purple-900/50 gap-3 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('my_teams')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'my_teams'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>My Squads ({joinedTeams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('invitations')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'invitations'
              ? 'border-pink-400 text-pink-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Invitations Inbox</span>
          {receivedInvites.filter((i) => i.status === 'pending').length > 0 && (
            <span className="w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] font-black flex items-center justify-center">
              {receivedInvites.filter((i) => i.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'bookmarks'
              ? 'border-purple-400 text-purple-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Members ({bookmarkedMembers.length})</span>
        </button>
      </div>

      {/* TAB 1: MY TEAMS */}
      {activeTab === 'my_teams' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Active Formed Squads ({joinedTeams.length})
            </h3>
            <button
              onClick={() => onNavigate('build_team')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Squad</span>
            </button>
          </div>

          {joinedTeams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {joinedTeams.map((team) => (
                <div
                  key={team.id}
                  className="p-6 rounded-3xl bg-[#180d31] border border-purple-800/40 space-y-4 shadow-xl shadow-purple-950/40"
                >
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-purple-900/40">
                    <div>
                      <h4 className="font-extrabold text-white text-lg">{team.name}</h4>
                      <p className="text-xs text-purple-300">{team.competition}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                      {team.balanceScore}% Balance
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{team.description}</p>

                  {/* Member Roster Chips */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Roster ({team.members.length}/{team.maxMembers})
                    </div>
                    <div className="space-y-2">
                      {team.members.map((tm) => {
                        const mem = allMembers.find((m) => m.id === tm.memberId);
                        if (!mem) return null;
                        return (
                          <div
                            key={tm.memberId}
                            onClick={() => onViewProfile(mem)}
                            className="p-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/40 cursor-pointer border border-purple-800/30 flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={mem.avatar}
                                alt={mem.name}
                                className="w-8 h-8 rounded-lg object-cover ring-1 ring-purple-400"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-white truncate block">
                                  {mem.name}
                                </span>
                                <span className="text-[10px] text-slate-400 block truncate">
                                  {tm.role}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] text-cyan-300 font-semibold">
                              {mem.major.split(' ')[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-purple-900/40 flex items-center justify-between text-xs text-slate-400">
                    <span>Created by {team.creatorName}</span>
                    <button
                      onClick={() => onNavigate('build_team')}
                      className="text-cyan-400 font-bold hover:underline"
                    >
                      Manage Roster →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-[#170a2f] border border-purple-800/40 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-purple-900/40 border border-purple-700/50 mx-auto flex items-center justify-center text-purple-400">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">You haven't formed a team yet</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Use our Team Builder or Matchmaker to find complementary members and register your squad for Tuwaiq Club challenges.
              </p>
              <button
                onClick={() => onNavigate('build_team')}
                className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold shadow-lg"
              >
                Create Your First Team
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INVITATIONS */}
      {activeTab === 'invitations' && (
        <div className="space-y-8">
          {/* Received Invitations */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-pink-400" />
              <span>Received Invitations ({receivedInvites.length})</span>
            </h3>

            {receivedInvites.length > 0 ? (
              <div className="space-y-3">
                {receivedInvites.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-5 rounded-3xl bg-[#180d31] border border-purple-800/40 space-y-3 shadow-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{inv.teamName}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              inv.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                                : inv.status === 'accepted'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-red-500/20 text-red-300 border border-red-500/40'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Invited by <strong className="text-purple-200">{inv.senderName}</strong> for role:{' '}
                          <strong className="text-cyan-300">{inv.roleProposed}</strong>
                        </p>
                      </div>

                      {inv.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onAcceptInvite(inv.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-transform active:scale-95"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => onDeclineInvite(inv.id)}
                            className="px-4 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-slate-400 hover:text-red-300 text-xs font-semibold border border-purple-800/40"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>

                    {inv.message && (
                      <p className="text-xs text-slate-300 bg-purple-950/40 p-3 rounded-2xl border border-purple-900/40 italic">
                        "{inv.message}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-purple-950/30 border border-purple-900/40 text-xs text-slate-400">
                No incoming invitations right now.
              </div>
            )}
          </div>

          {/* Sent Invitations */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>Sent Invitations ({sentInvites.length})</span>
            </h3>

            {sentInvites.length > 0 ? (
              <div className="space-y-3">
                {sentInvites.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-2xl bg-purple-950/50 border border-purple-900/40 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">
                        Invited {inv.receiverName} to {inv.teamName}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Proposed Role: {inv.roleProposed} • Sent on {inv.createdAt}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        inv.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-purple-950/30 border border-purple-900/40 text-xs text-slate-400">
                You haven't sent any team invitations yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BOOKMARKS */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Bookmarked Teammates ({bookmarkedMembers.length})
            </h3>
            <button
              onClick={() => onNavigate('directory')}
              className="text-xs text-cyan-400 hover:underline font-bold"
            >
              Browse More Members →
            </button>
          </div>

          {bookmarkedMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookmarkedMembers.map((member) => (
                <div
                  key={member.id}
                  onClick={() => onViewProfile(member)}
                  className="p-4 rounded-2xl bg-[#180d31] hover:bg-[#221245] border border-purple-800/40 hover:border-purple-400/50 cursor-pointer transition-all space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-purple-400"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{member.name}</h4>
                      <p className="text-xs text-purple-300 truncate">{member.major}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {member.bio}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {member.skills.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950 text-purple-200 border border-purple-800/40"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-[#170a2f] border border-purple-800/40 space-y-3 max-w-md mx-auto">
              <Bookmark className="w-8 h-8 text-purple-400 mx-auto" />
              <h4 className="text-base font-bold text-white">No saved members</h4>
              <p className="text-xs text-slate-300">
                Click the bookmark star on member cards in the directory to save them to your shortlist.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
