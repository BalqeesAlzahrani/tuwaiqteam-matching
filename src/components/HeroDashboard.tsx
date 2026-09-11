import React from 'react';
import { Member, Team, Competition } from '../types';
import { NavSection } from './Navbar';
import { SKILL_CATEGORIES_DATA, DEFAULT_COMPETITIONS } from '../data/mockData';
import {
  Sparkles,
  Users,
  Layers,
  Compass,
  ArrowRight,
  Trophy,
  Zap,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Flame,
  Lightbulb,
} from 'lucide-react';

interface HeroDashboardProps {
  members: Member[];
  teams: Team[];
  currentUser: Member | null;
  onNavigate: (section: NavSection) => void;
  onOpenProfileSetup: () => void;
  onViewMemberProfile: (member: Member) => void;
}

export const HeroDashboard: React.FC<HeroDashboardProps> = ({
  members,
  teams,
  currentUser,
  onNavigate,
  onOpenProfileSetup,
  onViewMemberProfile,
}) => {
  // Compute community stats
  const allUniqueSkills = new Set<string>();
  members.forEach((m) => m.skills.forEach((s) => allUniqueSkills.add(s.toLowerCase())));

  const totalMembersCount = members.length;
  const totalSkillsCount = allUniqueSkills.size;
  const potentialMatchesCount = Math.round((totalMembersCount * (totalMembersCount - 1)) / 2);
  const activeTeamsCount = teams.length;

  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-300">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#240e4f] via-[#1a0c38] to-[#120726] border border-purple-600/30 p-6 sm:p-10 lg:p-12 shadow-2xl shadow-purple-950/70">
        {/* Background ambient glow shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Track Tag Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 text-xs sm:text-sm font-semibold shadow-inner">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>نادي طويق • جامعة الباحة</span>
            <span className="text-purple-400">|</span>
            <span>Technology & Entrepreneurship Track</span>
          </div>

          {/* Main Title & Tagline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Tuwaiq <span className="bg-gradient-to-r from-purple-300 via-pink-400 to-cyan-300 bg-clip-text text-transparent">TeamMatch</span>
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-200 font-tajawal">
              "مهاراتك. مهاراتهم. فريق واحد."
            </p>
            <p className="text-base sm:text-lg text-slate-300 italic font-medium">
              "Your skills. Their skills. One team."
            </p>
          </div>

          {/* Short Description */}
          <p className="text-sm sm:text-base text-purple-100/90 max-w-2xl mx-auto leading-relaxed">
            Discover the people, skills, and ideas within our community — and build your next winning team for hackathons, capstones, and startup ventures.
          </p>

          {/* Main Call to Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            {!currentUser && (
              <button
                id="btn-hero-join-talent-pool"
                onClick={onOpenProfileSetup}
                className="px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-pink-900/60 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border border-pink-400/40"
              >
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span>Join Talent Pool (Create Profile)</span>
              </button>
            )}

            <button
              id="btn-hero-find-team"
              onClick={() => onNavigate('find_match')}
              className="px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-purple-900/60 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border border-white/20"
            >
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span>Find My Team</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="btn-hero-explore-members"
              onClick={() => onNavigate('directory')}
              className="px-6 sm:px-8 py-3.5 rounded-2xl bg-[#26134b] hover:bg-[#321a61] text-purple-100 font-bold text-sm sm:text-base border border-purple-500/40 transition-all hover:border-cyan-400/60 flex items-center gap-2"
            >
              <Users className="w-5 h-5 text-cyan-400" />
              <span>Explore Members</span>
            </button>

            <button
              id="btn-hero-build-team"
              onClick={() => onNavigate('build_team')}
              className="px-5 py-3.5 rounded-2xl bg-purple-950/80 hover:bg-purple-900/90 text-emerald-300 font-bold text-sm border border-emerald-500/30 transition-colors flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>Build a Team</span>
            </button>
          </div>
        </div>

        {/* STATS COUNTER BAR */}
        <div className="mt-12 pt-8 border-t border-purple-800/40 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-800/40 text-center">
            <div className="text-2xl sm:text-4xl font-extrabold text-white mb-1">
              {totalMembersCount}+
            </div>
            <div className="text-xs sm:text-sm font-semibold text-cyan-300 flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>Active Members</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-800/40 text-center">
            <div className="text-2xl sm:text-4xl font-extrabold text-white mb-1">
              {totalSkillsCount}+
            </div>
            <div className="text-xs sm:text-sm font-semibold text-pink-300 flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Unique Skills</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-800/40 text-center">
            <div className="text-2xl sm:text-4xl font-extrabold text-white mb-1">
              {potentialMatchesCount}+
            </div>
            <div className="text-xs sm:text-sm font-semibold text-yellow-300 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Potential Matches</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-800/40 text-center">
            <div className="text-2xl sm:text-4xl font-extrabold text-white mb-1">
              {activeTeamsCount}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-emerald-300 flex items-center justify-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              <span>Active Teams</span>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK LAUNCH TILES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tile 1: Smart Matchmaker */}
        <div
          onClick={() => onNavigate('find_match')}
          className="group cursor-pointer p-6 rounded-3xl bg-[#190d33] hover:bg-[#231248] border border-purple-800/40 hover:border-pink-500/50 transition-all shadow-lg hover:shadow-pink-950/40 space-y-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-pink-300 transition-colors">
              Find Complementary Teammates
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mt-1">
              Tell us what skills you're missing, and our matching algorithm will rank the best matching peers with compatibility scores.
            </p>
          </div>
          <div className="text-xs font-bold text-pink-400 flex items-center gap-1">
            <span>Launch Matchmaker</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Tile 2: Team Balance Builder */}
        <div
          onClick={() => onNavigate('build_team')}
          className="group cursor-pointer p-6 rounded-3xl bg-[#190d33] hover:bg-[#231248] border border-purple-800/40 hover:border-emerald-500/50 transition-all shadow-lg hover:shadow-emerald-950/40 space-y-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
              Assemble & Balance Squads
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mt-1">
              Build your team visually, monitor your Team Balance Score, and get instant suggestions for missing skills (UI/UX, Pitch, AI).
            </p>
          </div>
          <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            <span>Open Team Builder</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Tile 3: Hackathon Auto-Balancer */}
        <div
          onClick={() => onNavigate('team_generator')}
          className="group cursor-pointer p-6 rounded-3xl bg-[#190d33] hover:bg-[#231248] border border-purple-800/40 hover:border-cyan-500/50 transition-all shadow-lg hover:shadow-cyan-950/40 space-y-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
              Auto Team Generator
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mt-1">
              For organizers and tracks: Automatically generate balanced cross-functional teams with 1-click shuffle animations.
            </p>
          </div>
          <div className="text-xs font-bold text-cyan-400 flex items-center gap-1">
            <span>Try Team Generator</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* TRACK BREAKDOWN & SKILL CLOUD PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 4 Tracks of Tuwaiq */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#170a2f] border border-purple-800/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-600/30 text-purple-300">
                <Flame className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">Tuwaiq Skill Tracks</h3>
            </div>
            <button
              onClick={() => onNavigate('skill_map')}
              className="text-xs text-cyan-300 hover:underline font-semibold"
            >
              View Full Skill Map →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {SKILL_CATEGORIES_DATA.map((cat) => {
              const membersInCat = members.filter((m) => m.skillCategories.includes(cat.category));
              return (
                <div
                  key={cat.category}
                  onClick={() => onNavigate('directory')}
                  className={`p-4 rounded-2xl border ${cat.borderColor} bg-purple-950/40 hover:bg-purple-900/30 cursor-pointer transition-all space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider ${cat.textColor}`}>
                      {cat.name}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-900/60 text-white">
                      {membersInCat.length} Members
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-tajawal">{cat.nameAr}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {cat.skills.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-purple-900/50 text-slate-300"
                      >
                        {s}
                      </span>
                    ))}
                    <span className="text-[10px] px-1.5 py-0.5 text-purple-300">
                      +{cat.skills.length - 3}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Upcoming Competitions */}
        <div className="p-6 rounded-3xl bg-[#170a2f] border border-purple-800/40 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1.5 rounded-lg bg-yellow-500/20 text-yellow-300">
                <Trophy className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-white">Upcoming Competitions</h3>
            </div>
            <div className="space-y-3">
              {DEFAULT_COMPETITIONS.slice(0, 3).map((comp) => (
                <div
                  key={comp.id}
                  onClick={() => onNavigate('find_match')}
                  className="p-3 rounded-2xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/40 cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white truncate max-w-[170px]">{comp.title}</span>
                    <span className="text-[10px] font-semibold text-purple-300 px-1.5 py-0.5 rounded bg-purple-900/60">
                      {comp.date}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{comp.organizer}</p>
                  <div className="text-[10px] text-cyan-300 font-medium">
                    Ideal: {comp.idealSkills.slice(0, 2).join(' • ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('build_team')}
            className="w-full py-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 text-xs font-bold transition-colors border border-purple-700/40 text-center"
          >
            Form a Squad for These Events
          </button>
        </div>
      </div>
    </div>
  );
};
