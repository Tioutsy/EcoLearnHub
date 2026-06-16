import { useState } from "react";
import { CheckCircle2, XCircle, Circle, Lightbulb, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type {
  TextBlock,
  CalloutBlock,
  RevealBlock,
  ScenarioBlock,
  SortBlock,
  MatchingBlock,
  KnowledgeCheck,
  RoleSelectorBlock,
  DecisionBlock,
  PledgeBlock,
} from "./content";

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

export function RevealView({
  block,
  onResolved,
}: {
  block: RevealBlock;
  onResolved: () => void;
}) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  function reveal(i: number) {
    setRevealed((prev) => {
      if (prev.has(i)) return prev;
      const next = new Set(prev);
      next.add(i);
      if (next.size === block.items.length) onResolved();
      return next;
    });
  }

  return (
    <Card className="p-5">
      <p className="mb-4 text-sm font-medium text-foreground">{block.instruction}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {block.items.map((item, i) => {
          const open = revealed.has(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => reveal(i)}
              className={cn(
                "flex min-h-24 flex-col rounded-lg border p-4 text-left text-sm transition-colors",
                open
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                  : "border-border hover:border-emerald-300 hover:bg-muted",
              )}
            >
              <span className="flex items-center justify-between font-semibold text-foreground">
                {item.label}
                {open ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </span>
              {open ? (
                <span className="mt-2 text-muted-foreground">{item.detail}</span>
              ) : (
                <span className="mt-2 text-xs text-muted-foreground">Tap to reveal</span>
              )}
            </button>
          );
        })}
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

export function SortView({
  block,
  onResolved,
}: {
  block: SortBlock;
  onResolved: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  function choose(itemIndex: number, binKey: string) {
    if (answers[itemIndex] !== undefined) return;
    const next = { ...answers, [itemIndex]: binKey };
    setAnswers(next);
    setSelected(null);
    if (Object.keys(next).length === block.items.length) onResolved();
  }

  const allDone = Object.keys(answers).length === block.items.length;
  const correctCount = block.items.filter((it, i) => answers[i] === it.correctBin).length;

  return (
    <Card className="p-5">
      <p className="mb-4 text-sm font-medium text-foreground">{block.instruction}</p>
      <div className="space-y-2">
        {block.items.map((item, i) => {
          const answered = answers[i] !== undefined;
          const correct = answers[i] === item.correctBin;
          const isSelected = selected === i;
          const chosenBin = block.bins.find((b) => b.key === answers[i]);
          const correctBin = block.bins.find((b) => b.key === item.correctBin);
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => setSelected(isSelected ? null : i)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors",
                isSelected && "border-emerald-500 ring-2 ring-emerald-200",
                answered
                  ? correct
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                    : "border-red-400 bg-red-50 dark:bg-red-950/30"
                  : "border-border hover:bg-muted",
              )}
            >
              <span className="font-medium text-foreground">{item.label}</span>
              {answered ? (
                <span className="flex items-center gap-2 text-xs">
                  <span className={correct ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                    {chosenBin?.label}
                  </span>
                  {correct ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {isSelected ? "Choose a bin below" : "Tap to select"}
                </span>
              )}
              {answered && !correct ? (
                <span className="sr-only">Correct bin is {correctBin?.label}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {block.bins.map((bin) => (
          <button
            key={bin.key}
            type="button"
            disabled={selected === null}
            onClick={() => selected !== null && choose(selected, bin.key)}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm transition-colors",
              selected === null
                ? "border-border text-muted-foreground opacity-60"
                : "border-emerald-300 text-foreground hover:bg-emerald-50 dark:hover:bg-emerald-950/40",
            )}
          >
            {bin.label}
          </button>
        ))}
      </div>

      {block.items.map((item, i) =>
        answers[i] !== undefined && answers[i] !== item.correctBin ? (
          <p key={i} className="mt-2 text-sm text-muted-foreground">
            {item.label}: {item.note}
          </p>
        ) : null,
      )}

      {allDone ? (
        <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-400">
          You sorted {correctCount} of {block.items.length} correctly. Review any notes above and keep them in mind.
        </p>
      ) : null}
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
          Well matched. Thinking in this order helps you cut waste before it is even created.
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

export function PledgeView({
  block,
  selected,
  onToggle,
}: {
  block: PledgeBlock;
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
