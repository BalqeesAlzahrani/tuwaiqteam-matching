import React, { useState, useRef } from 'react';
import { Member, SkillCategory, AcademicYear } from '../types';
import { SKILL_CATEGORIES_DATA, DEFAULT_COMPETITIONS } from '../data/mockData';
import {
  X,
  Plus,
  Sparkles,
  Check,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Trash2,
  Trophy,
  Link as LinkIcon,
} from 'lucide-react';

interface ProfileSetupModalProps {
  initialMember?: Member | null;
  currentProfile?: Member | null;
  isOpen?: boolean;
  onSave?: (member: Member) => void;
  onSaveProfile?: (member: Member) => void;
  onClose: () => void;
}

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';

const COMMON_INTERESTS = [
  'Hackathons',
  'Generative AI',
  'FinTech',
  'GreenTech',
  'EdTech',
  'HealthTech',
  'SaaS',
  'Design Systems',
  'Venture Capital',
  'Mobile Apps',
  'Cybersecurity',
  'Robotics',
];

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
  initialMember,
  currentProfile,
  isOpen = true,
  onSave,
  onSaveProfile,
  onClose,
}) => {
  const profile = currentProfile || initialMember;
  const saveHandler = onSave || onSaveProfile;

  const [name, setName] = useState(profile?.name || '');
  const [nameAr, setNameAr] = useState(profile?.nameAr || '');
  const [major, setMajor] = useState(profile?.major || '');
  const [academicYear, setAcademicYear] = useState<AcademicYear>(
    (profile?.academicYear as AcademicYear) || 'Sophomore (Year 2)'
  );
  const [avatar, setAvatar] = useState(profile?.avatar || DEFAULT_AVATAR);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bio, setBio] = useState(profile?.bio || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    profile?.skills || []
  );
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [customSkillCategory, setCustomSkillCategory] = useState<SkillCategory>('TECH');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    profile?.interests || []
  );
  const [customInterestInput, setCustomInterestInput] = useState('');
  const [experience, setExperience] = useState(profile?.experience || '');
  const [canHelpWith, setCanHelpWith] = useState(profile?.canHelpWith || '');
  const [lookingFor, setLookingFor] = useState(profile?.lookingFor || '');

  // Target competitions added by the user themselves
  const [selectedCompetitions, setSelectedCompetitions] = useState<string[]>(
    profile?.competitionInterests || []
  );
  const [customCompetitionInput, setCustomCompetitionInput] = useState('');

  const [email, setEmail] = useState(profile?.contact?.email || '');
  const [github, setGithub] = useState(profile?.contact?.github || '');
  const [linkedin, setLinkedin] = useState(profile?.contact?.linkedin || '');
  const [portfolio, setPortfolio] = useState(profile?.contact?.portfolio || '');
  const [activeTab, setActiveTab] = useState<'basics' | 'skills' | 'synergy' | 'contact'>('basics');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Photo File Upload
  const handlePhotoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
        setCustomAvatarUrl('');
        setErrorMsg('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePhotoFile(file);
  };

  const handlePhotoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPhoto(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handlePhotoFile(file);
  };

  // Toggle skill
  const handleToggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Add custom skill
  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSkillInput.trim()) return;
    if (!selectedSkills.includes(customSkillInput.trim())) {
      setSelectedSkills([...selectedSkills, customSkillInput.trim()]);
    }
    setCustomSkillInput('');
  };

  // Toggle interest
  const handleToggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // Add custom interest
  const handleAddCustomInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInterestInput.trim()) return;
    if (!selectedInterests.includes(customInterestInput.trim())) {
      setSelectedInterests([...selectedInterests, customInterestInput.trim()]);
    }
    setCustomInterestInput('');
  };

  // Add target competition (User adds it themselves)
  const handleAddCustomCompetition = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customCompetitionInput.trim();
    if (!trimmed) return;
    if (!selectedCompetitions.includes(trimmed)) {
      setSelectedCompetitions([...selectedCompetitions, trimmed]);
    }
    setCustomCompetitionInput('');
  };

  const handleRemoveCompetition = (compToRemove: string) => {
    setSelectedCompetitions(selectedCompetitions.filter((c) => c !== compToRemove));
  };

  const handleQuickAddCompetition = (compTitle: string) => {
    if (!selectedCompetitions.includes(compTitle)) {
      setSelectedCompetitions([...selectedCompetitions, compTitle]);
    }
  };

  // Calculate derived categories from selected skills
  const deriveCategories = (skillsList: string[]): SkillCategory[] => {
    const cats = new Set<SkillCategory>();
    skillsList.forEach((skill) => {
      for (const catData of SKILL_CATEGORIES_DATA) {
        if (catData.skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
          cats.add(catData.category);
        }
      }
    });
    if (cats.size === 0) cats.add('TECH');
    return Array.from(cats);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      setActiveTab('basics');
      return;
    }
    if (selectedSkills.length === 0) {
      setErrorMsg('Please select at least 1 skill.');
      setActiveTab('skills');
      return;
    }

    const categories = deriveCategories(selectedSkills);

    const updatedMember: Member = {
      id: profile?.id || `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      nameAr: nameAr.trim() || undefined,
      major: major.trim(),
      academicYear,
      avatar: customAvatarUrl.trim() || avatar,
      bio: bio.trim(),
      skills: selectedSkills,
      skillCategories: categories,
      interests: selectedInterests,
      experience: experience.trim(),
      canHelpWith: canHelpWith.trim() || 'Frontend development and ideation.',
      lookingFor: lookingFor.trim() || 'Teammates with complementary skills.',
      competitionInterests:
        selectedCompetitions.length > 0 ? selectedCompetitions : ['Tuwaiq Innovation Challenge 2026'],
      contact: {
        email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@stu.bu.edu.sa`,
        github: github.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        portfolio: portfolio.trim() || undefined,
      },
      isAvailableForTeam: true,
      createdAt: profile?.createdAt || new Date().toISOString().split('T')[0],
      ownerKey: profile?.ownerKey,
      ownerUid: profile?.ownerUid,
    };

    if (saveHandler) {
      saveHandler(updatedMember);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-[#170a2d] border border-purple-500/40 rounded-3xl shadow-2xl shadow-purple-950/90 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 p-5 sm:p-6 flex items-center justify-between border-b border-purple-800/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-md bg-purple-600/40 text-cyan-300">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Tuwaiq Club • مسار ريادة الأعمال والتقنية
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {initialMember ? 'Edit Your Member Profile' : 'Create Your Tuwaiq Profile'}
            </h2>
          </div>

          <button
            id="btn-close-profile-setup"
            onClick={onClose}
            className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-purple-900/50 px-6 bg-purple-950/40 gap-2 overflow-x-auto">
          {[
            { id: 'basics', label: '1. Basic Info & Avatar' },
            { id: 'skills', label: '2. Skills & Categories' },
            { id: 'synergy', label: '3. What You Offer / Need' },
            { id: 'contact', label: '4. Contact & Links' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-400 text-purple-200'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="p-6">
          {/* TAB 1: BASICS */}
          {activeTab === 'basics' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-purple-200 uppercase mb-1.5">
                    Full Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-200 uppercase mb-1.5">
                    الاسم بالعربية (اختياري)
                  </label>
                  <input
                    type="text"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="الاسم الكامل بالعربية"
                    className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-tajawal"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-purple-200 uppercase mb-1.5">
                    Major / Department *
                  </label>
                  <input
                    type="text"
                    required
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="Enter your major or specialization"
                    className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-200 uppercase mb-1.5">
                    Academic Year *
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value as AcademicYear)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1e1039] border border-purple-800/60 text-white focus:outline-none focus:border-cyan-400 text-sm"
                  >
                    <option value="Freshman (Year 1)">Freshman (Year 1)</option>
                    <option value="Sophomore (Year 2)">Sophomore (Year 2)</option>
                    <option value="Junior (Year 3)">Junior (Year 3)</option>
                    <option value="Senior (Year 4)">Senior (Year 4)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase mb-1.5">
                  Bio & Introduction
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short summary of who you are, what projects excite you, and what makes you a great teammate..."
                  className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                />
              </div>

              {/* Custom Photo Upload Only */}
              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase mb-2">
                  Your Profile Photo
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-purple-950/40 border border-purple-800/50">
                  {/* Photo Preview */}
                  <div className="relative group w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-purple-400/50 flex-shrink-0 shadow-lg shadow-purple-950/80 bg-purple-900/40">
                    <img
                      src={customAvatarUrl.trim() || avatar}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity"
                    >
                      <Upload className="w-4 h-4 mb-0.5 text-cyan-300" />
                      <span>Change</span>
                    </button>
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2.5 w-full">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileInputChange}
                      accept="image/*"
                      className="hidden"
                    />

                    {/* Drag & Drop or Click Area */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingPhoto(true);
                      }}
                      onDragLeave={() => setIsDraggingPhoto(false)}
                      onDrop={handlePhotoDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`cursor-pointer px-4 py-3 rounded-xl border-2 border-dashed text-center transition-all ${
                        isDraggingPhoto
                          ? 'border-cyan-400 bg-cyan-950/30 text-cyan-200'
                          : 'border-purple-700/50 hover:border-purple-400/80 bg-purple-950/30 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2 text-xs font-semibold">
                        <Upload className="w-4 h-4 text-cyan-400" />
                        <span>Upload photo from your device</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Drag and drop or click to browse (PNG, JPG, WebP)
                      </p>
                    </div>

                    {/* Direct Image URL input */}
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <input
                        type="url"
                        value={customAvatarUrl}
                        onChange={(e) => setCustomAvatarUrl(e.target.value)}
                        placeholder="Or paste direct image URL (https://...)"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-800/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                      {(avatar !== DEFAULT_AVATAR || customAvatarUrl) && (
                        <button
                          type="button"
                          onClick={() => {
                            setAvatar(DEFAULT_AVATAR);
                            setCustomAvatarUrl('');
                          }}
                          title="Reset to default photo"
                          className="p-1.5 rounded-lg bg-purple-900/60 hover:bg-red-950/50 text-slate-400 hover:text-red-300 border border-purple-800/40 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SKILLS & CATEGORIES */}
          {activeTab === 'skills' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-200">
                💡 Select skills that best describe your capabilities. Click on tags to select/deselect them.
              </div>

              {/* Skills by Category */}
              {SKILL_CATEGORIES_DATA.map((catData) => (
                <div key={catData.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: catData.color }} />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {catData.name} <span className="font-tajawal text-slate-400">({catData.nameAr})</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {catData.skills.map((skill) => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => handleToggleSkill(skill)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border ${
                            isSelected
                              ? `${catData.badgeBg} ${catData.textColor} ${catData.borderColor} shadow-sm`
                              : 'bg-purple-950/30 text-slate-400 border-purple-900/40 hover:text-slate-200 hover:border-purple-700/50'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          <span>{skill}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Add Custom Skill */}
              <div className="pt-3 border-t border-purple-900/50">
                <label className="block text-xs font-bold text-purple-200 uppercase mb-2">
                  Can't find your skill? Add Custom Skill
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    placeholder="Type skill name and click Add"
                    className="flex-1 px-4 py-2 rounded-xl bg-purple-950/60 border border-purple-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSkill}
                    className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Selected Skills Summary */}
              <div>
                <div className="text-xs font-bold text-slate-300 uppercase mb-2">
                  Your Selected Skills ({selectedSkills.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSkills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600/30 text-purple-200 border border-purple-500/40 text-xs"
                    >
                      <span>{s}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleSkill(s)}
                        className="hover:text-red-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SYNERGY & COMPETITION */}
          {activeTab === 'synergy' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-400 uppercase mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>"I can help with..." *</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={canHelpWith}
                    onChange={(e) => setCanHelpWith(e.target.value)}
                    placeholder="Detail your strengths, technical capabilities, and what you can contribute to a squad"
                    className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-emerald-500/40 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 text-sm"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">This helps matchmakers discover what unique value you bring.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-pink-400 uppercase mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>"I'm looking for..." *</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={lookingFor}
                    onChange={(e) => setLookingFor(e.target.value)}
                    placeholder="Describe the skills and teammate roles you need in your squad"
                    className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-pink-500/40 text-white placeholder-slate-500 focus:outline-none focus:border-pink-400 text-sm"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Describe the missing teammates you need to succeed.</p>
                </div>
              </div>

              {/* Past Experience */}
              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase mb-1.5">
                  Past Experience / Notable Projects
                </label>
                <textarea
                  rows={2}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Describe your previous projects, competitions, or achievements"
                  className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                />
              </div>

              {/* Target Competitions - User Adds It Themselves */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-purple-200 uppercase flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-purple-400" />
                    <span>Target Competitions & Hackathons (Add Your Own)</span>
                  </label>
                  <span className="text-[11px] text-cyan-300 font-medium">
                    {selectedCompetitions.length} added
                  </span>
                </div>

                {/* Input to add competitions manually */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customCompetitionInput}
                    onChange={(e) => setCustomCompetitionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomCompetition();
                      }
                    }}
                    placeholder="Enter competition or hackathon name"
                    className="flex-1 px-4 py-2 rounded-xl bg-purple-950/60 border border-purple-800/60 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCustomCompetition()}
                    className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Active Competitions List */}
                <div className="flex flex-wrap gap-2">
                  {selectedCompetitions.map((comp) => (
                    <div
                      key={comp}
                      className="px-3 py-1.5 rounded-xl bg-purple-900/60 border border-purple-600/60 text-purple-100 text-xs font-semibold flex items-center gap-2 shadow-sm"
                    >
                      <Trophy className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                      <span>{comp}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCompetition(comp)}
                        className="p-0.5 rounded-full hover:bg-purple-800 text-slate-400 hover:text-red-300 transition-colors"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {selectedCompetitions.length === 0 && (
                    <p className="text-xs text-slate-400 italic">
                      No competitions added yet. Type one above or click a suggestion below!
                    </p>
                  )}
                </div>

                {/* Quick Add Suggestions */}
                <div className="pt-2">
                  <span className="block text-[11px] text-slate-400 font-medium mb-1.5">
                    Popular suggestions (click to add):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {DEFAULT_COMPETITIONS.map((comp) => {
                      const isAlreadyAdded = selectedCompetitions.includes(comp.title);
                      return (
                        <button
                          key={comp.id}
                          type="button"
                          disabled={isAlreadyAdded}
                          onClick={() => handleQuickAddCompetition(comp.title)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                            isAlreadyAdded
                              ? 'bg-purple-950/40 text-slate-500 border-purple-900/30 cursor-default line-through'
                              : 'bg-purple-950/40 text-purple-300 border-purple-800/40 hover:border-cyan-400 hover:text-white'
                          }`}
                        >
                          + {comp.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Domain Interests */}
              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase mb-2">
                  Domain Interests (Select or Add)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {COMMON_INTERESTS.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleToggleInterest(interest)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-purple-950/30 text-slate-400 border-purple-900/40 hover:text-white'
                        }`}
                      >
                        #{interest}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customInterestInput}
                    onChange={(e) => setCustomInterestInput(e.target.value)}
                    placeholder="Add custom interest tag..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-purple-950/50 border border-purple-800/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomInterest}
                    className="px-3 py-1.5 rounded-lg bg-purple-800 hover:bg-purple-700 text-white text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONTACT & LINKS */}
          {activeTab === 'contact' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase mb-1.5">
                  University / Contact Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@stu.bu.edu.sa"
                  className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-purple-200 uppercase mb-1.5">
                    GitHub Username
                  </label>
                  <input
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="GitHub username or profile link"
                    className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-200 uppercase mb-1.5">
                    LinkedIn Username
                  </label>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="LinkedIn profile URL"
                    className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-200 uppercase mb-1.5">
                    Portfolio / Website
                  </label>
                  <input
                    type="text"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    placeholder="Personal website or portfolio URL"
                    className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-900/50 mt-6">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Tuwaiq Community Pledge</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  By joining, you become part of the Al-Baha University Technology & Entrepreneurship Track talent ecosystem, connecting with ambitious peers to form winning competition squads.
                </p>
              </div>
            </div>
          )}

          {/* Footer & Submit Buttons */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-purple-900/50">
            <div className="flex items-center gap-2">
              {activeTab !== 'basics' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'skills') setActiveTab('basics');
                    else if (activeTab === 'synergy') setActiveTab('skills');
                    else if (activeTab === 'contact') setActiveTab('synergy');
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-slate-300 text-xs font-semibold"
                >
                  Previous
                </button>
              )}

              {activeTab !== 'contact' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'basics') setActiveTab('skills');
                    else if (activeTab === 'skills') setActiveTab('synergy');
                    else if (activeTab === 'synergy') setActiveTab('contact');
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-800/60 hover:bg-purple-700 text-purple-200 text-xs font-semibold"
                >
                  Next Step
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-transparent hover:bg-purple-950 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                id="btn-save-member-profile"
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-900/50 transition-all active:scale-95 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{initialMember ? 'Save Profile' : 'Publish Tuwaiq Profile'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
