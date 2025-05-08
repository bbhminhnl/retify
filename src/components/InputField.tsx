interface InputFieldProps {
  /**
   * Label hien thi tren input
   */
  label: string;
  /**
   * Gia tri cua input
   */
  value: string | number;
  /**
   *  Hàm nhan gia tri moi
   * @param value Gia tri moi
   * @returns
   */
  onChange: (value: string) => void;
  /**
   * Loai input
   */
  type?: string;
  /**
   * Placeholder
   */
  placeholder?: string;
  /**
   * Lỗi
   */
  error?: string;
}

export default function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  error,
}: InputFieldProps) {
  return (
    <div>
      <label className="block mb-1 font-medium text-left">{label}</label>
      <input
        type={type}
        className={`w-full border rounded-lg p-2 ${
          error ? "border-red-500" : ""
        }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
