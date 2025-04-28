"use client";

import { Suspense, useEffect, useState } from "react";
import { find, get, has, keys } from "lodash";

import ConnectHandler from "../components/ConnectHandler";
import Loading from "@/components/loading/Loading";
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
/** kiểu dữ liệu page */
type IPageProps = {
  /** ID Tổ chức */
  org_id: string;
  /** ID Page */
  page_id: string;
};

const ConnectInstall = () => {
  /** State accessToken*/
  const [access_token, setAccessToken] = useState<any>("");
  /** Danh sách page*/
  const [pages, setPages] = useState<UserProfile[]>([]);
  /** Danh sách product */
  const [products, setProducts] = useState<Product[]>([]);
  /** Page đã chọn */
  const [selected_page, setSelectedPage] = useState<string>("");
  /** Chatbox token */
  const [chatbox_token, setChatboxToken] = useState<string>("");
  /** Token merchant */
  const [token_merchant, setTokenMerchant] = useState("");
  /** loading */
  const [loading, setLoading] = useState(false);
  /** Text loading */
  const [loading_text, setLoadingText] = useState("");
  /** Chọn Tổ chức để thêm page vào*/
  const [organization, setOrganization] = useState([]);

  /** Finish Installing */
  const [finish_installing, setFinishInstalling] = useState(false);

  /** Hàm Error
   * @param message
   * @returns void
   * @description setLoading false
   * @description setLoadingText message
   * @description setTimeOut 2s setLoadingText ''
   */
  const handleError = (message: string) => {
    /** Tắt loading */
    setLoading(false);
    /** Hàm set loading text */
    setLoadingText(message);
    /** Set timeout */
    setTimeout(() => setLoadingText(""), 2000);
  };

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
      setProducts(DATA);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    /**
     * Nếu có token thì lấy danh sách page
     */
    if (access_token) {
      /** Lấy danh sách page */
      fetchPageFacebook();
      /** Lấy danh sách sản phẩm */
      fetchProducts();
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
   * @returns Access token
   */
  const onLogin = async (PAGE_ID: string) => {
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

      console.log(DATA, "DATA");

      if (DATA?.code !== 200) {
        return "error";
      }
      /**
       * Kiem tra data
       */
      const ACCESS_TOKEN = DATA?.data?.access_token;
      /** Return Token */
      return ACCESS_TOKEN;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách Pages:", error);
      return "error";
    } finally {
    }
  };

  /**
   *  Hàm thêm page vào Tổ chức
   * @param ACCESS_TOKEN
   * @returns List org
   */
  const fetchListOrg = async (ACCESS_TOKEN: string) => {
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
          Authorization: ACCESS_TOKEN,
        }
      );
      /**
       * Parse data
       */
      console.log(ORG_DATA, "org_data");

      if (ORG_DATA?.code !== 200) {
        return "error";
      }
      return ORG_DATA?.data;

      /** Lấy thông tin ORG */
      setOrganization(ORG_DATA.data);

      // addPage("7bd3ac17116c4aacb2e9e55ba0330388", PAGE_ID, ACCESS_TOKEN);

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
      return "error";
    }
  };

  /**
   * Hàm chọn BM để add Page vào
   * @param ORG_ID
   * @param PAGE_ID
   * @param ACCESS_TOKEN
   */
  const handleConnectToChatBox = async (
    ORG_ID: string,
    PAGE_ID: string,
    ACCESS_TOKEN: string
  ) => {
    /** ===================== Thêm page vào Chatbox ======================== */
    setLoadingText("Đang thêm Trang vào Tổ chức");
    /** Kiểm tra page đã tồn tại chưa */
    const IS_EXIST_PAGE = await checkExistPage(ORG_ID, PAGE_ID, ACCESS_TOKEN);
    /** Nếu chưa tồn tại thì thêm page */
    if (!IS_EXIST_PAGE) {
      const ADD_PAGE_STATUS = await addPage(ORG_ID, PAGE_ID, ACCESS_TOKEN);
      /** Trạng thái Add page */
      if (!ADD_PAGE_STATUS) {
        /** Gọi hàm handle error */
        handleError("Đã xảy ra lỗi, thêm Trang không thành công!");
        return;
      }
      /** Trạng Thái đạt giới hạn gọi sử dụng */
      if (ADD_PAGE_STATUS === "REACH_QUOTA.PAGE") {
        /** Gọi hàm handle error */
        handleError(
          "Đã đạt giới hạn Trang trong Tổ chức, thêm Trang không thành công!"
        );

        return;
      }
    }

    /** ================== Lấy danh sách AGENT ==================== */
    /** Cập nhật tin nhắn */
    setLoadingText("Đang cài đặt trợ lý ảo ...");
    /** Thông tin info */
    let agent_info = await fetchAgent(ACCESS_TOKEN, ORG_ID, PAGE_ID);
    /** Kiểm tra thông tin trả về */
    if (agent_info === "error") {
      return handleError("Đã xảy ra lỗi, lấy thông tin trợ lý ảo thất bại!");
    }
    /** Nếu không có thống tin trợ lý tin thì Tạo mới */
    if (!agent_info) {
      /** Kết quả khởi tạo trợ lý Ảo */
      const AGENT_CREATE_RESULT = await createAgent(
        ACCESS_TOKEN,
        ORG_ID,
        PAGE_ID
      );
      /** Nếu lỗi thì hiển thị lỗi */
      if (!AGENT_CREATE_RESULT || AGENT_CREATE_RESULT === "error") {
        return handleError("Đã xảy ra lỗi, Tạo trợ lý ảo không thành công!");
      }

      /** Nếu createAgent trả về true hoặc không có ID => fetch lại agent_info */
      if (AGENT_CREATE_RESULT === true) {
        agent_info = await fetchAgent(ACCESS_TOKEN, ORG_ID, PAGE_ID);

        if (!agent_info || agent_info === "error") {
          return handleError(
            "Tạo trợ lý ảo thành công nhưng lấy thông tin thất bại!"
          );
        }
      }
    }
    /** ================== Cập nhật Setting ==================== */
    /** Cập nhật Setting  */
    updateSettingPage(ORG_ID, PAGE_ID, ACCESS_TOKEN, agent_info);

    /** Tải lên kiến thức */

    uploadData(ORG_ID, ACCESS_TOKEN, agent_info);
  };

  /**
   * Hàm chọn BM để add Page vào
   * @param ORG_ID
   * @param PAGE_ID
   * @param ACCESS_TOKEN
   */
  const checkExistPage = async (
    ORG_ID: string,
    PAGE_ID: string,
    ACCESS_TOKEN: string
  ) => {
    try {
      /**
       * Domain add page
       */
      const DOMAIN = `https://chatbox-billing.botbanhang.vn/app/owner_ship/read_page`;
      /** Khai báo body */
      const BODY = {
        org_id: ORG_ID,
      };
      /** Khai báo Header */
      const HEADERS = {
        Authorization: ACCESS_TOKEN,
      };
      /** Thêm page vào Tổ chức */
      const DATA = await fetchApi(DOMAIN, "POST", BODY, HEADERS);

      const EXISTS = DATA?.data.some(
        (item: IPageProps) => item.page_id === PAGE_ID
      );
      return EXISTS;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách Pages:", error);
      return false;
    } finally {
      //   setLoading(false);
      //   setLoadingText("");
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
    setLoadingText("Installing virtual assistant...");
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

      if (DATA?.code === 200) {
        return true;
      } else {
        return DATA?.message;
      }

      /**
       * Parse data
       */
      // if (DATA?.code === 200) {
      //   /** Lấy danh sách page */
      //   fetchAgent(ACCESS_TOKEN, ORG_ID, PAGE_ID);
      // }
      //   }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách Pages:", error);
      return false;
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
    setLoadingText("Creating Virtual Assistant...");
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
        Authorization: "ACCESS_TOKEN",
      };
      /** Call API lấy danh sách agent */
      const DATA = await fetchApi(DOMAIN, "POST", BODY, HEADERS);
      /**
       *  Parse data
       */
      console.log(DATA, "Data");
      if (DATA?.data?.length === 0) {
        /** Tạo agent */
        // createAgent(ACCESS_TOKEN, ORG_ID, PAGE_ID);
        return false;
      } else {
        /** Nếu có rồi thì chọn agent 1 và thêm kiến kiến thức */
        console.log("Có agent rồi");
        const AGENT_ID = DATA?.data[0]?.fb_page_id;
        return AGENT_ID;
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
      return "error";
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
    setLoadingText("Setting up the virtual assistant...");
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
        ai_agent_working_hour_answer: {
          in_working_hour: {
            type: "SEND_DIRECTLY",
            time: 900000,
          },
          out_working_hour: {
            type: "SEND_DIRECTLY",
            time: 0,
          },
        },
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
      setLoadingText("ChatBot setup complete!");
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
    setLoadingText("Connecting to CRM...");
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

  /** Lấy client ID
   * @param page_id
   * @returns
   */
  const fetchClientId = async (page_id: string) => {
    try {
      /** Domain Merchant */
      const DOMAIN = `https://chatbox-public-v2.botbanhang.vn/embed/conversation/init_identify?name=anonymous&page_id=${page_id}`;

      /** Gọi API */
      const RESPONSE = await fetch(DOMAIN);

      /** Kiểm tra lỗi HTTP */
      if (!RESPONSE.ok) {
        throw new Error(`Lỗi khi fetch: ${RESPONSE.status}`);
      }

      /** Parse JSON */
      const DATA = await RESPONSE.json();

      /** Trả ra client ID */
      return DATA?.data;
    } catch (error) {
      console.error("Lỗi khi lấy client ID:", error);
      return null; // hoặc throw lại nếu muốn xử lý phía trên
    }
  };

  /**
   * Hàm lấy token merchant
   * @param ACCESS_TOKEN
   * @param PAGE_ID
   */
  const fetchTokenMerchant = async (ACCESS_TOKEN: string, PAGE_ID: string) => {
    /** Chat Domain */
    const DOMAIN = `https://api.merchant.vn/v1/public/chatbox/get_config`;

    /**
     * Khai báo body
     */
    const CLIENT_ID = await fetchClientId(PAGE_ID);

    /**
     * Body
     */
    const BODY = {
      access_token: ACCESS_TOKEN,
      //   client_id: "29877270768526767",
      client_id: CLIENT_ID,
      // client_id: "9907822685912987",
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

    setTokenMerchant(TOKEN_MERCHANT);
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
        // images: [product.product_image], // Thay ảnh
        images: [
          ["", null, undefined, "undefined"].includes(product.product_image)
            ? "https://i.imgur.com/Lh2vKTL.png"
            : product.product_image,
        ],
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
      // /** Tắt loading */
      // // setLoading(false);
      // /**
      //  * Hiển thị text tiền trình
      //  */
      // setLoadingText("The product has been created successfully!");
      // /**
      //  * Xoá text sau 5s
      //  */
      // // setTimeout(() => {
      // //   setLoadingText("");
      // // }, 5000);
      // setFinishInstalling(true);
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
    /** update message đã tạo sản phẩm thành công */
    setLoadingText("Created all products!");

    /**
     * Xoá text sau 5s
     */
    setTimeout(() => {
      setLoadingText("");
      setLoading(false);
      setFinishInstalling(true);
    }, 5000);

    // fetchListPages(ACCESS_TOKEN, PAGE_ID);
    // console.log("🎉 Hoàn tất tạo tất cả sản phẩm!");
  };
  /**
   *  Lấy thông tin page merchant
   * @param ACCESS_TOKEN
   * @param PAGE_ID
   */
  const fetchListPages = async (ACCESS_TOKEN: string, PAGE_ID: string) => {
    setLoadingText("Syncing product...");
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
      // createState(ACCESS_TOKEN, PAGE_ID, EXTERNAL_BUSINESS_ID);
      /**
       * Sync data lên fb
       */
      // syncDataToFbSMC(ACCESS_TOKEN, EXTERNAL_BUSINESS_ID);
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
    setLoadingText("Starting to sync product with Facebook...");
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
        "The product has been synced to FB SMC! After synchronization, it may take up to 24 hours for your product to appear on Messenger or up to 2 hours to be linked to Facebook Livestream."
      );
      /**
       * Xoá text sau 5s
       */
      setTimeout(() => {
        setLoadingText("");
        setFinishInstalling(true);
      }, 5000);
    }
  };

  const fetchDocument = async () => {
    const RESPONSE = await fetch("/api/documents");
    console.log(RESPONSE, "response");
    const DATA = await RESPONSE.json();
    console.log(DATA, "DATA");
    return DATA?.document;
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

    const RESULT = await fetchDocument();
    console.log(RESULT, "RESULT");
    /** Tạo mock data file mới với dữ liệu đã cập nhật */
    const MOCK_DATA_FILE = new File(
      [RESULT],
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

      console.log(DATA, "DATA");

      if (DATA?.code === 200) {
        return true;
      } else {
        return false;
      }

      /** Lấy thông tin AGENT */
      // fetchAgent(ACCESS_TOKEN, ORG_ID, PAGE_ID);
    } catch (error) {
      console.error("Loi khi lay danh sach Pages:", error);
      return "error";
    }
  };

  /**
   * Handle connect page
   * @param PAGE_ID
   */
  const handleConnectPage = async (PAGE_ID: string) => {
    /**================== Cập nhật trạng thái =================== */
    /** Bắt đầu loading */
    setLoading(true);
    /** Hiện text tiến trình */
    setLoadingText("Start installing...");

    /**================== Login =================== */
    /** Cập nhạt Text tiến trình */
    setLoadingText("Installing...");
    /**  */
    const ACCESS_TOKEN = await onLogin(PAGE_ID);
    /** Kiểm tra token được return */
    if (ACCESS_TOKEN === "error" || !ACCESS_TOKEN) {
      /** Gọi handle Error */
      handleError("Token không chính xác");

      return;
    }
    /** Lưu token và state */
    setChatboxToken(ACCESS_TOKEN);
    /** ======================= Lấy danh sách page Retion ======================== */
    setLoadingText("Fetching organization...");
    /** Danh sách Tổ chức */
    const LIST_ORG = await fetchListOrg(ACCESS_TOKEN);
    /** Nếu không có Tổ chức, hoặc lỗi error */
    if (LIST_ORG === "error" || !LIST_ORG) {
      /**
       * Gọi handle Error
       */
      handleError("Lấy Danh sách Tổ chức không thành công!");

      return;
    }

    setOrganization(LIST_ORG);
  };

  return (
    <div className="w-full h-full p-4">
      {/* Nhúng component xử lý kết nối */}
      <Suspense fallback={<div>Đang xử lý kết nối...</div>}>
        <ConnectHandler
          onComplete={(e) => {
            console.log("Xử lý token hoàn tất");
            setAccessToken(e);
          }}
        />
      </Suspense>

      {access_token && !loading && !loading_text && !finish_installing && (
        <div className="h-full">
          <h2>Select Page</h2>
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
          <h2>Select Organization</h2>
          <div className="flex flex-col gap-y-2">
            {organization.map((org: any) => (
              <div
                key={org?.org_id}
                className="flex items-center gap-x-2 border border-gray-200 hover:bg-gray-100 rounded p-2 cursor-pointer"
                onClick={() => {
                  console.log(org, "checkkk", chatbox_token);
                  handleConnectToChatBox(
                    org?.org_id,
                    selected_page,
                    chatbox_token
                  );
                  setOrganization([]);
                }}
              >
                <img
                  src={org?.org_info?.org_avatar || "./imgs/BBH.png"}
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
            <Loading size="lg" />
          </div>
        )}
        {
          <div className="flex items-center justify-center h-12">
            <p className="text-lg ">{loading_text}</p>
          </div>
        }
        {finish_installing && (
          <div className="flex flex-col items-center justify-center h-12">
            <p className="text-lg text-green-500">Kết nối thành công!</p>
            <a
              // href="https://m.me/414786618395170"
              href={`https://merchant.vn/login?chat_access_token=${chatbox_token}&redirect=https://merchant.vn/a/product`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white px-4 py-2 rounded-md bg-blue-500"
            >
              Mở Merchant
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectInstall;
