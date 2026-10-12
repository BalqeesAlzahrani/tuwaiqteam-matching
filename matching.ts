import { Member, MatchResult, MatchReason, SkillCategory } from '../types';
import { SKILL_CATEGORIES_DATA } from '../data/mockData';

export interface MatchingCriteria {
  skillsNeeded: string[];
  competition?: string;
  interests: string[];
  targetCategories?: SkillCategory[];
  currentMemberId?: string;
}

export function calculateMemberMatch(
  targetMember: Member,
  criteria: MatchingCriteria,
  sourceMember?: Member
): MatchResult {
  let score = 0;
  const reasons: MatchReason[] = [];
  const complementaryAspects: string[] = [];

  // Don't match with self
  if (sourceMember && targetMember.id === sourceMember.id) {
    return { member: targetMember, score: 0, reasons: [], complementaryAspects: [] };
  }

  // 1. Check required skills (High weight: 40 points total)
  if (criteria.skillsNeeded.length > 0) {
    const matchedSkills = targetMember.skills.filter((s) =>
      criteria.skillsNeeded.some((req) => req.toLowerCase() === s.toLowerCase())
    );

    if (matchedSkills.length > 0) {
      const skillScore = Math.min(40, (matchedSkills.length / Math.max(1, criteria.skillsNeeded.length)) * 40);
      score += skillScore;
      reasons.push({
        type: 'required_skill',
        text: `Has ${matchedSkills.length} required skill${matchedSkills.length > 1 ? 's' : ''}`,
        highlight: matchedSkills.join(', '),
      });
    }
  }

  // 2. Check "Looking For" vs "Can Help With" synergy (Weight: 25 points)
  if (sourceMember) {
    const sourceLookingFor = sourceMember.lookingFor.toLowerCase();
    const targetCanHelp = targetMember.canHelpWith.toLowerCase();
    const targetSkillsText = targetMember.skills.join(' ').toLowerCase();

    // Does target offer what source is looking for?
    const hasSynergy =
      targetSkillsText.split(' ').some((word) => word.length > 3 && sourceLookingFor.includes(word)) ||
      targetCanHelp.split(' ').some((word) => word.length > 4 && sourceLookingFor.includes(word));

    if (hasSynergy) {
      score += 25;
      reasons.push({
        type: 'complementary',
        text: 'Directly offers capabilities you are looking for',
        highlight: targetMember.canHelpWith.slice(0, 75) + '...',
      });
    }

    // 3. Category Complementarity (Tech vs Design vs Business vs Community) (Weight: 15 points)
    const sourceCats = new Set(sourceMember.skillCategories);
    const targetCats = new Set(targetMember.skillCategories);
    
    // Complementary if they have categories source doesn't have
    const newCategories = targetMember.skillCategories.filter((cat) => !sourceCats.has(cat));
    if (newCategories.length > 0) {
      score += 15;
      const catNames = newCategories
        .map((c) => SKILL_CATEGORIES_DATA.find((sc) => sc.category === c)?.name || c)
        .join(', ');
      reasons.push({
        type: 'complementary',
        text: `Brings complementary skill tracks to your team`,
        highlight: catNames,
      });
      complementaryAspects.push(`Covers ${catNames}`);
    }
  }

  // 4. Shared Competition Interest (Weight: 15 points)
  if (criteria.competition) {
    const hasSharedComp = targetMember.competitionInterests.some(
      (c) => c.toLowerCase() === criteria.competition?.toLowerCase()
    );
    if (hasSharedComp) {
      score += 15;
      reasons.push({
        type: 'competition',
        text: `Actively interested in ${criteria.competition}`,
        highlight: criteria.competition,
      });
    }
  } else if (sourceMember && sourceMember.competitionInterests.length > 0) {
    const shared = targetMember.competitionInterests.filter((c) =>
      sourceMember.competitionInterests.includes(c)
    );
    if (shared.length > 0) {
      score += 12;
      reasons.push({
        type: 'competition',
        text: `Shared competition focus`,
        highlight: shared[0],
      });
    }
  }

  // 5. Shared Domain Interests (Weight: 10 points)
  if (criteria.interests.length > 0) {
    const sharedInterests = targetMember.interests.filter((i) =>
      criteria.interests.some((req) => req.toLowerCase() === i.toLowerCase())
    );
    if (sharedInterests.length > 0) {
      score += 10;
      reasons.push({
        type: 'interest',
        text: `Shared domain passion`,
        highlight: sharedInterests.join(', '),
      });
    }
  } else if (sourceMember && sourceMember.interests.length > 0) {
    const sharedInterests = targetMember.interests.filter((i) =>
      sourceMember.interests.includes(i)
    );
    if (sharedInterests.length > 0) {
      score += 8;
      reasons.push({
        type: 'interest',
        text: `Shared interest in ${sharedInterests.slice(0, 2).join(', ')}`,
        highlight: sharedInterests.join(', '),
      });
    }
  }

  // Base compatibility baseline to avoid 0%
  const finalScore = Math.min(99, Math.max(55, Math.round(score + 35)));

  // If no specific reasons generated, add a general baseline reason
  if (reasons.length === 0) {
    reasons.push({
      type: 'academic',
      text: `Tuwaiq Club Member (${targetMember.major})`,
      highlight: `${targetMember.academicYear}`,
    });
  }

  return {
    member: targetMember,
    score: finalScore,
    reasons,
    complementaryAspects,
  };
}

