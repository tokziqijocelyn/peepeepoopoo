"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StyleQuestionnaire } from "~/app/shop/_components/StyleQuestionnaire";
import { BodyPhotoUpload } from "~/app/shop/_components/BodyPhotoUpload";

type Step = "questionnaire" | "bodyPhoto";

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("questionnaire");
  const router = useRouter();

  const finish = () => {
    router.replace("/shop");
  };

  if (step === "questionnaire") {
    return (
      <StyleQuestionnaire
        onComplete={() => setStep("bodyPhoto")}
      />
    );
  }

  return (
    <BodyPhotoUpload
      onComplete={finish}
      onSkip={finish}
    />
  );
}
