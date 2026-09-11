import { Member, SkillCategory, Team } from '../types';
import { calculateTeamBalance } from './matching';

export interface GenerateConfig {
  numTeams: number;
  teamSize: number;
  competition: string;
  requiredCategories: SkillCategory[];
}

const FUN_TEAM_NAMES = [
  'Team Nova (نوفا)',
  'ByteSparks (شرارة البايت)',
  'Tuwaiq Falcons (صقور طويق)',
  'Apex Pioneers (رواد القمة)',
  'Tuwaiq Innovators (مبتكرو طويق)',
  'NeuralForge (مصنع النيورال)',
  'PixelCrafters (صناع البكسل)',
  'Quantum Venture (المشروع الكمي)',
  'Summit Squad (فرقة القمة)',
  'CyberGuardians (حماة السايبر)',
  'CodeCraft Syndicate',
  'GreenTech Collective',
];

export function generateBalancedTeams(
  availableMembers: Member[],
  config: GenerateConfig
): Team[] {
  if (availableMembers.length === 0) return [];

  // Group members into pools by primary category
  const poolTech: Member[] = [];
  const poolDesign: Member[] = [];
  const poolBusiness: Member[] = [];
  const poolCommunity: Member[] = [];

  // Shuffle copy of available members first for variety
  const shuffledMembers = [...availableMembers].sort(() => Math.random() - 0.5);

  shuffledMembers.forEach((member) => {
    if (member.skillCategories.includes('TECH')) {
      poolTech.push(member);
    } else if (member.skillCategories.includes('DESIGN')) {
      poolDesign.push(member);
    } else if (member.skillCategories.includes('BUSINESS')) {
      poolBusiness.push(member);
    } else {
      poolCommunity.push(member);
    }
  });

  const numTeams = Math.max(1, Math.min(config.numTeams, Math.ceil(availableMembers.length / config.teamSize)));
  const teams: Team[] = [];

  // Initialize empty teams
  for (let i = 0; i < numTeams; i++) {
    const teamName = FUN_TEAM_NAMES[i % FUN_TEAM_NAMES.length] || `Team Alpha-${i + 1}`;
    teams.push({
      id: `gen-team-${Date.now()}-${i}`,
      name: teamName,
      competition: config.competition || 'Tuwaiq Innovation Challenge 2026',
      description: `Cross-functional squad generated for balanced competition performance.`,
      creatorId: 'system',
      creatorName: 'Tuwaiq Auto-Balancer',
      maxMembers: config.teamSize,
      requiredSkills: ['Tech', 'Design', 'Business'],
      members: [],
      balanceScore: 0,
      createdAt: new Date().toISOString().split('T')[0],
    });
  }

  const assignedMemberIds = new Set<string>();

  // Pass 1: Distribute 1 Tech person to each team if possible
  teams.forEach((team) => {
    const techMember = poolTech.find((m) => !assignedMemberIds.has(m.id));
    if (techMember && team.members.length < config.teamSize) {
      assignedMemberIds.add(techMember.id);
      team.members.push({
        memberId: techMember.id,
        role: 'Tech Lead / Developer',
        category: 'TECH',
      });
    }
  });

  // Pass 2: Distribute 1 Design person to each team if possible
  teams.forEach((team) => {
    const designMember = poolDesign.find((m) => !assignedMemberIds.has(m.id));
    if (designMember && team.members.length < config.teamSize) {
      assignedMemberIds.add(designMember.id);
      team.members.push({
        memberId: designMember.id,
        role: 'UI/UX & Product Design',
        category: 'DESIGN',
      });
    }
  });

  // Pass 3: Distribute 1 Business / Pitch person to each team if possible
  teams.forEach((team) => {
    const bizMember = poolBusiness.find((m) => !assignedMemberIds.has(m.id));
    if (bizMember && team.members.length < config.teamSize) {
      assignedMemberIds.add(bizMember.id);
      team.members.push({
        memberId: bizMember.id,
        role: 'Business & Pitch Strategist',
        category: 'BUSINESS',
      });
    }
  });

  // Pass 4: Distribute Community / remaining members to round out team sizes
  const remainingMembers = shuffledMembers.filter((m) => !assignedMemberIds.has(m.id));

  remainingMembers.forEach((member) => {
    // Find team with lowest member count that is not full
    const targetTeam = teams
      .filter((t) => t.members.length < config.teamSize)
      .sort((a, b) => a.members.length - b.members.length)[0];

    if (targetTeam) {
      assignedMemberIds.add(member.id);
      const primaryCat = member.skillCategories[0] || 'COMMUNITY';
      let role = 'Team Member';
      if (primaryCat === 'TECH') role = 'Software / AI Developer';
      else if (primaryCat === 'DESIGN') role = 'Visual & Brand Designer';
      else if (primaryCat === 'BUSINESS') role = 'Financial / Product Analyst';
      else role = 'Marketing & Communications';

      targetTeam.members.push({
        memberId: member.id,
        role,
        category: primaryCat,
      });
    }
  });

  // Calculate balance score for each generated team
  teams.forEach((team) => {
    const teamMembersList = team.members
      .map((tm) => availableMembers.find((m) => m.id === tm.memberId))
      .filter((m): m is Member => !!m);

    const balance = calculateTeamBalance(teamMembersList, ['AI', 'UI/UX', 'Pitching']);
    team.balanceScore = balance.score;
  });

  return teams.filter((t) => t.members.length > 0);
}
