"use client";

import { MOCK_DATA, MOCK_DATA_EN } from "@/utils/data";
import { apiCommon, callStepAPI } from "@/services/fetchApi";
import { generateSessionId, getSessionId, storeSessionId } from "@/lib/session";
import { loadFormData, saveFormData } from "@/utils/formStore";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import ConnectDone from "./components/step6/ConnectDone";
import Loading from "@/components/loading/Loading";
import Product from "../products/Products";
import Progress from "./components/Progress";
import StepContent from "./components/StepContent";
import StepNavigator from "./components/StepNavigator";
import StepTitle from "./components/StepTitle";
import { simpleUUID } from "@/utils";
import { toast } from "react-toastify";

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
/** Mock token */
const MOCK_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTI3MTE2MTQ5NjY4MzA4IiwiX2lkIjoiNjdkN2Y3YTFjNWY0M2M4NTU2NTZkNjcyIiwiaWF0IjoxNzQ3NDk5MjQ5LCJleHAiOjMxNTUzNDc0OTkyNDl9.Lj83AFAcQHWuTSq-hf40JpTfzAeDFHvxYKvF-61PLW0";
// const MOCK_TOKEN =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTkyOTMzNDI0MzMyNTE5IiwiZmJfc3RhZmZfaWQiOiIyNjkzOTE5NDU0MTExODczIiwiaXNfZGlzYWJsZSI6ZmFsc2UsIl9pZCI6IjY3ODA4NjdiYzVmNDNjODU1NmY1OGQ2YyIsImlhdCI6MTc0NzQ2OTU4MywiZXhwIjozMTU1MzQ3NDY5NTgzfQ.iAq5CIxrpmeSxm_Oh1rxnx09uIfWwnYK776LD0QQP7Y";
// /** Mock token */
// const MOCK_TOKEN =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNmI1ZWNjZGIyZjk3NGRhNDkyNDBjNzM4YWI0MjZjNTQiLCJmYl9zdGFmZl9pZCI6IjEwNDkyMzQ4NzM0ODUwMjkiLCJpc19kaXNhYmxlIjpmYWxzZSwiX2lkIjoiNjcwMGI0ZGZkMDM4NTYwOTFlM2I5OGU3IiwiaWF0IjoxNzQ1ODIyNjg2LCJleHAiOjMxNTUzNDU4MjI2ODZ9.OE-dXcI-MPoCK6Ca0W8q9LRUGP2av1lY9BO_tV7A2DI";
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
  is_need_to_update_crm: false,
  fetching_step_3_4: false,
  fetching_step_4_5: false,
  org_id: "",
  page_id: "",
};
const MainLayout = () => {
  /** Đa ngôn ngữ */
  const t = useTranslations();

  /** Locale hiện tại */
  const LOCALE = useLocale();
  /** Khai báo form_data */
  const [form_data, setFormData] = useState<FormDataType>(DEFAULT_FORM_DATA);
  /** Gọi lần đầu lấy data ở localStorage */
  useEffect(() => {
    /** Lấy data ở localStorage */
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
  /**Loading */
  const [loading, setLoading] = useState(false);

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
  /** Loading shop */
  const [loading_shop, setLoadingShop] = useState(false);

  /** File ảnh đã upload */
  const [file_logo_image, setFileLogoImage] = useState<File | null>(null);

  /** step 2 message */
  const [step2_message, setStep2Message] = useState("");

  /** loading Init */
  const [loading_init, setLoadingInit] = useState(true);
  /** Cập nhật lại trạng thái */
  useEffect(() => {
    /** Nếu loading_init */
    if (loading_init) {
      /** Nâng cấp trên 1 step */
      if (form_data?.access_token) {
        setLoadingInit(false);
      }
    }
  }, [loading_init, form_data?.access_token]);

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
      /** Cập nhật trạng thái connect to crm */
      updateField("connect_to_crm", false);
    }
    /** setStep  */
    // setStep((s) => Math.max(s - 1, 1));
    updateField("step", form_data.step - 1);
  };

  /**
   * Hàm chuyển sang bước tiếp theo
   */
  const goToNextStep = (current_step: number) => {
    updateField("step", current_step + 1);
  };
  const onNextFn = () => {
    /** Bước hiện tại */
    const CURRENT_STEP = form_data?.step ?? 1;
    /** Xử lý các bước */
    switch (CURRENT_STEP) {
      case 2: {
        if (file_image) {
          /** Xử lý tạo sản phẩm từ ảnh */
          handleProcessProductStep2();
          /**
           * Cập nhật trạng thái update crm
           */
          updateField("is_need_to_update_crm", true);
          /** bước 3 cần call */
          updateField("fetching_step_3_4", true);
          /** Bước 4 cần call */
          updateField("fetching_step_4_5", true);
        } else {
          goToNextStep(CURRENT_STEP);
        }
        break;
      }

      case 3: {
        if (form_data?.fetching_step_3_4) {
          /**
           * Tên cửa hàng
           */
          const SHOP_NAME = form_data?.data_input?.shop_name || "";
          /** Địa chỉ cửa hàng */
          const SHOP_ADDRESS = form_data?.data_input?.shop_address || "";
          /**
           * Query
           */
          const QUERY = `${SHOP_NAME} - ${SHOP_ADDRESS}`;
          /** GỌi hàm search */
          searchShopInfoStep3(QUERY, form_data.list_products);
        } else {
          goToNextStep(CURRENT_STEP);
        }
        break;
      }

      case 4: {
        /** Nếu bước 4 cần update */
        if (form_data?.fetching_step_4_5) {
          handleSaveStep4();
        } else {
          goToNextStep(CURRENT_STEP);
        }
        break;
      }

      case 5: {
        /** Cập nhật trạng thái */
        updateField("connect_to_crm", true);
        /** NẾu k cần update thông tin cửa hàng */
        if (!form_data?.is_need_to_update_crm) {
          goToNextStep(CURRENT_STEP); // Sang bước 6 luôn
        }
        break;
      }

      case 6: {
        /** Gọi API cập nhật trạng thái */
        updateSetupStatus();
        break;
      }

      default: {
        /** mặc định sang bước tiếp */
        goToNextStep(CURRENT_STEP);
        break;
      }
    }
  };

  /**
   * Hàm cập nhật trạng thái setup
   * @returns
   */
  const updateSetupStatus = async () => {
    try {
      /** End point */
      const END_POINT = "app/chatbot_user/update_setup_status";

      /** Gọi api cập nhật trạng thái setup */
      await apiCommon({
        end_point: END_POINT,
        method: "POST",
        body: {
          is_setup_completed: true,
        },
        headers: {
          Authorization: form_data.access_token,
        },
        service_type: "service",
      });

      /** Hoàn thành */
      updateField("on_finish_all", true);
    } catch (error) {
      toast.error(t("error_update_setup_status"));
    } finally {
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

      /** Cập nhật trạng thái connect to crm */
      updateField("connect_to_crm", false);
      /** Cập nhật trạng thái update CRM */
      updateField("is_need_to_update_crm", true);
      /**
       * cập nhật trạng thái update loading b5
       */
      updateField("fetching_step_4_5", false);
      /** Update step */
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

    // console.log(is_edit, "isEdit");
    // /** Nếu isEdit false thì Next luôn */
    // if (!is_edit) {
    //   updateField("step", form_data.step + 1);
    //   setIsEdit(false);
    //   return;
    // }
    /** Cập nhật trạng thái, cần update lại thông tin */
    updateField("is_need_to_update_crm", true);
    try {
      setLoadingShop(true);
      /** Key word search */
      let key_word = query ? query : "";
      /** Tìm kiếm thông tin cửa hàng */
      const RES = await fetch("/api/store-knowledge", {
        method: "POST",
        body: JSON.stringify({ query: key_word, locale: LOCALE }),
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

      /** Reset file */
      setFileLogoImage(null);
      /** Cập nhật trạng thái cần update set 3-> 4 */
      updateField("fetching_step_3_4", false);

      /** setStep */
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
    /** Dữ liệu mẫu */
    const EXISTING_DATA =
      LOCALE === "en"
        ? typeof MOCK_DATA_EN === "string"
          ? MOCK_DATA_EN
          : ""
        : typeof MOCK_DATA === "string"
        ? MOCK_DATA
        : "";

    /** Thông tin cửa hàng */
    const SHOP_INFO_BLOCK = shop ? `## ${t("shop_info")}\n${shop}` : "";

    /** Thông tin sản phẩm */
    const PRODUCT_BLOCK =
      item.length > 0
        ? item
            .map(
              (product) =>
                `- **${product.name}**: ${product.price.toLocaleString(
                  LOCALE === "en" ? "en-US" : "vi-VN"
                )} đ`
            )
            .join("\n")
        : "";

    /** Tổng hợp nội dung */
    const UPDATED_DATA = [EXISTING_DATA, PRODUCT_BLOCK, SHOP_INFO_BLOCK]
      .filter(Boolean)
      .join("\n\n");

    /** Cập nhật dữ liệu */
    updateField("markdown", UPDATED_DATA);
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

      // toast.success("Token chatbox: " + JSON.stringify(data));
      /** Kiem tra event data */
      if (data?.type === "page.token_chatbox") {
        console.log(data, "event data");

        /** Set access token */
        updateField("access_token", data.payload?.token);
        /** Tắt loading init */
        setLoadingInit(false);
      }
    };

    /** Add event listener */
    window.addEventListener("message", handleMessage);
    updateField("access_token", MOCK_TOKEN);

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
   * @param rawText
   * @returns
   */

  async function processMenu(rawText: string) {
    /** Bước 1 */
    setStep2Message(t("menu.process.step1")); // key cố định, không có biến
    const { fixedText } = await callStepAPI("step0", { rawText });

    /** Bước 2 */
    setStep2Message(t("menu.process.step2"));
    const { filteredText } = await callStepAPI("step1", { fixedText });

    /** Bước 3 */
    setStep2Message(t("menu.process.step3"));
    const { normalizedText } = await callStepAPI("step2", { filteredText });

    /** Bước 4 */
    setStep2Message(t("menu.process.step4"));
    const { menuItems } = await callStepAPI("step3", { normalizedText });

    /** Hoàn tất */
    setStep2Message(t("menu.process.done"));

    return menuItems;
  }

  /**
   * Hàm Xử lý Clean Menu
   * @param raw_text
   * @returns
   */
  const handleCleanMenu = async (raw_text: any) => {
    /** Xử lý tổng hợp thông tin món ăn */

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
    // const PARSED_MENU = menu_items.map((item: string) => {
    //   /** Tách tên và giá , đơn vị*/
    //   const [name, price, unit] = item.split(" - ");
    //   return { name, price, unit };
    // });

    /** Bước 2: Tách tên và giá */
    const PARSED_MENU = menu_items.map((item: any) => {
      /** Tách tên và giá , đơn vị*/
      return {
        name: item.name,
        price: item.price,
        unit: item.currency,
      };
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
      price: Number(product.price) || product.price || 0,
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

      /** Xử lý upload hình ảnh */
      setStep2Message(t("uploading_image"));

      /** Upload hình ảnh lên Merchant và lấy url*/
      const IMAGE_URL = await fetchUploadImage(file_image);

      // const IMAGE_URL =
      //   "https://static.botbanhang.vn/merchant/files/business_642655457c339f9194288da9/1747476643816.jpeg";

      /** Xử lý tạo menu */
      // const VISION_DATA = await googleVisionAPI(IMAGE_URL);
      /** Biến VISION_DATA */
      let VISION_DATA = null;
      /** Không gây break luồng */
      try {
        setStep2Message(t("detecting_text"));
        /** AI detect text from image */
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
      /** Tắt message */
      setStep2Message("");

      /** Update danh sách sản phẩm */
      updateField("list_products", [...PRODUCTS]);

      /** Update image */
      updateField("image_url", IMAGE_URL);

      setFileImage(null);

      /** Next step */
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

  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA);
  };

  return (
    <div className="flex flex-col h-screen w-screen">
      {loading_init && (
        <div className="flex flex-col justify-center items-center px-3 py-5 gap-4 w-full md:max-w-[400px] md:mx-auto bg-white h-full">
          <div>
            <Loading size="lg" />
          </div>
          <h4 className="text-xl font-medium">{t("loading_init")}</h4>
        </div>
      )}
      {!loading_init && (
        <div className="flex flex-col items-center px-3 py-5 gap-4 w-full md:max-w-[400px] md:mx-auto bg-white h-full">
          {!form_data?.on_finish_all && (
            <div className="flex flex-col items-center gap-4 w-full md:max-w-[400px] md:mx-auto bg-white h-full">
              <Progress
                currentStep={form_data?.step}
                totalSteps={TOTAL_STEPS}
              />
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
                    // console.log(e);
                    // console.log(data_input, "data_input");
                    updateField("data_input", {
                      ...form_data.data_input,
                      ...e,
                    });

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
                    /** Kiêm tra nội dung thay đổi */
                    const IS_CHANGED = Object.keys(e).some((key) => {
                      return e[key] !== (data_input ?? {})[key];
                    });
                    /** Nội dung thay đổi thì set trạng thái */
                    if (IS_CHANGED) {
                      // setIsEdit(true);
                      updateField("fetching_step_3_4", true);
                    }
                  }}
                  updateLogo={(e) => {
                    setFileLogoImage(e);
                    updateField("fetching_step_3_4", true);
                  }}
                  list_products={form_data.list_products}
                  setListProducts={(e) => {
                    updateField("list_products", [...e]);
                    // setIsEdit(true);
                    updateField("fetching_step_3_4", true);
                  }}
                  errors={form_data?.errors}
                  setErrors={(e) => {
                    updateField("errors", { ...form_data.errors, ...e });
                  }}
                  /** Bước 4 */

                  markdown_parent={form_data.markdown}
                  setMarkdownParent={(e) => {
                    updateField("markdown", e);
                    /** Nếu có chỉnh sửa thì set trạng thái */
                    updateField("fetching_step_4_5", true);
                  }}
                  internal_markdown_parent={form_data.internal_markdown}
                  setInternalMarkdownParent={(e) => {
                    updateField("internal_markdown", e);
                    /** Nếu có chỉnh sửa thì set trạng thái */
                    updateField("fetching_step_4_5", true);
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
                    // setSelectedPage(selected_page);
                    // setSelectedOrganization(selected_organization);
                    /** Update org */
                    updateField("org_id", selected_organization);
                    /** Update page */
                    updateField("page_id", selected_page);
                    /** Update trạng thái CRM */
                    updateField("is_need_to_update_crm", false);
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
                  is_need_to_update_crm={form_data.is_need_to_update_crm}
                  // setIsNeedToUpdateCrm={(e: boolean) => {
                  //   updateField("is_need_to_update_crm", e);
                  // }}
                  loading_message={step2_message}
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
              <ConnectDone
                page_id={form_data.page_id}
                org_id={form_data.org_id}
                resetForm={resetForm}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MainLayout;
