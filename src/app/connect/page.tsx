"use client";

import React, { useEffect, useState } from "react";

import { MOCK_DATA } from "@/utils/data";

const ConnectInstall = () => {
  /**
   * State accessToken
   */
  const [access_token, setAccessToken] = useState("");
  /**
   * Danh sách page
   */
  const [pages, setPages] = useState<any>([]);

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
  useEffect(() => {
    /**
     * Nếu có token thì lấy danh sách page
     */
    if (access_token) {
      fetchPageFacebook();
    }
  }, [access_token]);
  /**
   * Lay danh sach page
   */
  const fetchPageFacebook = async () => {
    try {
      /**
       * Gọi api lấy danh sách page
       */
      const RES = await fetch(
        // `https://graph.facebook.com/me/accounts?access_token=${access_token}`
        `https://graph.facebook.com/me/accounts?fields=id,name,picture&type=large&access_token=${access_token}`
      );
      /**
       * Lay data
       */
      const DATA = await RES.json();
      /**
       * Kiem tra data
       */
      if (DATA.data) {
        setPages(DATA.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách Pages:", error);
    }
  };

  /**
   * Login vào retion
   */
  const onLogin = async () => {
    try {
      /**
       * Domain login
       */
      const DOMAIN =
        "https://chatbox-service-v3.botbanhang.vn/public/oauth/facebook/login";
      const RES = await fetch(DOMAIN, {
        method: "POST",
        body: JSON.stringify({ access_token: access_token }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      /**
       * Parse data
       */
      const DATA = await RES.json();
      /**
       * Kiem tra data
       */
      const ACCESS_TOKEN = DATA.data.access_token;
      /**
       * Nếu co token thì lấy danh sách page
       */
      if (ACCESS_TOKEN) {
        /**
         * Add vào REtion
         */
        fetchAddPageToRetion(ACCESS_TOKEN);
      }

      console.log(DATA);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách Pages:", error);
    }
  };

  const fetchAddPageToRetion = async (ACCESS_TOKEN: string) => {
    try {
      /**
       * DOmain org
       */
      const ORG_DOMAIN = `https://chatbox-billing.botbanhang.vn/app/organization/read_org`;
      /**
       * Lay danh sach org
       */
      const ORG_RES = await fetch(ORG_DOMAIN, {
        method: "POST",
        body: JSON.stringify({}),
        headers: {
          "Content-Type": "application/json",
          Authorization: `${ACCESS_TOKEN}`,
        },
      });
      /**
       * Parse data
       */
      const ORG_DATA = await ORG_RES.json();
      console.log(ORG_DATA);
      /**
       * Lay id org
       */
      const ORG_ID = ORG_DATA.data[0].org_id;
      /**
       * Domain add page
       */
      const DOMAIN = `https://chatbox-billing.botbanhang.vn/app/owner_ship/add_page`;
      /**
       * Lay danh sach page
       */
      const RES = await fetch(DOMAIN, {
        method: "POST",
        body: JSON.stringify({
          org_id: ORG_ID,
          page_id: pages[0].id,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `${ACCESS_TOKEN}`,
        },
      });
      /**
       *  Parse data
       */
      const DATA = await RES.json();
      if (DATA?.code === 200) {
        fetchAgent(ACCESS_TOKEN, ORG_ID);
      }
      console.log(DATA);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách Pages:", error);
    }
  };
  /**
   * Fetch Agent
   */
  const fetchAgent = async (ACCESS_TOKEN: string, ORG_ID: string) => {
    try {
      /**
       * Domain add page
       */
      const DOMAIN = `https://chatbox-llm.botbanhang.vn/app/agent/get_agent`;
      /**
       * Lay danh sach page
       */
      const RES = await fetch(DOMAIN, {
        method: "POST",
        body: JSON.stringify({
          org_id: ORG_ID,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `${ACCESS_TOKEN}`,
        },
      });
      /**
       *  Parse data
       */
      const DATA = await RES.json();
      if (DATA?.data?.length === 0) {
        /** Tạo agent */
        createAgent(ACCESS_TOKEN, ORG_ID);
      } else {
        /** Nếu có rồi thì chọn agent 1 và thêm kiến kiến thức */
        console.log("Có agent rồi");
        const AGENT_ID = DATA?.data[0]?.fb_page_id;
        /**
         * Upload kiến thức
         */
        uploadData(ACCESS_TOKEN, ORG_ID, AGENT_ID);

        console.log(AGENT_ID);
      }
      console.log(DATA);
    } catch (error) {
      console.error("Loi khi lay danh sach Pages:", error);
    }
  };

  const uploadData = async (
    ACCESS_TOKEN: string,
    ORG_ID: string,
    AGENT_ID: string
  ) => {
    const MOCK_DATA_FILE = new File(
      [MOCK_DATA],
      "mau_tra_loi_nhan_vien_ai.txt",
      {
        type: "text/plain",
      }
    );
    /**
     * Đường dẫn API upload file
     */
    const END_POINT = `app/document/upload?org_id=${ORG_ID}`;
    const FORM_DATA = new FormData();

    FORM_DATA.append("file", MOCK_DATA_FILE);
    /**
     * Fetch API
     */
    try {
      /**
       * Fetch API
       */
      const RES = await fetch(
        `https://chatbox-llm.botbanhang.vn/${END_POINT}`,
        {
          method: "POST",
          headers: {
            Authorization: ACCESS_TOKEN,
          },
          body: FORM_DATA,
        }
      );

      /**
       * Chuyển dữ liệu trả về thành JSON
       */

      const DATA = await RES.json();
      console.log(DATA, "RES");
      /**
       * Nếu có lỗi thì throw data
       */
      if (DATA?.code !== 200) throw DATA.mean;
      /** Thêm kiến kiến thức cho Trợ lý ảo*/
      addKnowledge(
        ACCESS_TOKEN,
        ORG_ID,
        AGENT_ID,
        DATA?.data?.d_embedding_path
      );
      console.log(DATA, "DATA");
    } catch (error) {
      console.log(error);
      if (error === "LIMIT_SIZE") {
        /**
         * Hiển thị toast lỗi
         */
      } else if (error === "LIMIT_DOCUMENT") {
        /**
         * Hiển thị toast lỗi
         */
      } else {
        /**
         * Hiển thị toast lỗi
         */
      }
    } finally {
    }
  };
  /** Thêm kiến thức cho Trợ lý ảo  */
  const addKnowledge = async (
    ACCESS_TOKEN: string,
    ORG_ID: string,
    AGENT_ID: string,
    FILE_NAME: string
  ) => {
    const END_POINT = `https://chatbox-llm.botbanhang.vn/app/config/proxy/workspace/${AGENT_ID}/update-embeddings?org_id=${ORG_ID}`;

    /**
     * Gọi API cập nhật embedding
     */
    try {
      /**
       *  Gọi API cập nhật embedding
       */
      const RES = await fetch(END_POINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: ACCESS_TOKEN,
        },
        body: JSON.stringify({
          adds: [FILE_NAME],
        }),
      });
      const DATA = await RES.json();
      console.log(DATA, "DATA");
      /**
       * Hiển thị toast thông báo thành công
       */

      /**
       * Gọi hàm fetchAndFilterData
       */
    } catch (error) {
      console.error("Error updating embeddings:", error);
      /**
       * Hiển thị toast thông báo lỗi
       */
    }
  };
  const createAgent = async (ACCESS_TOKEN: string, ORG_ID: string) => {
    try {
      /**
       * Domain add page
       */
      const DOMAIN = `https://chatbox-llm.botbanhang.vn/app/agent/create_agent?org_id=${ORG_ID}`;
      /**
       * Lay danh sach page
       */
      const RES = await fetch(DOMAIN, {
        method: "POST",
        body: JSON.stringify({
          ai_agent_name: "Agent 1",
          description: "Agent 1",
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `${ACCESS_TOKEN}`,
        },
      });
      /**
       *  Parse data
       */
      const DATA = await RES.json();

      fetchAgent(ACCESS_TOKEN, ORG_ID);
      console.log(DATA);
    } catch (error) {
      console.error("Loi khi lay danh sach Pages:", error);
    }
  };

  /**
   * Handle connect page
   */
  const handleConnectPage = () => {
    /**
     * Lay danh sach page
     */
    onLogin();
  };

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
          <div className="flex flex-col gap-y-2">
            {pages.map((page: any) => (
              <div
                key={page.id}
                className="flex items-center gap-x-2 border border-gray-200 hover:bg-gray-100 rounded p-2 cursor-pointer"
                onClick={() => {
                  handleConnectPage();
                }}
              >
                <img
                  src={page?.picture?.data?.url}
                  alt={"logo"}
                  style={{ objectFit: "cover" }}
                  className="w-8 h-8 rounded-lg flex justify-center items-center"
                />
                <div>
                  <h3>{page.name}</h3>
                  <p>{page.id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectInstall;
