// [COMPLETE CODE for components/quiz/quiz-form.tsx]

"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { quizQuestions, findBestMatches } from "@/lib/services/quiz-logic";
import type { Competition, BusinessOpportunity } from "@/lib/services/google-sheets";
import { CompetitionCard } from "@/components/competitions/competition-card";
import { OpportunityCard } from "@/components/business-opportunities/opportunity-card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Compass,
  Cpu,
  RefreshCw,
  Sparkles,
  Stethoscope,
} from "lucide-react";

type QuizPath = "business" | "medicine" | "engineering";

interface QuizFormProps {
  itemsByPath: Record<QuizPath, (Competition | BusinessOpportunity)[]>;
}

export function QuizForm({ itemsByPath }: QuizFormProps) {
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [questionOrder, setQuestionOrder] = useState<string[]>([]);

  const doesQuestionMatch = (
    question: { path?: string; domain?: QuizPath },
    currentAnswers: { [key: string]: string },
  ) => {
    const matchesType = !question.path || question.path === currentAnswers.type;
    const matchesDomain =
      !question.domain || question.domain === currentAnswers.path;
    return matchesType && matchesDomain;
  };

  const filteredQuestions = quizQuestions.filter((q) =>
    doesQuestionMatch(q, answers),
  );
  const baseQuestionCount = quizQuestions.filter((q) => !q.path).length;
  const maxPathQuestionCount = Math.max(
    0,
    ...Object.values(
      quizQuestions.reduce<Record<string, number>>((acc, question) => {
        if (question.path) {
          acc[question.path] = (acc[question.path] || 0) + 1;
        }
        return acc;
      }, {}),
    ),
  );
  const totalSteps = Math.max(1, baseQuestionCount + maxPathQuestionCount);
  const currentStep = questionOrder.length;
  const currentQuestion = filteredQuestions[currentStep];
  const isFinished = filteredQuestions.length > 0 && currentStep >= filteredQuestions.length;
  const answeredSteps = Math.min(questionOrder.length, totalSteps);
  const percentComplete = Math.min(
    100,
    Math.round((answeredSteps / totalSteps) * 100),
  );
  const displayStep = Math.min(currentStep + 1, totalSteps);

  const activePath = answers.path as QuizPath | undefined;
  const activeItems = activePath ? itemsByPath[activePath] : [];
  const results = isFinished ? findBestMatches(answers, activeItems) : [];
  const resultsWrapperClass =
    results.length >= 3
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      : "flex flex-col sm:flex-row flex-wrap items-center justify-center gap-6";
  const resultCardWrapperClass = results.length >= 3 ? "w-full" : "w-full max-w-xl sm:flex-1";
  const browseHref =
    activePath === "medicine"
      ? "/medicine-opportunities"
      : activePath === "engineering"
        ? "/engineering-opportunities"
        : "/business-opportunities";

  const themeMap = {
    business: {
      badge:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200",
      glowTop: "bg-emerald-300/30 dark:bg-emerald-500/10",
      glowBottom: "bg-lime-200/40 dark:bg-emerald-400/10",
      container:
        "border-emerald-200/80 shadow-emerald-900/10 dark:border-emerald-700/40",
      overlay:
        "from-emerald-50/80 via-transparent to-green-100/40 dark:from-[#0d2a20]/60 dark:via-transparent dark:to-[#0b1a16]/70",
      progressTrack: "bg-emerald-100 dark:bg-emerald-900/40",
      progressFill: "from-emerald-500 via-green-500 to-lime-400",
      optionBorder: "border-emerald-200/60 dark:border-emerald-700/50",
      optionGlow:
        "group-hover:from-emerald-100/70 group-hover:to-emerald-200/70 dark:group-hover:from-emerald-500/20 dark:group-hover:to-emerald-400/10",
      optionArrow:
        "bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white dark:text-emerald-300",
      backButton:
        "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-200 dark:hover:bg-emerald-900/60",
      primaryButton: "bg-emerald-600 hover:bg-emerald-700",
      outlineButton:
        "border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-200 dark:hover:bg-emerald-900/40",
      emptyBorder: "border-emerald-200 dark:border-emerald-700/60",
      pathCard:
        "border-emerald-200/60 bg-white/80 dark:border-emerald-500/30 dark:bg-[#11263b]/80",
      pathGlow:
        "from-emerald-100/60 via-transparent to-emerald-200/70 dark:from-[#1d3f32]/60 dark:to-[#0f271d]/80",
      pathChip:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200",
      pathIcon:
        "bg-emerald-100/70 text-emerald-700 group-hover:bg-emerald-500 group-hover:text-white dark:bg-emerald-900/50 dark:text-emerald-200 dark:group-hover:bg-emerald-600",
      pathTitle:
        "group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-200",
      pathLink:
        "text-emerald-700 group-hover:text-emerald-800 dark:text-emerald-200 dark:group-hover:text-emerald-100",
      pathSelected: "ring-2 ring-emerald-300/70",
    },
    medicine: {
      badge:
        "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-200",
      glowTop: "bg-sky-200/40 dark:bg-sky-500/12",
      glowBottom: "bg-cyan-200/40 dark:bg-sky-400/10",
      container:
        "border-sky-200/80 shadow-sky-900/10 dark:border-sky-600/40",
      overlay:
        "from-sky-50/80 via-transparent to-sky-100/50 dark:from-[#0d2232]/60 dark:via-transparent dark:to-[#0b1823]/70",
      progressTrack: "bg-sky-100 dark:bg-sky-900/40",
      progressFill: "from-sky-500 via-blue-500 to-cyan-400",
      optionBorder: "border-sky-200/60 dark:border-sky-600/50",
      optionGlow:
        "group-hover:from-sky-100/70 group-hover:to-sky-200/70 dark:group-hover:from-sky-500/20 dark:group-hover:to-sky-400/10",
      optionArrow:
        "bg-sky-500/10 text-sky-600 group-hover:bg-sky-500 group-hover:text-white dark:text-sky-300",
      backButton:
        "bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-900/40 dark:text-sky-200 dark:hover:bg-sky-900/60",
      primaryButton: "bg-sky-600 hover:bg-sky-700",
      outlineButton:
        "border-sky-300 text-sky-700 hover:bg-sky-50 dark:border-sky-600 dark:text-sky-200 dark:hover:bg-sky-900/40",
      emptyBorder: "border-sky-200 dark:border-sky-600/60",
      pathCard:
        "border-sky-200/70 bg-white/80 dark:border-sky-500/30 dark:bg-[#11263b]/80",
      pathGlow:
        "from-sky-100/70 via-transparent to-sky-200/80 dark:from-sky-900/40 dark:to-sky-950/70",
      pathChip:
        "bg-sky-50 text-sky-700 dark:bg-sky-900/60 dark:text-sky-200",
      pathIcon:
        "bg-sky-100/70 text-sky-700 group-hover:bg-sky-500 group-hover:text-white dark:bg-sky-900/50 dark:text-sky-200 dark:group-hover:bg-sky-600",
      pathTitle:
        "group-hover:text-sky-700 dark:text-white dark:group-hover:text-sky-200",
      pathLink:
        "text-sky-700 group-hover:text-sky-800 dark:text-sky-200 dark:group-hover:text-sky-100",
      pathSelected: "ring-2 ring-sky-300/70",
    },
    engineering: {
      badge:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-200",
      glowTop: "bg-orange-200/40 dark:bg-orange-500/12",
      glowBottom: "bg-amber-200/40 dark:bg-amber-500/10",
      container:
        "border-orange-200/80 shadow-orange-900/10 dark:border-orange-600/40",
      overlay:
        "from-orange-50/80 via-transparent to-amber-100/50 dark:from-[#2a1b11]/60 dark:via-transparent dark:to-[#1a110b]/70",
      progressTrack: "bg-orange-100 dark:bg-orange-900/40",
      progressFill: "from-orange-500 via-amber-500 to-yellow-400",
      optionBorder: "border-orange-200/60 dark:border-orange-600/50",
      optionGlow:
        "group-hover:from-orange-100/70 group-hover:to-amber-200/70 dark:group-hover:from-orange-500/20 dark:group-hover:to-amber-400/10",
      optionArrow:
        "bg-orange-500/10 text-orange-600 group-hover:bg-orange-500 group-hover:text-white dark:text-orange-300",
      backButton:
        "bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/40 dark:text-orange-200 dark:hover:bg-orange-900/60",
      primaryButton: "bg-orange-600 hover:bg-orange-700",
      outlineButton:
        "border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-200 dark:hover:bg-orange-900/40",
      emptyBorder: "border-orange-200 dark:border-orange-600/60",
      pathCard:
        "border-orange-200/70 bg-white/80 dark:border-orange-500/30 dark:bg-[#11263b]/80",
      pathGlow:
        "from-orange-100/70 via-transparent to-orange-200/80 dark:from-orange-900/40 dark:to-orange-950/70",
      pathChip:
        "bg-orange-50 text-orange-700 dark:bg-orange-900/60 dark:text-orange-200",
      pathIcon:
        "bg-orange-100/70 text-orange-700 group-hover:bg-orange-500 group-hover:text-white dark:bg-orange-900/50 dark:text-orange-200 dark:group-hover:bg-orange-600",
      pathTitle:
        "group-hover:text-orange-700 dark:text-white dark:group-hover:text-orange-200",
      pathLink:
        "text-orange-700 group-hover:text-orange-800 dark:text-orange-200 dark:group-hover:text-orange-100",
      pathSelected: "ring-2 ring-orange-300/70",
    },
  } as const;

  const activeTheme = activePath ? themeMap[activePath] : themeMap.business;
  const isPathQuestion =
    currentQuestion?.id === "path" ||
    (currentQuestion?.answers?.length === 3 &&
      currentQuestion.answers.every((answer) =>
        ["business", "medicine", "engineering"].includes(answer.value),
      ));
  const pathCards: Array<{
    value: QuizPath;
    title: string;
    description: string;
    icon: typeof Briefcase;
    chip: string;
  }> = [
    {
      value: "business",
      title: "Business",
      description:
        "Internships, programs, and competitions tailored to ambitious students.",
      icon: Briefcase,
      chip: "Business",
    },
    {
      value: "medicine",
      title: "Medicine",
      description:
        "Shadowing, research, and healthcare programs for future clinicians.",
      icon: Stethoscope,
      chip: "Medicine",
    },
    {
      value: "engineering",
      title: "Engineering",
      description:
        "STEM challenges, labs, and mentorships for builders and innovators.",
      icon: Cpu,
      chip: "Engineering",
    },
  ];

  const handleAnswer = (questionId: string, answerValue: string) => {
    setAnswers(prev => {
      if (questionId === "path") {
        return { path: answerValue };
      }

      let updatedAnswers = { ...prev, [questionId]: answerValue };

      if (questionId === "type") {
        const allowedQuestionIds = new Set(
          quizQuestions.filter((q) => doesQuestionMatch(q, updatedAnswers)).map(
            (q) => q.id,
          ),
        );

        Object.keys(updatedAnswers).forEach(key => {
          if (!allowedQuestionIds.has(key)) {
            delete updatedAnswers[key];
          }
        });
      }

      return updatedAnswers;
    });

    setQuestionOrder(prev => {
      if (questionId === "path") {
        return ["path"];
      }

      const nextAnswers = { ...answers, [questionId]: answerValue };
      let updatedOrder = [...prev];
      const existingIndex = updatedOrder.indexOf(questionId);

      if (existingIndex !== -1) {
        updatedOrder = updatedOrder.slice(0, existingIndex);
      }

      updatedOrder.push(questionId);

      if (questionId === "type") {
        const allowedQuestionIds = new Set(
          quizQuestions.filter((q) => doesQuestionMatch(q, nextAnswers)).map(
            (q) => q.id,
          ),
        );

        updatedOrder = updatedOrder.filter(id => allowedQuestionIds.has(id));
      }

      return updatedOrder;
    });
  };

  const handleBack = () => {
    setQuestionOrder(prev => {
      if (prev.length === 0) return prev;

      const updatedOrder = prev.slice(0, -1);
      const questionIdToClear = prev[prev.length - 1];

      setAnswers(prevAnswers => {
        const newAnswers = { ...prevAnswers };
        delete newAnswers[questionIdToClear];

        if (questionIdToClear === "path") {
          quizQuestions.forEach(q => {
            if (q.id !== "path") {
              delete newAnswers[q.id];
            }
          });
        }

        if (questionIdToClear === "type") {
          quizQuestions.forEach(q => {
            if (q.path) {
              delete newAnswers[q.id];
            }
          });
        }

        return newAnswers;
      });

      return updatedOrder;
    });
  };

  const handleRestart = () => {
    setAnswers({});
    setQuestionOrder([]);
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10">
        <div
          className={`absolute -top-24 -right-20 h-56 w-56 rounded-full blur-3xl ${activeTheme.glowTop}`}
        />
        <div
          className={`absolute -bottom-32 -left-20 h-64 w-64 rounded-full blur-3xl ${activeTheme.glowBottom}`}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`relative overflow-hidden rounded-3xl border bg-white/90 shadow-2xl backdrop-blur-md dark:bg-[#101b28]/95 ${activeTheme.container}`}
      >
        <div
          className={`absolute inset-0 pointer-events-none bg-gradient-to-br ${activeTheme.overlay}`}
        />
        <div className="relative p-6 sm:p-10">
          <div className="flex flex-col gap-6 sm:gap-8">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider ${activeTheme.badge}`}
                >
                  <Sparkles className="h-4 w-4" />
                  {isFinished ? "Recommendations Ready" : "Personalized Quiz"}
                </span>
                {!isFinished && (
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {percentComplete}% complete
                  </span>
                )}
              </div>
              {!isFinished && (
                <div
                  className={`mt-4 h-2 w-full overflow-hidden rounded-full ${activeTheme.progressTrack}`}
                >
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${activeTheme.progressFill}`}
                    initial={{ width: "0%" }}
                    animate={{ width: `${Math.max(percentComplete, 8)}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {!isFinished ? (
                <motion.div
                  key={currentQuestion?.id ?? "question"}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="space-y-10"
                >
                  <div className="mx-auto max-w-3xl space-y-4 text-center">
                    <h2 className="text-3xl font-semibold text-gray-900 dark:text-white sm:text-4xl">
                      {currentQuestion?.question}
                    </h2>
                    <p className="text-base text-gray-600 dark:text-gray-300">
                      Select the option that best matches what you're looking for.
                    </p>
                  </div>

                  {isPathQuestion ? (
                    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {pathCards.map((card) => {
                        const cardTheme = themeMap[card.value];
                        const Icon = card.icon;
                        const isSelected = answers.path === card.value;
                        return (
                          <motion.button
                            key={card.value}
                            type="button"
                            onClick={() => handleAnswer("path", card.value)}
                            className={`group relative h-full overflow-hidden rounded-2xl border p-6 text-left shadow-[0_25px_60px_-30px_rgba(27,94,52,0.6)] backdrop-blur transition-all duration-300 ${cardTheme.pathCard} ${isSelected ? cardTheme.pathSelected : ""}`}
                            whileHover={{ y: -6, scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            aria-pressed={isSelected}
                          >
                            <div
                              className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-300 ${cardTheme.pathGlow} ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                            />
                            <div className="relative flex h-full flex-col gap-4">
                              <div className="flex items-center justify-between gap-3">
                                <span
                                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${cardTheme.pathChip}`}
                                >
                                  <Compass className="h-4 w-4" />
                                  {card.chip}
                                </span>
                                <span
                                  className={`rounded-full p-3 shadow-inner transition ${cardTheme.pathIcon}`}
                                >
                                  <Icon className="h-6 w-6" />
                                </span>
                              </div>
                              <div className="space-y-2">
                                <h3
                                  className={`text-xl font-semibold text-gray-900 transition-colors ${cardTheme.pathTitle}`}
                                >
                                  {card.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {card.description}
                                </p>
                              </div>
                              <div
                                className={`mt-auto flex items-center gap-2 pt-1 text-sm font-semibold transition group-hover:gap-3 ${cardTheme.pathLink}`}
                              >
                                Start exploring
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mx-auto grid w-full max-w-3xl gap-4 sm:grid-cols-1 md:grid-cols-2">
                      {currentQuestion?.answers?.map((answer) => {
                        const answerTheme = activeTheme;
                        return (
                          <motion.button
                            key={answer.value}
                            onClick={() =>
                              currentQuestion &&
                              handleAnswer(currentQuestion.id, answer.value)
                            }
                            className={`group relative overflow-hidden rounded-2xl border bg-white/90 p-6 text-left shadow-sm transition-all duration-300 hover:shadow-lg dark:bg-[#0f1f2d]/80 ${answerTheme.optionBorder}`}
                            whileHover={{ y: -6 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <div
                              className={`absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent transition-opacity duration-300 ${answerTheme.optionGlow}`}
                            />
                            <div className="relative flex items-center justify-between gap-4">
                              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                {answer.text}
                              </span>
                              <motion.span
                                className={`inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-transparent transition-colors ${answerTheme.optionArrow}`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                              >
                                <ArrowRight className="h-5 w-5" />
                              </motion.span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    {currentStep > 0 ? (
                      <Button
                        variant="ghost"
                        onClick={handleBack}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 transition ${activeTheme.backButton}`}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </Button>
                    ) : (
                      <span className="invisible">placeholder</span>
                    )}
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      Step {displayStep} of {totalSteps}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-8"
                >
                  <div className="mx-auto max-w-2xl space-y-3 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      <Sparkles className="mr-2 inline h-8 w-8 text-yellow-500" />
                      Your Personalized Recommendations
                    </h2>
                    <p className="text-base text-gray-600 dark:text-gray-300">
                      These opportunities are tailored to the goals you shared. Feel free to explore each one in detail.
                    </p>
                  </div>

                  {results.length > 0 ? (
                    <div className={resultsWrapperClass}>
                      {results.map((item, index) => (
                        <motion.div
                          key={item.id}
                          className={resultCardWrapperClass}
                          initial={{ opacity: 0, y: 24 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
                        >
                          {"teamRequirement" in item ? (
                            <CompetitionCard competition={item as Competition} />
                          ) : (
                            <OpportunityCard
                              opportunity={item as BusinessOpportunity}
                              isFavourited={false}
                              onFavourite={() => {}}
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className={`mx-auto max-w-xl rounded-2xl border border-dashed bg-white/80 p-10 text-center shadow-inner dark:bg-[#0f1f2d]/60 ${activeTheme.emptyBorder}`}
                    >
                      <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                        No perfect matches found just yet.
                      </p>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Try adjusting your answers or explore all opportunities to discover more ways to get involved.
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <Button
                      onClick={handleRestart}
                      className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-white ${activeTheme.primaryButton}`}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Restart Quiz
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className={`rounded-full px-6 py-3 ${activeTheme.outlineButton}`}
                    >
                      <Link href={browseHref}>Browse All Opportunities</Link>
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
