import React from 'react';
import { Member, SkillCategory } from '../types';
import { SKILL_CATEGORIES_DATA } from '../data/mockData';
import { Sparkles, Bookmark, UserPlus, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface MemberCardProps {
  member: Member;
  currentUserId?: string;
  matchScore?: number;
  matchReasonsSummary?: string;
  isBookmarked?: boolean;
  onToggleBookmark?: (memberId: string) => void;
  onViewProfile: (member: Member) => void;
  onInvite: (member: Member) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  currentUserId,
  matchScore,
  matchReasonsSummary,
  isBookmarked = false,
  onToggleBookmark,
  onViewProfile,
  onInvite,
}) => {
  const isSelf = currentUserId === member.id;

  const getCategoryBadge = (category: SkillCategory) => {
    const catData = SKILL_CATEGORIES_DATA.find((c) => c.category === category);
    if (!catData) return null;
    return (
      <span
        key={category}
        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${catData.badgeBg} ${catData.textColor} ${catData.borderColor}`}
      >
        {catData.name.split(' ')[0]}
      </span>
    );
  };

  return (
    <div
      id={`member-card-${member.id}`}
      className="group relative bg-[#180d31]/90 hover:bg-[#201142] border border-purple-900/40 hover:border-purple-500/50 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-purple-950/40 flex flex-col justify-between"
    >
      {/* Top Bar: Match Score & Bookmark */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {member.skillCategories.map((cat) => getCategoryBadge(cat))}
            {member.isAvailableForTeam && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Available
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {matchScore !== undefined && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-400/40 text-xs font-bold text-pink-300">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>{matchScore}% Match</span>
              </div>
            )}

            {onToggleBookmark && !isSelf && (
              <button
                id={`btn-bookmark-${member.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(member.id);
                }}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isBookmarked
                    ? 'bg-purple-600/30 border-purple-400 text-purple-300'
                    : 'bg-purple-950/30 border-purple-800/40 text-slate-400 hover:text-white'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark member'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-purple-400' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Avatar & Header */}
        <div className="flex items-center gap-3.5 mb-3.5 cursor-pointer" onClick={() => onViewProfile(member)}>
          <div className="relative flex-shrink-0">
            <img
              src={member.avatar}
              alt={member.name}
              className="w-13 h-13 rounded-xl object-cover ring-2 ring-purple-500/40 group-hover:ring-cyan-400/60 transition-all duration-300"
              referrerPolicy="no-referrer"
            />
            {member.nameAr && (
              <div className="absolute -bottom-1 -right-1 bg-purple-950/90 text-[9px] text-purple-200 px-1.5 rounded font-tajawal border border-purple-700/50">
                {member.nameAr.split(' ')[0]}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base truncate group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
              <span>{member.name}</span>
              {isSelf && (
                <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-purple-600 text-white">You</span>
              )}
            </h3>
            <p className="text-xs text-purple-200/80 truncate">{member.major}</p>
            <p className="text-[11px] text-slate-400">{member.academicYear}</p>
          </div>
        </div>

        {/* Bio Snippet */}
        <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
          {member.bio}
        </p>

        {/* Skills Chips */}
        <div className="mb-3.5">
          <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Key Skills</span>
            <span className="text-[10px] text-purple-400">{member.skills.length} skills</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {member.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="text-[11px] px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-200 border border-purple-800/40 font-medium"
              >
                {skill}
              </span>
            ))}
            {member.skills.length > 4 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-900/30 text-slate-400 font-medium">
                +{member.skills.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Match Reason Banner if provided */}
        {matchReasonsSummary && (
          <div className="mb-3.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="truncate">{matchReasonsSummary}</span>
          </div>
        )}

        {/* Can Help With & Looking For */}
        <div className="space-y-1.5 mb-4 text-[11px] bg-purple-950/40 p-2.5 rounded-xl border border-purple-900/30">
          <div className="flex items-start gap-1.5 text-slate-300">
            <span className="text-emerald-400 font-bold flex-shrink-0">Offers:</span>
            <span className="truncate text-slate-300">{member.canHelpWith}</span>
          </div>
          <div className="flex items-start gap-1.5 text-slate-300">
            <span className="text-pink-400 font-bold flex-shrink-0">Needs:</span>
            <span className="truncate text-slate-300">{member.lookingFor}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-purple-900/40">
        <button
          id={`btn-view-profile-${member.id}`}
          onClick={() => onViewProfile(member)}
          className="flex-1 px-3 py-2 rounded-xl bg-purple-900/30 hover:bg-purple-800/50 text-purple-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1 border border-purple-700/30"
        >
          <span>View Profile</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>

        {!isSelf && (
          <button
            id={`btn-invite-team-${member.id}`}
            onClick={() => onInvite(member)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-purple-950/50 flex items-center justify-center gap-1.5 border border-purple-400/30 active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite</span>
          </button>
        )}
      </div>
    </div>
  );
};
