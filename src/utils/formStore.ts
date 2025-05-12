const STORAGE_KEY = "multi_step_form_data";

/**
 * Hàm cập nhật dữ liệu với localstorage
 * @param data Form data
 */
export const saveFormData = (data: Partial<FormDataType>) => {
  /**
   * Khi chương trình chay trong trình duyet, cập nhật dữ liệu với localstorage
   */
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

/**
 * Hàm lấy dữ liệu tại localstorage
 */
export const loadFormData = (): Partial<FormDataType> | null => {
  /**
   * Khi chương trình chay trong trình duyet, lấy dữ liệu tại localstorage
   */
  if (typeof window !== "undefined") {
    /**
     * Lấy dữ liệu tại localstorage
     */
    const RAW = localStorage.getItem(STORAGE_KEY);
    /**
     * Lấy dữ liệu tại localstorage
     */
    return RAW ? JSON.parse(RAW) : null;
  }
  return null;
};

/**
 * Hàm xoa form data tại localstorage
 */
export const clearFormData = () => {
  /**
   * Khi chương trình chay trong trình duyet, xoa form data tại localstorage
   */
  if (typeof window !== "undefined") {
    /**
     * Xoa form data tại localstorage
     */
    localStorage.removeItem(STORAGE_KEY);
  }
};