export function calculateTeamBalance(
  members: Member[],
  requiredSkills: string[] = []
): {
  score: number;
  categoryCoverage: { category: SkillCategory; count: number; name: string; color: string }[];
  missingCategories: SkillCategory[];
  missingSkills: string[];
  feedback: string;
} {
  if (members.length === 0) {
    return {
      score: 0,
      categoryCoverage: [],
      missingCategories: ['TECH', 'DESIGN', 'BUSINESS', 'COMMUNITY'],
      missingSkills: requiredSkills,
      feedback: 'Add team members to calculate balance score.',
    };
  }

  const categoryCounts: Record<SkillCategory, number> = {
    TECH: 0,
    DESIGN: 0,
    BUSINESS: 0,
    COMMUNITY: 0,
  };

  const allTeamSkills = new Set<string>();

  members.forEach((m) => {
    m.skillCategories.forEach((cat) => {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    m.skills.forEach((s) => allTeamSkills.add(s.toLowerCase()));
  });

  const categoriesRepresented = Object.values(categoryCounts).filter((c) => c > 0).length;
  const missingCategories = (Object.keys(categoryCounts) as SkillCategory[]).filter(
    (cat) => categoryCounts[cat] === 0
  );

  // Calculate missing specific required skills
  const missingSkills = requiredSkills.filter(
    (req) => !allTeamSkills.has(req.toLowerCase())
  );

  // Score calculation:
  // - Category diversity: up to 60 pts (15 pts per covered track)
  // - Team size appropriateness (3-4 is optimal): up to 20 pts
  // - Required skills coverage: up to 20 pts
  let score = categoriesRepresented * 15;

  if (members.length >= 3 && members.length <= 5) {
    score += 20;
  } else if (members.length === 2) {
    score += 10;
  } else {
    score += 5;
  }

  if (requiredSkills.length > 0) {
    const coveredRequired = requiredSkills.length - missingSkills.length;
    score += Math.round((coveredRequired / requiredSkills.length) * 20);
  } else {
    score += 20;
  }

  const categoryCoverage = SKILL_CATEGORIES_DATA.map((cat) => ({
    category: cat.category,
    count: categoryCounts[cat.category] || 0,
    name: cat.name,
    color: cat.color,
  }));

  let feedback = 'Strong, versatile squad ready to compete!';
  if (missingCategories.includes('DESIGN') && missingCategories.includes('BUSINESS')) {
    feedback = 'Your team lacks both Design (UI/UX) and Business pitching capabilities.';
  } else if (missingCategories.includes('DESIGN')) {
    feedback = 'Your team may need a UI/UX Designer for high-fidelity prototyping and demo visuals. 🎨';
  } else if (missingCategories.includes('BUSINESS')) {
    feedback = 'Consider adding a Business Strategist or Pitcher to nail the business model canvas. 📊';
  } else if (missingCategories.includes('TECH')) {
    feedback = 'Your team needs a Technical/Software Lead to build the core MVP. 💻';
  } else if (members.length < 3) {
    feedback = 'Recruit 1-2 more members to form a complete cross-functional hackathon squad. 🚀';
  }

  return {
    score: Math.min(100, Math.max(15, score)),
    categoryCoverage,
    missingCategories,
    missingSkills,
    feedback,
  };
}
