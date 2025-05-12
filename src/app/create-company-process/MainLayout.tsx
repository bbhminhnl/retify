"use client";

import { generateSessionId, getSessionId, storeSessionId } from "@/lib/session";
import { useEffect, useState } from "react";

import ConnectDone from "./components/step6/ConnectDone";
import { IProductItem } from "@/types";
import { MOCK_DATA } from "@/utils/data";
import Product from "../products/Products";
import Progress from "./components/Progress";
import StepContent from "./components/StepContent";
import StepNavigator from "./components/StepNavigator";
import StepTitle from "./components/StepTitle";
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

const MainLayout = () => {
  /** Đa ngôn ngữ */
  const t = useTranslations();
  /** Tổng số Step */
  const TOTAL_STEPS = 6;
  /** Step hiện tại */
  const [step, setStep] = useState(1);
  /** company size */
  const [company_size, setCompanySize] = useState("");
  /** fixed menu */
  const [fixed_menu, setFixedMenu] = useState("");
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
  /** raw data*/
  const [raw_data, setRawData] = useState<any>(null);
  /** user_id */
  const [user_id, setUserId] = useState("user_id_test");
  /** Trạng thái step 3 */
  const [template_preview, setTemplatePreview] = useState("preview");
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

  /** Khai báo lỗi */
  const [errors, setErrors] = useState<{
    shop_name: string;
    shop_address: string;
  }>({
    shop_name: "",
    shop_address: "",
  });

  /** File ảnh đã upload */
  const [file_logo_image, setFileLogoImage] = useState<File | null>(null);

  /** ======= Bước 4 ======= */

  /** Markdown*/
  const [markdown, setMarkdown] = useState("");
  /** Nội dung markdown */
  const [internal_markdown, setInternalMarkdown] = useState("");

  /** Disable next button */
  const checkDisableNextButton = () => {
    /**
     * Bước 1: Chọn size, Nếu chưa chọn size thi khóa next button
     */
    if (step === 1 && company_size === "") {
      return true;
    }
    /**
     * Bước 2: Chọn menu, Nếu chưa tải file lên thì khóa next button
     */
    if (step === 2 && !file_image) {
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
    /** Nếu step 3 */
    if (step === 3) {
      /** Set trạng thái preview */
      setTemplatePreview("preview");
    }
    /** nếu step 5 */
    if (step === 5) {
      /** Xoá token */
      setAccessToken("");
    }
    /** setStep  */
    setStep((s) => Math.max(s - 1, 1));
  };

  /** Hàm xử lý Next */
  const onNextFn = () => {
    /** Bước 2 */
    if (step === 2) {
      /** Xử lý tạo món ăn */
      handleProcessProduct();
      /** Bước 3 */
    } else if (step === 3) {
      /** Set trạng thái preview */
      searchShopInfo(
        data_input?.shop_name + " - " + data_input?.shop_address,
        products
      );
      /** setStep */
      // setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    } else if (step === 4) {
      handleSave();
    } else {
      /** setStep */
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    }
  };
  /** Hàm xử lý khi nhấn nút lưu */
  const handleSave = async () => {
    /** Nếu editor đã được khởi tạo */
    // if (internal_markdown) {
    // const MD = editor.storage.markdown.getMarkdown();
    console.log(internal_markdown, "internal_markdown");
    console.log(markdown, "markdown");
    if (!internal_markdown) {
      toast.warning(t("content_required_before_save"));
      return;
    }
    try {
      setLoading(true);
      await fetch("/api/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(internal_markdown),
      });
      // setTimeout(() => {
      /** setStep */
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
      // }, 1000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }

    // }
  };
  /**
   * Hàm gọi API tạo ảnh từ prompt
   */
  const searchShopInfo = async (query: string, data: any) => {
    /**
     * Kiểm tra thống tin cửa hàng
     */
    if (!data_input?.shop_name || !data_input?.shop_address) {
      toast.error(t("enter_store_name_and_address"));
      /** Nếu thiếu thông tin cửa hàng */
      if (!data_input?.shop_name) {
        setErrors((prev) => {
          return {
            ...prev,
            shop_name: t("enter_store_name"),
          };
        });
      }
      /** Nếu thông tin địa chỉ cửa hàng */
      if (!data_input?.shop_address) {
        setErrors((prev) => {
          return {
            ...prev,
            shop_address: t("enter_store_address"),
          };
        });
      }
      return;
    }

    /** Upload hình ảnh lên Merchant và lấy url*/
    const IMAGE_URL = await fetchUploadImage(file_logo_image);
    /** Lưu lại giá trị */
    setDataInput &&
      setDataInput({
        ...data_input,
        shop_avatar: IMAGE_URL,
      });

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
      /** gọi hàm update tài liệu */
      handleAddDocument(data, DATA_STORE);
      /** Tắt loading */
      processDocument(data, DATA_STORE?.content);
      /** setStep */
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
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
    setMarkdown(UPDATED_DATA);

    /** Cập nhật nội dung editor */
    setInternalMarkdown(UPDATED_DATA);
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
      if (data?.type === "page.loginFB") {
        console.log(data, "event data");
        /** Hiệnt toast message */
        // toast.error(data.payload);
        /** Set access token */
        setAccessToken(data.payload?.token?.accessToken);
      }
    };

    /** Add event listener */
    window.addEventListener("message", handleMessage);

    /** Remove event listener */
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [step]);

  /**
   * Hàm xử lý upload ảnh lên server
   * @param file Luồng base64 của ảnh
   * @returns Promise trả về đường dẫn ảnh đã lưu
   */
  const fetchUploadImage = async (file: any): Promise<string> => {
    return new Promise((resolve) => {
      try {
        // /** Giả định đây là ảnh PNG, bạn có thể đổi thành "image/jpeg" nếu cần */
        // const MIME_TYPE = "image/png";
        // /** Convert base64 → binary → File */
        // const BYTE_STRING = atob(file);
        // /**
        //  * Chuyển đổi base64 thành Uint8Array
        //  */
        // const BYTE_ARRAY = new Uint8Array(BYTE_STRING.length);
        // /**
        //  * Chuyển đổi base64 thành Uint8Array
        //  */
        // for (let i = 0; i < BYTE_STRING.length; i++) {
        //   BYTE_ARRAY[i] = BYTE_STRING.charCodeAt(i);
        // }
        // /**
        //  * Tạo đối tượng File từ Uint8Array
        //  */
        // const FILE = new File([BYTE_ARRAY], "image.png", { type: MIME_TYPE });
        /**
         * Đưa vào FormData
         */
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
   * Hàm Xử lý Clean Menu
   * @param raw_text
   * @returns
   */
  const handleCleanMenu = async (raw_text: any) => {
    /** Xử lý tổng hợp thông tin món ăn */
    const CLEAN_MENU = await fetch("/api/clean-menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawText: raw_text?.join("\n") }),
    });

    /** Kiểm tra kết quả */
    if (!CLEAN_MENU.ok) {
      throw new Error(
        `Cleaned Menu API failed with status ${CLEAN_MENU.status}`
      );
    }
    /**
     * Kết quả trả về từ API
     */
    const { menuItems: MENU_ITEMS } = await CLEAN_MENU.json();
    return MENU_ITEMS;
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
    return PARSED_MENU;
  };

  /** UseEffect*/
  useEffect(() => {
    /** Nếu step 3 */
    if (step === 3) {
      /** Lấy dữ liệu products */
      fetchProducts();
    }
  }, [step]);
  /** Lấy đata products */
  const fetchProducts = async () => {
    try {
      /** Gọi API lấy products*/
      const RESPONSE = await fetch("/api/products", {
        headers: {
          "Cache-Control": "no-store",
        },
      });
      /** DATA JSON */
      const DATA = await RESPONSE.json();
      /** Lưu dữ liệu product */
      // setProduct(DATA);
      setProducts(DATA);
      console.log(DATA, "DATA");
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  /**
   * Hàm xử lý tạo món ăn trên server
   * @returns void
   * @description
   * Bước 2: Chọn ảnh, xử lý tạo menu -> lưu lại và chuyển sang bước 3
   * @description
   * Bước 3: Tạo món ăn trên server
   */
  const handleProcessProduct = async () => {
    try {
      /** Setloading */
      setLoading(true);
      /** Upload hình ảnh lên Merchant và lấy url*/
      const IMAGE_URL = await fetchUploadImage(file_image);
      // const IMAGE_URL = image_url;
      // console.log(IMAGE_URL, "IMAGE_URL");
      /** Lưu lại URL ảnh */
      setImage(IMAGE_URL);

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
      const PARSED_MENU = await handleSaveProducts(MENU_ITEMS);
      /** Lưu giá trị vào state */
      setRawData(PARSED_MENU);
      /** Next step */
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
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
      {!on_finish && (
        <div className="flex flex-col items-center gap-4 w-full md:max-w-[400px] md:mx-auto bg-white h-full">
          <Progress currentStep={step} totalSteps={TOTAL_STEPS} />
          <StepTitle step={step} />
          <div className="w-full flex-grow min-h-0  overflow-hidden overflow-y-auto">
            <StepContent
              step={step}
              onSelectCompanySize={(value) => {
                setCompanySize(value);
              }}
              company_size={company_size}
              onSelectMenu={(value) => {
                /** callback function */
                setFixedMenu(value);

                setFileImage(value);
              }}
              fixed_menu={image_url}
              handleConnectChannel={() => {
                console.log("Connect channel");
                setLoading(true);
                window.ReactNativeWebView?.postMessage(
                  JSON.stringify({ type: "page.loginFB", message: "" })
                );
                setTimeout(() => {
                  setLoading(false);
                  // setOnFinish(true);
                  /** Test nên giải lập lấy được accessToken */
                  // setAccessToken(
                  //   "EAASOEiugKa0BO1NYEt8nLkqOpJCBOToRZBFWLZCewJPnl0kuuhYPHVQryfGMctJDIhxqg7LlhGuJJM4fkUcNK2smAgNxJujcZAznjm0hEmgaTlZANqGVBlNFfUEWCVK3IRCfF3kHs6AUJx1q4eJIYvqIqzPCae9veqSJIPtNdQzIazwCRczMhu1ZA7ZAXBnktQufoL9j8VT6LyXAZDZD"
                  // );
                }, 2000);
              }}
              access_token={access_token}
              loading={loading}
              rawData={raw_data}
              template_id={user_id}
              address={""}
              // handleFinishPreview={(e) => {
              //   setTemplatePreview(e);
              // }}
              template_preview={template_preview}
              setTemplatePreview={setTemplatePreview}
              data_input={data_input}
              setDataInput={setDataInput}
              onFinish={(
                selected_page: string,
                selected_organization: string
              ) => {
                setOnFinish(true);
                setSelectedPage(selected_page);
                setSelectedOrganization(selected_organization);
              }}
              updateLogo={(e) => {
                setFileLogoImage(e);
              }}
              list_products={products}
              setListProducts={setProducts}
              errors={errors}
              setErrors={setErrors}
              markdown_parent={markdown}
              setMarkdownParent={setMarkdown}
              internal_markdown_parent={internal_markdown}
              setInternalMarkdownParent={setInternalMarkdown}
            />
          </div>
          <StepNavigator
            step={step}
            maxSteps={TOTAL_STEPS}
            onBack={() => {
              onBackFn();
            }}
            onNext={() => {
              onNextFn();
            }}
            disabledNext={checkDisableNextButton()}
            disabledBack={step === 1}
            loading={loading || loading_shop}
          />
        </div>
      )}
      {on_finish && (
        <div className="flex flex-col items-center gap-4 w-full md:max-w-[400px] md:mx-auto bg-white h-full">
          <ConnectDone page_id={selected_page} org_id={selected_organization} />
        </div>
      )}
    </main>
  );
};

export default MainLayout;
