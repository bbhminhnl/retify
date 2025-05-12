// components/StepContent.tsx
import React, { useState } from "react";

import CompanySizeSelector from "./step1/CompanySizeSelector";
import ConnectToCRM from "@/app/connect/ConnectToCRM";
import CreateAI from "./step2/CreateAI";
import EditorPage from "@/app/[locale]/editor/EditorPage";
import IframeMerchant from "./step4/IframeMerchant";
import LaunchAI from "./step5/LaunchAI";
import TemplateClient from "@/app/[locale]/template/TemplateClient";
import Tiptap from "@/components/Rich-Text-Editor/Tiptap";

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
  onFinish?: (page_id: string, org_id: string) => void;
  /** logo shop */
  updateLogo: (value: any) => void;
  /** List Products */
  list_products: any[];
  /** setListProducts */
  setListProducts: (value: any) => void;
  /** errors */
  errors?: {
    shop_name: string;
    shop_address: string;
  };
  /** setErrors */
  setErrors?: (value: any) => void;

  /** markdown */
  markdown_parent?: string;
  /** setMarkdown */
  setMarkdownParent?: (markdown: string) => void;
  /** Internal markdown */
  internal_markdown_parent?: string;
  /** setInternalMarkdown */
  setInternalMarkdownParent?: (markdown: string) => void;
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
  list_products,
  setListProducts,
  errors,
  setErrors,

  markdown_parent,
  setMarkdownParent,
  internal_markdown_parent,
  setInternalMarkdownParent,
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

      {step === 3 && (
        <div>
          <TemplateClient
            step={step}
            data_input={data_input}
            setDataInput={setDataInput}
            list_products={list_products}
            setListProducts={setListProducts}
            updateLogo={updateLogo}
            errors_input={errors}
            setErrorsInput={setErrors}
          />
        </div>
      )}
      {step === 4 && (
        <div>
          {/* <EditorPage
            step={step}
            handleFinishEditor={(e) => {
              setTemplatePreview(e);
            }}
          /> */}

          <Tiptap
            step={step}
            markdown_parent={markdown_parent}
            setMarkdownParent={setMarkdownParent}
            internal_markdown_parent={internal_markdown_parent}
            setInternalMarkdownParent={setInternalMarkdownParent}
          />
        </div>
      )}

      {step === 5 && (
        <div className="h-full">
          <IframeMerchant data_input={data_input} step={step} />
        </div>
      )}
      {step === 6 && !access_token && (
        <LaunchAI
          onConnect={() => {
            handleConnectChannel();
          }}
          loading={loading}
        />
      )}
      {step === 6 && access_token && (
        <div>
          <ConnectToCRM
            access_token_global={access_token}
            onFinish={(selected_page, selected_organization) => {
              onFinish && onFinish(selected_page, selected_organization);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default StepContent;
