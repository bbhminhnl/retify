import CompanySizeSelector from "./step1/CompanySizeSelector";
import CreateAI from "./step2/CreateAI";
import LaunchAI from "./step4/LaunchAI";
// components/StepContent.tsx
import React from "react";
import TemplateClient from "@/app/template/TemplateClient";

/**
 * Interface Props
 */
type Props = {
  /** Step hiện tại */
  step: number;
  /** onSelect Company size */
  onSelectCompanySize: (value: string) => void;
  /** onSelect Menu */
  onSelectMenu: (value: any) => void;
  /** company size */
  company_size: string;
  /** fixed menu */
  fixed_menu: string;
  /** Connect to Channel */
  handleConnectChannel: () => void;
  /** Loading */
  loading?: boolean;
  /** data menu */
  rawData: any;
  /** template id */
  template_id: string;
  /** address */
  address: string;
};

const StepContent: React.FC<Props> = ({
  step,
  onSelectCompanySize,
  onSelectMenu,
  company_size,
  fixed_menu,
  handleConnectChannel,
  loading,
  rawData,
  template_id,
  address,
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
          <TemplateClient
            rawData={rawData}
            template_id="user_id_test"
            address=""
          />
        </div>
      )}

      {step === 4 && (
        <div>
          <p>Iframe Shop Merchant</p>
        </div>
      )}
      {step === 5 && (
        <LaunchAI
          onConnect={() => {
            handleConnectChannel();
          }}
          loading={loading}
        />
      )}
    </div>
  );
};

export default StepContent;
