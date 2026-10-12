import React from 'react';
import { Member, SkillCategory } from '../types';
import { SKILL_CATEGORIES_DATA } from '../data/mockData';
import {
  X,
  UserPlus,
  Mail,
  Github,
  Linkedin,
  Globe,
  Send,
  Sparkles,
  Trophy,
  Compass,
  Award,
  Share2,
} from 'lucide-react';

interface MemberProfileModalProps {
  member: Member | null;
  currentUserId?: string;
  currentUser?: Member;
  isOpen?: boolean;
  onClose: () => void;
  onInvite: (member: Member) => void;
  onEdit?: (member: Member) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  member,
  currentUserId,
  currentUser,
  isOpen = true,
  onClose,
  onInvite,
  onEdit,
  isBookmarked,
  onToggleBookmark,
}) => {
  if (!member || !isOpen) return null;

  const effectiveUserId = currentUserId || currentUser?.id;
  const isSelf = effectiveUserId === member.id;

  const getCategoryDetails = (cat: SkillCategory) => {
    return SKILL_CATEGORIES_DATA.find((c) => c.category === cat);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#170a2d] border border-purple-600/40 rounded-3xl shadow-2xl shadow-purple-950/80 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Banner */}
        <div className="h-32 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 relative p-4 flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-purple-950/80 border border-purple-400/30 text-xs font-semibold text-purple-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Tuwaiq Member Profile</span>
            </span>
          </div>

          <button
            id="btn-close-profile-modal"
            onClick={onClose}
            className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar and Main Info Bar */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 mb-6">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-[#170a2d] border-2 border-purple-500/50 shadow-xl"
                  referrerPolicy="no-referrer"
                />
                {member.isAvailableForTeam && (
                  <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-[#170a2d]" title="Available for teams" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-extrabold text-white">{member.name}</h2>
                  {member.nameAr && (
                    <span className="text-lg text-purple-300 font-tajawal">({member.nameAr})</span>
                  )}
                </div>
                <p className="text-sm font-semibold text-cyan-400">{member.major}</p>
                <p className="text-xs text-slate-400">{member.academicYear} • Tuwaiq Club</p>
              </div>
            </div>

            {/* Action Button */}
            {!isSelf ? (
              <button
                id="btn-modal-invite-team"
                onClick={() => {
                  onClose();
                  onInvite(member);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-purple-900/50 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite to Team</span>
              </button>
            ) : onEdit ? (
              <button
                id="btn-modal-edit-profile"
                onClick={() => {
                  onClose();
                  onEdit(member);
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-sm font-bold shadow-lg shadow-purple-900/50 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Edit My Profile</span>
              </button>
            ) : null}
          </div>

          {/* Categories pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(member.skillCategories || []).map((cat) => {
              const catData = getCategoryDetails(cat);
              if (!catData) return null;
              return (
                <div
                  key={cat}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border ${catData.badgeBg} ${catData.textColor} ${catData.borderColor} flex items-center gap-1.5`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: catData.color }} />
                  <span>{catData.name}</span>
                  <span className="text-[10px] text-slate-400 font-tajawal">({catData.nameAr})</span>
                </div>
              );
            })}
          </div>

          {/* Bio Section */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">About & Bio</h4>
            <p className="text-sm text-slate-200 leading-relaxed bg-purple-950/30 p-4 rounded-2xl border border-purple-900/40">
              {member.bio}
            </p>
          </div>

          {/* Synergy Box (Offers / Needs) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase mb-1.5">
                <Sparkles className="w-4 h-4" />
                <span>I Can Help With / What I Offer</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{member.canHelpWith}</p>
            </div>

            <div className="p-4 rounded-2xl bg-pink-950/20 border border-pink-500/30">
              <div className="flex items-center gap-2 text-pink-400 font-bold text-xs uppercase mb-1.5">
                <Compass className="w-4 h-4" />
                <span>I'm Looking For / Teammate Wishlist</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{member.lookingFor}</p>
            </div>
          </div>

          {/* All Skills List */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-2.5">Skills & Proficiencies</h4>
            <div className="flex flex-wrap gap-2">
              {(member.skills || []).map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-xl bg-purple-900/40 text-purple-100 text-xs font-medium border border-purple-700/40 hover:border-purple-400 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Experience & Achievements */}
          {member.experience && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
                <Award className="w-4 h-4 text-yellow-400" />
                <span>Track Record & Experience</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-purple-950/20 p-3.5 rounded-2xl border border-purple-900/30">
                {member.experience}
              </p>
            </div>
          )}

          {/* Competition Interests & Domains */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
                <Trophy className="w-4 h-4 text-purple-400" />
                <span>Target Competitions</span>
              </div>
              <div className="space-y-1.5">
                {(member.competitionInterests || []).map((comp) => (
                  <div
                    key={comp}
                    className="text-xs px-3 py-1.5 rounded-xl bg-purple-950/50 border border-purple-800/40 text-purple-200 font-medium"
                  >
                    {comp}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Domains of Interest</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(member.interests || []).map((interest) => (
                  <span
                    key={interest}
                    className="text-xs px-2.5 py-1 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-200"
                  >
                    #{interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Contact & Portfolio Links */}
          <div className="pt-4 border-t border-purple-900/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {member.contact.email && (
                <a
                  href={`mailto:${member.contact.email}`}
                  className="px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-purple-700/30"
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{member.contact.email}</span>
                </a>
              )}
              {member.contact.github && (
                <a
                  href={`https://github.com/${member.contact.github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-purple-700/30"
                >
                  <Github className="w-3.5 h-3.5 text-slate-300" />
                  <span>GitHub</span>
                </a>
              )}
              {member.contact.linkedin && (
                <a
                  href={`https://linkedin.com/in/${member.contact.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-purple-700/30"
                >
                  <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                  <span>LinkedIn</span>
                </a>
              )}
              {member.contact.portfolio && (
                <a
                  href={`https://${member.contact.portfolio}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-purple-700/30"
                >
                  <Globe className="w-3.5 h-3.5 text-pink-400" />
                  <span>Portfolio</span>
                </a>
              )}
            </div>

            <span className="text-[11px] text-slate-400">
              Joined Tuwaiq Platform {member.createdAt}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
