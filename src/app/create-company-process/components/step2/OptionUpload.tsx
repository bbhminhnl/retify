import React, { useEffect, useRef, useState } from "react";

import { useTranslations } from "next-intl";

/** Kiểu dữ liệu */
type IOptionUpload = {
  /** Callback function */
  onSelect: (value: any) => void;
  /** Default value */
  defaultValue?: string;
};
const OptionUpload = ({ onSelect, defaultValue }: IOptionUpload) => {
  /** Đa ngôn ngữ */
  const t = useTranslations();
  /**
   * Input Ref
   */
  const FILE_INPUT_REF = useRef<HTMLInputElement | null>(null);
  /** Preview Ảnh */
  const [preview, setPreview] = useState<any | null>(null);

  useEffect(() => {
    if (defaultValue) {
      setPreview(defaultValue);
    }
  }, [defaultValue]);

  /** Handle div click */
  const handleDivClick = () => {
    FILE_INPUT_REF.current?.click();
  };

  /** Handle file change
   * @param event Sự kiện thay đổi input
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    /**
     * File Upload
     */
    const FILE = event.target.files?.[0];
    /** Nếu có file thì cập nhật preview */
    if (FILE) {
      /** Tạo URL cho ảnh */
      const IMAGE_URL = URL.createObjectURL(FILE);
      /** Cap nhật preview*/
      setPreview(IMAGE_URL);

      /** Truy xuat URL ảnh */
      onSelect(FILE);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-sm text-left font-normal">{t("Option1")}</h2>
      <div
        onClick={handleDivClick}
        className="border flex items-center justify-center overflow-hidden rounded-lg border-slate-200 p-3 text-sm cursor-pointer"
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            style={{ width: "50%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span>{t("click_to_capture")}</span>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        ref={FILE_INPUT_REF}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default OptionUpload;
