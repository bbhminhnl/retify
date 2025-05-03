// components/StepTitle.tsx
import React from "react";

/** Interface Props */
type Props = {
  /** Step hiện tại */
  step: number;
};

const StepTitle: React.FC<Props> = ({ step }) => {
  /** Render title cho từng bước */
  const renderTitle = () => {
    switch (step) {
      case 1:
        return "What is your company size?";
      case 2:
        return "Create Your AI Assistant & Sales Page";
      case 3:
        return "Preview Selling Page & AI";
      case 4:
        return "Launch AI Assistant and Storefront";
      default:
        return "";
    }
  };

  return (
    <div className="w-full text-left gap-1">
      <div className="flex">
        <div className="size-8 p-1 gap-2.5 flex items-center justify-center font-semibold rounded-full text-white bg-blue-700 shadow">
          {step}
        </div>
      </div>
      <h4 className="text-base font-semibold">{renderTitle()}</h4>
    </div>
  );
};

export default StepTitle;
