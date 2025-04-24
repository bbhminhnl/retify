"use client";

import { useEffect, useState } from "react";

import { set } from "lodash";

export default function TemplateClient({
  template_id,
  rawData,
}: {
  template_id: string;
  rawData: any;
}) {
  /** Data  Dữ liệu hiển thị*/
  const [data, setData] = useState<any[]>([]);
  /** Error */
  const [error, setError] = useState<string | null>(null);

  /**
   * setLoading
   */
  const [loading, setLoading] = useState<boolean>(false);
  /** Thêm ảnh mô tả cho sản phẩm
   * @param menuItems Danh sách các món ăn đã được làm sạch và tách tên, giá, đơn vị
   * @returns Danh sách các món ăn đã được thêm ảnh mô tả
   * @description
   * - Gọi API để tạo ảnh từ prompt
   * - Lưu ảnh vào server
   * - Trả về danh sách các món ăn đã được thêm ảnh mô tả
   * - Nếu có lỗi trong quá trình tạo ảnh, trả về null cho ảnh
   */
  const addImageDescription = async (menuItems: any[]) => {
    /** Call api tạo ảnh minh hoạ cho món ăn */
    const UPDATED_MENU = await Promise.all(
      menuItems.map(async (item: any) => {
        try {
          /**
           * Gọi API để tạo ảnh từ prompt
           */
          const RES = await fetch(`/api/google-generate-img`, {
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
          /**
           * Hàm xử lý upload ảnh lên server
           * @param base64Image Luồng base64 của ảnh
           * @returns {string} - Đường dẫn ảnh đã lưu
           */

          /** Trả về item và thêm image_url */
          return { ...item, image_url: IMG_URL };
        } catch (error) {
          console.error("Error generating image:", error);
          return { ...item, image_url: null };
        } finally {
          // completed++;
          // setProgress(`${completed}/${totalItems}`);
          // if (completed === totalItems) {
          //   setProgress("Done");
          //   setTimeout(() => {
          //     setProgress(null);
          //   }, 2000);
          // }
        }
      })
    );
    return UPDATED_MENU;
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
      const FILE = new File([BYTE_ARRAY], "image.png", {
        type: MIME_TYPE,
      });

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

  useEffect(() => {
    const fetchData = async () => {
      if (!rawData) {
        setError("Không tìm thấy dữ liệu hoặc dữ liệu đã quá hạn.");
        return;
      }

      try {
        setLoading(true);
        /**
         * Chuyển đổi dữ liệu từ Redis về định dạng JSON
         */
        // const PARSED_DATA = JSON.parse(rawData);
        const PARSED_DATA = rawData;

        console.log(rawData, "rawData");
        /** Kiểm tra nếu tất cả phần tử đều có image_url */
        const HAS_IMAGE_URL = PARSED_DATA.every(
          (item: any) => !!item.image_url
        );
        /** Lưu giá trị menu */
        let updated_menu = PARSED_DATA;
        /** Nếu không có image_url thì gọi API để tạo ảnh */
        if (!HAS_IMAGE_URL) {
          /** Nếu thiếu image_url, generate */
          updated_menu = await addImageDescription(PARSED_DATA);
          console.log(updated_menu, "UPDATED_MENU");
        } else {
          console.log("✅ Dữ liệu đã có image_url, không cần generate.");
        }

        setData(updated_menu);

        /** Lưu lại Redis */
        const RES = await fetch("/api/json", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: template_id, // ⚠️ thay bằng id thực tế nếu cần
            value: updated_menu,
          }),
        });
        console.log(RES, "RES");
      } catch (err: any) {
        setError("Dữ liệu bị lỗi hoặc không thể tạo ảnh.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rawData]);

  return (
    <main className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">📦 Dữ liệu template</h1>

      {error ? (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
          ⚠️ {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {loading && (
            <div className="p-4 bg-gray-100 text-gray-500 rounded">
              <p>Đang tải dữ liệu...</p>
            </div>
          )}
          {!loading &&
            (data && data.length > 0 ? (
              data.map((item, index) => (
                <div key={index} className="bg-white p-4 rounded shadow-md">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded"
                  />
                  <h2 className="text-xl font-semibold mt-4 truncate">
                    {item.name}
                  </h2>
                  <p className="text-gray-500">
                    {item.price} {item.unit}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 text-gray-500">Dữ liệu trống.</div>
            ))}
        </div>
      )}
    </main>
  );
}
