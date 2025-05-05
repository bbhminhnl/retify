"use client";

import React, { useEffect, useState } from "react";

import ConnectDone from "./components/step5/ConnectDone";
import Progress from "./components/Progress";
import StepContent from "./components/StepContent";
import StepNavigator from "./components/StepNavigator";
import StepTitle from "./components/StepTitle";
import { toast } from "react-toastify";

/**
 * Interface Props
 */
declare global {
  /**
   * Interface Window
   */
  interface Window {
    /**
     * Interface ReactNativeWebView
     */
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

const MainLayout = () => {
  /** Tổng số Step */
  const TOTAL_STEPS = 4;
  /** Step hiện tại */
  const [step, setStep] = useState(4);

  /** company size */
  const [company_size, setCompanySize] = useState("");
  /** fixed menu */
  const [fixed_menu, setFixedMenu] = useState("");

  /** onFinish */
  const [on_finish, setOnFinish] = useState(false);

  /**Loading */
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const DATA = JSON.parse(event.data);
        console.log("Data from mobile:", DATA);
        toast.success(DATA.payload + " " + DATA.type + "kkkkkkkkkkkk");

        // Xử lý tùy theo loại message
        if (DATA.type === "greeting") {
          alert(DATA.payload); // "Hello from mobile!"
        }
      } catch (error) {
        console.error("Invalid JSON from mobile:", event.data);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <main className="flex flex-col items-center px-3 py-5 gap-4 w-full md:max-w-[400px] md:mx-auto bg-white h-full">
      {!on_finish && (
        <div className="flex flex-col items-center gap-4 w-full md:max-w-[400px] md:mx-auto bg-white h-full">
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
              handleConnectChannel={() => {
                console.log("Connect channel");
                setLoading(true);
                window.ReactNativeWebView?.postMessage(
                  JSON.stringify({ type: "page.loginFB", message: "" })
                );
                setTimeout(() => {
                  setLoading(false);
                  // setOnFinish(true);
                }, 2000);
              }}
              loading={loading}
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
        </div>
      )}
      {on_finish && (
        <div className="flex flex-col items-center gap-4 w-full md:max-w-[400px] md:mx-auto bg-white h-full">
          <ConnectDone />
        </div>
      )}
    </main>
  );
};

export default MainLayout;
