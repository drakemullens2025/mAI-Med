"use client";

import { useState } from "react";
import { INTAKE_QUESTIONS } from "@/lib/constants";
import { IntakeQuestionField } from "./intake-question";
import { IntakeSummary } from "./intake-summary";
import { Button } from "@/components/ui/button";

interface IntakeWizardProps {
  onComplete: (answers: Record<string, string>) => void;
}

export function IntakeWizard({ onComplete }: IntakeWizardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showSummary, setShowSummary] = useState(false);

  const question = INTAKE_QUESTIONS[currentIndex];
  const isLast = currentIndex === INTAKE_QUESTIONS.length - 1;
  const currentAnswer = question ? answers[question.key] || "" : "";
  const canProceed = !question?.required || currentAnswer.trim().length > 0;

  function handleNext() {
    if (isLast) {
      setShowSummary(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  if (showSummary) {
    return (
      <div className="space-y-4">
        <IntakeSummary answers={answers} />
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowSummary(false)} className="flex-1">
            Edit
          </Button>
          <Button onClick={() => onComplete(answers)} className="flex-1">
            Continue to Video
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="h-1 flex-1 rounded-full bg-surface-2">
          <div
            className="h-1 rounded-full bg-primary transition-all"
            style={{ width: `${((currentIndex + 1) / INTAKE_QUESTIONS.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-text-secondary">
          {currentIndex + 1}/{INTAKE_QUESTIONS.length}
        </span>
      </div>

      <IntakeQuestionField
        question={question}
        value={currentAnswer}
        onChange={(value) => setAnswers((prev) => ({ ...prev, [question.key]: value }))}
      />

      <div className="flex gap-3">
        {currentIndex > 0 && (
          <Button variant="secondary" onClick={() => setCurrentIndex((i) => i - 1)} className="flex-1">
            Back
          </Button>
        )}
        <Button onClick={handleNext} disabled={!canProceed} className="flex-1">
          {isLast ? "Review Answers" : "Next"}
        </Button>
      </div>
    </div>
  );
}
