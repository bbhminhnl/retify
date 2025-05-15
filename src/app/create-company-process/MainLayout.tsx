"use client";

import { generateSessionId, getSessionId, storeSessionId } from "@/lib/session";
import { loadFormData, saveFormData } from "@/utils/formStore";
import { useEffect, useState } from "react";

import ConnectDone from "./components/step6/ConnectDone";
import { IProductItem } from "@/types";
import { MOCK_DATA } from "@/utils/data";
import Product from "../products/Products";
import Progress from "./components/Progress";
import StepContent from "./components/StepContent";
import StepNavigator from "./components/StepNavigator";
import StepTitle from "./components/StepTitle";
import { callStepAPI } from "@/services/fetchApi";
import { simpleUUID } from "@/utils";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

/**
 * Interface Props
 */
declare global {
  /**
   * Interface Window
   */
  interface Window {
    /**
     * Interface ReactNativeWebView
     */
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}
/** Form data type */
const DEFAULT_FORM_DATA: FormDataType = {
  step: 1,
  company_size: "",
  image_url: "",
  data_input: {},
  list_products: [],
  errors: {
    shop_name: "",
    shop_address: "",
  },
  markdown: "",
  internal_markdown: "",
  access_token: "",
  shop_information: {},
  shop_address_detected: "",
  shop_name_detected: "",
  connect_to_crm: false,
  on_finish_all: false,
  qr_code: "",
  parent_page_id: "",
};
const MainLayout = () => {
  /** Đa ngôn ngữ */
  const t = useTranslations();

  const [form_data, setFormData] = useState<FormDataType>(DEFAULT_FORM_DATA);
  /** Gọi lần đầu lấy data ở localStorage */
  useEffect(() => {
    const SAVED = loadFormData();
    if (SAVED) {
      setFormData({ ...DEFAULT_FORM_DATA, ...SAVED });
    }
  }, []);

  /** Tự động lưu vào localStorage khi form_data thay đổi */
  useEffect(() => {
    saveFormData(form_data);
  }, [form_data]);

  /**
   *  Hàm cập nhật gía trị trong form_data
   * @param key
   * @param value
   */
  const updateField = (key: keyof FormDataType, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  /** Tổng số Step */
  const TOTAL_STEPS = 6;
  /** Step hiện tại */
  // const [step, setStep] = useState(1);
  /** company size */
  const [company_size, setCompanySize] = useState("");
  /** onFinish */
  const [on_finish, setOnFinish] = useState(false);
  /**Loading */
  const [loading, setLoading] = useState(false);
  /** Image url  - mock link ảnh để test*/
  const [image_url, setImage] = useState(
    ""
    // "https://static.botbanhang.vn/merchant/files/business_642655457c339f9194288da9/1746516949858.jpeg"
  );
  /** File ảnh đã upload */
  const [file_image, setFileImage] = useState<File | null>(null);
  /** Data input */
  const [data_input, setDataInput] = useState<any>(null);
  /** Access token */
  const [access_token, setAccessToken] = useState("");
  /** selected page */
  const [selected_page, setSelectedPage] = useState("");
  /** selected organization */
  const [selected_organization, setSelectedOrganization] = useState("");
  /** data Product */
  const [products, setProducts] = useState<IProductItem[]>([]);
  /** Loading shop */
  const [loading_shop, setLoadingShop] = useState(false);

  /** File ảnh đã upload */
  const [file_logo_image, setFileLogoImage] = useState<File | null>(null);

  /** Data input */
  const [is_edit, setIsEdit] = useState(false);

  const [access_token_chatbox, setAccessTokenChatbox] = useState<string>("");

  /** Disable next button */
  const checkDisableNextButton = () => {
    /**
     * Bước 1: Chọn size, Nếu chưa chọn size thi khóa next button
     */
    if (form_data?.step === 1 && form_data?.company_size === "") {
      return true;
    }
    /**
     * Bước 2: Chọn menu, Nếu chưa tải file lên thì khóa next button
     */
    if (form_data?.step === 2 && !file_image && !form_data?.image_url) {
      // if (step === 2 && image_url === "") {
      return true;
    }

    /**
     * Bước 3: Tạo menu và tài liệu, Nếu chưa hoàn thành thì không cho next
     */

    /** Mặc định return false */
    return false;
  };

  /** Hàm xử lý back */
  const onBackFn = () => {
    /** nếu step 4 */
    if (form_data.step === 4) {
      setIsEdit(false);
      setDataInput({
        ...form_data.data_input,
      });
    }

    /** nếu step 5 */
    if (form_data.step === 5 && form_data.connect_to_crm) {
      updateField("connect_to_crm", false);
      return;
    }

    /** nếu step 5 */
    if (form_data.step === 6) {
      /** Xoá token */
      // setAccessToken("");
      // updateField("access_token", "");
      updateField("connect_to_crm", false);
    }
    /** setStep  */
    // setStep((s) => Math.max(s - 1, 1));
    updateField("step", form_data.step - 1);
  };

  /** Hàm xử lý Next */
  const onNextFn = () => {
    /** Bước 2 */
    if (form_data?.step === 2) {
      if (file_image) {
        /** Xử lý tạo món ăn */
        handleProcessProductStep2();
      } else {
        /** Cập nhật step */
        updateField("step", form_data.step + 1);
      }
      /** Bước 3 */
    } else if (form_data?.step === 3) {
      /** Set trạng thái preview */
      searchShopInfoStep3(
        form_data?.data_input?.shop_name +
          " - " +
          form_data?.data_input?.shop_address,
        form_data.list_products
      );
    } else if (form_data.step === 4) {
      handleSaveStep4();
    } else if (form_data.step === 5) {
      // setAccessTokenChatbox(
      //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNmI1ZWNjZGIyZjk3NGRhNDkyNDBjNzM4YWI0MjZjNTQiLCJmYl9zdGFmZl9pZCI6IjEwNDkyMzQ4NzM0ODUwMjkiLCJpc19kaXNhYmxlIjpmYWxzZSwiX2lkIjoiNjcwMGI0ZGZkMDM4NTYwOTFlM2I5OGU3IiwiaWF0IjoxNzQ1ODIyNjg2LCJleHAiOjMxNTUzNDU4MjI2ODZ9.OE-dXcI-MPoCK6Ca0W8q9LRUGP2av1lY9BO_tV7A2DI"
      // );

      // updateField(
      //   "access_token",
      //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNmI1ZWNjZGIyZjk3NGRhNDkyNDBjNzM4YWI0MjZjNTQiLCJmYl9zdGFmZl9pZCI6IjEwNDkyMzQ4NzM0ODUwMjkiLCJpc19kaXNhYmxlIjpmYWxzZSwiX2lkIjoiNjcwMGI0ZGZkMDM4NTYwOTFlM2I5OGU3IiwiaWF0IjoxNzQ1ODIyNjg2LCJleHAiOjMxNTUzNDU4MjI2ODZ9.OE-dXcI-MPoCK6Ca0W8q9LRUGP2av1lY9BO_tV7A2DI"
      // );
      /** setStep */
      // setStep((s) => Math.min(s + 1, TOTAL_STEPS));
      updateField("connect_to_crm", true);
    } else if (form_data.step === 6) {
      updateField("on_finish_all", true);
    } else {
      /** setStep */
      // setStep((s) => Math.min(s + 1, TOTAL_STEPS));
      updateField("step", form_data.step + 1);
    }
  };
  /** Hàm xử lý khi nhấn nút lưu */
  const handleSaveStep4 = async () => {
    /** Nếu editor đã được khởi tạo */
    if (!form_data.internal_markdown) {
      toast.warning(t("content_required_before_save"));
      return;
    }
    try {
      setLoading(true);
      await fetch("/api/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form_data.internal_markdown),
      });
      /** setStep */
      // setStep((s) => Math.min(s + 1, TOTAL_STEPS));
      updateField("step", form_data.step + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  /**
   * Hàm gọi API tạo ảnh từ prompt
   * @param query
   * @param data
   */
  const searchShopInfoStep3 = async (query: string, data: any) => {
    /**
     * Kiểm tra thống tin cửa hàng
     */
    if (
      !form_data?.data_input?.shop_name ||
      !form_data?.data_input?.shop_address
    ) {
      toast.error(t("enter_store_name_and_address"));

      const NEW_ERRORS: Record<string, string> = { ...form_data.errors };

      if (!form_data?.data_input?.shop_name) {
        NEW_ERRORS.shop_name = t("enter_store_name");
      }

      if (!form_data?.data_input?.shop_address) {
        NEW_ERRORS.shop_address = t("enter_store_address");
      }

      updateField("errors", NEW_ERRORS);

      return;
    }

    if (file_logo_image) {
      /** Upload hình ảnh lên Merchant và lấy url*/
      const IMAGE_URL = await fetchUploadImage(file_logo_image);
      /** Lưu lại giá trị */
      setDataInput &&
        setDataInput({
          ...data_input,
          shop_avatar: IMAGE_URL,
        });

      /** Update field data_input */
      updateField("data_input", {
        ...form_data.data_input,
        shop_avatar: IMAGE_URL,
      });
    }

    console.log(is_edit, "isEdit");
    /** Nếu isEdit false thì Next luôn */
    if (!is_edit) {
      updateField("step", form_data.step + 1);
      setIsEdit(false);
      return;
    }

    try {
      setLoadingShop(true);
      /** Key word search */
      let key_word = query ? query : "";
      /** Tìm kiếm thông tin cửa hàng */
      const RES = await fetch("/api/store-knowledge", {
        method: "POST",
        body: JSON.stringify({ query: key_word }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      /** Data Store */
      const DATA_STORE = await RES.json();
      console.log(DATA_STORE, "DATA_STORE");

      console.log(data, "data");
      /** gọi hàm update tài liệu */
      handleAddDocument(data, DATA_STORE);
      /** Tắt loading */
      processDocument(data, DATA_STORE?.content);
      /**
       * Tìm kiếm thông tin từ data
       */
      const AI_DETECT_CONTENT = await fetch("/api/clean-menu/ai-detect", {
        method: "POST",
        body: JSON.stringify({ rawText: DATA_STORE?.content }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      /**
       * Parse json
       */
      const AI_DETECT_CONTENT_DATA = await AI_DETECT_CONTENT.json();

      console.log(AI_DETECT_CONTENT_DATA, "DATA_AI_DETECT_CONTENT");

      /** Parse chuỗi JSON thành object */
      // const SHOP_INFO = JSON.parse(AI_DETECT_CONTENT_DATA?.fixedText);
      // let jsonFixed = SHOP_INFO.fixedText
      //   .replace(/(\w+):/g, '"$1":') // thêm dấu nháy cho key
      //   .replace(/\bundefined\b/g, "null");
      // try {
      //   const shopInfo = JSON.parse(jsonFixed);
      //   console.log(shopInfo);
      // } catch (e) {
      //   console.error("Lỗi parse JSON:", e.message);
      // }

      // updateField("shop_address_detected", SHOP_INFO?.ai_detect_shop_address);
      // updateField("shop_name_detected", SHOP_INFO?.ai_detect_shop_name);

      /** Set isEdit */
      setIsEdit(false);
      /** Reset file */
      setFileLogoImage(null);
      /** setStep */
      // setStep((s) => Math.min(s + 1, TOTAL_STEPS));
      updateField("step", form_data.step + 1);
    } catch (error) {
      toast.error(t("something_went_wrong"));
    } finally {
      setLoadingShop(false);
    }
  };

  /** Hàm xử lý tạo nội dung markdown từ dữ liệu
   * @param item Danh sách sản phẩm
   * @param shop Thông tin cửa hàng
   */
  const processDocument = (item: Product[], shop: string) => {
    /** Thông tin cửa hàng */
    const SHOP_INFO_BLOCK = shop ? `## 🏪 Thông tin cửa hàng\n${shop}` : "";
    /** THông tin Sản phẩm */
    const PRODUCT_BLOCK =
      item.length > 0
        ? `${item
            .map(
              (product) =>
                `- **${product.name}**: ${product.price.toLocaleString(
                  "vi-VN"
                )} đ`
            )
            .join("\n")}`
        : "";
    /** Lấy dữ liệu từ Mock data */
    const EXISTING_DATA = typeof MOCK_DATA === "string" ? MOCK_DATA : "";
    /** Cập nhật Thông tin sản phẩm và Thông tin Shop */
    const UPDATED_DATA = [EXISTING_DATA, PRODUCT_BLOCK, SHOP_INFO_BLOCK]
      .filter(Boolean)
      .join("\n\n");

    /** Cập nhật cả markdown và internal_markdown */
    // setMarkdown(UPDATED_DATA);
    updateField("markdown", UPDATED_DATA);
    /** Cập nhật nội dung editor */
    // setInternalMarkdown(UPDATED_DATA);
    updateField("internal_markdown", UPDATED_DATA);
  };

  /**
   *  Hàm gọi API tạo ảnh từ prompt
   * @param data
   * @param results
   * @returns
   */
  const handleAddDocument = async (data: any, results: any) => {
    /** Ensure sessionId is a string (fall back to a default string if undefined) */
    let session_id: string = getSessionId() ?? generateSessionId(); // Fallback to generateSessionId if undefined

    /** If sessionId was newly generated, store it in cookies */
    if (!getSessionId()) {
      storeSessionId(session_id);
    }
    /** Tajo 1 delay */
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    /** Sản phẩm mới */
    const NEW_PRODUCT = data.map((product: any) => ({
      id: product.id,
      name: product.name,
      price: Number(product.price) || product.price,
      product_image: `${product.image_url}`,
      type: "product",
      unit: product.unit,
    }));
    console.log(NEW_PRODUCT, "NEW_PRODUCT");
    try {
      /** Gửi sản phẩm mới */
      const PRODUCT_RES = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id, products: NEW_PRODUCT }), // Send sessionId
      });
      console.log(PRODUCT_RES, "PRODUCT_RES");
      /** Nếu không thành cong */
      if (!PRODUCT_RES.ok) {
        return;
      }

      console.log("✅ Sản phẩm đã được thêm");
      /** Gửi thông tin cửa hàng (nếu có) */
      if (results?.content) {
        toast.success(t("store_info_found"));
        const SHOP_INFO_RES = await fetch("/api/shop-info", {
          method: "PUT",
          body: JSON.stringify({ session_id, content: results.content }),
        });
        /** Kiem tra ket qua */
        if (SHOP_INFO_RES.ok) {
          console.log("✅ Cập nhật thông tin cửa hàng thành công");
        } else {
          console.warn("⚠️ Không thể cập nhật thông tin cửa hàng");
        }
      }
      /** Trường hợp không có content */
      if (!results?.content) {
        /** Hiển thị lỗi */
        toast.error(t("store_info_not_found"));
        /** Lưu thông tin cửa hàng */
        const SHOP_INFO_RES = await fetch("/api/shop-info", {
          method: "PUT",
          body: JSON.stringify({
            session_id,
            content: t("store_info_not_found"),
          }),
        });

        /** Kiem tra ket qua */
        if (SHOP_INFO_RES.ok) {
          console.log("✅ Cập nhật thông tin cửa hàng thành công");
        } else {
          console.warn("⚠️ Không thể cập nhật thông tin cửa hàng");
        }
      }
      /** Sau khi thành công, chờ 500ms rồi chuyển trang */
      await delay(500);
      /** Chuyển trang */
    } catch (error) {
      console.error("Lỗi mạng hoặc server:", error);
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    /** Nhận Message từ Mobile */
    const handleMessage = (event: MessageEvent) => {
      /** Tạo biến data */
      let data: any;
      // toast.error(event.data);
      try {
        /**  Cố gắng parse nếu là JSON */
        data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch (error) {
        console.warn("Không phải JSON, bỏ qua:", event.data);
        toast.error(t("not_JSON") + event.data);
        return;
      }

      /** Đảm bảo đã parse xong và có định dạng đúng */
      // if (data?.type === "page.loginFB") {
      //   console.log(data, "event data");
      //   /** Hiệnt toast message */
      //   // toast.error(data.payload);
      //   /** Set access token */
      //   setAccessToken(data.payload?.token?.accessToken);
      //   updateField("access_token", data.payload?.token?.accessToken);
      // }

      /** Kiem tra event data */
      if (data?.type === "page.token_chatbox") {
        console.log(data, "event data");

        /** Set access token */
        // setAccessToken(data.payload?.token?.accessToken);
        setAccessTokenChatbox(data.payload?.token?.accessToken);
        updateField("access_token", data.payload?.token?.accessToken);
      }
    };

    /** Add event listener */
    window.addEventListener("message", handleMessage);

    /** Remove event listener */
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  /**
   * Hàm xử lý upload ảnh lên server
   * @param file Luồng base64 của ảnh
   * @returns Promise trả về đường dẫn ảnh đã lưu
   */
  const fetchUploadImage = async (file: any): Promise<string> => {
    return new Promise((resolve) => {
      try {
        /** Đưa vào FormData */
        const FORM_DATA = new FormData();
        FORM_DATA.append("file", file);
        /** Upload ảnh lên merchant */
        fetch(
          "https://api.merchant.vn/v1/internals/attachment/upload?path=&label=&folder_id=&root_file_id=",
          {
            method: "POST",
            body: FORM_DATA,
            headers: {
              "token-business":
                process.env.NEXT_PUBLIC_MERCHANT_TOKEN_BUSINESS || "",
            },
          }
        )
          .then((res) => res.json())
          .then((result) => {
            const FILE_PATH = result?.data?.file_path || "";
            resolve(FILE_PATH);
          })
          .catch((error) => {
            console.error("Upload failed:", error);
            resolve("");
          });
      } catch (error) {
        console.error("Upload failed:", error);
        resolve("");
      }
    });
  };

  /**
   * Hàm xử lý hình ảnh google
   * @param image_url Url Hình ảnh
   */
  const googleVisionAPI = async (image_url: string) => {
    /** Gọi Hàm google Vision API để xử lý ảnh */
    const VISION_RES = await fetch("/api/vision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: image_url }),
    });
    /** parse json kết quả  */
    const VISION_DATA = await VISION_RES.json();

    /** Kiểm tra kết quả */
    if (!VISION_RES.ok) {
      throw new Error(`Vision API failed with status ${VISION_RES.status}`);
    }
    /** Trả về kết quả */
    return VISION_DATA;
  };

  /**
   * Hàm xử lý menu
   * @param raw_text
   * @returns
   */
  async function processMenu(rawText: string) {
    /** Fix text */
    const { fixedText } = await callStepAPI("step0", { rawText });
    /** Filter text*/
    const { filteredText } = await callStepAPI("step1", { fixedText });
    /** Normalize text*/
    const { normalizedText } = await callStepAPI("step2", { filteredText });
    /** Get menu items */
    const { menuItems } = await callStepAPI("step3", { normalizedText });

    return menuItems;
  }

  /**
   * Hàm Xử lý Clean Menu
   * @param raw_text
   * @returns
   */
  const handleCleanMenu = async (raw_text: any) => {
    // /** Xử lý tổng hợp thông tin món ăn */

    const CLEAN_MENU = await processMenu(raw_text?.join("\n"));

    /** Kiểm tra kết quả */

    console.log(CLEAN_MENU, "CLEAN_MENU");
    /**
     * Kết quả trả về từ API
     */
    // const { menuItems: MENU_ITEMS } = await CLEAN_MENU.json();
    return CLEAN_MENU;
  };

  /** Hàm xử lý lưu sản phẩm
   * @param menu_items
   * @returns
   */
  const handleSaveProducts = async (menu_items: any) => {
    /** Bước 2: Tách tên và giá */
    const PARSED_MENU = menu_items.map((item: string) => {
      /** Tách tên và giá , đơn vị*/
      const [name, price, unit] = item.split(" - ");
      return { name, price, unit };
    });
    /** Lưu menu về redis */
    // await saveMenuToRedisClient("user_id_test", JSON.stringify(PARSED_MENU));
    /** Lấy sessionId hoặc tạo mới Cookies */
    let session_id: string = getSessionId() ?? generateSessionId(); // Fallback to generateSessionId if undefined

    /** If sessionId was newly generated, store it in cookies */
    if (!getSessionId()) {
      storeSessionId(session_id);
    }

    /** Tạo sản phẩm mới từ sản phẫm đầu vào*/
    const NEW_PRODUCT = PARSED_MENU.map((product: any) => ({
      id: simpleUUID(),
      name: product.name,
      price: Number(product.price) || product.price,
      product_image: product.image_url,
      type: "product",
      unit: product.unit,
    }));
    /** Gửi sản phẩm mới */
    const PRODUCT_RES = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id, products: NEW_PRODUCT }), // Send sessionId
    });
    console.log(PRODUCT_RES, "PRODUCT_RES");
    /** Nếu không thành cong */
    if (!PRODUCT_RES.ok) {
      throw new Error("Failed to create products");
    }
    /** Trả về danh sách sản phẩm */
    return NEW_PRODUCT;
  };

  /**
   * Hàm xử lý tạo món ăn trên server
   * @returns void
   * @description
   * Bước 2: Chọn ảnh, xử lý tạo menu -> lưu lại và chuyển sang bước 3
   * @description
   * Bước 3: Tạo món ăn trên server
   */
  const handleProcessProductStep2 = async () => {
    try {
      /** Setloading */
      setLoading(true);
      /** Upload hình ảnh lên Merchant và lấy url*/
      const IMAGE_URL = await fetchUploadImage(file_image);
      // const IMAGE_URL = image_url;
      // console.log(IMAGE_URL, "IMAGE_URL");
      /** Lưu lại URL ảnh */
      setImage(IMAGE_URL);

      form_data.image_url = IMAGE_URL;
      // updateField("image_url", IMAGE_URL);

      /** Xử lý tạo menu */
      // const VISION_DATA = await googleVisionAPI(IMAGE_URL);
      /** Biến VISION_DATA */
      let VISION_DATA = null;
      /** Không gây break luồng */
      try {
        VISION_DATA = await googleVisionAPI(IMAGE_URL);
      } catch (visionError) {
        console.error("Google Vision API error:", visionError);
        /** Hiện toast message  */
        toast.warning(t("cannot_detect_text"));
      }

      /** Xử lý clean Menu */
      const MENU_ITEMS = await handleCleanMenu(VISION_DATA?.texts);
      /** Xử lý lưu lại Product */
      const PRODUCTS = await handleSaveProducts(MENU_ITEMS);

      console.log(PRODUCTS, "products");

      updateField("list_products", [...PRODUCTS]);

      setFileImage(null);

      /** Next step */
      // setStep((s) => Math.min(s + 1, TOTAL_STEPS));
      updateField("step", form_data.step + 1);
    } catch (error) {
      if (error instanceof Error) {
        /** Hiện toast */
        toast.error(error.message);
      } else {
        /** Hiện toast lỗi không xác định*/
        toast.error(t("unknown_error_occurred"));
      }
    } finally {
      setLoading(false);
    }
  };
  /** Xử lý message từ Facebook
   * @param event SSO
   */
  function getFacebookToken(event: MessageEvent) {
    if (
      !event ||
      !event.data ||
      typeof event.data !== "object" ||
      event.data.from !== "FACEBOOK_IFRAME" ||
      event.data.event !== "LOGIN"
    ) {
      return;
    }
    /** RESPONSE từ facebook */
    const FACEBOOK_RESPONSE = event.data.data;
    /** Nếu có access token thì lưu vào state */
    if (FACEBOOK_RESPONSE?.authResponse?.accessToken) {
      /** Lưu vào state */
      setAccessToken(FACEBOOK_RESPONSE.authResponse.accessToken);
      updateField("access_token", FACEBOOK_RESPONSE.authResponse.accessToken);
    }
  }
  /** Lầy token facebook */
  useEffect(() => {
    window.addEventListener("message", getFacebookToken);
    return () => {
      window.removeEventListener("message", getFacebookToken);
    };
  }, []);

  return (
    <main className="flex flex-col items-center px-3 py-5 gap-4 w-full md:max-w-[400px] md:mx-auto bg-white h-full">
      {!form_data?.on_finish_all && (
        <div className="flex flex-col items-center gap-4 w-full md:max-w-[400px] md:mx-auto bg-white h-full">
          <Progress currentStep={form_data?.step} totalSteps={TOTAL_STEPS} />
          <StepTitle step={form_data.step} />
          <div className="w-full flex-grow min-h-0  overflow-hidden overflow-y-auto">
            <StepContent
              // step={step}
              step={form_data.step}
              /** Bước 1 */
              onSelectCompanySize={(value) => {
                // setCompanySize(value);
                updateField("company_size", value);
              }}
              company_size={form_data.company_size}
              /** Bước 2 */
              onSelectMenu={(value) => {
                setFileImage(value);
              }}
              fixed_menu={form_data.image_url}
              /** Bước 3 */
              data_input={form_data.data_input}
              setDataInput={(e) => {
                console.log(e);
                console.log(data_input, "data_input");
                updateField("data_input", { ...form_data.data_input, ...e });

                /**
                 * Gán giá trị vào shop detected
                 */
                if (e?.shop_name) {
                  updateField("shop_name_detected", e?.shop_name);
                }
                if (e?.shop_address) {
                  updateField("shop_address_detected", e?.shop_address);
                }

                /** Compare dữ liệu */
                if (!e || typeof e !== "object") {
                  return;
                }
                const IS_CHANGED = Object.keys(e).some((key) => {
                  return e[key] !== (data_input ?? {})[key];
                });
                /** Nội dung thay đổi thì set trạng thái */
                if (IS_CHANGED) {
                  setIsEdit(true);
                }
              }}
              updateLogo={(e) => {
                setFileLogoImage(e);
                setIsEdit(true);
              }}
              list_products={form_data.list_products}
              setListProducts={(e) => {
                updateField("list_products", [...e]);
                setIsEdit(true);
              }}
              errors={form_data?.errors}
              setErrors={(e) => {
                updateField("errors", { ...form_data.errors, ...e });
              }}
              /** Bước 4 */

              markdown_parent={form_data.markdown}
              setMarkdownParent={(e) => {
                updateField("markdown", e);
              }}
              internal_markdown_parent={form_data.internal_markdown}
              setInternalMarkdownParent={(e) => {
                updateField("internal_markdown", e);
              }}
              /** Bước 5 */

              /** Bước 6 */
              handleConnectChannel={() => {
                console.log("Connect channel");
                setLoading(true);
                window.ReactNativeWebView?.postMessage(
                  JSON.stringify({ type: "page.loginFB", message: "" })
                );
                setTimeout(() => {
                  setLoading(false);
                }, 2000);
              }}
              loading={loading}
              /** Bước 6 Finish */
              access_token={""}
              access_token_chatbox={form_data.access_token}
              onFinish={(
                selected_page: string,
                selected_organization: string
              ) => {
                // setOnFinish(true);
                updateField("step", TOTAL_STEPS);
                setSelectedPage(selected_page);
                setSelectedOrganization(selected_organization);
              }}
              connect_to_crm={form_data.connect_to_crm}
              on_finish_all={form_data.on_finish_all}
              updateQRCode={(e) => {
                updateField("qr_code", e);
              }}
              qr_code={form_data.qr_code}
              parent_page_id={form_data.parent_page_id}
              setParentPageId={(e) => {
                updateField("parent_page_id", e);
              }}
            />
          </div>
          {(!form_data?.on_finish_all || form_data?.connect_to_crm) && (
            <StepNavigator
              step={form_data.step}
              maxSteps={TOTAL_STEPS}
              onBack={() => {
                onBackFn();
              }}
              onNext={() => {
                onNextFn();
              }}
              disabledNext={checkDisableNextButton()}
              disabledBack={form_data.step === 1}
              loading={loading || loading_shop}
            />
          )}
        </div>
      )}
      {form_data?.on_finish_all && (
        <div className="flex flex-col items-center gap-4 w-full md:max-w-[400px] md:mx-auto bg-white h-full">
          <ConnectDone page_id={selected_page} org_id={selected_organization} />
        </div>
      )}
    </main>
  );
};

export default MainLayout;
