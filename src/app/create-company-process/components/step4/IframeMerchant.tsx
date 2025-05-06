import {
  MOCK_CATEGORIES,
  MOCK_SETTING_DATA,
  MOCK_STORE_DATA,
} from "@/utils/data";
import React, { useEffect, useRef, useState } from "react";

import Loading from "@/components/loading/Loading";

const IframeMerchant: React.FC = () => {
  /** Iframe Ref */
  const IFRAME_REF = useRef<HTMLIFrameElement | null>(null);

  /** Loading */
  const [loading, setLoading] = useState(false);
  const handleLoad = () => {
    if (IFRAME_REF.current && IFRAME_REF.current.contentWindow) {
      IFRAME_REF.current.contentWindow.postMessage(
        {
          type: "PREVIEW",
          from: "RETIFY",
          preview_json: {
            categories: MOCK_CATEGORIES,
            store_data: MOCK_STORE_DATA,
            setting_data: MOCK_SETTING_DATA,
          },
        },
        "*" // ⚠️ Có thể thay bằng origin cụ thể nếu cần bảo mật hơn
      );
    }
  };
  // useEffect(() => {

  //   /** Iframe */
  //   const IFRAME = IFRAME_REF.current;
  //   /** Nếu có IFrame Gọi hàm handleLoad */
  //   if (IFRAME) {
  //     IFRAME.addEventListener("load", handleLoad);
  //   }
  //   /**
  //    * Xoá event khi unmount
  //    */
  //   return () => {
  //     if (IFRAME) {
  //       IFRAME.removeEventListener("load", handleLoad);
  //     }
  //   };
  // }, []);

  // Nhận message từ iframe gửi lên
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("Received message from iframe:", event.data);
      if (event.data.type !== "PREVIEW" && event.data.from !== "SELLING_PAGE") {
      } else {
        if (event.data.data?.type === "get.data") {
          handleLoad();
          setLoading(true);
        }
        if (event.data.data?.type === "get.data.success") {
          setLoading(false);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);
  console.log(loading, "loading");
  return (
    <div className="w-full h-full flex">
      {loading && <Loading size="lg" />}
      <iframe
        ref={IFRAME_REF}
        src="https://shop.merchant.vn/template2?type=preview" // 👉 Thay URL bạn cần nhúng
        width="100%"
        height="100%"
        style={{ border: "none" }}
        title="Merchant Iframe"
      />
    </div>
  );
};

export default IframeMerchant;
