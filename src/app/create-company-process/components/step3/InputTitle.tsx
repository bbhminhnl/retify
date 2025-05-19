import React, { useEffect, useState } from "react";

const InputTitle = ({
  value_input,
  setValueInput,
  title = "Title",
  placeholder = "Placeholder",
  error,
}: {
  value_input: string;
  setValueInput: (value: string) => void;
  title: string;
  placeholder: string;
  error?: string;
}) => {
  const [value, setValue] = useState<string>("");

  /** Sync value_input from outside to local state */
  useEffect(() => {
    setValue(value_input);
  }, [value_input]);

  /** Debounce and call setValueInput after 500ms of inactivity */
  // useEffect(() => {
  //   // const HANDLER = setTimeout(() => {
  //   setValueInput(value);
  //   // }, 500);

  //   // /** Cleanup if user types again before 500ms */
  //   // return () => {
  //   //   clearTimeout(HANDLER);
  //   // };
  // }, [value]);

  /**
   * Hàm xuất lý khi người dùng nhập dữ liệu
   * @param event Sự kiện thay đổi input
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value); // Just update local state
    setValueInput(event.target.value);
  };

  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-sm text-left font-normal">{title}</h2>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        className={`${
          error ? "border-red-500" : ""
        } border rounded-lg p-3 text-sm`}
        placeholder={placeholder}
      />
    </div>
  );
};

export default InputTitle;
