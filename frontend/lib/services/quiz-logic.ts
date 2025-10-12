// [COMPLETE CODE for the new, advanced lib/quiz-logic.ts]

import type { Competition, BusinessOpportunity } from './google-sheets';

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
        { text: 'Hands-on Learning', value: 'Learning' },
        { text: 'Mentorship or Shadowing', value: 'Mentorship' },
        { text: 'A Leadership Role', value: 'Leadership' },
        { text: 'Starting a Business', value: 'Entrepreneurship' },
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

export function findBestMatches(
  answers: { [key: string]: string },
  allItems: (Competition | BusinessOpportunity)[]
): (Competition | BusinessOpportunity)[] {
  
  const scoredItems = allItems
    .filter(item => item.status !== 'closed')
    .map(item => {
      let score = 0;
      
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
      }

      // --- Opportunity Logic ---
      if (answers.type === 'opportunity' && 'opportunityType' in item) {
        // All opportunity questions are heavily weighted as they define the experience
        if (item.opportunityType.includes(answers.opportunityType)) {
          score += 10;
        }
        if (item.duration.startsWith(answers.duration)) {
          score += 10;
        }
        if (item.timeCommitment === answers.timeCommitment) {
          score += 10;
        }

        // Persona Boost: "Ambitious Entrepreneur"
        if (answers.opportunityType === 'Entrepreneurship' && answers.duration === 'Long-term') {
          const description = item.description.toLowerCase();
          if (description.includes('elite') || description.includes('intensive') || description.includes('coveted')) {
            score += 5; // Add a bonus for ambitious-sounding programs
          }
        }
      }
      
      return { item, score };
    });

  // Sort by the highest score first
  scoredItems.sort((a, b) => b.score - a.score);

  // Filter for only the top-scoring items
  const maxScore = scoredItems[0]?.score || 0;
  if (maxScore <= 0) return []; // If no item scored positively, return nothing

  const bestMatches = scoredItems
    .filter(scoredItem => scoredItem.score === maxScore)
    .map(scoredItem => scoredItem.item);

  // If there are more than 3 best matches, apply tie-breaker logic
  if (bestMatches.length > 3) {
    // Smart Tie-Breaker: Prioritize 'closing-soon' and 'open' over 'upcoming'
    bestMatches.sort((a, b) => {
      const statusOrder = { "closing-soon": 1, open: 2, upcoming: 3 };
      const statusA = statusOrder[a.status as keyof typeof statusOrder] || 4;
      const statusB = statusOrder[b.status as keyof typeof statusOrder] || 4;
      return statusA - statusB;
    });
    // Then, randomly pick 3 from the top-tier results
    return shuffleArray(bestMatches).slice(0, 3);
  }

  return bestMatches;
}
