import CompanySizeSelector from "./step1/CompanySizeSelector";
import ConnectToCRM from "@/app/connect/ConnectToCRM";
import CreateAI from "./step2/CreateAI";
import IframeMerchant from "./step4/IframeMerchant";
import LaunchAI from "./step5/LaunchAI";
import React from "react";
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
  /** access token chatbox */
  access_token_chatbox?: string;
  /** Connect to CRM */
  connect_to_crm?: boolean;
  /** on Finish */
  on_finish_all?: boolean;
  /** Update QR code
   *  @param value
   */
  updateQRCode?: (value: any) => void;
  /** qr code */
  qr_code?: string;
  /** Parent_page_id */
  parent_page_id?: string;
  /** setParentPageId */
  setParentPageId?: (value: string) => void;

  /** is_need_to_update_crm */
  is_need_to_update_crm?: boolean;
  /**
   * setIsNeedToUpdateCrm
   */
  setIsNeedToUpdateCrm?: (value: boolean) => void;
  /** Hiển thị loading message */
  loading_message?: string;
};

const StepContent: React.FC<Props> = ({
  step,
  onSelectCompanySize,
  onSelectMenu,
  company_size,
  fixed_menu,
  handleConnectChannel,
  loading,
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
  access_token_chatbox,
  connect_to_crm,
  on_finish_all,
  updateQRCode,
  qr_code,
  parent_page_id,
  setParentPageId,
  is_need_to_update_crm,
  setIsNeedToUpdateCrm,
  loading_message,
}) => {
  console.log(company_size, "company_size");
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
          loading_message={loading_message}
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
        <div className="flex-grow min-h-0 overflow-hidden h-full">
          <Tiptap
            step={step}
            markdown_parent={markdown_parent}
            setMarkdownParent={setMarkdownParent}
            internal_markdown_parent={internal_markdown_parent}
            setInternalMarkdownParent={setInternalMarkdownParent}
          />
        </div>
      )}
      {step === 5 && !connect_to_crm && (
        <div className="h-full">
          <IframeMerchant
            data_input={data_input}
            step={step}
            products={list_products}
          />
        </div>
      )}
      {step === 5 && connect_to_crm && is_need_to_update_crm && (
        <div>
          <ConnectToCRM
            access_token_global={access_token}
            onFinish={(selected_page, selected_organization) => {
              onFinish && onFinish(selected_page, selected_organization);

              setIsNeedToUpdateCrm && setIsNeedToUpdateCrm(false);
            }}
            access_token_chatbox={access_token_chatbox}
            page_name={data_input.shop_name.toLowerCase()}
            document={markdown_parent}
            updateQRCode={updateQRCode}
            setParentPageId={setParentPageId}
            is_need_to_update_crm={is_need_to_update_crm}
            setIsNeedToUpdateCrm={setIsNeedToUpdateCrm}
          />
        </div>
      )}
      {step === 6 && !on_finish_all && (
        <LaunchAI
          // onConnect={() => {
          //   handleConnectChannel();
          // }}
          loading={loading}
          qr_code={qr_code}
          page_id={parent_page_id}
          page_name={data_input.shop_name.toLowerCase()}
        />
      )}
    </div>
  );
};

export default StepContent;
