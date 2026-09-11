import React, { useState, useMemo } from 'react';
import { Member, SkillCategory, MatchResult } from '../types';
import { SKILL_CATEGORIES_DATA, DEFAULT_COMPETITIONS } from '../data/mockData';
import { calculateMemberMatch } from '../utils/matching';
import { AnimatedScoreDial } from './AnimatedScoreDial';
import {
  Sparkles,
  CheckCircle2,
  Users,
  Trophy,
  ArrowRight,
  ArrowLeft,
  UserPlus,
  Compass,
  Zap,
  Flame,
  Check,
  Dices,
  Eye,
  Plus,
  X,
  Layers,
  Heart,
  Award,
  Target,
  Shuffle,
  Star,
} from 'lucide-react';

interface FindMyTeamProps {
  members: Member[];
  currentUser: Member | null;
  onViewProfile: (member: Member) => void;
  onInvite: (member: Member) => void;
  onOpenProfileSetup?: () => void;
}

// Fun superpower archetypes for matching activity
interface SuperpowerMission {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  targetCategory: SkillCategory | 'ANY';
  skills: string[];
  gradient: string;
  borderColor: string;
}

const SUPERPOWER_MISSIONS: SuperpowerMission[] = [
  {
    id: 'designer',
    emoji: '🎨',
    title: 'Visual Visionary',
    subtitle: 'UI/UX, Figma & Product Prototyping',
    targetCategory: 'DESIGN',
    skills: ['UI/UX', 'Figma', 'Product Prototyping', 'Design Systems'],
    gradient: 'from-pink-900/60 to-purple-900/60',
    borderColor: 'border-pink-500/50 hover:border-pink-400',
  },
  {
    id: 'developer',
    emoji: '💻',
    title: 'Code Architect',
    subtitle: 'Full-Stack, AI, APIs & Mobile Apps',
    targetCategory: 'TECH',
    skills: ['AI', 'Programming', 'Web Development', 'Mobile Development'],
    gradient: 'from-cyan-900/60 to-blue-900/60',
    borderColor: 'border-cyan-500/50 hover:border-cyan-400',
  },
  {
    id: 'pitcher',
    emoji: '📈',
    title: 'Pitch Strategist',
    subtitle: 'Business Model, Pitching & Strategy',
    targetCategory: 'BUSINESS',
    skills: ['Pitching', 'Business Model', 'Finance', 'Market Research'],
    gradient: 'from-amber-900/60 to-orange-900/60',
    borderColor: 'border-amber-500/50 hover:border-amber-400',
  },
  {
    id: 'community',
    emoji: '🤝',
    title: 'Growth Catalyst',
    subtitle: 'Marketing, Public Speaking & Ops',
    targetCategory: 'COMMUNITY',
    skills: ['Public Speaking', 'Marketing & Social Media', 'Event Management'],
    gradient: 'from-emerald-900/60 to-teal-900/60',
    borderColor: 'border-emerald-500/50 hover:border-emerald-400',
  },
  {
    id: 'wildcard',
    emoji: '⚡',
    title: 'All-Round Squad Ally',
    subtitle: 'Broad complementary skills & versatility',
    targetCategory: 'ANY',
    skills: ['UI/UX', 'Programming', 'Pitching'],
    gradient: 'from-purple-900/60 to-indigo-900/60',
    borderColor: 'border-purple-500/50 hover:border-purple-400',
  },
];

