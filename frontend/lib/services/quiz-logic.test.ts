import { describe, expect, it } from "vitest";
import type { BusinessOpportunity, Competition } from "./google-sheets";
import { findBestMatches, scoreCompetition, scoreOpportunity } from "./quiz-logic";

function competition(overrides: Partial<Competition>): Competition {
  return {
    id: "c", title: "Competition", organizer: "Org", logo: "", gradeTags: [],
    deadline: "2027-03-01", prize: "", status: "open", description: "",
    applicationType: "team", applyUrl: "", frequency: "", dates: ["", ""],
    location: "", cost: "Free", costNumeric: 0, teamRequirement: "Team",
    subjectArea: ["General"], likes: 0,
    ...overrides,
  };
}

function opportunity(overrides: Partial<BusinessOpportunity>): BusinessOpportunity {
  return {
    id: "o", title: "Program", organizer: "Org", logo: "", gradeTags: [],
    startDate: "", endDate: "", cost: "Free", costNumeric: 0, format: "",
    status: "open", description: "", applicationType: "", applyUrl: "",
    category: "", opportunityType: [], duration: "", timeCommitment: "",
    likes: 0,
    ...overrides,
  };
}

const competitionAnswers = { type: "competition", teamRequirement: "Team", cost: "any" };

describe("competition subject matching", () => {
  const finance = competition({ id: "finance", subjectArea: ["Finance"] });
  const marketing = competition({ id: "marketing", subjectArea: ["Marketing"] });
  const general = competition({ id: "general", subjectArea: ["General"] });

  it("ranks Finance and Marketing differently (both used to map to General)", () => {
    const forFinance = findBestMatches({ ...competitionAnswers, subjectArea: "Finance" }, [marketing, general, finance]);
    const forMarketing = findBestMatches({ ...competitionAnswers, subjectArea: "Marketing" }, [finance, general, marketing]);
    expect(forFinance.map((c) => c.id)).toEqual(["finance", "general", "marketing"]);
    expect(forMarketing.map((c) => c.id)).toEqual(["marketing", "general", "finance"]);
  });

  it("matches a subject inside a multi-subject cell, ignoring case", () => {
    const both = competition({ subjectArea: ["finance, Marketing"] });
    expect(scoreCompetition({ subjectArea: "Marketing" }, both).score)
      .toBe(scoreCompetition({ subjectArea: "Marketing" }, marketing).score);
  });

  it("still favours general competitions for someone open to anything", () => {
    const answers = { ...competitionAnswers, subjectArea: "General" };
    expect(scoreCompetition(answers, general).score).toBeGreaterThan(scoreCompetition(answers, finance).score);
  });
});

describe("competition cost", () => {
  const free = competition({ id: "free", costNumeric: 0 });
  const cheap = competition({ id: "cheap", costNumeric: 40 });
  const pricey = competition({ id: "pricey", costNumeric: 250 });
  const unknown = competition({ id: "unknown", costNumeric: -1 });

  it("penalizes paid items for a free-only budget", () => {
    const answers = { cost: "free" };
    expect(scoreCompetition(answers, free).score).toBeGreaterThan(scoreCompetition(answers, cheap).score);
    expect(scoreCompetition(answers, cheap).score).toBeLessThan(0);
  });

  it("does not count an unreadable cost as under $100", () => {
    const answers = { cost: "under100" };
    expect(scoreCompetition(answers, unknown).score).toBe(0);
    expect(scoreCompetition(answers, cheap).score).toBeGreaterThan(0);
    expect(scoreCompetition(answers, pricey).score).toBeLessThan(0);
  });
});

describe("findBestMatches", () => {
  it("returns at most three open items with a positive score", () => {
    const items = [
      competition({ id: "a" }), competition({ id: "b" }), competition({ id: "c" }),
      competition({ id: "d" }), competition({ id: "closed", status: "closed" }),
    ];
    const matches = findBestMatches(competitionAnswers, items);
    expect(matches).toHaveLength(3);
    expect(matches.map((m) => m.id)).not.toContain("closed");
  });

  it("breaks ties with the earlier deadline", () => {
    const later = competition({ id: "later", deadline: "2027-06-01" });
    const sooner = competition({ id: "sooner", deadline: "2027-02-01" });
    expect(findBestMatches(competitionAnswers, [later, sooner]).map((m) => m.id)).toEqual(["sooner", "later"]);
  });

  it("returns nothing when every item scores zero or less", () => {
    const paid = competition({ teamRequirement: "Solo", subjectArea: ["Marketing"], costNumeric: 300 });
    expect(findBestMatches({ type: "competition", teamRequirement: "Team", subjectArea: "Finance", cost: "free" }, [paid])).toEqual([]);
  });

  it("only considers the kind of item asked for", () => {
    const items = [competition({ id: "comp" }), opportunity({ id: "opp", opportunityType: ["Internship"] })];
    expect(findBestMatches({ type: "opportunity", opportunityType: "Internship" }, items).map((m) => m.id)).toEqual(["opp"]);
  });
});

describe("opportunity matching", () => {
  const internship = opportunity({ id: "intern", opportunityType: ["Internship"] });
  const mentorship = opportunity({ id: "mentor", opportunityType: ["Mentorship & Learning"] });
  const leadership = opportunity({ id: "lead", opportunityType: ["Leadership"] });

  it("ranks the chosen type first, then its related type, then the rest", () => {
    const answers = { type: "opportunity", opportunityType: "Internship" };
    expect(findBestMatches(answers, [leadership, mentorship, internship]).map((m) => m.id)).toEqual(["intern", "mentor"]);
  });

  it("prefers the requested program length", () => {
    const answers = { opportunityType: "Internship", duration: "Long-term" };
    const long = opportunity({ opportunityType: ["Internship"], duration: "6 months" });
    const short = opportunity({ opportunityType: ["Internship"], duration: "3 days" });
    expect(scoreOpportunity(answers, long).score).toBeGreaterThan(scoreOpportunity(answers, short).score);
  });

  it("does not crash when the type question was not answered", () => {
    expect(() => findBestMatches({ type: "opportunity" }, [internship])).not.toThrow();
  });
});
