"use client";

import { useState } from "react";

export default function ImageUploader() {
  const [preview, setPreview] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [is_loading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const processMenuText = async (rawText: string[]) => {
    // Bước 1: Gọi API làm sạch dữ liệu
    const cleanRes = await fetch("/api/clean-menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawText: rawText.join("\n") }),
    });
    const { menuItems } = await cleanRes.json();

    // Bước 2: Tách tên và giá
    const parsedMenu = menuItems.map((item: string) => {
      const [name, price] = item.split(" - ");
      return { name, price };
    });

    return parsedMenu;
  };
  const handleSubmit = async () => {
    if (!preview) return;

    setIsLoading(true);
    setProgress(0);

    try {
      /** Bước 1: Gọi Vision API */
      setProgress(20);
      const VISION_RES = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image: preview }),
      });
      /**
       * Gọi Vision API để nhận diện món ăn
       */
      if (!VISION_RES.ok) throw new Error("Vision API failed");
      /**
       * Kết quả trả về từ Vision API
       */
      const VISION_DATA = await VISION_RES.json();

      // Sử dụng trong hàm handleSubmit

      const cleanedMenu = await processMenuText(VISION_DATA.texts);
      // setMenu(cleanedMenu);
      console.log(cleanedMenu, "cleanedMenu");
      /** Bước 2: Generate menu text */
      setProgress(40);
      /**
       * Gọi API để tạo menu từ kết quả Vision API
       */
      const MENU_RES = await fetch("/api/generate-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(VISION_DATA),
      });
      /**
       * Kết quả trả về từ API tạo menu
       */
      if (!MENU_RES.ok) throw new Error("Menu generation failed");
      /**
       * Kết quả trả về từ API tạo menu
       */
      const MENU_DATA = await MENU_RES.json();
      setMenu(MENU_DATA);
      /** Bước 3: Generate ảnh từ prompt */
      setProgress(60);
      const imageRes = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: MENU_DATA.image_prompt }),
      });
      if (!imageRes.ok) throw new Error("Image generation failed");
      const { image_url } = await imageRes.json();

      // Kết hợp kết quả
      setProgress(100);
      setMenu({
        ...MENU_DATA,
        image_url: image_url || "/placeholder-food.jpg",
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Có lỗi xảy ra: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
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
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Phần upload ảnh giữ nguyên */}
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
      {is_loading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {menu && (
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="border rounded-lg overflow-hidden">
            <img
              src={menu.image_url!}
              alt={menu.name_vi}
              className="w-full h-64 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-food.jpg";
              }}
            />
          </div>

          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-800">{menu.name_vi}</h2>
            <p className="text-gray-600 italic">{menu.name_en}</p>
            <p className="text-red-500 font-bold text-xl my-2">{menu.price}</p>
            {/* <p className="text-gray-700 mb-4">{menu.description}</p> */}

            {/* <div className="mt-4 p-3 bg-gray-50 rounded border">
              <h3 className="font-semibold text-gray-700">Prompt ảnh:</h3>
              <p className="text-sm text-gray-600 mt-1">{menu.image_prompt}</p>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
}
