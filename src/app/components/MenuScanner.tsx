"use client";

import { useState } from "react";

export default function MenuScanner() {
  /**
   * Url ảnh
   */
  const [image_url, setImageUrl] = useState("");
  /**
   * Kết quả
   */
  const [result, setResult] = useState<any>(null);
  /**
   * Trạng thái loading
   */
  const [isLoading, setIsLoading] = useState(false);
  console.log(result, "result");
  const analyzeImage = async () => {
    /**
     * Kiem tra url
     */
    if (!image_url) return;
    /**
     * Set loading
     */
    setIsLoading(true);
    /**
     * Phân tích ảnh
     */
    try {
      const RES = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url }),
      });
      setResult(await RES.json());
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
          disabled={isLoading || !image_url}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {isLoading ? "Đang phân tích..." : "Phân tích"}
        </button>
      </div>

      {/* {result && (
        <div className="mt-6 space-y-2">
          {result.error ? (
            <p className="text-red-500">{result.error}</p>
          ) : (
            typeof result.data !== "object" &&
            result.data?.map((item: any, index: number) => (
              <div key={index} className="flex justify-between border-b py-2">
                <span>{item.name}</span>
                <span className="font-medium">
                  {item.price.toLocaleString("vi-VN")}₫
                </span>
              </div>
            ))
          )}
        </div>
      )} */}
      {result && (
        <div className="mt-6 space-y-2">
          {result.error ? (
            <p className="text-red-500">{result.error}</p>
          ) : Array.isArray(result.data) ? (
            result.data.map((item: any, index: number) => (
              <div key={index} className="flex justify-between border-b py-2">
                <span>{item.name}</span>
                <span className="font-medium">
                  {item.price.toLocaleString("vi-VN")}₫
                </span>
              </div>
            ))
          ) : (
            result.data?.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between border-b py-2">
                <span>{item.name}</span>
                <div className="flex gap-x-2">
                  <span className="font-medium">
                    {item.price.toLocaleString("vi-VN")}
                  </span>
                  <span>{item.currency}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
