import React, { useState } from 'react';
import { Member, Team, TeamInvitation } from '../types';
import { X, Send, Plus, Users, Sparkles, CheckCircle2 } from 'lucide-react';

interface InviteModalProps {
  isOpen?: boolean;
  targetMember: Member | null;
  currentUser: Member;
  userTeams?: Team[];
  availableTeams?: Team[];
  onSendInvite?: (invitation: TeamInvitation) => void;
  onSendInvitation?: (invitationData: Omit<TeamInvitation, 'id' | 'createdAt' | 'status'>) => void;
  onNavigateToBuildTeam?: () => void;
  onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen = true,
  targetMember,
  currentUser,
  userTeams,
  availableTeams,
  onSendInvite,
  onSendInvitation,
  onNavigateToBuildTeam,
  onClose,
}) => {
  if (!targetMember || !isOpen) return null;

  const effectiveTeams: Team[] = availableTeams || userTeams || [];

  const [selectedTeamId, setSelectedTeamId] = useState(
    effectiveTeams.length > 0 ? effectiveTeams[0].id : 'create_new'
  );
  const [roleProposed, setRoleProposed] = useState(
    targetMember.skillCategories?.includes('TECH')
      ? 'Lead Developer'
      : targetMember.skillCategories?.includes('DESIGN')
      ? 'UI/UX Designer'
      : targetMember.skillCategories?.includes('BUSINESS')
      ? 'Business & Pitch Lead'
      : 'Marketing & PR Lead'
  );
  const [message, setMessage] = useState(
    `Hey ${targetMember.name}! We saw your impressive profile on Tuwaiq TeamMatch and would love to have your skills on our squad.`
  );
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTeamId === 'create_new') {
      onClose();
      if (onNavigateToBuildTeam) onNavigateToBuildTeam();
      return;
    }

    const team = effectiveTeams.find((t) => t.id === selectedTeamId);
    if (!team) return;

    if (onSendInvitation) {
      onSendInvitation({
        teamId: team.id,
        teamName: team.name,
        senderId: currentUser.id,
        senderName: currentUser.name,
        receiverId: targetMember.id,
        receiverName: targetMember.name,
        receiverUid: targetMember.ownerUid,
        roleProposed: roleProposed.trim(),
        message: message.trim(),
      });
    } else if (onSendInvite) {
      const newInvite: TeamInvitation = {
        id: `inv-${Date.now()}`,
        teamId: team.id,
        teamName: team.name,
        senderId: currentUser.id,
        senderName: currentUser.name,
        receiverId: targetMember.id,
        receiverName: targetMember.name,
        receiverUid: targetMember.ownerUid,
        roleProposed: roleProposed.trim(),
        status: 'pending',
        message: message.trim(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      onSendInvite(newInvite);
    }

    setIsSent(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#180d31] border border-purple-500/40 rounded-3xl shadow-2xl shadow-purple-950/90 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 p-5 flex items-center justify-between border-b border-purple-800/40">
          <div className="flex items-center gap-3">
            <img
              src={targetMember.avatar}
              alt={targetMember.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-purple-400"
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="font-bold text-white text-base">Invite {targetMember.name}</h3>
              <p className="text-xs text-purple-300 font-tajawal">{targetMember.major}</p>
            </div>
          </div>

          <button
            id="btn-close-invite-modal"
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSent ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-white">Invitation Sent!</h4>
            <p className="text-xs text-slate-300">
              {targetMember.name} will receive your invitation in their Tuwaiq TeamMatch inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Select Team */}
            <div>
              <label className="block text-xs font-bold text-purple-200 uppercase mb-1.5">
                Select Your Team
              </label>
              {effectiveTeams.length > 0 ? (
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#221245] border border-purple-800/60 text-white focus:outline-none focus:border-cyan-400 text-sm"
                >
                  {effectiveTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({(t.members || []).length}/{t.maxMembers} members)
                    </option>
                  ))}
                  <option value="create_new">+ Create New Team With {targetMember.name}</option>
                </select>
              ) : (
                <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-800/50 text-xs text-purple-200 flex items-center justify-between">
                  <span>You don't have an active team yet.</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onNavigateToBuildTeam) onNavigateToBuildTeam();
                    }}
                    className="text-cyan-300 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Create Team Now</span>
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Proposed Role */}
            <div>
              <label className="block text-xs font-bold text-purple-200 uppercase mb-1.5">
                Proposed Role on Team
              </label>
              <input
                type="text"
                required
                value={roleProposed}
                onChange={(e) => setRoleProposed(e.target.value)}
                placeholder="Enter proposed role on team"
                className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold text-purple-200 uppercase mb-1.5">
                Invitation Message
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a friendly personal note about why their skills complement your vision..."
                className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
              />
            </div>

            {/* Synergy preview */}
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>
                {targetMember.name} brings skills in <strong className="text-purple-200">{targetMember.skills.slice(0, 3).join(', ')}</strong>.
              </span>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-transparent hover:bg-purple-950 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                id="btn-submit-invitation"
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-900/50 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Team Invitation</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
