"use client";

import { File } from "openai/_shims/index.mjs";
import { useState } from "react";

interface MenuData {
  name_vi: string;
  name_en: string;
  price: string;
  description: string;
  image_prompt: string;
}

export default function ImageUploader() {
  /**
   * Khai báo state preview
   */
  const [preview, setPreview] = useState<string | null>(null);
  /**
   * Khai báo state menu
   */
  const [menu, setMenu] = useState<MenuData | null>(null);
  /**
   * Khai báo state loading
   */
  const [is_loading, setIsLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    /** Khai báo FILE */
    const FILE = e.target.files?.[0];
    if (!FILE) return;
    /**
     * Tạo READER
     */
    const READER = new FileReader();
    READER.onload = () => {
      setPreview(READER.result as string);
    };
    READER.readAsDataURL(FILE);
  };
  /**
   * Action khi nhấn nút submit
   * @returns
   */
  const handleSubmit = async () => {
    if (!preview) return;

    setIsLoading(true);
    try {
      /** Gọi Vision API trực tiếp với base64 */
      const VISION_RES = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image: preview }),
      });
      /**
       * Kiểm tra xem có lỗi không
       */
      if (!VISION_RES.ok) throw new Error("Vision API failed");
      /**
       * Lấy dữ liệu từ Vision API
       */
      const VISION_DATA = await VISION_RES.json();

      /** Generate menu */
      const MENU_RES = await fetch("/api/generate-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(VISION_DATA),
      });
      /**
       * Kiểm tra xem có lỗi không
       */
      if (!MENU_RES.ok) throw new Error("Menu generation failed");
      /**
       * Lấy dữ liệu từ Vision API
       */
      const MENU_DATA = await MENU_RES.json();

      setMenu(MENU_DATA);
    } catch (error) {
      console.error("Error:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700"
        />

        {preview && (
          <button
            onClick={handleSubmit}
            disabled={is_loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {is_loading ? "Đang xử lý..." : "Tạo Menu"}
          </button>
        )}
      </div>

      {preview && (
        <div className="mt-4">
          <img
            src={preview}
            alt="Preview"
            className="max-h-60 object-contain rounded border"
          />
        </div>
      )}

      {menu && (
        <div className="p-4 border rounded-lg mt-4 bg-white shadow">
          <h2 className="text-xl font-bold text-gray-800">{menu.name_vi}</h2>
          <p className="text-gray-600 italic">{menu.name_en}</p>
          <p className="text-red-500 font-medium my-2">{menu.price}</p>
          <p className="text-gray-700">{menu.description}</p>
          <div className="mt-3 p-2 bg-gray-50 rounded">
            <p className="text-sm text-gray-500">Prompt ảnh:</p>
            <p className="text-sm text-gray-700">{menu.image_prompt}</p>
          </div>
        </div>
      )}
    </div>
  );
}
