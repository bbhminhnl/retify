// components/CompanySizeSelector.tsx
import React, { useState } from "react";
/** Company size */
const SIZES = [
  "Solo",
  "2 – 10 employees",
  "11 – 50 employees",
  "51 – 100 employees",
  "Above 100 employees",
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
    <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
      {SIZES.map((size) => (
        <div
          key={size}
          onClick={() => handleSelect(size)}
          className={`cursor-pointer border rounded-lg p-3 gap-2.5 text-left font-medium transition text-sm ${
            selected === size
              ? "bg-blue-700 text-white border-blue-700 shadow"
              : "bg-white hover:border-blue-400"
          }`}
        >
          {size}
        </div>
      ))}
    </div>
  );
};

export default CompanySizeSelector;
