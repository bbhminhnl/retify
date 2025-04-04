"use client";

import React, { useEffect, useState } from "react";
import { find, get, has, keys, set } from "lodash";

import { MOCK_DATA } from "@/utils/data";
import { UserProfile } from "@/types";
import { fetchApi } from "@/services/fetchApi";

/**
 * Interface Product
 */
type Product = {
  /**
   * id
   */
  id: number;
  /** Tên */
  name: string;
  /** Giá */
  price: number;
  /** IMG */
  product_image: string;
  /** Type */
  type: string;
  /**
   * cost
   */
  cost: number;
};
const ConnectInstall = () => {
  /** State accessToken*/
  const [access_token, setAccessToken] = useState("");
  /** Danh sách page*/
  const [pages, setPages] = useState<UserProfile[]>([]);
  /** Danh sách product */
  const [products, setProducts] = useState<Product[]>([]);
  /** Page đã chọn */
  const [selected_page, setSelectedPage] = useState<string>("");
  /** Chatbox token */
  const [chatbox_token, setChatboxToken] = useState<string>("");

  /** Lấy đata products */
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  /** loading */
  const [loading, setLoading] = useState(false);
  /** Text loading */
  const [loading_text, setLoadingText] = useState("");

  /**
   * Chọn Tổ chức để thêm page vào
   */
  const [organization, setOrganization] = useState([]);

  /** Lấy Facebook Token */
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
    /** Kiểm tra token */
    if (FACEBOOK_RESPONSE?.authResponse?.accessToken) {
      /** Set token */
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
      /** Lấy danh sách page */
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
        `https://graph.facebook.com/me/accounts?fields=id,name,picture&type=large&access_token=${access_token}`
      );
      /**
       * Lấy data
       */
      const DATA = await RES.json();
      /**
       * Kiểm tra data
       */
      if (DATA.data) {
        /** Lấy danh sách page */
        setPages(DATA.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách Pages:", error);
    }
  };

  /**
   * Login vào retion
   * @param PAGE_ID
   */
  const onLogin = async (PAGE_ID: string) => {
    /** Cập nhật text */
    setLoadingText("Đang cài đặt...");
    try {
      /**
       * Domain login
       */
      const DOMAIN =
        "https://chatbox-service-v3.botbanhang.vn/public/oauth/facebook/login";
      /** Body */
      const BODY = { access_token: access_token };
      /** Header */
      const HEADERS = {};
      /** RES */
      const DATA = await fetchApi(DOMAIN, "POST", BODY, HEADERS);
      /**
       * Kiem tra data
       */
      const ACCESS_TOKEN = DATA.data.access_token;

      setChatboxToken(ACCESS_TOKEN);

      /**
       * Nếu co token thì lấy danh sách page
       */
      if (ACCESS_TOKEN) {
        /**
         * Add vào REtion
         */
        fetchAddPageToRetion(ACCESS_TOKEN, PAGE_ID);
      }
      console.log(DATA);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách Pages:", error);
    } finally {
      //   setLoading(false);
      //   setLoadingText("");
    }
  };

  /**
   *  Hàm thêm page vào Tổ chức
   * @param ACCESS_TOKEN
   */
  const fetchAddPageToRetion = async (
    ACCESS_TOKEN: string,
    PAGE_ID: string
  ) => {
    try {
      /**
       * DOmain org
       */
      const ORG_DOMAIN = `https://chatbox-billing.botbanhang.vn/app/organization/read_org`;
      /**
       * Lay danh sach org
       */
      const ORG_DATA = await fetchApi(
        ORG_DOMAIN,
        "POST",
        {},
        {
          Authorization: `${ACCESS_TOKEN}`,
        }
      );
      /**
       * Parse data
       */
      console.log(ORG_DATA);
      /** Lấy thông tin ORG */
      setOrganization(ORG_DATA.data);

      //   /**
      //    * Lay id org
      //    */
      //   const ORG_ID = ORG_DATA.data[0].org_id;
      //   /**
      //    * Domain add page
      //    */
      //   const DOMAIN = `https://chatbox-billing.botbanhang.vn/app/owner_ship/add_page`;
      //   /**
      //    * Khai báo body
      //    */
      //   const BODY = {
      //     org_id: ORG_ID,
      //     page_id: PAGE_ID,
      //   };
      //   /** Khai báo header */
      //   const HEADERS = {
      //     Authorization: `${ACCESS_TOKEN}`,
      //   };

      //   /** Thêm page vào Tổ chức */
      //   const DATA = await fetchApi(DOMAIN, "POST", BODY, HEADERS);
      //   /**
      //    * Parse data
      //    */
      //   if (DATA?.code === 200) {
      //     /** Lấy danh sách page */
      //     fetchAgent(ACCESS_TOKEN, ORG_ID, PAGE_ID);
      //   }
      //   console.log(DATA);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách Pages:", error);
    }
  };
  /**
   * Hàm chọn BM để add Page vào
   * @param ORG_ID
   * @param PAGE_ID
   * @param ACCESS_TOKEN
   */
  const addPage = async (
    ORG_ID: string,
    PAGE_ID: string,
    ACCESS_TOKEN: string
  ) => {
    /** Cập nhật text */
    setLoadingText("Đang cài đặt trợ lý ảo");
    try {
      /**
       * Domain add page
       */
      const DOMAIN = `https://chatbox-billing.botbanhang.vn/app/owner_ship/add_page`;
      /** Khai báo body */
      const BODY = {
        page_id: PAGE_ID,
        org_id: ORG_ID,
      };
      /** Khai báo Header */
      const HEADERS = {
        Authorization: ACCESS_TOKEN,
      };
      /** Thêm page vào Tổ chức */
      const DATA = await fetchApi(DOMAIN, "POST", BODY, HEADERS);
      /**
       * Parse data
       */
      if (DATA?.code === 200) {
        /** Lấy danh sách page */
        fetchAgent(ACCESS_TOKEN, ORG_ID, PAGE_ID);
      }
      //   }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách Pages:", error);
    } finally {
      //   setLoading(false);
      //   setLoadingText("");
    }
  };

  /**
   * Fetch Agent
   * @param ACCESS_TOKEN
   * @param ORG_ID
   * @param PAGE_ID
   */
  const fetchAgent = async (
    ACCESS_TOKEN: string,
    ORG_ID: string,
    PAGE_ID: string
  ) => {
    /** Cập nhật text */
    setLoadingText("Đang tạo Trợ lý ảo");
    try {
      /**
       * Domain add page
       */
      const DOMAIN = `https://chatbox-llm.botbanhang.vn/app/agent/get_agent`;
      /** Khai báo body */
      const BODY = {
        org_id: ORG_ID,
      };
      /** Khai báo Header */
      const HEADERS = {
        Authorization: ACCESS_TOKEN,
      };
      /** Call API lấy danh sách agent */
      const DATA = await fetchApi(DOMAIN, "POST", BODY, HEADERS);
      /**
       *  Parse data
       */

      if (DATA?.data?.length === 0) {
        /** Tạo agent */
        createAgent(ACCESS_TOKEN, ORG_ID, PAGE_ID);
      } else {
        /** Nếu có rồi thì chọn agent 1 và thêm kiến kiến thức */
        console.log("Có agent rồi");
        const AGENT_ID = DATA?.data[0]?.fb_page_id;

        /** Bật trợ lý ảo và chọn Trợ lý ảo cho page */
        updateSettingPage(ACCESS_TOKEN, ORG_ID, PAGE_ID, AGENT_ID);

        /**
         * Upload kiến thức
         */
        uploadData(ACCESS_TOKEN, ORG_ID, AGENT_ID);
      }
      console.log(DATA);
    } catch (error) {
      console.error("Loi khi lay danh sach Pages:", error);
    }
  };
  /** Cập nhật setting page Bật trợ lý ảo và chọn Trợ lý ảo mới tạo
   * @param ACCESS_TOKEN
   * @param ORG_ID
   * @param PAGE_ID
   * @param AGENT_ID
   */
  const updateSettingPage = async (
    ACCESS_TOKEN: string,
    ORG_ID: string,
    PAGE_ID: string,
    AGENT_ID: string
  ) => {
    /** Cập nhật text */
    setLoadingText("Đang cài đặt trợ lý ảo");
    try {
      /**
       * Domain add page
       */
      const DOMAIN = `https://chatbox-service-v3.botbanhang.vn/app/page/update_page_setting`;
      /** Khai báo body */
      const BODY = {
        page_id: PAGE_ID,
        ai_agent_id: AGENT_ID,
        is_active_ai_agent: true,
      };
      /** Khai báo Header */
      const HEADERS = {
        Authorization: ACCESS_TOKEN,
      };
      /**
       * Gọi thông tin UPdate Setting
       */
      const DATA = await fetchApi(DOMAIN, "POST", BODY, HEADERS);
    } catch (error) {
      console.error("Loi khi lay danh sach Pages:", error);
    } finally {
      //   setLoading(false);
      /** Kết nối với chatbox thành công */
      setLoadingText("Cài đặt ChatBox Thành công!");
      /** Sau 1s thì gọi API lấy token Partner */
      setTimeout(() => {
        fetchTokenPartner(ACCESS_TOKEN, ORG_ID, PAGE_ID);
      }, 1000);
    }
  };

  const fetchTokenPartner = async (
    ACCESS_TOKEN: string,
    ORG_ID: string,
    PAGE_ID: string
  ) => {
    /** Cập nhật text */
    setLoadingText("Đang kết nối với Merchant");
    try {
      /**
       * Domain add page
       */
      const DOMAIN = `https://chatbox-service-v3.botbanhang.vn/app/page/get_page_info_to_chat`;
      /** Khai báo body */
      const BODY = {
        org_id: ORG_ID,
        list_page_id: [PAGE_ID],
      };
      /** Khai báo Header */
      const HEADERS = {
        Authorization: ACCESS_TOKEN,
      };
      /**
       * fetch Data
       */
      const DATA = await fetchApi(DOMAIN, "POST", BODY, HEADERS);

      /** Lấy danh sách các key trong `data` */
      const DATA_KEYS = keys(DATA.data);

      /**Tìm key nào chứa `partner_token` */
      const KEY_WITH_PARTNER_TOKEN = find(DATA_KEYS, (key) =>
        has(DATA.data[key], "partner_token")
      );

      /** Nếu tìm thấy `partner_token`, lấy giá trị của nó */
      const PARTNER_TOKEN = KEY_WITH_PARTNER_TOKEN
        ? get(DATA, `data.${KEY_WITH_PARTNER_TOKEN}.partner_token`, null)
        : null;
      console.log(PARTNER_TOKEN);

      /**   createProductMerchant(PARTNER_TOKEN, ORG_ID, PAGE_ID); */
      fetchTokenMerchant(PARTNER_TOKEN, PAGE_ID);
    } catch (error) {}
  };
  /**
   * Hàm lấy token merchant
   * @param ACCESS_TOKEN
   * @param PAGE_ID
   */
  const fetchTokenMerchant = async (ACCESS_TOKEN: string, PAGE_ID: string) => {
    /** Domain Merchant */
    const DOMAIN = "https://api.merchant.vn/v1/public/chatbox/get_config";
    /**
     * Body
     */
    const BODY = {
      access_token: ACCESS_TOKEN,
      //   client_id: "29877270768526767",
      //   client_id: "9481492605237941",
      client_id: "9907822685912987",
      //   secret_key: "0cf5516973a145929ff36d3303183e5f",
      secret_key: "6f8b22eebe1d4d93b2f4a618901df020",
    };
    /**
     * fetch Data
     */
    const DATA = await fetchApi(DOMAIN, "POST", BODY, {});
    /**
     * Token merchatn
     */
    const TOKEN_MERCHANT = DATA?.data?.access_token;
    /**
     * Tạo sản phẩm
     */
    createAllProducts(TOKEN_MERCHANT, PAGE_ID);
    console.log(DATA, "data");
  };
  /** Hàm gọi API
   * @param ACCESS_TOKEN
   * @param PAGE_ID
   * @param product
   */
  const createProductMerchant = async (
    ACCESS_TOKEN: string,
    PAGE_ID: string,
    product: {
      name: string;
      product_image: string;
      price: number;
      cost: number;
    }
  ) => {
    try {
      /** Domain Tạo sản phẩm */
      const DOMAIN = `https://api-product.merchant.vn/product/create_product`;

      /** Khai báo body */
      const BODY = {
        name: product.name, // Thay tên sản phẩm
        images: [product.product_image], // Thay ảnh
        price: product.price,
        cost: product?.cost || product?.price, // Thay giá gốc
        wholesale_price: 0,
        max_inventory_quantity: 0,
        min_inventory_quantity: 0,
        status: "ACTIVE",
        type: "product",
        sold_when_quantity_runs_out: false,
        weight: 0,
        length: 0,
        width: 0,
        height: 0,
        vat: 0,
        custom_fields: {
          revenue_allocation: false,
          commission_allocation: false,
          departments_allocated_commissions: [
            {
              department_id: "",
              commission: 0,
              commission_type: "percentage",
              max_commission: 0,
            },
          ],
          calculate_commission_for_marketing: false,
          value_gradually_decreases: null,
        },
        description: "SP Test",
        service_fee: null,
      };

      /** Khai báo Header */
      const HEADERS = {
        "token-business": ACCESS_TOKEN,
        accept: "application/json, text/plain, */*",
      };

      /** fetch API */
      const DATA = await fetchApi(DOMAIN, "POST", BODY, HEADERS);
      console.log(`✅ Tạo sản phẩm ${product.name} thành công`, DATA);
    } catch (error) {
      console.error(`❌ Lỗi khi tạo sản phẩm ${product.name}`, error);
    } finally {
      /** Tắt loading */
      // setLoading(false);
      /**
       * Hiển thị text tiền trình
       */
      setLoadingText("Tạo sản phẩm thành công!");
      /**
       * Xoá text sau 5s
       */
      // setTimeout(() => {
      //   setLoadingText("");
      // }, 5000);
    }
  };

  /** Hàm xử lý gọi API cho toàn bộ danh sách sản phẩm
   * @param ACCESS_TOKEN
   * @param PAGE_ID
   */
  const createAllProducts = async (ACCESS_TOKEN: string, PAGE_ID: string) => {
    /** Dùng Promise.all để gửi nhiều request cùng lúc */
    await Promise.all(
      products.map((product) =>
        createProductMerchant(ACCESS_TOKEN, PAGE_ID, product)
      )
    );
    fetchListPages(ACCESS_TOKEN, PAGE_ID);
    console.log("🎉 Hoàn tất tạo tất cả sản phẩm!");
  };
  /**
   *  Lấy thông tin page merchant
   * @param ACCESS_TOKEN
   * @param PAGE_ID
   */
  const fetchListPages = async (ACCESS_TOKEN: string, PAGE_ID: string) => {
    setLoadingText("Đang đồng bộ sản phẩm");
    try {
      /**
       * Domain
       */
      const DOMAIN = `https://api.merchant.vn/v1/apps/facebook/pages`;
      /**
       * Header
       */
      const HEADERS = {
        "token-business": ACCESS_TOKEN,
        accept: "application/json, text/plain, */*",
      };
      /**
       * fetch Data
       */
      const DATA = await fetchApi(DOMAIN, "POST", {}, HEADERS);
      /**
       * Page
       */
      const PAGE = DATA.data.find((page: any) => page.page_id === PAGE_ID);
      /**
       * External business
       */
      const EXTERNAL_BUSINESS_ID = PAGE.external_business_id;
      /**
       * Tạo state trên fb
       */
      createState(ACCESS_TOKEN, PAGE_ID, EXTERNAL_BUSINESS_ID);
      /**
       * Sync data lên fb
       */
      syncDataToFbSMC(ACCESS_TOKEN, EXTERNAL_BUSINESS_ID);
    } catch (error) {
      console.error(error);
    } finally {
      // setLoading(false);
      // setLoadingText("");
    }
  };

  /**
   *  Kết nối với Facebook
   * @param ACCESS_TOKEN
   * @param PAGE_ID
   * @param EXTERNAL_BUSINESS_ID
   */
  const createState = async (
    ACCESS_TOKEN: string,
    PAGE_ID: string,
    EXTERNAL_BUSINESS_ID: string
  ) => {
    /**
     * Domain
     */
    const DOMAIN = `https://api.merchant.vn/v1/apps/facebook/create_state`;
    /**
     * Header
     */
    const HEADERS = {
      "token-business": ACCESS_TOKEN,
      accept: "application/json, text/plain, */*",
    };
    /**
     * Body
     */
    const BODY = {
      page_id: PAGE_ID,
      external_business_id: EXTERNAL_BUSINESS_ID,
      redirect_uri: "https://smc-oauth.merchant.vn/",
    };
    /**
     * fetch Data
     */
    const DATA = await fetchApi(DOMAIN, "POST", BODY, HEADERS);
    console.log(DATA, "DATA");
  };

  /**
   * sync data lên fb
   * @param ACCESS_TOKEN
   */
  const syncDataToFbSMC = async (ACCESS_TOKEN: string, BUSINESS_ID: string) => {
    /**
     * Bật trạng thái loading
     */
    setLoadingText("Đang đồng bộ sản phẩm...");
    setLoading(true);
    try {
      /**
       * Domain
       */
      const DOMAIN = `https://api-product.merchant.vn/product/sync_product_facebook`;
      /** Header */
      const HEADERS = {
        "token-business": ACCESS_TOKEN,
        accept: "application/json, text/plain, */*",
      };
      /** Body */
      const BODY = {
        external_business_id: BUSINESS_ID,
        type: "ALL",
      };
      /**
       * fetch Data
       */
      const DATA = await fetchApi(DOMAIN, "POST", BODY, HEADERS);
      console.log(DATA, "DATA");
    } catch (error) {
      console.log(error);
    } finally {
      /**
       * Tắt loading
       */
      setLoading(false);
      /**
       * Cập nhật text
       */
      setLoadingText(
        "Đã đồng bộ sản phẩm lên FB SMC! Sau khi đồng bộ, có thể mất 24 giờ để sản phẩm của bạn xuất hiện trên Messenger hoặc tối đa 02 giờ để gắn được lên Facebook Livestream"
      );
      /**
       * Xoá text sau 5s
       */
      setTimeout(() => {
        setLoadingText("");
      }, 5000);
    }
  };

  /**
   *    Upload data mock
   * @param ACCESS_TOKEN User access token
   * @param ORG_ID
   * @param AGENT_ID
   */
  const uploadData = async (
    ACCESS_TOKEN: string,
    ORG_ID: string,
    AGENT_ID: string
  ) => {
    /** Định dạng dữ liệu sản phẩm */
    const FORMATTED_DATA = products
      .map(
        (product) =>
          `${product.name}: ${product.price.toLocaleString("vi-VN")} đ`
      )
      .join("\n");

    /** Giả sử MOCK_DATA đã có dữ liệu trước đó */
    const EXISTING_DATA = typeof MOCK_DATA === "string" ? MOCK_DATA : "";

    /** Ghép dữ liệu cũ và mới */
    const UPDATED_DATA = EXISTING_DATA + "\n" + FORMATTED_DATA;

    /** Tạo mock data file mới với dữ liệu đã cập nhật */
    const MOCK_DATA_FILE = new File(
      [UPDATED_DATA],
      "mau_tra_loi_nhan_vien_ai_update.txt",
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
  /** Thêm kiến thức cho Trợ lý ảo
   * @param ACCESS_TOKEN User access token
   * @param ORG_ID Org id
   * @param AGENT_ID Agent id
   * @param FILE_NAME File name
   */
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
      /**
       * Data RESPONSE
       */
      const DATA = await RES.json();
      console.log(DATA, "DATA");
      /**
       * Hiển thị toast thông báo thành công
       */
      /**
       * Xem xét thêm Sản phẩm ở vị trí và kết nối với Merchant
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
  /**
   * Tạo Agent
   * @param ACCESS_TOKEN
   * @param ORG_ID
   * @param PAGE_ID
   */
  const createAgent = async (
    ACCESS_TOKEN: string,
    ORG_ID: string,
    PAGE_ID: string
  ) => {
    try {
      /**
       * Domain add page
       */
      const DOMAIN = `https://chatbox-llm.botbanhang.vn/app/agent/create_agent?org_id=${ORG_ID}`;
      /**
       *  Body
       */
      const BODY = {
        ai_agent_name: "Agent 1",
        description: "Agent 1",
      };
      /**
       * Header
       */
      const HEADERS = {
        Authorization: ACCESS_TOKEN,
      };
      /**
       * Fetch data
       */
      const DATA = await fetchApi(DOMAIN, "POST", BODY, HEADERS);
      /** Lấy thông tin AGENT */
      fetchAgent(ACCESS_TOKEN, ORG_ID, PAGE_ID);
    } catch (error) {
      console.error("Loi khi lay danh sach Pages:", error);
    }
  };

  /**
   * Handle connect page
   * @param PAGE_ID
   */
  const handleConnectPage = (PAGE_ID: string) => {
    /** Bắt đầu loading */
    setLoading(true);
    /** Hiện text tiến trình */
    setLoadingText("Đang cài đặt...");
    /**
     * Lay danh sach page
     */
    onLogin(PAGE_ID);
  };

  return (
    <div className="w-full h-full p-4">
      {!access_token && !loading && !loading_text && (
        <div className="flex items-center justify-center h-full w-full">
          <div className="h-10 w-80">
            <iframe
              loading="lazy"
              className="relative z-[2] w-full h-full"
              src='https://botbanhang.vn/cross-login-facebook?app_id=1282108599314861&amp;option={"return_scopes":true,"auth_type":"rerequest","enable_profile_selector":true,"scope":"public_profile,pages_show_list,pages_read_engagement,pages_messaging,email,pages_read_user_content,instagram_manage_comments,instagram_manage_insights,business_management,ads_management,read_insights,pages_manage_metadata,pages_manage_ads,pages_manage_posts,pages_manage_engagement,page_events"}&amp;text=Tiếp tục với Facebook&amp;btn_style=display%3Aflex%3Bjustify-content%3Acenter%3Bwidth%3A100%25%3Bheight%3A100%25%3Balign-items%3Acenter%3Bgap%3A0.5rem%3Bbackground-color%3A%23f1f5f9%3Bborder-radius%3A0.375rem%3Bcolor%3A%230f172a%3Bfont-size%3A16px%3Bfont-weight%3A500%3Bborder-color%3A%23e2e8f0%3Bborder-width%3A1px'
              frameBorder="none"
            ></iframe>
          </div>
        </div>
      )}
      {access_token && !loading && !loading_text && (
        <div className="h-full">
          <h2>Chọn Trang</h2>
          <div className="flex flex-col gap-y-2">
            {pages.map((page: UserProfile) => (
              <div
                key={page.id}
                className="flex items-center gap-x-2 border border-gray-200 hover:bg-gray-100 rounded p-2 cursor-pointer"
                onClick={() => {
                  setSelectedPage(page?.id);
                  handleConnectPage(page?.id);
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
      {organization?.length > 0 && (
        <div className="h-full">
          <h2>Chọn BM</h2>
          <div className="flex flex-col gap-y-2">
            {organization.map((org: any) => (
              <div
                key={org?.org_id}
                className="flex items-center gap-x-2 border border-gray-200 hover:bg-gray-100 rounded p-2 cursor-pointer"
                onClick={() => {
                  console.log(org, "checkkk", chatbox_token);
                  addPage(org?.org_id, selected_page, chatbox_token);
                  setOrganization([]);
                }}
              >
                <img
                  src={org?.org_info?.org_avatar}
                  alt={"logo"}
                  style={{ objectFit: "cover" }}
                  className="w-8 h-8 rounded-lg flex justify-center items-center"
                />
                <div>
                  <h3>{org?.org_info?.org_name}</h3>
                  <p>{org?.org_id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex h-full w-full flex-col items-center justify-center gap-y-5">
        {loading && (
          <div className="flex items-center justify-center h-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        )}
        {
          <div className="flex items-center justify-center h-12">
            <p className="text-lg ">{loading_text}</p>
          </div>
        }
      </div>
    </div>
  );
};

export default ConnectInstall;
