"use client";

import React, { useEffect, useState } from "react";

const ConnectInstall = () => {
  /**
   * State accessToken
   */
  const [access_token, setAccessToken] = useState("");

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

    console.log(FACEBOOK_RESPONSE, FACEBOOK_RESPONSE.authResponse.accessToken);
    if (FACEBOOK_RESPONSE?.authResponse?.accessToken) {
      //   onAccessToken(FACEBOOK_RESPONSE.authResponse.accessToken);
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

  return (
    <div className="w-full h-full p-4">
      {!access_token && (
        <div className="h-10">
          <iframe
            loading="lazy"
            className="relative z-[2] w-full h-full"
            src='https://botbanhang.vn/cross-login-facebook?app_id=1282108599314861&amp;option={"return_scopes":true,"auth_type":"rerequest","enable_profile_selector":true,"scope":"public_profile,pages_show_list,pages_read_engagement,pages_messaging,email,pages_read_user_content,instagram_manage_comments,instagram_manage_insights,business_management,ads_management,read_insights,pages_manage_metadata,pages_manage_ads,pages_manage_posts,pages_manage_engagement,page_events"}&amp;text=Tiếp tục với Facebook&amp;btn_style=display%3Aflex%3Bjustify-content%3Acenter%3Bwidth%3A100%25%3Bheight%3A100%25%3Balign-items%3Acenter%3Bgap%3A0.5rem%3Bbackground-color%3A%23f1f5f9%3Bborder-radius%3A0.375rem%3Bcolor%3A%230f172a%3Bfont-size%3A16px%3Bfont-weight%3A500%3Bborder-color%3A%23e2e8f0%3Bborder-width%3A1px'
            frameBorder="none"
          ></iframe>
        </div>
      )}
      {access_token && (
        <div className="h-full">
          <h2>Chọn Trang</h2>
        </div>
      )}
    </div>
  );
};

export default ConnectInstall;
