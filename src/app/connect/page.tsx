"use client";

import { Suspense, useEffect, useState } from "react";
import { find, get, has, keys } from "lodash";

import ConnectHandler from "../components/ConnectHandler";
import Loading from "@/components/loading/Loading";
import { UserProfile } from "@/types";
import { apiCommon } from "@/services/fetchApi";

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

  /** Partner Token */
  const [partner_token, setPartnerToken] = useState("");

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
      const END_POINT = "public/oauth/facebook/login";
      /** Body */
      const BODY = { access_token: access_token };
      /** Header */
      const HEADERS = {};
      /** RES */
      const DATA = await apiCommon({
        end_point: END_POINT,
        method: "POST",
        body: BODY,
        headers: HEADERS,
        service_type: "setting",
      });

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
      const ORG_END_POINT = `app/organization/read_org`;
      /**
       * Lay danh sach org
       */
      const ORG_DATA = await apiCommon({
        end_point: ORG_END_POINT,
        method: "POST",

        headers: {
          Authorization: ACCESS_TOKEN,
        },
        service_type: "billing",
      });
      /**
       * Parse data
       */
      console.log(ORG_DATA, "org_data");

      if (ORG_DATA?.code !== 200) {
        return "error";
      }
      return ORG_DATA?.data;
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
      await addPage(ORG_ID, PAGE_ID, ACCESS_TOKEN);
    }

    /** ================== Lấy danh sách AGENT ==================== */
    /** Cập nhật tin nhắn */
    setLoadingText("Đang cài đặt trợ lý ảo ...");
    /** Thông tin info */
    let agent_info = await fetchAgent(ORG_ID);

    /** Nếu không có thống tin trợ lý tin thì Tạo mới */
    if (!agent_info) {
      /** Kết quả khởi tạo trợ lý Ảo */
      const AGENT_CREATE_RESULT = await createAgent(ACCESS_TOKEN, ORG_ID);

      /** Nếu createAgent trả về true hoặc không có ID => fetch lại agent_info */
      if (AGENT_CREATE_RESULT) {
        /** Lấy thông tin trợ lý ảo */
        agent_info = await fetchAgent(ORG_ID);

        if (!agent_info) {
          return handleError(
            "Tạo trợ lý ảo thành công nhưng lấy thông tin thất bại!"
          );
        }
      }
    }
    /** ================== Cập nhật Setting ==================== */
    /** Cập nhật text */
    setLoadingText("Đang cập nhật Thiết lập trợ lý ảo ...");
    /** Cập nhật Setting  */
    await updateSettingPage({
      ACCESS_TOKEN,
      PAGE_ID,
      AGENT_ID: agent_info,
    });

    /** ========== Tải lên file tài liệu ===========*/
    /** Update text */
    setLoadingText("Tải lên tài liệu ...");
    /** Gọi hàm upload tài liệu */
    const UPLOAD_DATA = await uploadData(ACCESS_TOKEN, ORG_ID, agent_info);
    /** Kiểm tra thông tin lỗi */

    /** ================ Thêm tài liệu cho Trợ lý ảo ============= */
    /** Cập nhật text */
    setLoadingText("Thêm tài liệu cho trợ lý ảo ...");
    /** Gọi hàm add knowledge */
    await addKnowledge(ACCESS_TOKEN, ORG_ID, agent_info, UPLOAD_DATA);

    /** Cập nhật text message */

    setLoadingText("Cài đặt Chatbox thành công!");
  };

  const handleConnectToMerchant = async (
    ORG_ID: string,
    PAGE_ID: string,
    ACCESS_TOKEN: string
  ) => {
    /** Cập nhật Loading Text */
    setLoadingText("Đang kết nối với Merchant");
    /** Gọi hàm lấy Token Partner */
    const PARTNER_TOKEN = await fetchTokenPartner(
      ACCESS_TOKEN,
      ORG_ID,
      PAGE_ID
    );

    setPartnerToken(PARTNER_TOKEN);
    /** Gọi hàm lấy Token merchant */
    const TOKEN_MERCHANT = await fetchTokenMerchant(PARTNER_TOKEN, PAGE_ID);
    setTokenMerchant(TOKEN_MERCHANT);

    /** Tạo sản phẩm đồng bộ sang Merchant */
    setLoadingText("Đang đồng bộ sản phẩm với Merchant");
    /** GỌi hàm Tạo sản phẩm Merchant */
    await createAllProducts(TOKEN_MERCHANT, PAGE_ID);
  };

  /** Function chính
   * @param ORG_ID
   * @param PAGE_ID
   * @param ACCESS_TOKEN
   */
  const mainFunction = async (
    ORG_ID: string,
    PAGE_ID: string,
    ACCESS_TOKEN: string
  ) => {
    try {
      /** Kết nối Chatbox */
      await handleConnectToChatBox(ORG_ID, PAGE_ID, ACCESS_TOKEN);
      /** Kết nối Merchant */
      await handleConnectToMerchant(ORG_ID, PAGE_ID, ACCESS_TOKEN);
    } catch (error) {
      /** Hiện lỗi */
      handleErrorByCode(error, handleError);
    }
  };

  /** Hàm xử lý Error
   * @param error
   * @param handleError
   */
  function handleErrorByCode(
    error: any,
    handleError: (msg: string) => void
  ): void {
    /** Nếu không có lỗi báo lỗi không xác định */
    if (!error) {
      handleError("Đã xảy ra lỗi không xác định.");
      return;
    }
    /** Kiểm tra loại lỗi */
    const ERROR =
      typeof error === "string" ? error : error?.code || error?.message;
    /** Hiện thông tin lỗi */
    switch (ERROR) {
      case "REACH_QUOTA.PAGE":
        handleError(
          "Đã đạt giới hạn Trang trong Tổ chức, thêm Trang không thành công!"
        );
        break;

      case "LIMIT_DOCUMENT":
        handleError(
          "Đã đạt giới hạn Tải lên tài liệu của Tổ chức, Thêm tài liệu không thành công!"
        );
        break;

      case "LIMIT_SIZE":
        handleError(
          "Dung lượng file tải lên quá lớn, Thêm tài liệu không thành công!"
        );
        break;

      case "jwt malformed":
        handleError("Token không hợp lệ, Kết nối không thành công!");
        break;

      default:
        handleError(`Đã xảy ra lỗi: ${error?.message || error}`);
        break;
    }
  }

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
    /**
     * Domain add page
     */
    const END_POINT = `app/owner_ship/read_page`;
    /** Khai báo body */
    const BODY = {
      org_id: ORG_ID,
    };
    /** Khai báo Header */
    const HEADERS = {
      Authorization: ACCESS_TOKEN,
    };
    /** Thêm page vào Tổ chức */
    const DATA = await apiCommon({
      end_point: END_POINT,
      method: "POST",
      body: BODY,
      headers: HEADERS,
      service_type: "billing",
    });
    /** Throw lỗi */
    if (DATA?.code !== 200) {
      throw DATA?.message;
    }
    /** Check Tồn tại page */
    const EXISTS = DATA?.data.some(
      (item: IPageProps) => item.page_id === PAGE_ID
    );
    return EXISTS;
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
    /**
     * Domain add page
     */
    const END_POINT = `app/owner_ship/add_page`;
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
    const DATA = await apiCommon({
      end_point: END_POINT,
      method: "POST",
      body: BODY,
      headers: HEADERS,
      service_type: "billing",
    });
    /** Throw lỗi */
    if (DATA?.code !== 200) {
      throw DATA?.message;
    }
    return true;
  };

  /**
   * Fetch Agent
   * @param ORG_ID
   */
  const fetchAgent = async (ORG_ID: string) => {
    /** Domain add page*/
    const END_POINT = `app/agent/get_agent`;
    /** Khai báo body */
    const BODY = {
      org_id: ORG_ID,
    };

    /** Call API lấy danh sách agent */
    const DATA = await apiCommon({
      end_point: END_POINT,
      method: "POST",
      body: BODY,
      service_type: "llm_no_proxy",
    });

    /** Throw lỗi */
    if (DATA?.code !== 200) {
      throw DATA?.message;
    }
    if (DATA?.data?.length === 0) {
      /** Tạo agent */

      return false;
    } else {
      /** Nếu có rồi thì chọn agent 1 và thêm kiến kiến thức */
      const AGENT_ID = DATA?.data[0]?.fb_page_id;
      return AGENT_ID;
    }
  };
  /** Cập nhật setting page Bật trợ lý ảo và chọn Trợ lý ảo mới tạo
   * @param ACCESS_TOKEN
   * @param ORG_ID
   * @param PAGE_ID
   * @param AGENT_ID
   */
  const updateSettingPage = async ({
    ACCESS_TOKEN,
    PAGE_ID,
    AGENT_ID,
  }: {
    ACCESS_TOKEN: string;
    PAGE_ID: string;
    AGENT_ID: string;
  }) => {
    /** Domain add page*/
    const END_POINT = `app/page/update_page_setting`;
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
    const DATA = await apiCommon({
      end_point: END_POINT,
      method: "POST",
      body: BODY,
      headers: HEADERS,
      service_type: "service",
    });
    /** Throw lỗi */
    if (DATA?.code !== 200) {
      throw DATA?.message;
    }
    /** return true */
    return true;
  };

  const fetchTokenPartner = async (
    ACCESS_TOKEN: string,
    ORG_ID: string,
    PAGE_ID: string
  ) => {
    /** Domain add page */
    const DOMAIN = `app/page/get_page_info_to_chat`;
    /** Khai báo body */
    const BODY = {
      org_id: ORG_ID,
      list_page_id: [PAGE_ID],
    };
    /** Khai báo Header */
    const HEADERS = {
      Authorization: ACCESS_TOKEN,
    };
    /** fetch Data*/
    const DATA = await apiCommon({
      end_point: DOMAIN,
      method: "POST",
      body: BODY,
      headers: HEADERS,
      service_type: "service",
    });

    /** Throw lỗi */
    if (DATA?.code !== 200) {
      throw DATA?.message;
    }

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
    return PARTNER_TOKEN;

    // fetchTokenMerchant(PARTNER_TOKEN, PAGE_ID);
  };

  /** Lấy client ID
   * @param page_id
   * @returns
   */
  const fetchClientId = async (page_id: string) => {
    /** Domain Merchant */
    const DOMAIN = `embed/conversation/init_identify?name=anonymous&page_id=${page_id}`;

    const RES = await apiCommon({
      end_point: DOMAIN,
      method: "GET",
      service_type: "public",
    });
    /** Nếu code không bằng 200 thiết lập lỗi */
    if (RES?.code !== 200) {
      throw RES?.message;
    }
    console.log(RES, "RESPONSE");
    /** Trả ra client ID */
    return RES?.data;
  };

  /**
   * Hàm lấy token merchant
   * @param ACCESS_TOKEN
   * @param PAGE_ID
   */
  const fetchTokenMerchant = async (ACCESS_TOKEN: string, PAGE_ID: string) => {
    /** Chat Domain */
    const END_POINT = `v1/public/chatbox/get_config`;

    /** Khai báo body*/
    const CLIENT_ID = await fetchClientId(PAGE_ID);

    /** Body*/
    const BODY = {
      access_token: ACCESS_TOKEN,
      client_id: CLIENT_ID,
      secret_key: "6f8b22eebe1d4d93b2f4a618901df020",
    };
    /** fetch Data*/
    const DATA = await apiCommon({
      end_point: END_POINT,
      method: "POST",
      body: BODY,
      service_type: "merchant",
    });

    /** Throw lỗi */
    if (DATA?.code !== 200) {
      throw DATA?.message;
    }
    /** Token merchatn*/
    const TOKEN_MERCHANT = DATA?.data?.access_token;
    /** Return Token  */
    return TOKEN_MERCHANT;
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
    /** Domain Tạo sản phẩm */
    const END_POINT = `product/create_product`;

    /** Khai báo body */
    const BODY = {
      name: product.name, // Thay tên sản phẩm
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
    const DATA = await apiCommon({
      end_point: END_POINT,
      method: "POST",
      body: BODY,
      headers: HEADERS,
      service_type: "merchant_product",
    });
    console.log(DATA, "DATA");
    /** Throw lỗi */
    // if (DATA?.code !== 200) {
    //   throw DATA?.message;
    // }

    console.log(`✅ Tạo sản phẩm ${product.name} thành công`, DATA);
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
    setLoadingText("Đồng bộ sản phẩm thành công");
    /** Tắt loading */
    setLoading(false);
    /**
     * Xoá text sau 5s
     */
    setTimeout(() => {
      setLoadingText("");
      setFinishInstalling(true);
    }, 2000);

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
      const END_POINT = `v1/apps/facebook/pages`;
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
      const DATA = await apiCommon({
        end_point: END_POINT,
        method: "POST",
        headers: HEADERS,
        service_type: "merchant",
      });
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
    const DOMAIN = `v1/apps/facebook/create_state`;
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
    const DATA = await apiCommon({
      end_point: DOMAIN,
      method: "POST",
      body: BODY,
      headers: HEADERS,
      service_type: "merchant",
    });
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
      const DOMAIN = `product/sync_product_facebook`;
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
      const DATA = await apiCommon({
        end_point: DOMAIN,
        method: "POST",
        body: BODY,
        headers: HEADERS,
        service_type: "merchant_product",
      });
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
    /** Lấy FILE Document từ API */
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

    /** Đường dẫn API upload file*/
    const END_POINT = `app/document/upload?org_id=${ORG_ID}`;
    /** Tạo thành Form Data */
    const FORM_DATA = new FormData();
    /** Thêm data vào form */
    FORM_DATA.append("file", MOCK_DATA_FILE);

    /** Fetch API */
    const RES = await fetch(`https://chatbox-llm.botbanhang.vn/${END_POINT}`, {
      method: "POST",
      headers: {
        Authorization: ACCESS_TOKEN,
      },
      body: FORM_DATA,
    });

    /** Chuyển dữ liệu trả về thành JSON */
    const DATA = await RES.json();
    /** Nếu có lỗi thì throw data*/
    if (DATA?.code !== 200) throw DATA.message;
    /** Trả về path của tài liệu */
    return DATA?.data?.d_embedding_path;
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
    /** Engpoint */
    const END_POINT = `workspace/${AGENT_ID}/update-embeddings?org_id=${ORG_ID}`;

    /** Gọi API cập nhật embedding */

    /**
     *  Gọi API cập nhật embedding
     */
    const RES = await apiCommon({
      end_point: END_POINT,
      method: "POST",
      body: {
        adds: [FILE_NAME],
      },
      service_type: "llm_ai",
    });

    console.log(RES, "RES");
    /** Throw lỗi */
    if (RES?.code !== 200) throw RES.message;
    /** Return true */
    return true;
  };
  /**
   * Tạo Agent
   * @param ACCESS_TOKEN
   * @param ORG_ID
   */
  const createAgent = async (ACCESS_TOKEN: string, ORG_ID: string) => {
    /** Domain add page*/
    const END_POINT = `app/agent/create_agent?org_id=${ORG_ID}`;
    /**  Body */
    const BODY = {
      ai_agent_name: "Agent 1",
      description: "Agent 1",
    };
    /** Header */
    const HEADERS = {
      Authorization: ACCESS_TOKEN,
    };
    /** Fetch data*/
    const DATA = await apiCommon({
      end_point: END_POINT,
      method: "POST",
      service_type: "llm_no_proxy",
      body: BODY,
    });
    /** Nếu code !== 200 thì throw lỗi */
    if (DATA?.code !== 200) {
      throw DATA?.message;
    }
    return true;
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
    setLoadingText("Bắt đầu cài đặt");

    /**================== Login =================== */
    /** Cập nhạt Text tiến trình */
    setLoadingText("Đang cài đặt");
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
    setLoadingText("Đang lấy dữ liệu tổ chức");
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
    /** Lưu danh sách Tổ chức */
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
          <h2>Chọn Trang của bạn</h2>
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
            {pages.length === 0 && (
              <div className="flex flex-col gap-y-2 w-full items-center py-4">
                <h3>Không tìm thấy trang</h3>
                <p>
                  Bạn cần tạo một trang Facebook trước khi tiếp tục thiết lập.
                </p>
              </div>
            )}
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
                  mainFunction(org?.org_id, selected_page, chatbox_token);
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
              href={`https://merchant.vn/login?chat_access_token=${partner_token}&redirect=https://merchant.vn/a/product`}
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
