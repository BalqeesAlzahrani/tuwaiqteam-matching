import React, { useState, useMemo } from 'react';
import { Member, Team, SkillCategory, TeamMemberRole } from '../types';
import { calculateTeamBalance } from '../utils/matching';
import { SKILL_CATEGORIES_DATA, DEFAULT_COMPETITIONS } from '../data/mockData';
import confetti from 'canvas-confetti';
import {
  Layers,
  Sparkles,
  UserPlus,
  Trash2,
  Trophy,
  Dices,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Plus,
  Users,
  Share2,
  Copy,
  Check,
} from 'lucide-react';

interface TeamBuilderProps {
  members: Member[];
  currentUser: Member | null;
  existingTeams: Team[];
  onSaveTeam: (team: Team) => void;
  onViewProfile: (member: Member) => void;
  onOpenProfileSetup?: () => void;
}

const FUN_NAMES = [
  'Team Nova',
  'ByteSparks',
  'Tuwaiq Falcons',
  'Apex Pioneers',
  'Tuwaiq Innovators',
  'NeuralForge',
  'PixelCrafters',
  'Quantum Venture',
  'Summit Squad',
  'CyberGuardians',
];

export const TeamBuilder: React.FC<TeamBuilderProps> = ({
  members,
  currentUser,
  existingTeams,
  onSaveTeam,
  onViewProfile,
  onOpenProfileSetup,
}) => {
  // New Team Form State
  const [teamName, setTeamName] = useState('');
  const [competition, setCompetition] = useState(DEFAULT_COMPETITIONS[0]?.title || 'Tuwaiq Innovation Challenge');
  const [description, setDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState(4);
  const [teamMembers, setTeamMembers] = useState<TeamMemberRole[]>(() => {
    if (!currentUser) return [];
    return [
      {
        memberId: currentUser.id,
        role: currentUser.skillCategories.includes('TECH')
          ? 'Lead Developer'
          : currentUser.skillCategories.includes('DESIGN')
          ? 'Lead UI/UX'
          : currentUser.skillCategories.includes('BUSINESS')
          ? 'Business Lead'
          : 'Team Lead',
        category: currentUser.skillCategories[0] || 'TECH',
      },
    ];
  });
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [isSavedRecently, setIsSavedRecently] = useState(false);
  const [copiedRoster, setCopiedRoster] = useState(false);

  // Randomize Team Name
  const handleRandomizeName = () => {
    const randomIndex = Math.floor(Math.random() * FUN_NAMES.length);
    setTeamName(FUN_NAMES[randomIndex]);
  };

  // Resolve team member objects
  const fullMemberObjects = useMemo(() => {
    return teamMembers
      .map((tm) => members.find((m) => m.id === tm.memberId))
      .filter((m): m is Member => !!m);
  }, [teamMembers, members]);

  // Compute live Team Balance
  const balanceInfo = useMemo(() => {
    return calculateTeamBalance(fullMemberObjects, requiredSkills);
  }, [fullMemberObjects, requiredSkills]);

  // Add a member to team
  const handleAddMember = (member: Member, defaultRole?: string) => {
    if (teamMembers.some((tm) => tm.memberId === member.id)) return;
    if (teamMembers.length >= maxMembers) return;

    let role = defaultRole || 'Team Member';
    if (!defaultRole) {
      if (member.skillCategories.includes('TECH')) role = 'Developer / AI Engineer';
      else if (member.skillCategories.includes('DESIGN')) role = 'UI/UX & Product Design';
      else if (member.skillCategories.includes('BUSINESS')) role = 'Business & Pitch Lead';
      else role = 'Marketing & Communications';
    }

    setTeamMembers([
      ...teamMembers,
      {
        memberId: member.id,
        role,
        category: member.skillCategories[0] || 'TECH',
      },
    ]);
  };

  // Remove a member from team
  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(teamMembers.filter((tm) => tm.memberId !== memberId));
  };

  // Change member role
  const handleUpdateRole = (memberId: string, newRole: string) => {
    setTeamMembers(
      teamMembers.map((tm) => (tm.memberId === memberId ? { ...tm, role: newRole } : tm))
    );
  };

  // Missing Skill Teammate Recommendations
  const missingSkillTeammates = useMemo(() => {
    if (balanceInfo.missingCategories.length === 0) return [];
    const neededCat = balanceInfo.missingCategories[0];

    return members
      .filter((m) => !teamMembers.some((tm) => tm.memberId === m.id))
      .filter((m) => m.skillCategories.includes(neededCat))
      .slice(0, 4);
  }, [balanceInfo.missingCategories, members, teamMembers]);

  // Save Team Handler
  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    if (!currentUser) {
      if (onOpenProfileSetup) {
        onOpenProfileSetup();
      }
      return;
    }

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: teamName.trim(),
      competition,
      description: description.trim(),
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      creatorUid: currentUser.ownerUid,
      members: teamMembers,
      maxMembers,
      requiredSkills,
      balanceScore: balanceInfo.score,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onSaveTeam(newTeam);
    setIsSavedRecently(true);

    // Trigger celebratory confetti animation!
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#06b6d4', '#ec4899', '#10b981', '#ffffff'],
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setIsSavedRecently(false);
    }, 3000);
  };

  // Copy roster to clipboard
  const handleCopyRoster = () => {
    const lines = [
      `🚀 ${teamName}`,
      `🏆 Competition: ${competition}`,
      `📊 Team Balance: ${balanceInfo.score}%`,
      `👥 Roster (${teamMembers.length}/${maxMembers}):`,
      ...teamMembers.map((tm) => {
        const mem = members.find((m) => m.id === tm.memberId);
        return `• ${tm.role}: ${mem?.name || 'Member'}`;
      }),
      `Built with Tuwaiq TeamMatch - Tuwaiq Club`,
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedRoster(true);
    setTimeout(() => setCopiedRoster(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-purple-950 to-indigo-950 p-6 sm:p-8 border border-emerald-500/30 shadow-xl shadow-purple-950/60">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive Squad Canvas</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Build & Balance Your Team
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Assemble cross-functional teammates, monitor live skill balance ratings, and get smart recommendations to fill missing team roles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT 2 COLS: TEAM ROSTER CANVAS */}
        <div className="lg:col-span-2 space-y-6">
          {/* TEAM DETAILS HEADER CARD */}
          <div className="p-6 rounded-3xl bg-[#170a2f] border border-purple-800/50 space-y-4 shadow-xl shadow-purple-950/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Team Name
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter team name"
                    className="w-full px-4 py-2 rounded-xl bg-purple-950/80 border border-purple-700/60 text-white font-extrabold text-lg focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={handleRandomizeName}
                    title="Generate fun team name"
                    className="p-2.5 rounded-xl bg-purple-800/60 hover:bg-purple-700 text-purple-200 transition-colors border border-purple-600/40 flex-shrink-0"
                  >
                    <Dices className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="sm:w-64">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Target Competition
                </label>
                <select
                  value={competition}
                  onChange={(e) => setCompetition(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/80 border border-purple-700/60 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                >
                  {DEFAULT_COMPETITIONS.map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Project Vision / Goal
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What problem will your team solve in this hackathon?"
                className="w-full px-4 py-2 rounded-xl bg-purple-950/60 border border-purple-800/50 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* SQUAD SLOTS (VISUAL ROSTER) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>
                  Team Roster ({teamMembers.length} / {maxMembers} Members)
                </span>
              </h3>
              <div className="text-xs text-purple-300">
                {teamMembers.length < maxMembers ? (
                  <span>{maxMembers - teamMembers.length} slot(s) open</span>
                ) : (
                  <span className="text-emerald-400 font-bold">Team is Full ✨</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teamMembers.map((tm, idx) => {
                const member = members.find((m) => m.id === tm.memberId);
                if (!member) return null;
                const isCreator = currentUser ? tm.memberId === currentUser.id : false;

                return (
                  <div
                    key={tm.memberId}
                    className="relative p-4 rounded-2xl bg-[#1a0d36] border border-purple-700/50 space-y-3 shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-purple-400"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-sm truncate flex items-center gap-1.5">
                            <span>{member.name}</span>
                            {isCreator && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-600 text-white font-normal">
                                Creator
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-cyan-300/90 truncate">{member.major}</p>
                        </div>
                      </div>

                      {!isCreator && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(tm.memberId)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Remove from team"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Editable Role in Team */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Assigned Role
                      </label>
                      <input
                        type="text"
                        value={tm.role}
                        onChange={(e) => handleUpdateRole(tm.memberId, e.target.value)}
                        placeholder="Role..."
                        className="w-full px-3 py-1.5 rounded-lg bg-purple-950/80 border border-purple-800/60 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
                      />
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {member.skills.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950 text-purple-200 border border-purple-900/50"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Empty Available Slots */}
              {Array.from({ length: Math.max(0, maxMembers - teamMembers.length) }).map(
                (_, slotIdx) => (
                  <div
                    key={`empty-${slotIdx}`}
                    className="p-6 rounded-2xl border-2 border-dashed border-purple-800/60 bg-purple-950/20 flex flex-col items-center justify-center text-center space-y-2 min-h-[160px]"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-900/40 text-purple-400 flex items-center justify-center">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-300">Open Slot #{teamMembers.length + slotIdx + 1}</div>
                      <div className="text-[11px] text-slate-500">
                        Add from missing skills below
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* MISSING SKILL SUGGESTIONS BOX */}
          {balanceInfo.missingCategories.length > 0 && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/90 to-[#220e40] border border-pink-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Suggested Teammates for Missing Skills</h4>
                    <p className="text-xs text-pink-200/90">{balanceInfo.feedback}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {missingSkillTeammates.map((member) => (
                  <div
                    key={member.id}
                    className="p-3.5 rounded-2xl bg-[#190c33] border border-purple-800/40 hover:border-pink-400/50 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-pink-400"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{member.name}</div>
                        <div className="text-[11px] text-purple-300 truncate">
                          {member.skills.slice(0, 2).join(', ')}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={teamMembers.length >= maxMembers}
                      onClick={() => handleAddMember(member)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold shadow transition-transform active:scale-95 flex items-center gap-1 flex-shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT 1 COL: TEAM BALANCE GAUGE & ACTIONS */}
        <div className="space-y-6">
          {/* BALANCE SCORE CARD */}
          <div className="p-6 rounded-3xl bg-[#170a2f] border border-purple-800/50 space-y-6 shadow-xl shadow-purple-950/40">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Team Balance Score</span>
                <span className="text-cyan-300 font-bold">Target: 90%+</span>
              </div>

              {/* Big Score Gauge */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950 to-[#28134d] border border-purple-700/50 text-center space-y-2">
                <div className="text-4xl sm:text-5xl font-black text-white flex items-center justify-center gap-1">
                  <span
                    className={
                      balanceInfo.score >= 85
                        ? 'text-emerald-400'
                        : balanceInfo.score >= 65
                        ? 'text-yellow-400'
                        : 'text-pink-400'
                    }
                  >
                    {balanceInfo.score}%
                  </span>
                </div>
                <p className="text-xs text-purple-200 font-medium">{balanceInfo.feedback}</p>
              </div>
            </div>

            {/* Track Coverage Breakdown */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Track Coverage Breakdown
              </div>
              <div className="space-y-2">
                {balanceInfo.categoryCoverage.map((cat) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span>{cat.name.split(' ')[0]}</span>
                      </span>
                      <span
                        className={`font-bold ${
                          cat.count > 0 ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        {cat.count > 0 ? `✓ Covered (${cat.count})` : 'Missing'}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-purple-950 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, cat.count * 50)}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Team CTA */}
            <div className="space-y-2 pt-2 border-t border-purple-900/50">
              <button
                id="btn-save-assembled-team"
                type="button"
                onClick={handleSaveTeam}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-emerald-950/60 transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Assembled Team</span>
              </button>

              {isSavedRecently && (
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-center text-xs font-bold text-emerald-300 animate-in fade-in">
                  🎉 Team saved successfully to "My Teams"!
                </div>
              )}

              <button
                type="button"
                onClick={handleCopyRoster}
                className="w-full py-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 text-xs font-semibold border border-purple-700/40 transition-colors flex items-center justify-center gap-2"
              >
                {copiedRoster ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedRoster ? 'Roster Copied!' : 'Copy Team Roster'}</span>
              </button>
            </div>
          </div>

          {/* ACTIVE TEAMS ROSTER PREVIEW */}
          <div className="p-6 rounded-3xl bg-[#170a2f] border border-purple-800/50 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>Other Formed Teams ({existingTeams.length})</span>
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {existingTeams.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-2xl bg-purple-950/50 border border-purple-800/40 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{t.name}</span>
                    <span className="font-bold text-emerald-400">{t.balanceScore}% Balance</span>
                  </div>
                  <p className="text-[11px] text-purple-300/80">{t.competition}</p>
                  <div className="text-[10px] text-slate-400">
                    {t.members.length} members • Created by {t.creatorName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
