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
  onSelect: (value: string) => void;
  /**
   * Giá trị mặc định
   */
  defaultValue?: string;
};

const CreateAI: React.FC<Props> = ({ onSelect, defaultValue }) => {
  /** Selected */
  const [selected, setSelected] = useState<string | null>(defaultValue || null);
  /**
   * Hàm xuất lý khi chọn size
   * @param size Size selected
   */

  return (
    <div className="w-full grid gap-4">
      <OptionUpload onSelect={onSelect} defaultValue={defaultValue} />
      <OptionInput />
      <SelectPOS />
    </div>
  );
};

export default CreateAI;
