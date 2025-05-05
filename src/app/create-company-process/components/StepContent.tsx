import CompanySizeSelector from "./step1/CompanySizeSelector";
import CreateAI from "./step2/CreateAI";
import LaunchAI from "./step4/LaunchAI";
// components/StepContent.tsx
import React from "react";

/**
 * Interface Props
 */
type Props = {
  /** Step hiện tại */
  step: number;
  /** onSelect Company size */
  onSelectCompanySize: (value: string) => void;
  /** onSelect Menu */
  onSelectMenu: (value: string) => void;
  /** company size */
  company_size: string;
  /** fixed menu */
  fixed_menu: string;
};

const StepContent: React.FC<Props> = ({
  step,
  onSelectCompanySize,
  onSelectMenu,
  company_size,
  fixed_menu,
}) => {
  return (
    <div className="rounded w-full text-center">
      {step === 1 && (
        <CompanySizeSelector
          onSelect={(value) => {
            console.log("Chọn:", value);
            /** callback function */
            onSelectCompanySize && onSelectCompanySize(value);
          }}
          defaultValue={company_size}
        />
      )}
      {step === 2 && (
        <CreateAI
          onSelect={(value) => {
            console.log("Chọn:", value);
            /** callback function */
            onSelectMenu && onSelectMenu(value);
          }}
          defaultValue={fixed_menu}
        />
      )}
      {step === 3 && (
        <div>
          <p>Iframe Shop Merchant</p>
        </div>
      )}
      {step === 4 && <LaunchAI />}
    </div>
  );
};

export default StepContent;
