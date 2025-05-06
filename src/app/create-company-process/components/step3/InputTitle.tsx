import React, { useEffect, useState } from "react";

const InputTitle = ({
  value_input,
  setValueInput,
  title = "Title",
  placeholder = "Placeholder",
  error,
}: {
  /**
   * Giá trị nhập với input
   */
  value_input: string;
  /**
   * Hàm set giá trị nhập với input
   * @param value Giá trị nhập với input
   * @returns
   */
  setValueInput: (value: string) => void;
  /** Title */
  title: string;
  /** Placeholder */
  placeholder: string;
  /** Error */
  error?: string;
}) => {
  /** State lưu giá trị nhập */
  const [value, setValue] = useState<string>("");
  /** Input */
  useEffect(() => {
    setValue(value_input);
  }, [value_input]);

  /** Khi người dùng nhập dữ liệu
   * @param event Sự kiện thay đổi input
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    /**
     * Lưu vào state
     */
    setValue(event.target.value);
    /** callback function */
    setValueInput(event.target.value);
  };

  return (
    <div className="flex flex-col gap-1 ">
      <h2 className="text-sm text-left font-normal">{title}</h2>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        className={`
          ${error ? "border-red-500" : ""} border rounded-lg p-3 text-sm
        `}
        placeholder={placeholder}
      />
    </div>
  );
};

export default InputTitle;
