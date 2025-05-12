// components/StepTitle.tsx
import React from "react";
import { useTranslations } from "next-intl";
/** Interface Props */
type Props = {
  /** Step hiện tại */
  step: number;
};

const StepTitle: React.FC<Props> = ({ step }) => {
  const t = useTranslations();
  /** Render title cho từng bước */
  const renderTitle = () => {
    switch (step) {
      case 1:
        return t("step1");
      case 2:
        return t("step2");
      case 3:
        return t("step3");
      case 4:
        return t("step4");
      case 5:
        return t("step5");
      case 6:
        return t("step6");
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
