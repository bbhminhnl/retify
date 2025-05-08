"use client";

import { QA, StoreDetails } from "@/types/store";
import React, { useState } from "react";

export default function StoreInfoPage() {
  const [searchText, setSearchText] = useState("");
  const [storeDetails, setStoreDetails] = useState<StoreDetails | null>(null);
  const [qa, setQA] = useState<QA[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchText.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/search-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchText }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch store info");
      }

      const data = await response.json();
      setStoreDetails(data.storeDetails);
      setQA(data.qa);
    } catch (err) {
      setError("Không thể lấy thông tin cửa hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tìm kiếm thông tin cửa hàng</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Nhập tên và địa chỉ cửa hàng (ví dụ: Cửu Vân Long số 10 Trần Phú)"
          className="border p-2 w-full mb-2"
        />
        <button
          type="submit"
          disabled={!searchText.trim() || loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? "Đang xử lý..." : "Tìm kiếm"}
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}

      {storeDetails && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Thông tin cửa hàng</h2>
          <p>
            <strong>Tên:</strong> {storeDetails.name || "N/A"}
          </p>
          <p>
            <strong>Địa chỉ:</strong> {storeDetails.address || "N/A"}
          </p>
          <p>
            <strong>SĐT:</strong> {storeDetails.phone || "N/A"}
          </p>
          <p>
            <strong>Giờ mở cửa:</strong> {storeDetails.openingHours || "N/A"}
          </p>
          <p>
            <strong>Đánh giá:</strong> {storeDetails.rating || "N/A"}
          </p>
        </div>
      )}

      {qa.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold">Câu hỏi thường gặp</h2>
          <ul className="list-disc pl-5">
            {qa.map((item, index) => (
              <li key={index}>
                <strong>{item.question}</strong> {item.answer}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
