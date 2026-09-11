export type SkillCategory = 'TECH' | 'DESIGN' | 'BUSINESS' | 'COMMUNITY';

export interface SkillItem {
  id: string;
  name: string;
  category: SkillCategory;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export type AcademicYear = 'Freshman (Year 1)' | 'Sophomore (Year 2)' | 'Junior (Year 3)' | 'Senior (Year 4)';

export interface Member {
  id: string;
  name: string;
  nameAr?: string;
  major: string;
  majorAr?: string;
  academicYear: AcademicYear;
  avatar: string;
  bio: string;
  skills: string[]; // Skill names
  skillCategories: SkillCategory[];
  interests: string[];
  experience: string;
  canHelpWith: string;
  lookingFor: string;
  competitionInterests: string[];
  contact: {
    email: string;
    github?: string;
    linkedin?: string;
    portfolio?: string;
    telegram?: string;
  };
  isAvailableForTeam: boolean;
  createdAt: string;
  ownerUid?: string;
  ownerKey?: string;
}

export interface TeamMemberRole {
  memberId: string;
  role: string;
  category: SkillCategory;
}

export interface Team {
  id: string;
  name: string;
  competition: string;
  description: string;
  creatorId: string;
  creatorName: string;
  members: TeamMemberRole[];
  maxMembers: number;
  requiredSkills: string[];
  balanceScore: number;
  createdAt: string;
}

export interface MatchReason {
  type: 'required_skill' | 'competition' | 'complementary' | 'interest' | 'academic';
  text: string;
  highlight?: string;
}

export interface MatchResult {
  member: Member;
  score: number; // 0 - 100
  reasons: MatchReason[];
  complementaryAspects: string[];
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  teamName: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  roleProposed: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  createdAt: string;
}

export interface Competition {
  id: string;
  title: string;
  organizer: string;
  date: string;
  tag: string;
  recommendedTeamSize: string;
  idealSkills: string[];
}
