// [COMPLETE CODE for the new, advanced lib/quiz-logic.ts]

import type { Competition, BusinessOpportunity } from './google-sheets';
import {
  deriveOpportunityType,
  type OpportunityType,
} from "@/lib/constants/opportunity-types";

// --- QUIZ STRUCTURE AND QUESTIONS ---

// The structure remains the same, but the logic will interpret the values differently.
export const quizQuestions = [
  {
    id: 'type',
    question: 'What are you looking for?',
    answers: [
      { text: 'Business Competitions', value: 'competition' },
      { text: 'Business Opportunities', value: 'opportunity' },
    ],
  },
  // --- Competition Path ---
  {
    id: 'teamRequirement',
    question: 'How do you want to work?',
    answers: [
      { text: 'By Myself', value: 'Solo' },
      { text: 'With a Team', value: 'Team' },
      { text: 'Either is Fine', value: 'Both' },
    ],
    path: 'competition',
  },
  {
    id: 'subjectArea',
    question: 'What subject interests you most?',
    answers: [
      { text: 'Finance', value: 'Finance' },
      { text: 'Marketing', value: 'Marketing' },
      { text: 'Entrepreneurship / Pitching', value: 'Entrepreneurship' },
      { text: 'I\'m open to anything!', value: 'General' },
    ],
    path: 'competition',
  },
  {
    id: 'cost',
    question: 'What\'s your budget?',
    answers: [
      { text: 'Free only ($0)', value: 'free' },
      { text: 'Under $100', value: 'under100' },
      { text: 'Any cost is fine', value: 'any' },
    ],
    path: 'competition',
  },
  // --- Opportunity Path ---
  {
    id: 'opportunityType',
    question: 'What kind of experience do you want?',
    answers: [
        { text: 'Internships & Placements', value: 'Internship' },
        { text: 'Mentorship & Learning', value: 'Mentorship & Learning' },
        { text: 'Leadership Track', value: 'Leadership' },
        { text: 'Launch or Build a Venture', value: 'Entrepreneurship' },
    ],
    path: 'opportunity',
  },
  {
    id: 'duration',
    question: 'What is your ideal program length?',
    answers: [
      { text: 'Short-term (days to 2 weeks)', value: 'Short-term' },
      { text: 'Medium-term (a few weeks to 2 months)', value: 'Medium-term' },
      { text: 'Long-term (2+ months)', value: 'Long-term' },
    ],
    path: 'opportunity',
  },
  {
    id: 'timeCommitment',
    question: 'How much time can you commit per week?',
    answers: [
      { text: 'Low (1-5 hours)', value: 'Low' },
      { text: 'Medium (5-10 hours)', value: 'Medium' },
      { text: 'High (10+ hours)', value: 'High' },
    ],
    path: 'opportunity',
  },
];

// --- ADVANCED MATCHING ALGORITHM ---

const subjectMapping: { [key: string]: string } = {
  Finance: 'General',
  Marketing: 'General',
  Entrepreneurship: 'Entrepreneurship',
  General: 'General',
};

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

type NormalizedDuration = "Short-term" | "Medium-term" | "Long-term";

function normalizeDuration(raw: string): NormalizedDuration {
  const value = raw.toLowerCase();
  if (value.includes("long") || value.includes("6 month") || value.includes("semester")) {
    return "Long-term";
  }
  if (value.includes("week") || value.includes("month") || value.includes("medium")) {
    return "Medium-term";
  }
  return "Short-term";
}

const opportunityTypeAffinity: Record<OpportunityType, { primary: OpportunityType[]; secondary: OpportunityType[] }> = {
  Entrepreneurship: { primary: ["Entrepreneurship"], secondary: ["Leadership"] },
  Internship: { primary: ["Internship"], secondary: ["Mentorship & Learning"] },
  Leadership: { primary: ["Leadership"], secondary: ["Entrepreneurship", "Mentorship & Learning"] },
  "Mentorship & Learning": { primary: ["Mentorship & Learning"], secondary: ["Internship"] },
};

