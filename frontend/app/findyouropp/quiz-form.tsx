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
import { ArrowLeft, ArrowRight, RefreshCw, Sparkles } from "lucide-react";

interface QuizFormProps {
  allItems: (Competition | BusinessOpportunity)[];
}

export function QuizForm({ allItems }: QuizFormProps) {
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [questionOrder, setQuestionOrder] = useState<string[]>([]);

  const filteredQuestions = quizQuestions.filter(q => !q.path || q.path === answers.type);
  const totalSteps = filteredQuestions.length || 1;
  const currentStep = questionOrder.length;
  const currentQuestion = filteredQuestions[currentStep];
  const isFinished = filteredQuestions.length > 0 && currentStep >= filteredQuestions.length;
  const answeredSteps = Math.min(questionOrder.length, totalSteps);
  const percentComplete = Math.round((answeredSteps / totalSteps) * 100);
  const displayStep = Math.min(currentStep + 1, totalSteps);

  const results = isFinished ? findBestMatches(answers, allItems) : [];
  const resultsWrapperClass =
    results.length >= 3
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      : "flex flex-col sm:flex-row flex-wrap items-center justify-center gap-6";
  const resultCardWrapperClass = results.length >= 3 ? "w-full" : "w-full max-w-xl sm:flex-1";

  const handleAnswer = (questionId: string, answerValue: string) => {
    setAnswers(prev => {
      let updatedAnswers = { ...prev, [questionId]: answerValue };

      if (questionId === "type") {
        const allowedQuestionIds = new Set(
          quizQuestions
            .filter(q => !q.path || q.path === answerValue)
            .map(q => q.id)
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
      let updatedOrder = [...prev];
      const existingIndex = updatedOrder.indexOf(questionId);

      if (existingIndex !== -1) {
        updatedOrder = updatedOrder.slice(0, existingIndex);
      }

      updatedOrder.push(questionId);

      if (questionId === "type") {
        const allowedQuestionIds = new Set(
          quizQuestions
            .filter(q => !q.path || q.path === answerValue)
            .map(q => q.id)
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
        <div className="absolute -top-24 -right-20 h-56 w-56 rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-lime-200/40 blur-3xl dark:bg-emerald-400/10" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl border border-emerald-200/80 bg-white/90 shadow-2xl shadow-emerald-900/10 backdrop-blur-md dark:border-emerald-700/40 dark:bg-[#101b28]/95"
      >
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-50/80 via-transparent to-green-100/40 dark:from-[#0d2a20]/60 dark:via-transparent dark:to-[#0b1a16]/70" />
        <div className="relative p-6 sm:p-10">
          <div className="flex flex-col gap-6 sm:gap-8">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200">
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
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-emerald-100 dark:bg-gray-800">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-green-500 to-lime-400"
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

                  <div className="mx-auto grid w-full max-w-3xl gap-4 sm:grid-cols-1 md:grid-cols-2">
                    {currentQuestion?.answers.map(answer => (
                      <motion.button
                        key={answer.value}
                        onClick={() => currentQuestion && handleAnswer(currentQuestion.id, answer.value)}
                        className="group relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-white/90 p-6 text-left shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-900/10 dark:border-emerald-700/50 dark:bg-[#0f1f2d]/80"
                        whileHover={{ y: -6 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/0 via-transparent to-emerald-200/0 transition-opacity duration-300 group-hover:from-emerald-100/70 group-hover:to-emerald-200/70 dark:group-hover:from-emerald-500/20 dark:group-hover:to-emerald-400/10" />
                        <div className="relative flex items-center justify-between gap-4">
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {answer.text}
                          </span>
                          <motion.span
                            className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-transparent bg-emerald-500/10 text-emerald-600 transition-colors group-hover:bg-emerald-500 group-hover:text-white dark:text-emerald-300"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <ArrowRight className="h-5 w-5" />
                          </motion.span>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    {currentStep > 0 ? (
                      <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-200 dark:hover:bg-emerald-900/60"
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
                    <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-emerald-200 bg-white/80 p-10 text-center shadow-inner dark:border-emerald-700/60 dark:bg-[#0f1f2d]/60">
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
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-700"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Restart Quiz
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-full border-emerald-300 px-6 py-3 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                    >
                      <Link href="/business-opportunities">Browse All Opportunities</Link>
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
