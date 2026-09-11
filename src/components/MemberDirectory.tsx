import React, { useState, useMemo } from 'react';
import { Member, SkillCategory } from '../types';
import { MemberCard } from './MemberCard';
import { SKILL_CATEGORIES_DATA, DEFAULT_COMPETITIONS } from '../data/mockData';
import {
  Search,
  Filter,
  X,
  LayoutGrid,
  List,
  Sparkles,
  Users,
  Check,
  ChevronDown,
  UserPlus,
} from 'lucide-react';

interface MemberDirectoryProps {
  members: Member[];
  currentUser: Member | null;
  bookmarks: string[];
  onToggleBookmark: (memberId: string) => void;
  onViewProfile: (member: Member) => void;
  onInvite: (member: Member) => void;
  onOpenRegister?: () => void;
  initialSkillFilter?: string | null;
}

export const MemberDirectory: React.FC<MemberDirectoryProps> = ({
  members,
  currentUser,
  bookmarks,
  onToggleBookmark,
  onViewProfile,
  onInvite,
  onOpenRegister,
  initialSkillFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'ALL'>('ALL');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    initialSkillFilter ? [initialSkillFilter] : []
  );
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedCompetition, setSelectedCompetition] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);

  // Toggle skill filter
  const handleToggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedSkills([]);
    setSelectedYear('ALL');
    setSelectedCompetition('ALL');
    setShowOnlyAvailable(false);
    setShowOnlyBookmarks(false);
  };

  // Filter logic
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = member.name.toLowerCase().includes(query);
        const matchesNameAr = member.nameAr?.toLowerCase().includes(query);
        const matchesMajor = member.major.toLowerCase().includes(query);
        const matchesBio = member.bio.toLowerCase().includes(query);
        const matchesSkill = member.skills.some((s) => s.toLowerCase().includes(query));
        const matchesInterest = member.interests.some((i) => i.toLowerCase().includes(query));
        const matchesHelp = member.canHelpWith.toLowerCase().includes(query);
        const matchesLooking = member.lookingFor.toLowerCase().includes(query);

        if (
          !matchesName &&
          !matchesNameAr &&
          !matchesMajor &&
          !matchesBio &&
          !matchesSkill &&
          !matchesInterest &&
          !matchesHelp &&
          !matchesLooking
        ) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory !== 'ALL') {
        if (!member.skillCategories.includes(selectedCategory)) {
          return false;
        }
      }

      // 3. Selected Skills (Must contain ALL or ANY selected skills - let's do ANY if multiple)
      if (selectedSkills.length > 0) {
        const hasSkill = selectedSkills.some((skill) =>
          member.skills.some((s) => s.toLowerCase() === skill.toLowerCase())
        );
        if (!hasSkill) return false;
      }

      // 4. Academic Year
      if (selectedYear !== 'ALL') {
        if (member.academicYear !== selectedYear) return false;
      }

      // 5. Competition
      if (selectedCompetition !== 'ALL') {
        const hasComp = member.competitionInterests.some(
          (c) => c.toLowerCase() === selectedCompetition.toLowerCase()
        );
        if (!hasComp) return false;
      }

      // 6. Availability
      if (showOnlyAvailable && !member.isAvailableForTeam) {
        return false;
      }

      // 7. Bookmarks only
      if (showOnlyBookmarks && !bookmarks.includes(member.id)) {
        return false;
      }

      return true;
    });
  }, [
    members,
    searchQuery,
    selectedCategory,
    selectedSkills,
    selectedYear,
    selectedCompetition,
    showOnlyAvailable,
    showOnlyBookmarks,
    bookmarks,
  ]);

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedCategory !== 'ALL' ? 1 : 0) +
    selectedSkills.length +
    (selectedYear !== 'ALL' ? 1 : 0) +
    (selectedCompetition !== 'ALL' ? 1 : 0) +
    (showOnlyAvailable ? 1 : 0) +
    (showOnlyBookmarks ? 1 : 0);

  // Available skills to show in filter bar depending on selected category
  const visibleSkillChips = useMemo(() => {
    if (selectedCategory === 'ALL') {
      return SKILL_CATEGORIES_DATA.flatMap((cat) => cat.skills).slice(0, 14);
    }
    const cat = SKILL_CATEGORIES_DATA.find((c) => c.category === selectedCategory);
    return cat ? cat.skills : [];
  }, [selectedCategory]);

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-200">
      {/* Directory Top Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Community Talent Pool</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Member Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Discover student builders, designers, pitchers, and organizers in the Tuwaiq Club ecosystem.
          </p>
        </div>

        {/* View Toggle, Register Button & Count */}
        <div className="flex flex-wrap items-center gap-3">
          {onOpenRegister && (
            <button
              id="btn-directory-register-student"
              onClick={onOpenRegister}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-950 transition-all active:scale-95 border border-white/20"
            >
              <UserPlus className="w-3.5 h-3.5 text-yellow-300" />
              <span>{currentUser ? '+ Add Student to Directory' : '+ Create Student Profile'}</span>
            </button>
          )}

          <span className="text-xs font-semibold px-3 py-2 rounded-xl bg-purple-950/80 border border-purple-800/40 text-purple-200">
            Showing <strong className="text-white">{filteredMembers.length}</strong> of {members.length} members
          </span>

          <div className="flex items-center bg-purple-950/60 p-1 rounded-xl border border-purple-800/40">
            <button
              id="btn-view-grid"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="btn-view-list"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* FILTER CONTROL CARD */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#170a2f] border border-purple-800/50 space-y-4 shadow-xl shadow-purple-950/40">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-members"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members by name, skill, major, or interests..."
            className="w-full pl-12 pr-10 py-3 rounded-2xl bg-purple-950/80 border border-purple-700/50 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 text-sm shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === 'ALL'
                ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-900/50'
                : 'bg-purple-950/40 text-slate-300 border-purple-900/40 hover:text-white hover:bg-purple-900/30'
            }`}
          >
            All Tracks ({members.length})
          </button>

          {SKILL_CATEGORIES_DATA.map((cat) => {
            const count = members.filter((m) => m.skillCategories.includes(cat.category)).length;
            const isSelected = selectedCategory === cat.category;
            return (
              <button
                key={cat.category}
                onClick={() => setSelectedCategory(cat.category)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                  isSelected
                    ? `${cat.badgeBg} ${cat.textColor} ${cat.borderColor} shadow-md`
                    : 'bg-purple-950/40 text-slate-400 border-purple-900/40 hover:text-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span>{cat.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950/80 text-white">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Skill Chips Quick Select */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Filter by Specific Skills</span>
            {selectedSkills.length > 0 && (
              <button
                onClick={() => setSelectedSkills([])}
                className="text-pink-400 hover:underline text-[10px]"
              >
                Clear skill filters ({selectedSkills.length})
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {visibleSkillChips.map((skill) => {
              const isSelected = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  onClick={() => handleToggleSkill(skill)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 border ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm'
                      : 'bg-purple-950/50 text-slate-300 border-purple-800/40 hover:border-purple-600 hover:text-white'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-cyan-300" />}
                  <span>{skill}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Extra Dropdown Filters & Toggles */}
        <div className="pt-2 border-t border-purple-900/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Academic Year Filter */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-800/60 text-xs text-purple-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Academic Years</option>
              <option value="Freshman (Year 1)">Freshman (Year 1)</option>
              <option value="Sophomore (Year 2)">Sophomore (Year 2)</option>
              <option value="Junior (Year 3)">Junior (Year 3)</option>
              <option value="Senior (Year 4)">Senior (Year 4)</option>
            </select>

            {/* Target Competition Filter */}
            <select
              value={selectedCompetition}
              onChange={(e) => setSelectedCompetition(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-800/60 text-xs text-purple-200 focus:outline-none focus:border-cyan-400 max-w-[200px]"
            >
              <option value="ALL">All Competitions</option>
              {DEFAULT_COMPETITIONS.map((c) => (
                <option key={c.id} value={c.title}>
                  {c.title}
                </option>
              ))}
            </select>

            {/* Bookmarks Filter */}
            <button
              onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                showOnlyBookmarks
                  ? 'bg-purple-600/40 text-purple-200 border-purple-400'
                  : 'bg-purple-950/40 text-slate-400 border-purple-800/40 hover:text-white'
              }`}
            >
              ⭐ Bookmarked ({bookmarks.length})
            </button>
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset All Filters ({activeFiltersCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* MEMBER CARDS GRID / LIST */}
      {filteredMembers.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
              : 'space-y-4'
          }
        >
          {filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              currentUserId={currentUser?.id}
              isBookmarked={bookmarks.includes(member.id)}
              onToggleBookmark={onToggleBookmark}
              onViewProfile={onViewProfile}
              onInvite={onInvite}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl bg-[#170a2f] border border-purple-800/40 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-purple-900/40 border border-purple-700/50 mx-auto flex items-center justify-center text-purple-400">
            {members.length === 0 ? <Users className="w-8 h-8" /> : <Search className="w-8 h-8" />}
          </div>
          <h3 className="text-lg font-bold text-white">
            {members.length === 0 ? 'No registered student profiles yet' : 'No matching members found'}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {members.length === 0
              ? 'Be the first to join! Create your student profile, select your skills, and start forming squads.'
              : 'Try adjusting your search keywords, clearing skill tags, or selecting "All Tracks" to explore the full community.'}
          </p>
          {members.length === 0 && onOpenRegister ? (
            <button
              onClick={onOpenRegister}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-purple-950 transition-transform active:scale-95"
            >
              + Create Student Profile
            </button>
          ) : (
            <button
              onClick={handleClearFilters}
              className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold shadow-lg"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};
