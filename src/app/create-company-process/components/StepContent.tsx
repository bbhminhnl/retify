import CompanySizeSelector from "./CompanySizeSelector";
// components/StepContent.tsx
import React from "react";

/**
 * Interface Props
 */
type Props = {
  /** Step hiện tại */
  step: number;
};

const StepContent: React.FC<Props> = ({ step }) => {
  return (
    <div className=" rounded w-full text-center">
      {step === 1 && (
        <CompanySizeSelector
          onSelect={(value) => console.log("Chọn:", value)}
        />
      )}
      {step !== 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Step {step}</h2>
          <p>This is content for step {step}.</p>
        </div>
      )}
    </div>
  );
};

export default StepContent;
