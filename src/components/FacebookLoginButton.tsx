"use client";

import { useEffect, useState } from "react";

import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

const FacebookLoginButton = () => {
  /** Trạng thái load SDK */
  const [sdk_loaded, setSdkLoaded] = useState(false);
  /** Router */
  const ROUTER = useRouter();

  /** Load Facebook SDK */
  useEffect(() => {
    /**
     * Kiem tra xem SDK da load chua
     */
    if (window.FB) {
      setSdkLoaded(true);
      return;
    }
    /**
     * Khoi tao SDK
     */
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: "1282108599314861", // 👉 Thay bằng App ID thật
        // appId: "945623877734350", // 👉 Thay bằng App ID thật
        cookie: true,
        xfbml: false,
        version: "v20.0",
      });
      setSdkLoaded(true);
    };
    /**
     * Tạo script SDK
     */
    const SCRIPT = document.createElement("script");
    SCRIPT.src = "https://connect.facebook.net/vi_VN/sdk.js";
    SCRIPT.async = true;
    SCRIPT.defer = true;
    document.body.appendChild(SCRIPT);
  }, []);
  /**
   * Hàm login FB
   * @returns void
   */
  const handleFacebookLogin = () => {
    /** Kiem tra xem SDK da load chua */
    if (!window.FB) {
      toast.error("Facebook SDK chưa sẵn sàng.");
      return;
    }
    /**
     * Login
     */
    window.FB.login(
      (response: any) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          console.log("Access token:", accessToken);

          /** 👉 Chuyển hướng hoặc xử lý tiếp với token */
          ROUTER.push("/connect?access_token=" + accessToken);
        } else {
          toast.error("Đăng nhập Facebook thất bại hoặc bị hủy.");
        }
      },
      {
        scope:
          "public_profile,email,pages_show_list,pages_read_engagement,pages_messaging,pages_read_user_content,instagram_manage_comments,instagram_manage_insights,business_management,ads_management,read_insights,pages_manage_metadata,pages_manage_ads,pages_manage_posts,pages_manage_engagement,page_events",
        auth_type: "rerequest",
      }
    );
  };

  return (
    <button
      onClick={handleFacebookLogin}
      disabled={!sdk_loaded}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="white"
        viewBox="0 0 24 24"
        width={20}
        height={20}
      >
        <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 23.403.597 24 1.326 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.794.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.312h3.59l-.467 3.622h-3.123V24h6.116c.73 0 1.326-.597 1.326-1.326V1.326C24 .597 23.403 0 22.675 0z" />
      </svg>
      Đăng nhập bằng Facebook
    </button>
  );
};

export default FacebookLoginButton;
