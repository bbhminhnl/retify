"use client";

import ActionConnect from "../products/components/ActionConnect";
import ProductItem from "../products/components/ProductItem";
import ProductItemCustom from "../products/components/ProductItemCustom";
import { useState } from "react";

export default function ImageUploader() {
  /**
   * Khai báo các biến trạng thái
   */
  const [preview, setPreview] = useState<string | null>(null);
  /**
   * Trạng thái loading
   */
  const [is_loading, setIsLoading] = useState(false);
  /** Tiến trình */
  const [progress, setProgress] = useState<number>(0);
  /**
   * Khai báo biến trạng thái cho menu
   */
  const [menu_list, setMenuList] = useState<MenuData[]>([]);

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
      const [name, price, unit] = item.split(" - ");
      return { name, price, unit };
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

      const CLEANED_MENU = await processMenuText(VISION_DATA.texts);
      const updatedMenu = await Promise.all(
        CLEANED_MENU.map(async (item: any) => {
          try {
            const res = await fetch("/api/google-generate-img", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt: item.name }),
            });

            const data = await res.json();

            const imageUrl = await saveImageToServer(data?.image);

            return { ...item, image_url: imageUrl };
          } catch (error) {
            console.error("Error generating image:", error);
            return { ...item, image_url: null };
          }
        })
      );
      console.log(updatedMenu, "updatedMenu");
      // setMenu(cleanedMenu);
      // console.log(CLEANED_MENU, "cleanedMenu");

      // const res = await fetch("/api/google-generate-img", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ prompt: CLEANED_MENU[0].image_prompt }),
      // });

      // const data = await res.json();

      // const imageUrl = await saveImageToServer(data?.image);
      // console.log(data);
      // setBase64Image2(imageUrl);

      // setBase64Image(data.description);
      /** Bước 2: Generate menu text */
      setProgress(40);
      /**
       * Gọi API để tạo menu từ kết quả Vision API
       */
      // const MENU_RES = await fetch("/api/generate-menu", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(VISION_DATA),
      // });
      // /**
      //  * Kết quả trả về từ API tạo menu
      //  */
      // if (!MENU_RES.ok) throw new Error("Menu generation failed");
      // /**
      //  * Kết quả trả về từ API tạo menu
      //  */
      // const MENU_DATA = await MENU_RES.json();
      // setMenu(CLEANED_MENU[0]);
      setMenuList(updatedMenu);
      /** Bước 3: Generate ảnh từ prompt */
      setProgress(60);
      // const imageRes = await fetch("/api/generate-image", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ prompt: CLEANED_MENU[0].image_prompt }),
      // });
      // if (!imageRes.ok) throw new Error("Image generation failed");
      // const { image_url } = await imageRes.json();

      // // Kết hợp kết quả
      // setProgress(100);
      // // setMenu({
      // //   ...MENU_DATA,
      // //   image_url: image_url || "/placeholder-food.jpg",
      // // });
      // setAiMenuGenerated(image_url);
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
  /**
   * Lưu ảnh vào file public
   * @param base64Image Luồng base64 của ảnh
   * @returns
   */
  const saveImageToServer = async (base64Image: string) => {
    if (!base64Image) return;

    setIsLoading(true);
    try {
      /**
       * Gọi API để lưu ảnh
       */
      const RESPONSE = await fetch("/api/save-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image }),
      });

      const DATA = await RESPONSE.json();
      if (DATA.success) {
        // setBase64Image(data.imageUrl);
        return DATA.imageUrl;
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="container mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Tải ảnh lên để phân tích</h2>
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
        <div className="flex items-center justify-center h-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* <img src={`data:image/jpeg;base64,${base64Image}`} alt="Ảnh base64" /> */}
      {/* <img src={`${base64Image2}`} alt="Ảnh base64" /> */}
      {/* {menu && (
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
            <p className="text-gray-700 mb-4">{menu.description}</p>

            <div className="mt-4 p-3 bg-gray-50 rounded border">
              <h3 className="font-semibold text-gray-700">Prompt ảnh:</h3>
              <p className="text-sm text-gray-600 mt-1">{menu.image_prompt}</p>
            </div>
          </div>
        </div>
      )} */}
      {menu_list?.length > 0 && (
        <div className="md:container md:mx-auto p-2 px-4">
          <h2 className="text-2xl font-bold">Menu</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {menu_list.map((menu, index) => (
              // <div
              //   key={index}
              //   className="overflow-hidden bg-white rounded-lg shadow"
              // >
              //   <img
              //     src={menu.image_url!}
              //     alt={menu.name}
              //     className="w-full h-64 object-cover rounded-lg"
              //     onError={(e) => {
              //       (e.target as HTMLImageElement).src = "/placeholder-food.jpg";
              //     }}
              //   />
              //   <div className="">
              //     <h2 className="text-2xl font-bold text-gray-800">
              //       {menu.name}
              //     </h2>
              //     <p className="text-red-500 font-bold text-xl my-2">
              //       {menu.price}
              //     </p>
              //   </div>
              // </div>
              <ProductItemCustom
                key={index}
                name={menu.name}
                price={menu.price}
                product_image={menu.image_url}
                unit={menu?.unit}
              />
            ))}
          </div>
          <div className="sticky bottom-0 w-full text-center bg-white">
            <ActionConnect products={menu_list || []} />
          </div>
        </div>
      )}
    </div>
  );
}
