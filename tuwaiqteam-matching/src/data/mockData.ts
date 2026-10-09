import { Member, SkillCategory, Competition, Team } from '../types';

export const SKILL_CATEGORIES_DATA: {
  category: SkillCategory;
  name: string;
  nameAr: string;
  color: string;
  accentBg: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  skills: string[];
}[] = [
  {
    category: 'TECH',
    name: 'Tech & Engineering',
    nameAr: 'التقنية والبرمجة',
    color: '#06b6d4', // cyan
    accentBg: 'bg-cyan-500/10',
    badgeBg: 'bg-cyan-500/20',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    skills: [
      'Programming',
      'AI',
      'Machine Learning',
      'Data Science',
      'Web Development',
      'Mobile Development',
      'Cybersecurity',
      'Cloud & DevOps',
      'Python',
      'React & TypeScript',
      'Flutter',
      'Computer Vision',
    ],
  },
  {
    category: 'DESIGN',
    name: 'Design & Creative',
    nameAr: 'التصميم والإبداع',
    color: '#ec4899', // pink/magenta
    accentBg: 'bg-pink-500/10',
    badgeBg: 'bg-pink-500/20',
    textColor: 'text-pink-400',
    borderColor: 'border-pink-500/40',
    skills: [
      'UI/UX',
      'Graphic Design',
      'Figma',
      'Branding',
      'Video Editing',
      '3D Modeling',
      'Design Systems',
      'Wireframing',
      'Product Prototyping',
      'Motion Design',
    ],
  },
  {
    category: 'BUSINESS',
    name: 'Business & Strategy',
    nameAr: 'الأعمال والريادة',
    color: '#10b981', // emerald
    accentBg: 'bg-emerald-500/10',
    badgeBg: 'bg-emerald-500/20',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    skills: [
      'Entrepreneurship',
      'Business',
      'Finance',
      'Business Model',
      'Pitching',
      'Market Research',
      'Product Management',
      'Growth Strategy',
      'Financial Modeling',
      'Value Proposition',
    ],
  },
  {
    category: 'COMMUNITY',
    name: 'Community & Leadership',
    nameAr: 'المجتمع والقيادة',
    color: '#f97316', // orange
    accentBg: 'bg-orange-500/10',
    badgeBg: 'bg-orange-500/20',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/40',
    skills: [
      'Marketing',
      'PR',
      'Social Media',
      'Leadership',
      'Project Management',
      'Public Speaking',
      'Team Facilitation',
      'Event Planning',
      'Content Creation',
      'Storytelling',
    ],
  },
];

export const ALL_SKILLS_LIST = SKILL_CATEGORIES_DATA.flatMap((cat) => cat.skills);

export const DEFAULT_COMPETITIONS: Competition[] = [
  {
    id: 'comp-1',
    title: 'Tuwaiq Innovation Challenge 2026',
    organizer: 'Tuwaiq Club',
    date: 'Oct 2026',
    tag: 'Hackathon',
    recommendedTeamSize: '3-4 members',
    idealSkills: ['AI', 'UI/UX', 'Pitching', 'Web Development'],
  },
  {
    id: 'comp-2',
    title: 'Tuwaiq FinTech Sprint',
    organizer: 'College of Computer Science & Business',
    date: 'Nov 2026',
    tag: 'FinTech',
    recommendedTeamSize: '4 members',
    idealSkills: ['Finance', 'Mobile Development', 'Cybersecurity', 'Business Model'],
  },
  {
    id: 'comp-3',
    title: 'Saudi Green & Tourism Hackathon',
    organizer: 'Ministry of Tourism & Monshaat',
    date: 'Dec 2026',
    tag: 'Sustainability',
    recommendedTeamSize: '3-5 members',
    idealSkills: ['Product Management', 'Data Science', 'UI/UX', 'Public Speaking'],
  },
  {
    id: 'comp-4',
    title: 'Graduation Capstone Showcase',
    organizer: 'Faculty of Computer Engineering',
    date: 'Spring 2027',
    tag: 'Capstone',
    recommendedTeamSize: '4 members',
    idealSkills: ['Programming', 'Machine Learning', 'Figma', 'Project Management'],
  },
];

export const INITIAL_MEMBERS: Member[] = [];

export const INITIAL_TEAMS: Team[] = [];
