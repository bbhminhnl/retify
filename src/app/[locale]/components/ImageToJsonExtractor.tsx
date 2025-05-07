"use client";

import { useState } from "react";

export default function ImageToJsonExtractor() {
  /**
   * State hình ảnh
   */
  const [image, setImage] = useState<string | null>(null);
  /**
   * State data trích xuất
   */
  const [extracted_data, setExtractedData] = useState<any>(null);
  /**
   * State loading
   */
  const [is_loading, setIsLoading] = useState(false);
  /**
   * State lỗi
   */
  const [error, setError] = useState<string | null>(null);

  /** Xử lý upload ảnh
   * @param e
   */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    /**
     * File Upload
     */
    const FILE = e.target.files?.[0];
    /**
     * Nếu không có file thì bỏ qua
     */
    if (!FILE) return;
    /**
     * Tạo reader cho ảnh
     */
    const READER = new FileReader();
    /** Reader */
    READER.onload = (event) => {
      setImage(event.target?.result as string);
      setError(null); // Reset lỗi khi có ảnh mới
    };
    READER.readAsDataURL(FILE);
  };

  /** Gọi API trích xuất menu */
  const extractMenuToJson = async () => {
    /**
     * Nếu không có ảnh báo lỗi
     */
    if (!image) {
      setError("Vui lòng chọn ảnh trước");
      return;
    }
    /**
     * Tạo loading
     */
    setIsLoading(true);
    /**
     * Reset lỗi
     */
    setError(null);

    try {
      /**
       * Domain trích xuất menu
       */
      const RESPONSE = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: image }),
      });
      /**
       * Nếu khó trích xuất menu báo lỗi
       */
      if (!RESPONSE.ok) throw new Error("API error");
      /**
       * Lấy data trích xuất
       */
      const { data } = await RESPONSE.json();
      setExtractedData(data);
    } catch (err) {
      console.error("Lỗi trích xuất:", err);
      setError("Không thể đọc menu. Vui lòng thử ảnh khác.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white shadow-sm">
      <div>
        <label className="block text-sm font-medium mb-1">Chọn ảnh menu</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {image && (
        <div className="flex flex-col items-center">
          <img
            src={image}
            alt="Ảnh menu đã chọn"
            className="max-h-60 border rounded-md mb-2"
          />
          <button
            onClick={extractMenuToJson}
            disabled={is_loading}
            className={`px-4 py-2 rounded-md text-white
              ${is_loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}
              transition-colors`}
          >
            {is_loading ? "Đang xử lý..." : "Trích xuất Menu → JSON"}
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-sm py-2">{error}</p>}

      {extracted_data && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Kết quả:</h3>
          <pre className="p-3 bg-gray-50 rounded-md text-xs overflow-auto max-h-60">
            {JSON.stringify(extracted_data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
