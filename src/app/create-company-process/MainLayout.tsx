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
  const [step, setStep] = useState(2);

  /** company size */
  const [company_size, setCompanySize] = useState("");
  /** fixed menu */
  const [fixed_menu, setFixedMenu] = useState("");

  /** onFinish */
  const [on_finish, setOnFinish] = useState(false);

  /**Loading */
  const [loading, setLoading] = useState(false);
  /** Image url */
  const [image_url, setImage] = useState("");
  /** File ảnh đã upload */
  const [file_image, setFileImage] = useState<File | null>(null);
  /**
   * raw data
   */
  const [raw_data, setRawData] = useState<any>(null);
  /** user_id */
  const [user_id, setUserId] = useState("user_id_test");
  /** Trạng thái step 3 */
  const [template_preview, setTemplatePreview] = useState("preview");

  /** Disable next button */
  const checkDisableNextButton = () => {
    /**
     * Bước 1: Chọn size
     */
    if (step === 1 && company_size === "") {
      return true;
    }
    /**
     * Bước 2: Chọn menu
     */
    if (step === 2 && !file_image) {
      return true;
    }

    /**
     * Bước 3: Xây dựng
     */
    if (step === 3 && template_preview !== "editor_success") {
      return true;
    }

    return false;
  };

  useEffect(() => {
    /** Handle message from mobile
     * @param event
     */
    const handleMessage = (event: MessageEvent) => {
      try {
        /** Lấy data */
        const DATA = JSON.parse(event.data);

        /** Xử lý tùy theo loại message */
        if (DATA.type === "page.loginFB") {
          /** Xử lý thông tin trên mobile */
        }
      } catch (error) {
        console.error("Invalid JSON from mobile:", event.data);
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
   * @param FILE Luồng base64 của ảnh
   * @returns Promise trả về đường dẫn ảnh đã lưu
   */
  const fetchUploadImage = async (FILE: any): Promise<string> => {
    return new Promise((resolve) => {
      try {
        // /** Giả định đây là ảnh PNG, bạn có thể đổi thành "image/jpeg" nếu cần */
        // const MIME_TYPE = "image/png";
        // /** Convert base64 → binary → File */
        // const BYTE_STRING = atob(value);
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
        FORM_DATA.append("file", FILE);
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

            // setImage(FILE_PATH);
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

  const handleProcessProduct = async () => {
    try {
      /** Setloading */
      setLoading(true);
      /** Upload hình ảnh */
      const IMAGE_URL = await fetchUploadImage(file_image);
      console.log(IMAGE_URL, "IMAGE_URL");
      setImage(IMAGE_URL);
      /** api google vision xử lý ảnh */
      const VISION_RES = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: IMAGE_URL }),
      });
      /** parse json kết quả  */
      const VISION_DATA = await VISION_RES.json();

      /** Xử lý tổng hợp thông tin món ăn */
      const CLEAN_MENU = await fetch("/api/clean-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: VISION_DATA?.texts.join("\n") }),
      });
      /**
       * Kết quả trả về từ API
       */
      const { menuItems } = await CLEAN_MENU.json();

      /** Bước 2: Tách tên và giá */
      const PARSED_MENU = menuItems.map((item: string) => {
        /** Tách tên và giá , đơn vị*/
        const [name, price, unit] = item.split(" - ");
        return { name, price, unit };
      });
      /** Lưu menu về redis */
      // await saveMenuToRedisClient("user_id_test", JSON.stringify(PARSED_MENU));
      /** Ensure sessionId is a string (fall back to a default string if undefined) */
      let session_id: string = getSessionId() ?? generateSessionId(); // Fallback to generateSessionId if undefined

      /** If sessionId was newly generated, store it in cookies */
      if (!getSessionId()) {
        storeSessionId(session_id);
      }

      console.log(PARSED_MENU, "PARSED_MENU");
      /** Sản phẩm mới */
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
        return;
      }
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
          <div className="w-full flex-grow min-h-0 overflow-hidden overflow-y-auto">
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
                }, 2000);
              }}
              loading={loading}
              rawData={raw_data}
              template_id={user_id}
              address={"Haidilao Vincom Trần Duy Hưng"}
              // handleFinishPreview={(e) => {
              //   setTemplatePreview(e);
              // }}
              template_preview={template_preview}
              setTemplatePreview={setTemplatePreview}
            />
          </div>
          <StepNavigator
            step={step}
            maxSteps={TOTAL_STEPS}
            onNext={() => {
              if (step === 2) {
                handleProcessProduct();
              } else if (step === 3) {
                setTemplatePreview("preview");
                setStep((s) => Math.min(s + 1, TOTAL_STEPS));
              } else {
                setStep((s) => Math.min(s + 1, TOTAL_STEPS));
              }
            }}
            onBack={() => setStep((s) => Math.max(s - 1, 1))}
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