const durationWeight: Record<NormalizedDuration, Record<NormalizedDuration, number>> = {
  "Short-term": { "Short-term": 15, "Medium-term": 8, "Long-term": 0 },
  "Medium-term": { "Short-term": 6, "Medium-term": 15, "Long-term": 8 },
  "Long-term": { "Short-term": 0, "Medium-term": 10, "Long-term": 18 },
};

const timeCommitmentWeight: Record<string, Record<string, number>> = {
  Low: { Low: 12, Medium: 6, High: 0 },
  Medium: { Low: 6, Medium: 12, High: 6 },
  High: { Low: 0, Medium: 8, High: 12 },
};

export function findBestMatches(
  answers: { [key: string]: string },
  allItems: (Competition | BusinessOpportunity)[]
): (Competition | BusinessOpportunity)[] {
  
  const scoredItems = allItems
    .filter(item => item.status !== 'closed')
    .map(item => {
      let score = 0;
      let tieBreakerBias = 0;
      
      // --- Competition Logic ---
      if (answers.type === 'competition' && 'teamRequirement' in item) {
        // Team Requirement (Weighted)
        if (item.teamRequirement === answers.teamRequirement) {
          score += 5; // Perfect match
        } else if (item.teamRequirement === 'Both' || answers.teamRequirement === 'Both') {
          score += 3; // Good partial match
        }

        // Subject Area (Weighted)
        const mappedSubject = subjectMapping[answers.subjectArea];
        if (item.subjectArea.includes(mappedSubject)) {
          if (mappedSubject === 'General' && answers.subjectArea !== 'General') {
            score += 2; // Partial credit for "General" if user picked something specific
          } else {
            score += 5; // Perfect match
          }
        }

        // Cost (Heavily Weighted)
        if (answers.cost === 'free') {
          if (item.costNumeric === 0) score += 10;
          else score -= 10; // Penalize paid items if user wants free
        } else if (answers.cost === 'under100') {
          if (item.costNumeric <= 100) score += 10;
          else score -= 5; // Penalize expensive items
        } else if (answers.cost === 'any') {
          score += 5; // Bonus for matching "any"
        }

        // Tie-breaker bias for earlier deadlines
        if (item.deadline) {
          const deadlineTime = new Date(item.deadline).getTime();
          if (!Number.isNaN(deadlineTime)) {
            tieBreakerBias -= deadlineTime / 1_000_000_000;
          }
        }
      }

      // --- Opportunity Logic ---
      if (answers.type === 'opportunity' && 'opportunityType' in item) {
        const derivedType = deriveOpportunityType({
          opportunityType: item.opportunityType,
          category: item.category,
          title: item.title,
          description: item.description,
        });

        const userType = answers.opportunityType as OpportunityType;
        const affinity = opportunityTypeAffinity[userType];

        if (affinity.primary.includes(derivedType)) {
          score += 35;
        } else if (affinity.secondary.includes(derivedType)) {
          score += 18;
        } else {
          score -= 5;
        }

        const normalizedDuration = normalizeDuration(item.duration || "");
        const desiredDuration = answers.duration as NormalizedDuration;
        score += durationWeight[desiredDuration]?.[normalizedDuration] ?? 0;

        if (item.timeCommitment) {
          score += timeCommitmentWeight[answers.timeCommitment]?.[item.timeCommitment] ?? 0;
        }

        const description = item.description.toLowerCase();
        if (userType === "Entrepreneurship" && description.includes("venture")) {
          score += 6;
        }
        if (userType === "Mentorship & Learning" && description.includes("mentor")) {
          score += 6;
        }

        // Dedicate tie breaker to prioritize long-form programs for leadership/internship tracks
        if (userType === "Leadership" || userType === "Internship") {
          if (normalizedDuration === "Long-term") tieBreakerBias += 5;
        }
      }
      
      return { item, score, tieBreakerBias };
    });

  // Sort by the highest score first
  scoredItems.sort((a, b) => {
    if (b.score === a.score) {
      return b.tieBreakerBias - a.tieBreakerBias;
    }
    return b.score - a.score;
  });

  const positiveMatches = scoredItems.filter(({ score }) => score > 0);
  const topMatches = positiveMatches.slice(0, 3).map(({ item }) => item);

  return topMatches.length > 0 ? topMatches : [];
}
