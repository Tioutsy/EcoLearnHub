import { useState } from "react";
import { CheckCircle2, XCircle, Circle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export type TextBlock = { type: "text"; heading?: string; body: string };
export type CalloutBlock = { type: "callout"; title: string; body: string };

export type ScenarioChoice = { label: string; feedback: string; ideal?: boolean };
export type ScenarioBlock = {
  type: "scenario";
  prompt: string;
  choices: ScenarioChoice[];
};

export type MatchPair = { term: string; match: string };
export type MatchingBlock = {
  type: "matching";
  instruction: string;
  pairs: MatchPair[];
};

export type KnowledgeCheck = {
  type: "check";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type RoleExample = { role: string; example: string };
export type RoleSelectorBlock = {
  type: "roles";
  instruction: string;
  roles: RoleExample[];
  actionPrompt: string;
  actions: string[];
};

export type DecisionScenario = {
  prompt: string;
  options: { label: string; correct: boolean; feedback: string }[];
};
export type DecisionBlock = {
  type: "decision";
  intro: string;
  scenarios: DecisionScenario[];
};

export type CommitmentOption = { value: string; label: string; description: string };
export type CommitmentBlock = {
  type: "commitment";
  instruction: string;
  options: CommitmentOption[];
};

export function TextView({ block }: { block: TextBlock }) {
  return (
    <div className="space-y-2">
      {block.heading ? (
        <h3 className="text-lg font-semibold text-foreground">{block.heading}</h3>
      ) : null}
      <p className="text-base leading-relaxed text-muted-foreground">{block.body}</p>
    </div>
  );
}

export function CalloutView({ block }: { block: CalloutBlock }) {
  return (
    <Card className="border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
      <div className="flex gap-3">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <div className="space-y-1">
          <p className="font-semibold text-emerald-900 dark:text-emerald-200">{block.title}</p>
          <p className="text-sm leading-relaxed text-emerald-800 dark:text-emerald-300">{block.body}</p>
        </div>
      </div>
    </Card>
  );
}

export function ScenarioView({
  block,
  onResolved,
}: {
  block: ScenarioBlock;
  onResolved: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <Card className="p-5">
      <p className="mb-4 text-base font-medium text-foreground">{block.prompt}</p>
      <div className="space-y-3">
        {block.choices.map((choice, i) => {
          const isPicked = picked === i;
          return (
            <div key={i}>
              <button
                type="button"
                onClick={() => {
                  setPicked(i);
                  onResolved();
                }}
                className={cn(
                  "w-full rounded-lg border p-3 text-left text-sm transition-colors",
                  isPicked
                    ? choice.ideal
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                      : "border-amber-400 bg-amber-50 dark:bg-amber-950/30"
                    : "border-border hover:border-emerald-300 hover:bg-muted",
                )}
              >
                {choice.label}
              </button>
              {isPicked ? (
                <p
                  className={cn(
                    "mt-2 px-1 text-sm",
                    choice.ideal ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400",
                  )}
                >
                  {choice.feedback}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function MatchingView({
  block,
  onResolved,
}: {
  block: MatchingBlock;
  onResolved: () => void;
}) {
  const matches = block.pairs.map((p) => p.match);
  const shuffled = [...matches].sort((a, b) => a.localeCompare(b));
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [assigned, setAssigned] = useState<Record<number, string>>({});

  const allDone = Object.keys(assigned).length === block.pairs.length;

  function assign(matchValue: string) {
    if (selectedTerm === null) return;
    const next = { ...assigned, [selectedTerm]: matchValue };
    setAssigned(next);
    setSelectedTerm(null);
    if (Object.keys(next).length === block.pairs.length) onResolved();
  }

  const usedMatches = new Set(Object.values(assigned));

  return (
    <Card className="p-5">
      <p className="mb-4 text-sm font-medium text-foreground">{block.instruction}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          {block.pairs.map((pair, i) => {
            const correct = assigned[i] === pair.match;
            const answered = assigned[i] !== undefined;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedTerm(i)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors",
                  selectedTerm === i && "border-emerald-500 ring-2 ring-emerald-200",
                  answered
                    ? correct
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                      : "border-red-400 bg-red-50 dark:bg-red-950/30"
                    : "border-border hover:bg-muted",
                )}
              >
                <span>{pair.term}</span>
                {answered ? (
                  correct ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )
                ) : null}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {shuffled.map((m, i) => (
            <button
              key={i}
              type="button"
              disabled={usedMatches.has(m)}
              onClick={() => assign(m)}
              className={cn(
                "w-full rounded-lg border p-3 text-left text-sm transition-colors",
                usedMatches.has(m)
                  ? "border-border bg-muted text-muted-foreground opacity-60"
                  : "border-border hover:border-emerald-300 hover:bg-muted",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      {allDone ? (
        <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-400">
          Nicely done. Each action above brings a real benefit to people, the planet, and the business.
        </p>
      ) : null}
    </Card>
  );
}

export function CheckView({
  block,
  onResolved,
}: {
  block: KnowledgeCheck;
  onResolved: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  return (
    <Card className="p-5">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">Knowledge check</p>
      <p className="mb-4 text-base font-medium text-foreground">{block.question}</p>
      <div className="space-y-2">
        {block.options.map((opt, i) => {
          const isCorrect = i === block.correctIndex;
          const isPicked = picked === i;
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => {
                setPicked(i);
                onResolved();
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
                !answered && "border-border hover:border-emerald-300 hover:bg-muted",
                answered && isCorrect && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
                answered && isPicked && !isCorrect && "border-red-400 bg-red-50 dark:bg-red-950/30",
                answered && !isCorrect && !isPicked && "border-border opacity-60",
              )}
            >
              {answered && isCorrect ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : answered && isPicked ? (
                <XCircle className="h-4 w-4 shrink-0 text-red-500" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {answered ? (
        <p className="mt-3 rounded-lg bg-muted p-3 text-sm text-muted-foreground">{block.explanation}</p>
      ) : null}
    </Card>
  );
}

export function RolesView({
  block,
  onResolved,
}: {
  block: RoleSelectorBlock;
  onResolved: () => void;
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  function toggle(i: number) {
    const next = new Set(selected);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setSelected(next);
    if (next.size > 0) onResolved();
  }
  return (
    <Card className="p-5">
      <p className="mb-4 text-sm font-medium text-foreground">{block.instruction}</p>
      <div className="mb-5 space-y-2">
        {block.roles.map((r, i) => (
          <div key={i} className="rounded-lg border border-border p-3">
            <p className="text-sm font-semibold text-foreground">{r.role}</p>
            <p className="text-sm text-muted-foreground">{r.example}</p>
          </div>
        ))}
      </div>
      <p className="mb-2 text-sm font-medium text-foreground">{block.actionPrompt}</p>
      <div className="space-y-2">
        {block.actions.map((a, i) => {
          const on = selected.has(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
                on ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" : "border-border hover:bg-muted",
              )}
            >
              {on ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <span>{a}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

export function DecisionView({
  block,
  onResolved,
}: {
  block: DecisionBlock;
  onResolved: () => void;
}) {
  const [picks, setPicks] = useState<Record<number, number>>({});
  function pick(si: number, oi: number) {
    const next = { ...picks, [si]: oi };
    setPicks(next);
    if (Object.keys(next).length === block.scenarios.length) onResolved();
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{block.intro}</p>
      {block.scenarios.map((sc, si) => {
        const picked = picks[si];
        const hasPick = picked !== undefined;
        return (
          <Card key={si} className="p-5">
            <p className="mb-3 text-base font-medium text-foreground">{sc.prompt}</p>
            <div className="space-y-2">
              {sc.options.map((opt, oi) => {
                const isPicked = picked === oi;
                return (
                  <div key={oi}>
                    <button
                      type="button"
                      disabled={hasPick}
                      onClick={() => pick(si, oi)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
                        !hasPick && "border-border hover:border-emerald-300 hover:bg-muted",
                        hasPick && opt.correct && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
                        hasPick && isPicked && !opt.correct && "border-red-400 bg-red-50 dark:bg-red-950/30",
                        hasPick && !opt.correct && !isPicked && "border-border opacity-60",
                      )}
                    >
                      {hasPick && opt.correct ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      ) : hasPick && isPicked ? (
                        <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span>{opt.label}</span>
                    </button>
                    {isPicked ? (
                      <p
                        className={cn(
                          "mt-2 px-1 text-sm",
                          opt.correct ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400",
                        )}
                      >
                        {opt.feedback}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export function CommitmentView({
  block,
  selected,
  onToggle,
}: {
  block: CommitmentBlock;
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  return (
    <Card className="p-5">
      <p className="mb-4 text-sm font-medium text-foreground">{block.instruction}</p>
      <div className="space-y-3">
        {block.options.map((opt) => {
          const on = selected.has(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                on ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" : "border-border hover:bg-muted",
              )}
            >
              {on ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              )}
              <span>
                <span className="block text-sm font-semibold text-foreground">{opt.label}</span>
                <span className="block text-sm text-muted-foreground">{opt.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
