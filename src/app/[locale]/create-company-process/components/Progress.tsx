// components/Progress.tsx
import React from "react";

/**
 *  Interface Props
 */
type Props = {
  /** Bước hiện tại */
  currentStep: number;
  /** Tổng số bước */
  totalSteps?: number;
};

const Progress: React.FC<Props> = ({ currentStep, totalSteps = 4 }) => {
  return (
    <div className="flex flex-col w-full">
      {/* Centered progress lines */}
      <div className="w-full flex flex-col items-center">
        <div className="flex w-full justify-between items-center gap-x-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded ${
                index < currentStep ? "bg-blue-700" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
      {/* Fixed icon at top-left corner */}
    </div>
  );
};

export default Progress;
