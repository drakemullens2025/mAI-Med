import { INTAKE_QUESTIONS } from "@/lib/constants";

interface IntakeSummaryProps {
  answers: Record<string, string>;
}

export function IntakeSummary({ answers }: IntakeSummaryProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text">Review Your Answers</h3>
      {INTAKE_QUESTIONS.map((q) => {
        const answer = answers[q.key];
        if (!answer) return null;
        return (
          <div key={q.key} className="rounded-xl bg-surface p-3">
            <p className="text-xs font-medium text-text-secondary">{q.text}</p>
            <p className="mt-1 text-sm text-text">{answer}</p>
          </div>
        );
      })}
    </div>
  );
}
