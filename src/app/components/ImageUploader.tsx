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
    /** Bước 1: Gọi API làm sạch dữ liệu */
    const CLEAN_RES = await fetch("/api/clean-menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawText: rawText.join("\n") }),
    });
    /**
     * Kết quả trả về từ API
     */
    const { menuItems } = await CLEAN_RES.json();

    /** Bước 2: Tách tên và giá */
    const PARSED_MENU = menuItems.map((item: string) => {
      /** Tách tên và giá , đơn vị*/
      const [name, price, unit] = item.split(" - ");
      return { name, price, unit };
    });

    return PARSED_MENU;
  };

  /**
   * Hàm xử lý upload ảnh lên server
   * @param base64Image Luồng base64 của ảnh
   * @returns {string} - Đường dẫn ảnh đã lưu
   */

  const fetchUploadImage = async (base64Image: string) => {
    try {
      /** Giả định đây là ảnh PNG, bạn có thể đổi thành "image/jpeg" nếu cần */
      const MIME_TYPE = "image/png";

      /** Convert base64 → binary → File */
      const BYTE_STRING = atob(base64Image);
      /**
       * Chuyển đổi base64 thành Uint8Array
       */
      const BYTE_ARRAY = new Uint8Array(BYTE_STRING.length);
      /**
       * Chuyển đổi base64 thành Uint8Array
       */
      for (let i = 0; i < BYTE_STRING.length; i++) {
        BYTE_ARRAY[i] = BYTE_STRING.charCodeAt(i);
      }
      /**
       * Tạo đối tượng File từ Uint8Array
       */
      const FILE = new File([BYTE_ARRAY], "image.png", { type: MIME_TYPE });

      /** Đưa vào FormData */
      const FORM_DATA = new FormData();
      /** đổi 'file' nếu API cần tên khác */
      FORM_DATA.append("file", FILE);
      /**
       * Gọi API để upload ảnh
       */
      const RES = await fetch(
        "https://api.merchant.vn/v1/internals/attachment/upload?path=&label=&folder_id=&root_file_id=",
        {
          method: "POST",
          body: FORM_DATA,
          headers: {
            "token-business":
              process.env.NEXT_PUBLIC_MERCHANT_TOKEN_BUSINESS || "",
          },
        }
      );
      /**
       * Kết quả trả về từ API dạng JSON
       */
      const RESULT = await RES.json();
      /**
       * URL ảnh
       */
      const FILE_PATH = RESULT?.data?.file_path || "";
      console.log(RESULT);
      /**
       * Tra ve URL ảnh
       */
      return FILE_PATH;
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };
  /**
   * Hàm xử lý sự kiện khi nhấn nút Tạo Menu
   * @returns
   */
  const handleSubmit = async () => {
    /**
     * Kiểm tra nếu không có preview thì trả về
     */
    if (!preview) return;
    /**
     * Bật Loading
     */
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

      /** Sử dụng trong hàm handleSubmit */
      const CLEANED_MENU = await processMenuText(VISION_DATA.texts);
      /**
       * Lọc các món ăn không hợp lệ
       */
      const UPDATED_MENU = await Promise.all(
        CLEANED_MENU.map(async (item: any) => {
          try {
            /**
             * Gọi API để tạo ảnh từ prompt
             */
            const RES = await fetch("/api/google-generate-img", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt: item.name }),
            });
            /**
             * Kết quả trả về từ API tạo ảnh
             */
            const DATA = await RES.json();

            // const imageUrl = await saveImageToServer(data?.image);
            /**
             * Gọi API để lưu ảnh
             * @param base64Image Luồng base64 của ảnh
             * @returns {string} - Đường dẫn ảnh đã lưu
             */
            const IMG_URL = await fetchUploadImage(DATA?.image);
            /** Trả về item và thêm image_url */
            return { ...item, image_url: IMG_URL };
          } catch (error) {
            console.error("Error generating image:", error);
            return { ...item, image_url: null };
          }
        })
      );
      console.log(UPDATED_MENU, "updatedMenu");
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
      setMenuList(UPDATED_MENU);
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

  /**
   *  Hàm xử lý sự kiện khi thay đổi input
   * @param e Sự kiện thay đổi input
   * @returns
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    /** Khai báo FILE */
    const FILE = e.target.files?.[0];
    /** Kiểm tra nếu không có FILE thì trả về */
    if (!FILE) return;
    /**
     * Tạo READER
     */
    const READER = new FileReader();
    /**
     * Kiểm tra định dạng file
     */
    READER.onload = () => {
      setPreview(READER.result as string);
    };
    /**
     * Kiểm tra định dạng file
     */
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
      <h2 className="text-2xl font-bold">Upload an image for analysis</h2>
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
            {is_loading ? "Processing...." : "Create Menu"}
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

      {menu_list?.length > 0 && (
        <div className="md:container md:mx-auto p-2 px-4">
          <h2 className="text-2xl font-bold">Menu</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {menu_list.map((menu, index) => (
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
