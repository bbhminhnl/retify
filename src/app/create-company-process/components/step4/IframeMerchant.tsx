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
  /** Hàm gửi thông tin đến Merchant */
  const handleLoad = () => {
    /** Kiểm tra Iframe */
    if (IFRAME_REF.current && IFRAME_REF.current.contentWindow) {
      /** Gửi thông tin đến Merchant */
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
    /**
     * Hàm xuất lý sự kiện thay đổi iframe
     * @param event Sự kiện thay đổi iframe
     */
    const handleMessage = (event: MessageEvent) => {
      console.log("Received message from iframe:", event.data);
      /** Kiểm tra sự kiện từ Merchant */
      if (event.data.type !== "PREVIEW" && event.data.from !== "SELLING_PAGE") {
        /** Tạm thời chưa có Event */
      } else {
        /**
         * Nhận event từ Merchant
         */
        if (event.data.data?.type === "get.data") {
          /** Gửi data */
          handleLoad();
          /** Set loading */
          setLoading(true);
        }
        /**
         * Nhận data từ Merchant
         */
        if (event.data.data?.type === "get.data.success") {
          setLoading(false);
        }
      }
    };
    /**
     * Lisetner sự kiện thay đổi iframe
     */
    window.addEventListener("message", handleMessage);
    /**
     * Xoá lisetner sự kiện thay đổi iframe khi unmount
     */
    return () => window.removeEventListener("message", handleMessage);
  }, []);

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
