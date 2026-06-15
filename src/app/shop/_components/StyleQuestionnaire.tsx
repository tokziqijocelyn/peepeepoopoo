"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { api } from "~/trpc/react";
import { AESTHETICS, OCCASIONS, GENDERS, BUDGETS, COLOR_PALETTE } from "~/lib/constants";
import { cn } from "~/lib/utils";

interface Props {
  onComplete: () => void;
}

export function StyleQuestionnaire({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState("");
  const [aesthetics, setAesthetics] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [occasions, setOccasions] = useState<string[]>([]);

  const processMutation = api.style.processQuestionnaire.useMutation({
    onSuccess: () => onComplete(),
  });

  const toggleItem = (
    arr: string[],
    setArr: (v: string[]) => void,
    item: string,
  ) => {
    setArr(
      arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item],
    );
  };

  const canProceed = [
    gender !== "",
    aesthetics.length > 0,
    colors.length > 0,
    budget !== "",
    occasions.length > 0,
  ][step];

  const totalSteps = 5;

  const handleSubmit = () => {
    processMutation.mutate({ gender, aesthetics, colors, budget, occasions });
  };

  const steps = [
    // Step 0: Gender
    <div key="gender" className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">What&apos;s your style vibe?</h2>
      <p className="text-sm text-[var(--color-text-secondary)]">
        How would you describe your gender expression?
      </p>
      <div className="flex flex-col gap-2">
        {GENDERS.map((g) => (
          <button
            key={g}
            onClick={() => setGender(g)}
            className={cn(
              "rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all",
              gender === g
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                : "border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-text-secondary)]",
            )}
          >
            {g}
          </button>
        ))}
      </div>
    </div>,

    // Step 1: Aesthetics
    <div key="aesthetics" className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Pick your aesthetics</h2>
      <p className="text-sm text-[var(--color-text-secondary)]">
        Select all that speak to you
      </p>
      <div className="flex flex-wrap gap-2">
        {AESTHETICS.map((a) => (
          <button
            key={a}
            onClick={() => toggleItem(aesthetics, setAesthetics, a)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-all",
              aesthetics.includes(a)
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                : "border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-text-secondary)]",
            )}
          >
            {a}
          </button>
        ))}
      </div>
    </div>,

    // Step 2: Colors
    <div key="colors" className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Your color palette</h2>
      <p className="text-sm text-[var(--color-text-secondary)]">
        What colors do you gravitate toward?
      </p>
      <div className="grid grid-cols-4 gap-3">
        {COLOR_PALETTE.map((c) => (
          <button
            key={c.name}
            onClick={() => toggleItem(colors, setColors, c.name)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-all",
              colors.includes(c.name)
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                : "border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-text-secondary)]",
            )}
          >
            <div
              className="h-10 w-10 rounded-full border border-[var(--color-border)]"
              style={{ backgroundColor: c.value }}
            />
            <span className="text-[10px] text-[var(--color-text-secondary)]">
              {c.name}
            </span>
          </button>
        ))}
      </div>
    </div>,

    // Step 3: Budget
    <div key="budget" className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Budget range</h2>
      <p className="text-sm text-[var(--color-text-secondary)]">
        What&apos;s your typical spend on clothing?
      </p>
      <div className="flex flex-col gap-2">
        {BUDGETS.map((b) => (
          <button
            key={b}
            onClick={() => setBudget(b)}
            className={cn(
              "rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all",
              budget === b
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                : "border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-text-secondary)]",
            )}
          >
            {b}
          </button>
        ))}
      </div>
    </div>,

    // Step 4: Occasions
    <div key="occasions" className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Dress for the occasion</h2>
      <p className="text-sm text-[var(--color-text-secondary)]">
        What do you dress for most?
      </p>
      <div className="flex flex-wrap gap-2">
        {OCCASIONS.map((o) => (
          <button
            key={o}
            onClick={() => toggleItem(occasions, setOccasions, o)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-all",
              occasions.includes(o)
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                : "border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-text-secondary)]",
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>,
  ];

  return (
    <div className="flex min-h-dvh flex-col px-6 py-8">
      {/* Progress bar */}
      <div className="mb-8 flex gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all",
              i <= step
                ? "bg-[var(--color-accent)]"
                : "bg-[var(--color-bg-elevated)]",
            )}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {step < totalSteps - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed}
            className="flex items-center gap-1 rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canProceed || processMutation.isPending}
            className="flex items-center gap-1 rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          >
            {processMutation.isPending ? "Analyzing..." : "Finish"}
          </button>
        )}
      </div>
    </div>
  );
}
