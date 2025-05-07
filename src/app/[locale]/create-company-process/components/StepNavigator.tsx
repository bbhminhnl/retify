// components/StepNavigator.tsx
import Loading from "@/components/loading/Loading";
import React from "react";

/** Interface Props */
type Props = {
  /** Step hiện tại */
  step: number;
  /** Tổng số Step */
  maxSteps: number;
  /**
   * Click next
   * @returns void
   */
  onNext: () => void;
  /**
   * Click back
   */
  onBack: () => void;
  /**
   * disabled Next
   */
  disabledNext?: boolean;
  /**
   * disabled Back
   */
  disabledBack?: boolean;
  /**
   * loading
   */
  loading?: boolean;
};

const StepNavigator: React.FC<Props> = ({
  step,
  maxSteps,
  onNext,
  onBack,
  disabledNext,
  disabledBack,
  loading,
}) => {
  return (
    <div className="flex justify-between w-full">
      <button
        onClick={() => onBack()}
        disabled={step === 1 || loading}
        className="px-10 py-2 bg-slate-200 text-slate-700 rounded-md disabled:opacity-50 text-sm font-semibold cursor-pointer"
      >
        Back
      </button>
      {step !== maxSteps && (
        <button
          onClick={() => {
            if (disabledNext) return;
            onNext();
          }}
          disabled={step === maxSteps || disabledNext || loading}
          className={`px-10 py-2 bg-blue-700 text-white rounded-md disabled:bg-blue-200 disabled:text-blue-700 text-sm font-semibold cursor-pointer flex items-center gap-x-2`}
        >
          Next
          {loading && (
            <div className="">
              <Loading size="sm" color_white />
            </div>
          )}
        </button>
      )}
    </div>
  );
};

export default StepNavigator;
