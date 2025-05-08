// components/StepContent.tsx
import React, { useState } from "react";

import CompanySizeSelector from "./step1/CompanySizeSelector";
import ConnectToCRM from "@/app/connect/ConnectToCRM";
import CreateAI from "./step2/CreateAI";
import EditorPage from "@/app/[locale]/editor/EditorPage";
import IframeMerchant from "./step4/IframeMerchant";
import LaunchAI from "./step5/LaunchAI";
import TemplateClient from "@/app/[locale]/template/TemplateClient";

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
  /** Template preview */
  template_preview: string;
  /** setTemplatePreview */
  setTemplatePreview: (value: string) => void;
  /** Data input */
  data_input: any;
  /** setDataInput */
  setDataInput: (value: any) => void;
  /** Access token */
  access_token: string;
  /** onFinish */
  onFinish?: () => void;
  /** logo shop */
  updateLogo: (value: any) => void;
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
  template_preview,
  setTemplatePreview,
  data_input,
  setDataInput,
  access_token,
  onFinish,
  updateLogo,
}) => {
  return (
    <div className="rounded w-full text-center h-full">
      {step === 1 && (
        <CompanySizeSelector
          onSelect={(value) => {
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

      {step === 3 && template_preview === "preview" && (
        <div>
          <TemplateClient
            address=""
            handleFinishPreview={(e) => setTemplatePreview(e)}
            step={step}
            onSelect={(value) => {}}
            defaultValue=""
            data_input={data_input}
            setDataInput={setDataInput}
            onSelectAvatar={(value) => {
              updateLogo(value);
            }}
          />
        </div>
      )}
      {((step === 3 && template_preview === "success") ||
        (step === 3 && template_preview === "editor_success")) && (
        <div>
          <EditorPage
            handleFinishEditor={(e) => {
              setTemplatePreview(e);
            }}
          />
        </div>
      )}

      {step === 4 && (
        <div className="h-full">
          <IframeMerchant data_input={data_input} step={step} />
        </div>
      )}
      {step === 5 && !access_token && (
        <LaunchAI
          onConnect={() => {
            handleConnectChannel();
          }}
          loading={loading}
        />
      )}
      {step === 5 && access_token && (
        <div>
          <ConnectToCRM
            access_token_global={access_token}
            onFinish={() => {
              onFinish && onFinish();
            }}
          />
        </div>
      )}
    </div>
  );
};

export default StepContent;
