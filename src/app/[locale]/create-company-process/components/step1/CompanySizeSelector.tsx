// components/CompanySizeSelector.tsx
import React, { useState } from "react";
/** Company size */
const SIZES = [
  {
    key: "Solo",
    value: "SOLO",
  },
  {
    key: "2 – 10 employees",
    value: "2to10",
  },
  {
    key: "11 – 50 employees",
    value: "11to50",
  },
  {
    key: "51 – 100 employees",
    value: "51to100",
  },
  {
    key: "Above 100 employees",
    value: "above100",
  },
];

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

const CompanySizeSelector: React.FC<Props> = ({ onSelect, defaultValue }) => {
  /** Selected */
  const [selected, setSelected] = useState<string | null>(defaultValue || null);
  /**
   * Hàm xuất lý khi chọn size
   * @param size Size selected
   */
  const handleSelect = (size: string) => {
    /**
     * cập nhật state
     */
    setSelected(size);
    /** callback function */
    onSelect(size);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {SIZES.map((size) => (
        <div
          key={size.value}
          onClick={() => handleSelect(size.value)}
          className={`cursor-pointer border rounded-lg p-3 gap-2.5 text-left font-medium transition text-sm ${
            selected === size.value
              ? "bg-blue-700 text-white border-blue-700 shadow"
              : "bg-white hover:border-blue-400"
          }`}
        >
          {size.key}
        </div>
      ))}
    </div>
  );
};

export default CompanySizeSelector;
