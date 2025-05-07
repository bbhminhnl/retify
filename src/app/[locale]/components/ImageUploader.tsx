"use client";

import { useEffect, useState } from "react";

import ActionConnect from "../products/components/ActionConnect";
import ProductItem from "../products/components/ProductItem";
import ProductItemCustom from "../products/components/ProductItemCustom";
import { useRouter } from "next/navigation";

export default function ImageUploader() {
  /**
   * ROuter
   */
  const ROUTER = useRouter();
  /**
   * Khai báo các biến trạng thái
   */
  const [preview, setPreview] = useState<string | null>(null);
  /**
   * Trạng thái loading
   */
  const [is_loading, setIsLoading] = useState(false);
  /** Tiến trình */
  const [progress, setProgress] = useState<string | null>(null);
  /**
   * Khai báo biến trạng thái cho menu
   */
  const [menu_list, setMenuList] = useState<MenuData[]>([]);
  /** Query */
  const [query, setQuery] = useState("");

  /**
   *  Hàm xử lý menu text
   * @description
   * - Bước 1: Gọi API làm sạch dữ liệu
   * - Bước 2: Tách tên và giá
   * - Bước 3: Tạo ảnh từ prompt
   * - Bước 4: Lưu ảnh vào server
   * - Bước 5: Trả về danh sách món ăn
   * @param rawText Danh sách văn bản nhận diện
   * @returns
   */
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

    try {
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
      const totalItems = CLEANED_MENU.length;
      let completed = 0;
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
          } finally {
            completed++;
            setProgress(`${completed}/${totalItems}`);
            if (completed === totalItems) {
              setProgress("Done");
              setTimeout(() => {
                setProgress(null);
              }, 2000);
            }
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

  /** State accessToken*/
  const [access_token, setAccessToken] = useState("");
  /** Lấy Facebook Token */
  function getFacebookToken(event: MessageEvent) {
    /** Kiểm tra event có hợp lệ không */
    if (
      !event ||
      !event.data ||
      typeof event.data !== "object" ||
      event.data.from !== "FACEBOOK_IFRAME" ||
      event.data.event !== "LOGIN"
    ) {
      return;
    }
    /**
     * Lay response tu facebook
     */
    const FACEBOOK_RESPONSE = event.data.data;
    /** Kiểm tra token */
    if (FACEBOOK_RESPONSE?.authResponse?.accessToken) {
      /** Set token */
      setAccessToken(FACEBOOK_RESPONSE.authResponse.accessToken);
    }
  }
  useEffect(() => {
    /**
     * Add event listener
     */
    window.addEventListener("message", getFacebookToken);

    return () => {
      window.removeEventListener("message", getFacebookToken);
    };
    /** Chỉ chạy một lần khi component mount */
  }, []);
  useEffect(() => {
    if (access_token) {
      handleAddProductAndNavigate(access_token);
    }
  }, [access_token]);
  /**
   *  Hàm xử lý sự kiện khi nhấn nút thêm sản phẩm
   * @param e
   */
  const handleAddProductAndNavigate = async (access_token: string) => {
    /**
     * Thêm loading
     */

    /** Sản phẩm mới */
    const NEW_PRODUCT = menu_list.map((product: any) => ({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      product_image: `${product.image_url}`,
      type: "product",
      unit: product.unit,
    }));

    try {
      /**
       * Thêm sản phẩm mới vào danh sách sản phẩm
       */
      const RES = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        /** Gửi danh sách sản phẩm */
        body: JSON.stringify(NEW_PRODUCT),
      });
      /**
       * Kiểm tra xem có lỗi không
       */
      if (RES.ok) {
        console.log("Sản phẩm đã được thêm");
        /** Chuyển trang sau khi thành công */
        ROUTER.push("/connect?access_token=" + access_token);
      } else {
        console.error("Lỗi khi thêm sản phẩm");
      }
    } catch (error) {
      console.error("Lỗi mạng hoặc server:", error);
    } finally {
      // setLoading(false);
    }
  };

  const [image, setImage] = useState("");
  const handleGenerateImage = async () => {
    const prompt = `nhân viên nhập liệu thủ công, thực đơn giấy cũ`;
    try {
      /**
       * Gọi API để tạo ảnh từ prompt
       */
      const RES = await fetch("/api/google-generate-img", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt }),
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
      setImage(IMG_URL);
    } catch (error) {
      console.error("Lỗi mạng hoặc server:", error);
    }
  };

  const searchShopInfo = async (query: string) => {
    const res = await fetch("/api/web-info", {
      method: "POST",
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    return data.results; // danh sách các kết quả từ Google
  };

  return (
    <div className="container mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Upload an image for analysis</h2>

      {/* <button onClick={handleGenerateImage}>generate Image</button>
      <img
        src={image}
        alt=""
        className="max-h-60 object-contain rounded border"
      /> */}

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
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <button onClick={() => searchShopInfo(query)} className="btn">
          Click search api google
        </button>
      </div>
      {preview && (
        <div className="mt-4">
          <img
            src={preview}
            alt="Preview"
            className="w-full object-contain rounded border"
          />
        </div>
      )}
      {is_loading && (
        <div className="flex items-center justify-center h-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}
      {progress && (
        <div className="text-center text-xl text-blue-500">
          {progress === "Done" ? (
            <span className="text-green-500">The menu has been generated</span>
          ) : (
            <span>
              <span className="text-blue-500">Processing... {progress}</span>
            </span>
          )}
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
          <div className="flex items-center justify-center h-full w-full">
            <div className="h-10 w-80">
              <iframe
                loading="lazy"
                className="relative z-[2] w-full h-full"
                src='https://botbanhang.vn/cross-login-facebook?app_id=1282108599314861&amp;option={"return_scopes":true,"auth_type":"rerequest","enable_profile_selector":true,"scope":"public_profile,pages_show_list,pages_read_engagement,pages_messaging,email,pages_read_user_content,instagram_manage_comments,instagram_manage_insights,business_management,ads_management,read_insights,pages_manage_metadata,pages_manage_ads,pages_manage_posts,pages_manage_engagement,page_events"}&amp;text=Tiếp tục với Facebook&amp;btn_style=display%3Aflex%3Bjustify-content%3Acenter%3Bwidth%3A100%25%3Bheight%3A100%25%3Balign-items%3Acenter%3Bgap%3A0.5rem%3Bbackground-color%3A%23f1f5f9%3Bborder-radius%3A0.375rem%3Bcolor%3A%230f172a%3Bfont-size%3A16px%3Bfont-weight%3A500%3Bborder-color%3A%23e2e8f0%3Bborder-width%3A1px'
                frameBorder="none"
              ></iframe>
            </div>
          </div>
          <div className="sticky bottom-0 w-full text-center bg-white"></div>
        </div>
      )}
    </div>
  );
}
