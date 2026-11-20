import type { BusinessOpportunity, Competition } from "./google-sheets";
import {
  deriveOpportunityType,
  type OpportunityType,
} from "@/lib/constants/opportunity-types";

export type QuizPath = "business" | "medicine" | "engineering";

export type QuizQuestion = {
  id: string;
  question: string;
  answers: { text: string; value: string }[];
  /** Asked only after this answer to "What are you looking for?". */
  path?: "competition" | "opportunity";
  /** Asked only on this path. */
  domain?: QuizPath;
};

// --- QUIZ STRUCTURE AND QUESTIONS ---

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'path',
    question: 'Choose your path.',
    answers: [
      { text: 'Business', value: 'business' },
      { text: 'Medicine', value: 'medicine' },
      { text: 'Engineering', value: 'engineering' },
    ],
  },
  {
    id: 'type',
    question: 'What are you looking for?',
    answers: [
      { text: 'Competitions', value: 'competition' },
      { text: 'Opportunities', value: 'opportunity' },
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
    domain: 'business',
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

// --- MATCHING ---
//
// Each open item gets a hand-tuned score from the answers; the top three
// with a positive score are shown. Weights favour hard constraints (cost,
// opportunity type) over preferences (team size, subject, duration).

type Answers = { [questionId: string]: string };
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

function teamScore(wanted: string | undefined, offered: string): number {
  if (!wanted) return 0;
  if (offered === wanted) return 5;
  if (offered === "Both" || wanted === "Both") return 3;
  return 0;
}

/**
 * Subject cells hold free text such as "Finance" or "Finance, Marketing",
 * so tags are matched case-insensitively as substrings.
 */
function subjectScore(wanted: string | undefined, subjects: string[]): number {
  if (!wanted) return 0;
  const tags = subjects.map((subject) => subject.toLowerCase());
  const tagged = (subject: string) => tags.some((tag) => tag.includes(subject.toLowerCase()));
  if (tagged(wanted)) return 5;
  // A general competition partly fits any specific interest.
  if (wanted !== "General" && tagged("General")) return 2;
  return 0;
}

/** costNumeric is -1 when the sheet's cost could not be read. */
function costScore(budget: string | undefined, cost: number): number {
  if (budget === "any") return 5; // keeps every item eligible for the positive-score cut
  if (cost < 0) return 0;
  if (budget === "free") return cost === 0 ? 10 : -10;
  if (budget === "under100") return cost <= 100 ? 10 : -5;
  return 0;
}

type Scored = { score: number; tieBreaker: number };

export function scoreCompetition(answers: Answers, item: Competition): Scored {
  const score =
    teamScore(answers.teamRequirement, item.teamRequirement) +
    subjectScore(answers.subjectArea, item.subjectArea) +
    costScore(answers.cost, item.costNumeric);
  // Earlier deadlines win ties.
  const deadline = new Date(item.deadline).getTime();
  return { score, tieBreaker: Number.isNaN(deadline) ? 0 : -deadline / 1_000_000_000 };
}

export function scoreOpportunity(answers: Answers, item: BusinessOpportunity): Scored {
  let score = 0;
  let tieBreaker = 0;
  const wantedType = answers.opportunityType as OpportunityType | undefined;
  const affinity = wantedType ? opportunityTypeAffinity[wantedType] : undefined;

  if (affinity) {
    const itemType = deriveOpportunityType({
      opportunityType: item.opportunityType,
      category: item.category,
      title: item.title,
      description: item.description,
    });
    if (affinity.primary.includes(itemType)) score += 35;
    else if (affinity.secondary.includes(itemType)) score += 18;
    else score -= 5;
  }

  const duration = normalizeDuration(item.duration || "");
  const wantedDuration = answers.duration as NormalizedDuration | undefined;
  if (wantedDuration) score += durationWeight[wantedDuration]?.[duration] ?? 0;

  if (item.timeCommitment) {
    score += timeCommitmentWeight[answers.timeCommitment]?.[item.timeCommitment] ?? 0;
  }

  const description = (item.description || "").toLowerCase();
  if (wantedType === "Entrepreneurship" && description.includes("venture")) score += 6;
  if (wantedType === "Mentorship & Learning" && description.includes("mentor")) score += 6;

  // Internship and leadership tracks lean toward longer programs on ties.
  if ((wantedType === "Leadership" || wantedType === "Internship") && duration === "Long-term") {
    tieBreaker += 5;
  }
  return { score, tieBreaker };
}

/** The three best open matches with a positive score, best first. */
export function findBestMatches(
  answers: Answers,
  allItems: (Competition | BusinessOpportunity)[],
): (Competition | BusinessOpportunity)[] {
  const scored = allItems
    .filter((item) => item.status !== "closed")
    .flatMap((item): (Scored & { item: Competition | BusinessOpportunity })[] => {
      if (answers.type === "competition" && "teamRequirement" in item) {
        return [{ item, ...scoreCompetition(answers, item) }];
      }
      if (answers.type === "opportunity" && "opportunityType" in item) {
        return [{ item, ...scoreOpportunity(answers, item) }];
      }
      return [];
    });

  scored.sort((a, b) => b.score - a.score || b.tieBreaker - a.tieBreaker);

  return scored
    .filter(({ score }) => score > 0)
    .slice(0, 3)
    .map(({ item }) => item);
}
