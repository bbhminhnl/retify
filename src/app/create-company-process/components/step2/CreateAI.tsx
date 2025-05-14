// components/CompanySizeSelector.tsx
import React, { useState } from "react";

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
};

const CreateAI: React.FC<Props> = ({ onSelect, defaultValue }) => {
  return (
    <div className="w-full grid gap-4 p-1">
      <OptionUpload onSelect={onSelect} defaultValue={defaultValue} />
      {/* <OptionInput /> */}
      <SelectPOS />
    </div>
  );
};

export default CreateAI;
