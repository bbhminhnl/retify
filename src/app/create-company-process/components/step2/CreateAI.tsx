// components/CompanySizeSelector.tsx
import React, { useState } from "react";

import Loading from "@/components/loading/Loading";
import OptionInput from "./OptionInput";
import OptionUpload from "./OptionUpload";
import SelectPOS from "./SelectPOS";

/**
 * Interface Props
 */
type Props = {
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
};

const CreateAI: React.FC<Props> = ({
  onSelect,
  defaultValue,
  loading_message,
}) => {
  return (
    <div className="w-full grid gap-4 p-1">
      <OptionUpload onSelect={onSelect} defaultValue={defaultValue} />
      {/* <OptionInput /> */}
      <SelectPOS />
      {loading_message && (
        <div>
          <Loading size="md" />
          <span>{loading_message}</span>
        </div>
      )}
    </div>
  );
};

export default CreateAI;
