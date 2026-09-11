import React, { useState, useMemo } from 'react';
import { Member, Team, SkillCategory } from '../types';
import { SKILL_CATEGORIES_DATA, DEFAULT_COMPETITIONS } from '../data/mockData';
import { NavSection } from './Navbar';
import {
  BarChart3,
  ShieldCheck,
  Users,
  AlertTriangle,
  Trophy,
  Compass,
  Download,
  Flame,
  CheckCircle2,
  Sparkles,
  Layers,
  Send,
  Check,
} from 'lucide-react';

interface OrganizerDashboardProps {
  members: Member[];
  teams: Team[];
  onNavigate: (section: NavSection) => void;
  onViewProfile: (member: Member) => void;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({
  members,
  teams,
  onNavigate,
  onViewProfile,
}) => {
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [copiedData, setCopiedData] = useState(false);

  // Community statistics calculation
  const totalMembers = members.length;
  const totalTeams = teams.length;

  // Unmatched members (not in any team)
  const matchedMemberIds = new Set<string>();
  teams.forEach((t) => t.members.forEach((tm) => matchedMemberIds.add(tm.memberId)));

  const unmatchedMembers = members.filter((m) => !matchedMemberIds.has(m.id));

  // Category distribution
  const categoryCounts: Record<SkillCategory, number> = {
    TECH: 0,
    DESIGN: 0,
    BUSINESS: 0,
    COMMUNITY: 0,
  };

  members.forEach((m) => {
    m.skillCategories.forEach((cat) => {
      if (categoryCounts[cat] !== undefined) {
        categoryCounts[cat] += 1;
      }
    });
  });

  // Identify skill bottlenecks (e.g. skills needed in competitions vs available)
  const highDemandSkills = [
    { skill: 'UI/UX & Prototyping', count: 3, urgency: 'High', reason: 'Critical for hackathon judging' },
    { skill: 'Investor Pitching', count: 4, urgency: 'Medium', reason: 'Needed for final stage demos' },
    { skill: 'Cloud & AI Deployment', count: 5, urgency: 'Medium', reason: 'Backend infrastructure lead' },
  ];

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastMessage('');
      setBroadcastSent(false);
    }, 3000);
  };

  const handleExportData = () => {
    const summary = {
      exportDate: new Date().toISOString(),
      club: 'Tuwaiq Club (نادي طويق)',
      totalMembers,
      totalTeams,
      unmatchedMembersCount: unmatchedMembers.length,
      categoryDistribution: categoryCounts,
      teams: teams.map((t) => ({
        name: t.name,
        competition: t.competition,
        balanceScore: t.balanceScore,
        memberCount: t.members.length,
      })),
      membersSummary: members.map((m) => ({
        name: m.name,
        major: m.major,
        categories: m.skillCategories,
        skills: m.skills,
      })),
    };

    navigator.clipboard.writeText(JSON.stringify(summary, null, 2));
    setCopiedData(true);
    setTimeout(() => setCopiedData(false), 2500);
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-200">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-[#1b083c] to-indigo-950 p-6 sm:p-8 border border-purple-500/40 shadow-xl shadow-purple-950/60">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Track Leadership & Organizer Portal</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Community Analytics & Team Formations
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Monitor community talent balance, identify missing skills before hackathons, and ensure every student finds a high-impact team.
          </p>
        </div>
      </div>

      {/* TOP STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#170a2f] border border-purple-800/50 space-y-1 shadow-lg">
          <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
            <Users className="w-4 h-4 text-purple-400" />
            <span>Total Members</span>
          </div>
          <div className="text-3xl font-black text-white">{totalMembers}</div>
          <p className="text-[11px] text-purple-300">Registered across 4 tracks</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#170a2f] border border-purple-800/50 space-y-1 shadow-lg">
          <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>Active Formed Teams</span>
          </div>
          <div className="text-3xl font-black text-white">{totalTeams}</div>
          <p className="text-[11px] text-emerald-400">Avg. 88% Balance Score</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#170a2f] border border-purple-800/50 space-y-1 shadow-lg">
          <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-pink-400" />
            <span>Looking for Teams</span>
          </div>
          <div className="text-3xl font-black text-pink-400">{unmatchedMembers.length}</div>
          <p className="text-[11px] text-slate-400">Available for matching</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#170a2f] border border-purple-800/50 space-y-1 shadow-lg">
          <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Competitions</span>
          </div>
          <div className="text-3xl font-black text-white">{DEFAULT_COMPETITIONS.length}</div>
          <p className="text-[11px] text-cyan-300">Upcoming club milestones</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT 2 COLS: CATEGORY SPREAD & MISSING SKILL ALERTS */}
        <div className="lg:col-span-2 space-y-6">
          {/* TRACK DISTRIBUTION */}
          <div className="p-6 rounded-3xl bg-[#170a2f] border border-purple-800/50 space-y-4 shadow-xl shadow-purple-950/40">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Track Distribution & Capacity</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SKILL_CATEGORIES_DATA.map((cat) => {
                const count = categoryCounts[cat.category];
                const percentage = Math.round((count / totalMembers) * 100);

                return (
                  <div
                    key={cat.category}
                    className={`p-4 rounded-2xl border ${cat.borderColor} bg-purple-950/40 space-y-2`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-bold ${cat.textColor}`}>{cat.name}</span>
                      <span className="font-extrabold text-white">
                        {count} ({percentage}%)
                      </span>
                    </div>

                    <div className="h-2.5 rounded-full bg-purple-950 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${percentage}%`, backgroundColor: cat.color }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-400 font-tajawal">{cat.nameAr}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MISSING SKILLS ALERTS */}
          <div className="p-6 rounded-3xl bg-[#170a2f] border border-purple-800/50 space-y-4 shadow-xl shadow-purple-950/40">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span>Upcoming Hackathon Talent Bottlenecks</span>
              </h3>
              <button
                onClick={() => onNavigate('team_generator')}
                className="text-xs text-cyan-400 hover:underline font-bold"
              >
                Run Auto-Balancer →
              </button>
            </div>

            <div className="space-y-3">
              {highDemandSkills.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-purple-950/50 border border-purple-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{item.skill}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.urgency === 'High'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                        }`}
                      >
                        {item.urgency} Demand
                      </span>
                    </div>
                    <p className="text-slate-300 mt-1">{item.reason}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-purple-300 font-bold">{item.count} open requests</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* UNMATCHED STUDENTS ROSTER */}
          <div className="p-6 rounded-3xl bg-[#170a2f] border border-purple-800/50 space-y-4 shadow-xl shadow-purple-950/40">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Students Seeking Teams ({unmatchedMembers.length})</span>
              </h3>
              <button
                onClick={() => onNavigate('team_generator')}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow"
              >
                Auto-Group These Students
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {unmatchedMembers.map((member) => (
                <div
                  key={member.id}
                  onClick={() => onViewProfile(member)}
                  className="p-3 rounded-2xl bg-purple-950/60 hover:bg-purple-900/50 cursor-pointer border border-purple-800/40 flex items-center gap-3 transition-colors"
                >
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-purple-400"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white truncate">{member.name}</h4>
                    <p className="text-[11px] text-cyan-300 truncate">{member.major}</p>
                    <div className="text-[10px] text-slate-400 truncate">
                      {member.skills.slice(0, 2).join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT 1 COL: ORGANIZER TOOLS & BROADCAST */}
        <div className="space-y-6">
          {/* TRACK BROADCAST ANNOUNCEMENT */}
          <div className="p-6 rounded-3xl bg-[#170a2f] border border-purple-800/50 space-y-4 shadow-xl shadow-purple-950/40">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Send className="w-4 h-4 text-cyan-400" />
              <span>Track Announcement</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Notify all registered track members about team registration deadlines and hackathon updates.
            </p>

            <form onSubmit={handleBroadcast} className="space-y-3">
              <textarea
                rows={4}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Enter announcement message for registered track members..."
                className="w-full p-3 rounded-2xl bg-purple-950/80 border border-purple-700/60 text-white text-xs placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-transform active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Community Broadcast</span>
              </button>

              {broadcastSent && (
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-center text-xs font-bold text-emerald-300 animate-in fade-in">
                  ✓ Broadcast sent to all {totalMembers} track members!
                </div>
              )}
            </form>
          </div>

          {/* QUICK ACTIONS & EXPORT */}
          <div className="p-6 rounded-3xl bg-[#170a2f] border border-purple-800/50 space-y-3 shadow-xl shadow-purple-950/40">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Leadership Actions
            </h3>

            <button
              onClick={() => onNavigate('team_generator')}
              className="w-full p-3 rounded-2xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/40 text-left text-xs font-bold text-white flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Launch Team Auto-Balancer</span>
              </div>
              <span className="text-purple-400">→</span>
            </button>

            <button
              onClick={() => onNavigate('skill_map')}
              className="w-full p-3 rounded-2xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/40 text-left text-xs font-bold text-white flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-pink-400" />
                <span>Inspect Community Skill Cloud</span>
              </div>
              <span className="text-purple-400">→</span>
            </button>

            <button
              onClick={handleExportData}
              className="w-full p-3 rounded-2xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/50 text-purple-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              {copiedData ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
              <span>{copiedData ? 'Export Copied to Clipboard!' : 'Export Track Summary (JSON)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
