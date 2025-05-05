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
  const [step, setStep] = useState(4);

  /** company size */
  const [company_size, setCompanySize] = useState("");
  /** fixed menu */
  const [fixed_menu, setFixedMenu] = useState("");

  /** Disable next button */
  const checkDisableNextButton = () => {
    /**
     * Bước 1: Chọn size
     */
    if (step === 1 && company_size === "") {
      return true;
    }
    /**
     * Bước 2: Chọn menu
     */
    if (step === 2 && fixed_menu === "") {
      return true;
    }
    return false;
  };

  return (
    <main className="flex flex-col items-center px-3 py-5 gap-4 w-full md:max-w-[400px] md:mx-auto bg-white h-full">
      <Progress currentStep={step} totalSteps={TOTAL_STEPS} />
      <StepTitle step={step} />
      <div className="w-full flex-grow min-h-0 overflow-hidden overflow-y-auto">
        <StepContent
          step={step}
          onSelectCompanySize={(value) => {
            setCompanySize(value);
          }}
          company_size={company_size}
          onSelectMenu={(value) => {
            /** callback function */
            setFixedMenu(value);
          }}
          fixed_menu={fixed_menu}
        />
      </div>
      <StepNavigator
        step={step}
        maxSteps={TOTAL_STEPS}
        onNext={() => setStep((s) => Math.min(s + 1, TOTAL_STEPS))}
        onBack={() => setStep((s) => Math.max(s - 1, 1))}
        disabledNext={checkDisableNextButton()}
        disabledBack={step === 1}
      />
    </main>
  );
};

export default MainLayout;
