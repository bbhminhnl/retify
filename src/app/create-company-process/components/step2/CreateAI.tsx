// components/CompanySizeSelector.tsx
import React, { useState } from "react";

import Loading from "@/components/loading/Loading";
import OptionInput from "./OptionInput";
import OptionUpload from "./OptionUpload";
import SelectPOS from "./SelectPOS";

/**
 * Interface Props
 */
type IProps = {
  /**
   *  Hàm xuất lý khi chọn size
   * @param value Size selected
   * @returns
   */
  onSelect: (value: any) => void;
  /**
   * Giá trị mặc định
   */
  defaultValue?: string;
  /**
   * Loading
   */
  loading_message?: string;
  /**
   * Kiểu dữ liệu connect channel
   */
  onConnectStep2?: (e: string) => void;
  /**
   * Kiểu dữ liệu connect channel
   */
  loading?: boolean;
  /** shopify connected */
  shopify_connected?: boolean;
};

const CreateAI = ({
  onSelect,
  defaultValue,
  loading_message,
  onConnectStep2,
  loading,
  shopify_connected,
}: IProps) => {
  return (
    <div className="w-full grid gap-4 p-1">
      <OptionUpload onSelect={onSelect} defaultValue={defaultValue} />
      {/* <OptionInput /> */}
      <SelectPOS
        onConnect={(e) => {
          onConnectStep2 && onConnectStep2(e);
        }}
        connected={shopify_connected}
        loading={loading}
      />
      {loading_message ||
        (loading && (
          <div>
            <Loading size="md" />
            <span>{loading_message}</span>
          </div>
        ))}
    </div>
  );
};

export default CreateAI;
