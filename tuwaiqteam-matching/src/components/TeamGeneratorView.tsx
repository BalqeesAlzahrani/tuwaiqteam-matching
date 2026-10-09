import React, { useState, useEffect } from 'react';
import { Member, Team, SkillCategory } from '../types';
import { generateBalancedTeams, GenerateConfig } from '../utils/teamGenerator';
import { DEFAULT_COMPETITIONS, SKILL_CATEGORIES_DATA } from '../data/mockData';
import confetti from 'canvas-confetti';
import {
  Compass,
  Shuffle,
  Sparkles,
  Users,
  Trophy,
  CheckCircle2,
  Layers,
  Save,
  Check,
} from 'lucide-react';

interface TeamGeneratorViewProps {
  members: Member[];
  onSaveGeneratedTeams: (teams: Team[]) => void;
  onViewProfile: (member: Member) => void;
}

export const TeamGeneratorView: React.FC<TeamGeneratorViewProps> = ({
  members,
  onSaveGeneratedTeams,
  onViewProfile,
}) => {
  const [teamSize, setTeamSize] = useState<number>(4);
  const [competition, setCompetition] = useState<string>('Tuwaiq Innovation Challenge 2026');
  const [generatedTeams, setGeneratedTeams] = useState<Team[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Generate initial teams on mount or parameters change
  const handleGenerate = () => {
    setIsShuffling(true);
    setIsSaved(false);

    setTimeout(() => {
      const config: GenerateConfig = {
        numTeams: Math.ceil(members.length / teamSize),
        teamSize,
        competition,
        requiredCategories: ['TECH', 'DESIGN', 'BUSINESS', 'COMMUNITY'],
      };

      const result = generateBalancedTeams(members, config);
      setGeneratedTeams(result);
      setIsShuffling(false);

      // Trigger celebratory confetti on generation
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#06b6d4', '#ec4899', '#a855f7', '#10b981'],
        });
      } catch {
        // ignore
      }
    }, 450);
  };

  useEffect(() => {
    if (members.length > 0 && generatedTeams.length === 0) {
      handleGenerate();
    }
  }, [members]);

  const handleSaveAll = () => {
    if (generatedTeams.length === 0) return;
    onSaveGeneratedTeams(generatedTeams);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-cyan-950 p-6 sm:p-8 border border-cyan-500/30 shadow-xl shadow-purple-950/60">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold">
            <Compass className="w-3.5 h-3.5" />
            <span>Hackathon Auto-Balancer Engine</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Smart Team Generator
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Automatically group students into balanced, cross-functional squads ensuring every team has complementary skills across Tech, Design, Business, and Presentation.
          </p>
        </div>
      </div>

      {/* GENERATOR CONTROLS BAR */}
      <div className="p-6 rounded-3xl bg-[#170a2f] border border-purple-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shadow-purple-950/40">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Target Team Size
            </label>
            <div className="flex items-center gap-1.5 bg-purple-950/80 p-1 rounded-xl border border-purple-800/60">
              {[3, 4, 5].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setTeamSize(size)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    teamSize === size
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {size} Members
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Event / Competition
            </label>
            <select
              value={competition}
              onChange={(e) => setCompetition(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-purple-950/80 border border-purple-800/60 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
            >
              {DEFAULT_COMPETITIONS.map((c) => (
                <option key={c.id} value={c.title}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            id="btn-shuffle-teams"
            type="button"
            disabled={isShuffling}
            onClick={handleGenerate}
            className={`px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-purple-950/60 transition-all active:scale-95 flex items-center gap-2 ${
              isShuffling ? 'animate-pulse' : ''
            }`}
          >
            <Shuffle className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
            <span>{isShuffling ? 'Balancing Squads...' : 'Shuffle Teams 🎲'}</span>
          </button>

          <button
            id="btn-save-generated-teams"
            type="button"
            onClick={handleSaveAll}
            className="px-4 py-3 rounded-2xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold border border-emerald-500/40 transition-colors flex items-center gap-1.5"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Saved to Teams!' : 'Save All Teams'}</span>
          </button>
        </div>
      </div>

      {/* GENERATED TEAMS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Generated Cross-Functional Teams ({generatedTeams.length})</span>
          </h3>
          <span className="text-xs text-slate-400">
            {members.length} members distributed with cross-track balance
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {generatedTeams.map((team, tIdx) => (
            <div
              key={team.id}
              className={`p-5 rounded-3xl bg-[#180d31] border border-purple-800/40 hover:border-purple-400/50 transition-all space-y-4 shadow-xl shadow-purple-950/50 flex flex-col justify-between ${
                isShuffling ? 'opacity-40 scale-95' : 'opacity-100 scale-100 duration-300'
              }`}
            >
              <div>
                {/* Team Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-purple-900/40">
                  <div>
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                      Squad #{tIdx + 1}
                    </span>
                    <h4 className="font-extrabold text-white text-base leading-tight">
                      {team.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5">
                      {team.competition}
                    </p>
                  </div>

                  <div className="flex flex-col items-end">
                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${
                        team.balanceScore >= 85
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : team.balanceScore >= 70
                          ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                          : 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                      }`}
                    >
                      {team.balanceScore}% Balance
                    </span>
                  </div>
                </div>

                {/* Team Members List */}
                <div className="space-y-2.5 pt-3">
                  {team.members.map((tm) => {
                    const member = members.find((m) => m.id === tm.memberId);
                    if (!member) return null;

                    const catData = SKILL_CATEGORIES_DATA.find(
                      (c) => c.category === tm.category
                    );

                    return (
                      <div
                        key={tm.memberId}
                        onClick={() => onViewProfile(member)}
                        className="p-2.5 rounded-2xl bg-purple-950/50 hover:bg-purple-900/40 cursor-pointer border border-purple-800/30 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-purple-500/40"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">
                              {member.name}
                            </div>
                            <div className="text-[10px] text-slate-300 truncate">
                              {tm.role}
                            </div>
                          </div>
                        </div>

                        {catData && (
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${catData.badgeBg} ${catData.textColor} ${catData.borderColor} flex-shrink-0`}
                          >
                            {catData.name.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card Footer info */}
              <div className="pt-2 border-t border-purple-900/40 flex items-center justify-between text-[11px] text-slate-400">
                <span>{team.members.length} Members</span>
                <span className="text-purple-300 font-medium">Competition Ready 🚀</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
