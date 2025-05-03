"use client";

import React, { useState } from "react";

import Progress from "./components/Progress";
import StepContent from "./components/StepContent";
import StepNavigator from "./components/StepNavigator";
import StepTitle from "./components/StepTitle";

const MainLayout = () => {
  /** Tổng số Step */
  const TOTAL_STEPS = 4;
  /** Step hiện tại */
  const [step, setStep] = useState(1);

  return (
    <main className="flex flex-col items-center px-3 py-5 gap-3">
      <Progress currentStep={step} totalSteps={TOTAL_STEPS} />
      <StepTitle step={step} />
      <StepContent step={step} />
      <StepNavigator
        step={step}
        maxSteps={TOTAL_STEPS}
        onNext={() => setStep((s) => Math.min(s + 1, TOTAL_STEPS))}
        onBack={() => setStep((s) => Math.max(s - 1, 1))}
      />
    </main>
  );
};

export default MainLayout;
