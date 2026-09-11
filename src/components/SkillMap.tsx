import React, { useState, useMemo } from 'react';
import { Member, SkillCategory } from '../types';
import { SKILL_CATEGORIES_DATA } from '../data/mockData';
import {
  BarChart3,
  Sparkles,
  Users,
  Search,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Flame,
  UserPlus,
} from 'lucide-react';

interface SkillMapProps {
  members: Member[];
  onViewProfile: (member: Member) => void;
  onInvite: (member: Member) => void;
  onSelectSkillFilter?: (skill: string) => void;
}

export const SkillMap: React.FC<SkillMapProps> = ({
  members,
  onViewProfile,
  onInvite,
  onSelectSkillFilter,
}) => {
  const [selectedSkill, setSelectedSkill] = useState<string>('UI/UX');
  const [activeCategoryTab, setActiveCategoryTab] = useState<SkillCategory | 'ALL'>('ALL');
  const [searchSkillQuery, setSearchSkillQuery] = useState('');

  // Count frequencies of each skill across community
  const skillStats = useMemo(() => {
    const counts: Record<string, { count: number; category: SkillCategory; color: string }> = {};

    SKILL_CATEGORIES_DATA.forEach((cat) => {
      cat.skills.forEach((skill) => {
        counts[skill] = {
          count: 0,
          category: cat.category,
          color: cat.color,
        };
      });
    });

    members.forEach((m) => {
      m.skills.forEach((s) => {
        if (counts[s]) {
          counts[s].count += 1;
        } else {
          // Custom skill
          counts[s] = {
            count: 1,
            category: m.skillCategories[0] || 'TECH',
            color: '#a855f7',
          };
        }
      });
    });

    return Object.entries(counts)
      .map(([name, data]) => ({
        name,
        count: data.count,
        category: data.category,
        color: data.color,
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [members]);

  // Filter skills based on tab and search
  const filteredSkillStats = useMemo(() => {
    return skillStats.filter((item) => {
      if (activeCategoryTab !== 'ALL' && item.category !== activeCategoryTab) {
        return false;
      }
      if (
        searchSkillQuery.trim() &&
        !item.name.toLowerCase().includes(searchSkillQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [skillStats, activeCategoryTab, searchSkillQuery]);

  // Members who possess the currently selected skill
  const membersWithSelectedSkill = useMemo(() => {
    if (!selectedSkill) return [];
    return members.filter((m) =>
      m.skills.some((s) => s.toLowerCase() === selectedSkill.toLowerCase())
    );
  }, [members, selectedSkill]);

  const maxSkillCount = Math.max(...skillStats.map((s) => s.count), 1);

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-200">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 p-6 sm:p-8 border border-purple-500/40 shadow-xl shadow-purple-950/60">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-bold">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Community Talent Radar</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Tuwaiq Skill Map & Density
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Explore the collective skills, strengths, and talent clusters across Al-Baha University's Technology & Entrepreneurship Track.
          </p>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="p-5 rounded-3xl bg-[#170a2f] border border-purple-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl shadow-purple-950/40">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategoryTab('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              activeCategoryTab === 'ALL'
                ? 'bg-purple-600 text-white border-purple-400'
                : 'bg-purple-950/40 text-slate-400 border-purple-900/40 hover:text-white'
            }`}
          >
            All Tracks
          </button>
          {SKILL_CATEGORIES_DATA.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setActiveCategoryTab(cat.category)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                activeCategoryTab === cat.category
                  ? `${cat.badgeBg} ${cat.textColor} ${cat.borderColor}`
                  : 'bg-purple-950/40 text-slate-400 border-purple-900/40 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              <span>{cat.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Search Skill */}
        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchSkillQuery}
            onChange={(e) => setSearchSkillQuery(e.target.value)}
            placeholder="Search skill..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-purple-950/80 border border-purple-800/60 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT 2 COLS: VISUAL SKILL DENSITY & BARS */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interactive Skill Cloud Bubbles */}
          <div className="p-6 rounded-3xl bg-[#170a2f] border border-purple-800/50 space-y-4 shadow-xl shadow-purple-950/40">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Interactive Skill Cloud (Click to Inspect)</span>
              </h3>
              <span className="text-xs text-purple-300">
                Selected: <strong className="text-cyan-300">{selectedSkill}</strong>
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5 p-4 rounded-2xl bg-purple-950/40 border border-purple-900/40 min-h-[140px] items-center">
              {filteredSkillStats.map((item) => {
                const isSelected = selectedSkill.toLowerCase() === item.name.toLowerCase();
                const relativeSize = Math.max(0.85, (item.count / maxSkillCount) * 1.3);

                return (
                  <button
                    key={item.name}
                    onClick={() => setSelectedSkill(item.name)}
                    className={`px-3.5 py-2 rounded-2xl font-bold transition-all transform flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-300 scale-105 shadow-lg shadow-purple-950/80 ring-2 ring-cyan-400/50'
                        : 'bg-[#1e0f3c] text-purple-200 border-purple-800/50 hover:border-purple-500 hover:text-white hover:scale-102'
                    }`}
                    style={{ fontSize: `${relativeSize * 13}px` }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-purple-950/90 text-slate-300 text-[10px] font-extrabold border border-purple-800/60">
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skill Distribution Bar Breakdown */}
          <div className="p-6 rounded-3xl bg-[#170a2f] border border-purple-800/50 space-y-4 shadow-xl shadow-purple-950/40">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Skill Distribution & Volume</span>
            </h3>

            <div className="space-y-3">
              {filteredSkillStats.slice(0, 10).map((item) => {
                const percentage = Math.round((item.count / members.length) * 100);
                const isSelected = selectedSkill.toLowerCase() === item.name.toLowerCase();

                return (
                  <div
                    key={item.name}
                    onClick={() => setSelectedSkill(item.name)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-purple-900/50 border-purple-400 shadow-md'
                        : 'bg-purple-950/40 border-purple-900/30 hover:bg-purple-900/30'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                        <span className="text-[10px] font-normal text-slate-400">({item.category})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-cyan-300">{item.count} members</span>
                        <span className="text-[10px] text-slate-400">({percentage}%)</span>
                      </div>
                    </div>

                    <div className="h-2 rounded-full bg-purple-950 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (item.count / maxSkillCount) * 100)}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT 1 COL: MEMBERS POSSESSING SELECTED SKILL */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-[#170a2f] border border-purple-800/50 space-y-4 shadow-xl shadow-purple-950/40">
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Members with "{selectedSkill}"</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {membersWithSelectedSkill.length} member(s) available
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold">
                {selectedSkill}
              </span>
            </div>

            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {membersWithSelectedSkill.map((member) => (
                <div
                  key={member.id}
                  className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-800/40 hover:border-purple-400/50 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="flex items-center gap-2.5 cursor-pointer min-w-0"
                      onClick={() => onViewProfile(member)}
                    >
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-purple-500/40"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate hover:text-cyan-300">
                          {member.name}
                        </h4>
                        <p className="text-[11px] text-purple-300/80 truncate">{member.major}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onInvite(member)}
                      className="p-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold shadow transition-transform active:scale-95"
                      title="Invite to Team"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
                    {member.bio}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-purple-900/40">
                    <span className="text-emerald-400">Offers: {member.canHelpWith.slice(0, 30)}...</span>
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
