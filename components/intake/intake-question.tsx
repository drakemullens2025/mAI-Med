"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import type { IntakeQuestion } from "@/lib/types";

interface IntakeQuestionProps {
  question: IntakeQuestion;
  value: string;
  onChange: (value: string) => void;
}

export function IntakeQuestionField({ question, value, onChange }: IntakeQuestionProps) {
  if (question.type === "textarea") {
    return (
      <Textarea
        label={question.text}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={question.required}
        placeholder="Type your answer..."
      />
    );
  }

  if (question.type === "select" && question.options) {
    return (
      <Select
        label={question.text}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={question.required}
        options={question.options.map((o) => ({ value: o, label: o }))}
      />
    );
  }

  return (
    <Input
      label={question.text}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={question.required}
      placeholder="Type your answer..."
    />
  );
}
