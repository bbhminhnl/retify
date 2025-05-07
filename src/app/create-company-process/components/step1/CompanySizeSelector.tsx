import React, { useState } from "react";

// components/CompanySizeSelector.tsx
import { useTranslations } from "next-intl";

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
  /** Đa ngôn ngữ */
  const t = useTranslations();
  /** Company size */
  const SIZES = [
    {
      key: t("solo"),
      value: "SOLO",
    },
    {
      key: t("2to10"),
      value: "2to10",
    },
    {
      key: t("11to50"),
      value: "11to50",
    },
    {
      key: t("51to100"),
      value: "51to100",
    },
    {
      key: t("above100"),
      value: "above100",
    },
  ];

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