export const FindMyTeam: React.FC<FindMyTeamProps> = ({
  members = [],
  currentUser,
  onViewProfile,
  onInvite,
  onOpenProfileSetup,
}) => {
  const activeUser = currentUser || members[0];
  // Active Mission & Criteria State
  const [activeMissionId, setActiveMissionId] = useState<string>('designer');
  const [selectedSkillsNeeded, setSelectedSkillsNeeded] = useState<string[]>([
    'UI/UX',
    'Figma',
    'Product Prototyping',
  ]);
  const [targetCategory, setTargetCategory] = useState<SkillCategory | 'ANY'>('DESIGN');

  // Competitions list (user can add their own!)
  const [competitionsList, setCompetitionsList] = useState<string[]>([
    'Tuwaiq Innovation Challenge 2026',
    'Al-Baha Smart Cities Hackathon',
    'Saudi AI Olympiad',
    'FinTech Venture Sprint',
  ]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>(
    'Tuwaiq Innovation Challenge 2026'
  );
  const [customCompetitionInput, setCustomCompetitionInput] = useState('');
  const [showAddCompetition, setShowAddCompetition] = useState(false);

  const [surpriseAnimation, setSurpriseAnimation] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // Toggle superpower mission
  const handleSelectMission = (mission: SuperpowerMission) => {
    setActiveMissionId(mission.id);
    setSelectedSkillsNeeded(mission.skills);
    setTargetCategory(mission.targetCategory);
  };

  // Toggle specific skill chip
  const handleToggleSkill = (skill: string) => {
    if (selectedSkillsNeeded.includes(skill)) {
      setSelectedSkillsNeeded(selectedSkillsNeeded.filter((s) => s !== skill));
    } else {
      setSelectedSkillsNeeded([...selectedSkillsNeeded, skill]);
    }
    setActiveMissionId('custom');
  };

  // Add custom target competition
  const handleAddCustomCompetition = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customCompetitionInput.trim();
    if (!trimmed) return;
    if (!competitionsList.includes(trimmed)) {
      setCompetitionsList([trimmed, ...competitionsList]);
    }
    setSelectedCompetition(trimmed);
    setCustomCompetitionInput('');
    setShowAddCompetition(false);
  };

  // Toggle bookmark
  const handleToggleBookmark = (id: string) => {
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(bookmarkedIds.filter((b) => b !== id));
    } else {
      setBookmarkedIds([...bookmarkedIds, id]);
    }
  };

  // Calculate Matches with Transparent Reasons & Scores
  const matchResults: MatchResult[] = useMemo(() => {
    const criteria = {
      skillsNeeded: selectedSkillsNeeded,
      competition: selectedCompetition,
      interests: activeUser?.interests || [],
      currentMemberId: activeUser?.id || '',
    };

    const results = (members || [])
      .filter((m) => (activeUser ? m.id !== activeUser.id : true)) // exclude self
      .filter((m) => {
        if (targetCategory === 'ANY') return true;
        return (m.skillCategories || []).includes(targetCategory);
      })
      .map((target) => calculateMemberMatch(target, criteria, activeUser))
      .sort((a, b) => b.score - a.score);

    return results;
  }, [members, activeUser, selectedSkillsNeeded, selectedCompetition, targetCategory]);

  // Roll For Chemistry (visual highlight animation)
  const handleRollForChemistry = () => {
    if (matchResults.length === 0) return;
    setSurpriseAnimation(true);
    setTimeout(() => {
      setSurpriseAnimation(false);
    }, 600);
  };

  // Generate a synthesized coach explanation of why this person matches
  const getMatchHeadline = (result: MatchResult): string => {
    const target = result.member;
    const matchingSkills = (target.skills || []).filter((s) =>
      selectedSkillsNeeded.some((req) => req.toLowerCase() === s.toLowerCase())
    );

    if (matchingSkills.length > 0 && target.skillCategories.includes('DESIGN')) {
      return `Brings top-tier design craft (${matchingSkills.slice(0, 2).join(', ')}) to turn your ideas into functional prototypes.`;
    }
    if (matchingSkills.length > 0 && target.skillCategories.includes('TECH')) {
      return `Solid technical horsepower (${matchingSkills.slice(0, 2).join(', ')}) to architect and deliver the working MVP.`;
    }
    if (matchingSkills.length > 0 && target.skillCategories.includes('BUSINESS')) {
      return `Master pitcher and strategist (${matchingSkills.slice(0, 2).join(', ')}) to own the pitch deck and business model.`;
    }
    if (result.score >= 85) {
      return `High complementary energy: fills your skill gaps and shares your competition ambitions!`;
    }
    return `Great potential ally with complementary tracks and active competition interest.`;
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-200">
      {/* GAMIFIED ACTIVITY HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#210940] via-[#2f115e] to-[#160630] p-6 sm:p-8 border border-purple-500/40 shadow-2xl shadow-purple-950/80">
        {/* Glow Accent Circles */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
              <span>Squad Matchmaker Activity • مسار ريادة الأعمال والتقنية</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Find Your Dream Squad 🚀
            </h1>

            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed font-normal">
              Not a boring form! Pick your squad's missing superpower or roll for chemistry to reveal
              ideal complementary teammates, complete with live animated compatibility scores and deep synergy breakdowns.
            </p>

            {/* Current Matching Persona Banner */}
            {currentUser ? (
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800/60 text-xs text-purple-200">
                <span className="text-slate-400">Matching for:</span>
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-cyan-400"
                  referrerPolicy="no-referrer"
                />
                <span className="font-bold text-white">{currentUser.name}</span>
                <span className="text-[11px] text-cyan-300 font-mono">({currentUser.major})</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800/60 text-xs text-purple-200">
                <span className="text-slate-400">Simulating chemistry as:</span>
                <span className="font-bold text-white">{activeUser?.name || 'Guest Explorer'}</span>
                {onOpenProfileSetup && (
                  <button
                    onClick={onOpenProfileSetup}
                    className="ml-2 px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-[11px] transition-all"
                  >
                    + Create Your Profile
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRollForChemistry}
              disabled={matchResults.length === 0}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-black shadow-xl shadow-pink-950/70 flex items-center gap-2 border border-pink-400/40 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Dices className={`w-4 h-4 text-yellow-300 ${surpriseAnimation ? 'animate-spin' : ''}`} />
              <span>Roll for Chemistry! 🎲</span>
            </button>
          </div>
        </div>
      </div>

      {/* INTERACTIVE MISSION SELECTOR (Replaces static inputs) */}
      <div className="p-6 rounded-3xl bg-[#170a2f] border border-purple-800/50 shadow-xl shadow-purple-950/50 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-600/40 text-cyan-300 font-black text-xs flex items-center justify-center">
                1
              </span>
              <label className="text-xs font-black text-white uppercase tracking-wider">
                What Superpower Does Your Squad Need?
              </label>
            </div>
            <span className="text-[11px] text-purple-300 font-medium">
              Click a mission to instantly recalibrate chemistry
            </span>
          </div>

          {/* Mission Archetype Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {SUPERPOWER_MISSIONS.map((mission) => {
              const isSelected = activeMissionId === mission.id;
              return (
                <button
                  key={mission.id}
                  type="button"
                  onClick={() => handleSelectMission(mission)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 relative overflow-hidden ${
                    isSelected
                      ? `bg-gradient-to-b ${mission.gradient} border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg shadow-purple-950/60 scale-[1.02]`
                      : 'bg-purple-950/30 border-purple-900/40 hover:bg-purple-900/30 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{mission.emoji}</span>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-black text-[9px] font-black uppercase">
                        Active
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white leading-snug">{mission.title}</h4>
                    <p className="text-[10px] text-purple-200/80 line-clamp-2 mt-0.5">
                      {mission.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Skill Tags (Refine Hunt) */}
        <div className="space-y-2 pt-2 border-t border-purple-900/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Superpower Skills ({selectedSkillsNeeded.length} active)</span>
            </span>
            {selectedSkillsNeeded.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedSkillsNeeded([])}
                className="text-[11px] text-pink-400 hover:underline"
              >
                Clear all skills
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              'UI/UX',
              'Figma',
              'Product Prototyping',
              'Programming',
              'AI',
              'Web Development',
              'Mobile Development',
              'Pitching',
              'Business Model',
              'Finance',
              'Public Speaking',
              'Marketing & Social Media',
              'Cloud & DevOps',
              'Design Systems',
            ].map((skill) => {
              const isSelected = selectedSkillsNeeded.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleToggleSkill(skill)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm shadow-cyan-900/40'
                      : 'bg-purple-950/40 text-slate-400 border-purple-800/40 hover:text-white hover:border-purple-600'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        {/* Competition Arena Selector (Users Add & Pick) */}
        <div className="pt-2 border-t border-purple-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-600/40 text-cyan-300 font-black text-xs flex items-center justify-center">
                2
              </span>
              <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                <span>Target Arena / Competition</span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => setShowAddCompetition(!showAddCompetition)}
              className="text-xs font-bold text-cyan-300 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Arena</span>
            </button>
          </div>

          {/* Add custom competition field */}
          {showAddCompetition && (
            <form onSubmit={handleAddCustomCompetition} className="flex gap-2 animate-in fade-in duration-150">
              <input
                type="text"
                value={customCompetitionInput}
                onChange={(e) => setCustomCompetitionInput(e.target.value)}
                placeholder="Enter competition/hackathon name..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-700/60 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold"
              >
                Add Arena
              </button>
            </form>
          )}

          {/* Competitions chips */}
          <div className="flex flex-wrap gap-2">
            {competitionsList.map((comp) => {
              const isSelected = selectedCompetition === comp;
              return (
                <button
                  key={comp}
                  type="button"
                  onClick={() => setSelectedCompetition(comp)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-purple-600/40 text-purple-100 border-purple-400 ring-1 ring-purple-400/50'
                      : 'bg-purple-950/40 text-slate-400 border-purple-800/40 hover:text-white'
                  }`}
                >
                  <Trophy className={`w-3 h-3 ${isSelected ? 'text-yellow-400' : 'text-slate-500'}`} />
                  <span>{comp}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SQUAD MATCHMAKER RESULTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span>Matched Teammates ({matchResults.length})</span>
          </h3>
          <span className="text-xs text-slate-400">
            Ranked by compatibility score
          </span>
        </div>

        {matchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {matchResults.map((result) => (
              <div
                key={result.member.id}
                className="p-5 rounded-3xl bg-[#180d31] hover:bg-[#201040] border border-purple-800/40 hover:border-purple-400/50 transition-all space-y-4 shadow-lg shadow-purple-950/40 flex flex-col justify-between"
              >
                <div>
                  {/* Top: Avatar, Name & Animated Score Dial */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={result.member.avatar}
                        alt={result.member.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-500/40"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="font-bold text-white text-base leading-tight">
                          {result.member.name}
                        </h4>
                        <p className="text-xs text-cyan-300 font-medium">
                          {result.member.major}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {result.member.academicYear}
                        </p>
                      </div>
                    </div>

                    <AnimatedScoreDial score={result.score} size="sm" showLabel={false} />
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(result.member.skills || []).map((s) => {
                      const isDirectMatch = selectedSkillsNeeded.some(
                        (req) => req.toLowerCase() === s.toLowerCase()
                      );
                      return (
                        <span
                          key={s}
                          className={`text-[11px] px-2 py-0.5 rounded-md font-medium border ${
                            isDirectMatch
                              ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold"
                              : "bg-purple-950 text-purple-200 border-purple-800/40"
                          }`}
                        >
                          {isDirectMatch ? "🎯 " : ""}
                          {s}
                        </span>
                      );
                    })}
                  </div>

                  {/* Why they match: Checklist */}
                  <div className="space-y-1.5 p-3 rounded-2xl bg-purple-950/40 border border-purple-900/30">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Why You Match:</span>
                      <span className="text-cyan-300">{result.score}% Compatibility</span>
                    </div>

                    {result.reasons.slice(0, 3).map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">
                          {reason.text}
                          {reason.highlight && (
                            <strong className="text-purple-200 font-medium"> ({reason.highlight})</strong>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-purple-900/40">
                  <button
                    type="button"
                    onClick={() => onViewProfile(result.member)}
                    className="flex-1 py-2 rounded-xl bg-purple-900/30 hover:bg-purple-800/50 text-purple-200 text-xs font-semibold border border-purple-700/30 transition-colors"
                  >
                    View Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => onInvite(result.member)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-950/60 flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Invite</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-purple-950/30 border border-purple-800/40 space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-purple-900/40 border border-purple-700/50 mx-auto flex items-center justify-center text-purple-400">
              <Compass className="w-8 h-8" />
            </div>
            {members.length === 0 || (members.length === 1 && activeUser) ? (
              <>
                <h3 className="text-lg font-bold text-white">No registered student profiles yet</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Start by creating your student profile or invite classmates to register their skills! As profiles are added, compatibility scores and teammate recommendations will appear here automatically.
                </p>
                {onOpenProfileSetup && (
                  <button
                    type="button"
                    onClick={onOpenProfileSetup}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs font-bold shadow-lg"
                  >
                    Create Student Profile
                  </button>
                )}
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-white">No exact matches for this specific combination</h3>
                <p className="text-xs text-purple-300">
                  Try selecting the "All-Round Squad Ally" mission or choosing another skill track to broaden your search!
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};