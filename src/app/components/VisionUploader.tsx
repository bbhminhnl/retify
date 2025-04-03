"use client";

import { useState } from "react";

export default function VisionUploader() {
  /**
   * State hình ảnh
   */
  const [image_url, setImageUrl] = useState("");
  /**
   * State data trích xuất
   */
  const [results, setResults] = useState<any[]>([]);
  /**
   * Trạng thái loading
   */
  const [is_loading, setIsLoading] = useState(false);

  /** Nhận url và xử lý ảnh */
  const analyzeImage = async () => {
    /**
     * Set Loading
     */
    setIsLoading(true);
    try {
      /**
       * Phân tích ảnh
       */
      const RES = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url }),
      });
      const DATA = await RES.json();

      /**
       * Set data
       */
      setResults(DATA.data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={image_url}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Dán URL ảnh menu"
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={analyzeImage}
          disabled={is_loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {is_loading ? "Đang phân tích..." : "Gửi"}
        </button>
      </div>

      {results?.length > 0 && (
        <div className="mt-6 border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Món ăn</th>
                <th className="p-3 text-right">Giá</th>
              </tr>
            </thead>
            <tbody>
              {results?.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3">{item.name}</td>
                  <td className="p-3 text-right">
                    {item.price.toLocaleString("vi-VN")}₫
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
