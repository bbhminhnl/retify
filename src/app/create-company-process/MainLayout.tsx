"use client";

import { generateSessionId, getSessionId, storeSessionId } from "@/lib/session";
import { useEffect, useState } from "react";

import ConnectDone from "./components/step6/ConnectDone";
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

const MainLayout = () => {
  /** Tổng số Step */
  const TOTAL_STEPS = 5;
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

  /** File ảnh đã upload */
  const [file_logo_image, setFileLogoImage] = useState<File | null>(null);
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
    if (step === 3 && template_preview !== "editor_success") {
      return true;
    }
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
      setTemplatePreview("preview");
      /** setStep */
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    } else {
      /** setStep */
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    }
  };

  useEffect(() => {
    /** Nhận Message từ Mobile */
    const handleMessage = (event: MessageEvent) => {
      /** Tạo biến data */
      let data: any;
      toast.error(event.data);
      try {
        /**  Cố gắng parse nếu là JSON */
        data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch (error) {
        console.warn("Không phải JSON, bỏ qua:", event.data);
        toast.error("Không phải JSON, bỏ qua: " + event.data);
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
      console.log(IMAGE_URL, "IMAGE_URL");
      /** Lưu lại URL ảnh */
      setImage(IMAGE_URL);
      /** api google vision xử lý ảnh */
      const VISION_DATA = await googleVisionAPI(IMAGE_URL);
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
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };
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
                // console.log(value, "valueee");
                // fetchUploadImage(value);'
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
                  //   "EAASOEiugKa0BO4U7YFL3ZA3gssEZC9s3XgcFtxOy93tDGrKIgUf0jYADdIy0DKQ1FusGmgECeGSqmGNwjn1vpM97eNc64MXF4ina8csntAwTL2DAZCBwFzXQQ08wDhM28YKdAGP1OeJfM86TBPxwkrGSqjyqZBklApgzmmghUgidTCUzZA3ZCZAZAZCWY48fS90GHEb52UZAuKk4rUpQZDZD"
                  // );
                }, 2000);
              }}
              access_token={access_token}
              loading={loading}
              rawData={raw_data}
              template_id={user_id}
              address={"Haidilao Vincom Trần Duy Hưng"}
              // handleFinishPreview={(e) => {
              //   setTemplatePreview(e);
              // }}
              template_preview={template_preview}
              setTemplatePreview={setTemplatePreview}
              data_input={data_input}
              setDataInput={setDataInput}
              onFinish={() => setOnFinish(true)}
              updateLogo={(e) => {
                // setFileLogoImage(e);
              }}
            />
          </div>
          <StepNavigator
            step={step}
            maxSteps={TOTAL_STEPS}
            onNext={() => {
              onNextFn();
            }}
            onBack={() => {
              onBackFn();
            }}
            disabledNext={checkDisableNextButton()}
            disabledBack={step === 1}
            loading={loading}
          />
        </div>
      )}
      {on_finish && (
        <div className="flex flex-col items-center gap-4 w-full md:max-w-[400px] md:mx-auto bg-white h-full">
          <ConnectDone />
        </div>
      )}
    </main>
  );
};

export default MainLayout;
