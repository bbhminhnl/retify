import React, { useState } from "react";

import { useTranslations } from "next-intl";

const OptionInput: React.FC = () => {
  /** Đa ngôn ngữ */
  const t = useTranslations();
  /** State lưu giá trị nhập */
  const [value, setValue] = useState<string>("");

  /** Khi người dùng nhập dữ liệu
   * @param event Sự kiện thay đổi input
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-sm text-left font-normal">{t("Option2")}</h2>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        className="border rounded-lg p-3 text-sm"
        placeholder="https://..."
      />
    </div>
  );
};

export default OptionInput;
