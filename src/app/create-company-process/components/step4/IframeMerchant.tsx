import React, { useEffect, useRef } from "react";

const IframeMerchant: React.FC = () => {
  /** Iframe Ref */
  const IFRAME_REF = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const handleLoad = () => {
      if (IFRAME_REF.current && IFRAME_REF.current.contentWindow) {
        IFRAME_REF.current.contentWindow.postMessage(
          {
            action: "PREVIEW",
            from: "RETIFY",
          },
          "*" // ⚠️ Có thể thay bằng origin cụ thể nếu cần bảo mật hơn
        );
      }
    };
    /** Iframe */
    const IFRAME = IFRAME_REF.current;
    /** Nếu có IFrame Gọi hàm handleLoad */
    if (IFRAME) {
      IFRAME.addEventListener("load", handleLoad);
    }
    /**
     * Xoá event khi unmount
     */
    return () => {
      if (IFRAME) {
        IFRAME.removeEventListener("load", handleLoad);
      }
    };
  }, []);

  return (
    <div>
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
