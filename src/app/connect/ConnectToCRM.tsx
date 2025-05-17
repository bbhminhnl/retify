"use client";

import { create, find, forEach, get, has, keys, set } from "lodash";
import { generateQRCodeImage, toRenderDomain } from "@/utils";
import { useEffect, useState } from "react";

import Loading from "@/components/loading/Loading";
import { UserProfile } from "@/types";
import { apiCommon } from "@/services/fetchApi";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

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

const ConnectToCRM = ({
  access_token_global,
  onFinish,
  access_token_chatbox,
  page_name,
  document,
  updateQRCode,
  setParentPageId,
  is_need_to_update_crm,
  setIsNeedToUpdateCrm,
}: {
  access_token_global: string;
  onFinish?: (page_id: string, org_id: string) => void;
  access_token_chatbox?: string;
  page_name?: string;
  document?: string;
  updateQRCode?: (value: any) => void;
  parent_page_id?: string;
  setParentPageId?: (value: string) => void;
  /** is_need_to_update_crm */
  is_need_to_update_crm?: boolean;
  /** setIsNeedToUpdateCrm */
  setIsNeedToUpdateCrm?: (value: boolean) => void;
}) => {
  /** Đa ngôn ngữ */
  const t = useTranslations();
  /** State accessToken*/
  const [access_token, setAccessToken] = useState<any>("");
  /** Danh sách page*/
  const [pages, setPages] = useState<UserProfile[]>([]);
  /** Danh sách product */
  const [products, setProducts] = useState<Product[]>([]);
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
  /** Chọn Tổ chức */
  const [selected_organization, setSelectedOrganization] = useState("");

  /** Finish Installing */
  const [finish_installing, setFinishInstalling] = useState(false);

  /** Partner Token */
  const [partner_token, setPartnerToken] = useState("");

  /** Domain */
  const [domain, setDomain] = useState("");

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

    toast.error(message);
    /** Set timeout */
    setTimeout(() => setLoadingText(""), 2000);
  };

  // useEffect(() => {
  //   /** Nhậnd dược token global */
  //   if (access_token_global) {
  //     setAccessToken(access_token_global);
  //   }
  // }, [access_token_global]);

  useEffect(() => {
    if (access_token_chatbox) {
      console.log(access_token_chatbox);

      // fetchListOrg(access_token_chatbox);
      handleLoginChatbox(access_token_chatbox);
    }
  }, [access_token_chatbox]);

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
   * Gọi API lấy dữ liệu workspace
   * @returns
   */
  const fetchWorkSpace = async (page_id: string, org_id: string) => {
    /**
     * Đường dẫn API lấy dữ liệu workspace
     */
    const END_POINT = `workspace/${page_id}?org_id=${org_id}`;
    /**
     * Gọi API lấy dữ liệu workspace
     */
    try {
      const RES = await apiCommon({
        end_point: END_POINT,
        service_type: "llm_ai",
        headers: {},
        method: "GET",
      });

      /** Chuyển dữ liệu thành dạng cố định
       * để hiển thị được tên file
       */

      console.log(RES, "RES");

      /** Trả về danh sách cần loại bỏ */
      return RES?.data?.workspace?.documents || [];
    } catch (error) {
      console.error("Error fetching workspace:", error);
      return [];
    }
  };

  /**
   * Gọi API cập nhật embedding
   */
  const fetchUpdateEmbedding = async (
    adds: string[],
    deletes: string[],
    page_id: string,
    org_id: string
  ) => {
    setLoading(true);

    /**
     * Đường dẫn API xoá folder
     */
    const END_POINT = `workspace/${page_id}/update-embeddings?org_id=${org_id}`;

    /**
     * Gọi API cập nhật embedding
     */
    try {
      /**
       *  Gọi API cập nhật embedding
       */
      await apiCommon({
        end_point: END_POINT,
        method: "POST",
        body: {
          adds,
          deletes,
        },
        service_type: "llm_ai",
      });
    } catch (error) {
    } finally {
    }
  };

  const fetchLocalFiles = async (org_id: string) => {
    /**
     * Đường dẫn API lấy dữ liệu local files
     */
    const END_POINT = `app/document/local_files?org_id=${org_id}`;

    const RES = await apiCommon({
      end_point: END_POINT,
      service_type: "llm_no_proxy",
      method: "POST",
      body: {
        /** fix cứng */
        d_parent_id: { $exists: false },
      },
    });

    return RES?.data;
  };

  /**
   * API xoá tài liệu
   * @param d_id  id Tài liệu
   */
  const fetchDeleteDocument = async (d_id: string[], org_id: string) => {
    setLoading(true);
    /**
     * Đường dẫn API xoá tài liệu
     */
    const END_POINT = `app/document/remove_document?org_id=${org_id}`;

    /**
     * Gọi API cập nhật embedding
     */
    try {
      /**
       * Gọi API cập nhật XOÁ tài liệu
       */

      await apiCommon({
        end_point: END_POINT,
        method: "DELETE",
        body: { d_id: d_id },
        service_type: "llm_no_proxy",
      });
    } catch (error) {
      console.error("Error updating embeddings:", error);
      /**
       * Hiển thị toast thông báo lỗi
       */
      // dispatch(
      //   showToast({
      //     message: t('delete_failed_maybe_system_error'),
      //     type: 'error',
      //   })
      // )
    } finally {
      /**
       * Kết thúc loading
       */
      setLoading(false);
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
    setLoadingText(t("adding_page_to_organization"));
    /** Kiểm tra page đã tồn tại chưa */
    const IS_EXIST_PAGE = await checkExistPage(ORG_ID, PAGE_ID, ACCESS_TOKEN);
    /** Nếu chưa tồn tại thì thêm page */
    if (!IS_EXIST_PAGE) {
      await addPage(ORG_ID, PAGE_ID, ACCESS_TOKEN);
    }

    /** ================== Lấy danh sách AGENT ==================== */
    /** Cập nhật tin nhắn */
    setLoadingText(t("setting_up_virtual_assistant"));
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
          return handleError(t("assistant_created_but_fetch_failed"));
        }
      }
    }
    /** ================== Cập nhật Setting ==================== */
    /** Cập nhật text */
    setLoadingText(t("updating_virtual_assistant_settings"));
    /** Cập nhật Setting  */
    await updateSettingPage({
      ACCESS_TOKEN,
      PAGE_ID,
      AGENT_ID: agent_info,
    });

    /** ========== Tải lên file tài liệu ===========*/
    /** Update text */
    setLoadingText(t("uploading_document"));

    /** ================== Lấy dữ liệu workspace, Xoá nếu là tài liệu retify, Cập nhật embedding ==================== */
    /** Lấy dữ liệu workspace */
    const WORK_SPACE_DATA = await fetchWorkSpace(agent_info, ORG_ID);
    /** Lọc những tài liệu Trùng tên với data của retify */
    const FILTERED_DATA =
      WORK_SPACE_DATA &&
      WORK_SPACE_DATA.filter((item: any) =>
        item?.docpath.includes("retify_started_knowledge.txt")
      );
    /** Khởi tạo List cần xoá */
    let deletes = [];
    /** Thêm tài liệu vào list */
    deletes =
      (FILTERED_DATA && FILTERED_DATA.map((item: any) => item?.docpath)) || [];
    /** Tiến hành xoá tài liệu Trùng với retify */
    await fetchUpdateEmbedding([], deletes, agent_info, ORG_ID);
    /** Danh sách tài liệu tỏng local file */
    const LOCAL_FILES = await fetchLocalFiles(ORG_ID);

    /** Lấy ra những tài liệu Trùng với retify */
    const FILTERED_LOCAL_FILES = LOCAL_FILES.filter(
      (item: any) => item?.d_name === "retify_started_knowledge.txt"
    );
    console.log(FILTERED_LOCAL_FILES, "FILTERED_LOCAL_FILES");
    /** Tạo danh sách d_id */
    const LIST_D_ID = FILTERED_LOCAL_FILES.map((item: any) => item?.d_id);
    /** Xoá tài liệu */
    forEach(LIST_D_ID, async (item: any) => {
      fetchDeleteDocument(item, ORG_ID);
    });
    /** Gọi hàm upload tài liệu */
    const UPLOAD_DATA = await uploadData(ACCESS_TOKEN, ORG_ID, agent_info);

    /** Kiểm tra thông tin lỗi */

    /** ================ Thêm tài liệu cho Trợ lý ảo ============= */
    /** Cập nhật text */
    setLoadingText(t("adding_document_to_assistant"));
    /** Gọi hàm add knowledge */
    await addKnowledge(ACCESS_TOKEN, ORG_ID, agent_info, UPLOAD_DATA);

    /** Cập nhật text message */

    setLoadingText(t("chatbox_setup_success"));
  };

  const handleConnectToMerchant = async (
    ORG_ID: string,
    PAGE_ID: string,
    ACCESS_TOKEN: string,
    DOMAIN: string
  ) => {
    /** Cập nhật Loading Text */
    setLoadingText(t("connecting_to_merchant"));
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
    setLoadingText(t("syncing_product_with_merchant"));
    /** GỌi hàm Tạo sản phẩm Merchant */
    await createAllProducts(TOKEN_MERCHANT, PAGE_ID, ORG_ID, DOMAIN);
  };

  /**
   *  Hàm tạo page
   * @param ORG_ID
   * @param ACCESS_TOKEN
   * @param DOMAIN
   * @returns
   */
  const createPage = async (
    ORG_ID: string,
    ACCESS_TOKEN: string,
    DOMAIN: string
  ) => {
    setLoadingText(t("creating_page"));
    /**
     * Endpoint tạo page
     */
    const END_POINT = "app/page/create_website_page";
    /** Tạo QR code */
    const BASE_64_IMG = await generateQRCodeImage(`https://${DOMAIN}`);
    /**
     * Update QR code
     */
    updateQRCode && updateQRCode(BASE_64_IMG);
    /** Tạo page */
    const RES = await apiCommon({
      end_point: END_POINT,
      method: "POST",
      body: {
        org_id: ORG_ID,
        name: DOMAIN,
      },
      headers: {
        Authorization: ACCESS_TOKEN,
      },
      service_type: "service",
    });
    return RES?.data?.fb_page_id;
  };

  const changePageName = async (
    page_id: string,
    name: string,
    ACCESS_TOKEN: string
  ) => {
    apiCommon({
      end_point: "app/page/update_page_setting",
      method: "POST",
      body: {
        page_id,
        name,
      },
      headers: {
        Authorization: ACCESS_TOKEN,
      },
      service_type: "service",
    });
  };

  /** Function chính
   * @param ORG_ID
   * @param PAGE_ID
   * @param ACCESS_TOKEN
   */
  const mainFunction = async (ORG_ID: string, ACCESS_TOKEN: string) => {
    try {
      /** Cập nhật org id */
      setSelectedOrganization(ORG_ID);
      /** Cập nhật loading */
      setLoading(true);

      /** Kiểm tra trong list page đã có page dạng **.retify.ai chưa */
      const LIST_INSTALLED_PAGE = await checkInstalledPage(
        ORG_ID,
        ACCESS_TOKEN
      );
      console.log(LIST_INSTALLED_PAGE, "LIST_INSTALLED_PAGE");
      /** Page id */
      let list_page = [];
      /** Lưu page trùng với tên mới tạo */
      if (LIST_INSTALLED_PAGE) {
        list_page = LIST_INSTALLED_PAGE?.filter((item: any) =>
          item?.page_info?.name.includes(".retify.ai")
        );
      }
      console.log(list_page, "LIST_PAGE_ID");
      /** Domain */
      const DOMAIN = toRenderDomain(page_name || "");

      /** check page
       * Nếu không có page nào trùng với form tên page mới tạo
       */
      if (list_page.length === 0 || !list_page) {
        /** Tạo page */
        const PAGE_ID = await createPage(ORG_ID, ACCESS_TOKEN, DOMAIN);
        /** Cập nhật page id */
        setParentPageId && setParentPageId(PAGE_ID);
        /** Kết nối Chatbox */
        await handleConnectToChatBox(ORG_ID, PAGE_ID, ACCESS_TOKEN);
        /** Kết nối Merchant */
        await handleConnectToMerchant(ORG_ID, PAGE_ID, ACCESS_TOKEN, DOMAIN);
      }

      /** check page
       * Nếu có 1 page trùng với form tên page mới tạo
       */
      if (list_page.length > 0) {
        /** Cập nhật page id */
        setParentPageId && setParentPageId(list_page[0]?.page_id);

        /** Đổi tên page */
        await changePageName(list_page[0]?.page_id, DOMAIN, ACCESS_TOKEN);

        /** Kết nối Chatbox */
        await handleConnectToChatBox(
          ORG_ID,
          list_page[0]?.page_id,
          ACCESS_TOKEN
        );
        /** Kết nối Merchant */
        await handleConnectToMerchant(
          ORG_ID,
          list_page[0]?.page_id,
          ACCESS_TOKEN,
          DOMAIN
        );
      }
    } catch (error) {
      /** Hiện lỗi */
      handleErrorByCode(error, handleError);
      setLoading(false);
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
      handleError(t("unknown_error_occurred"));
      return;
    }
    /** Kiểm tra loại lỗi */
    const ERROR =
      typeof error === "string" ? error : error?.code || error?.message;
    /** Hiện thông tin lỗi */
    switch (ERROR) {
      case "REACH_QUOTA.PAGE":
        handleError(t("org_page_limit_reached"));
        break;

      case "LIMIT_DOCUMENT":
        handleError(t("org_doc_upload_limit_reached"));
        break;

      case "LIMIT_SIZE":
        handleError(t("file_too_large"));
        break;

      case "jwt malformed":
        handleError(t("invalid_token_connection_failed"));
        break;

      default:
        handleError(`${t("error_occurred")}: ${error?.message || error}`);
        break;
    }
  }

  /**
   * Hàm chọn BM để add Page vào
   * @param ORG_ID
   * @param PAGE_ID
   * @param ACCESS_TOKEN
   */
  const checkInstalledPage = async (ORG_ID: string, ACCESS_TOKEN: string) => {
    console.log(ACCESS_TOKEN, "access_token");

    /** Domain add page*/
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
    /** Return list data */
    return DATA.data;
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
  const createAllProducts = async (
    ACCESS_TOKEN: string,
    PAGE_ID: string,
    ORG_ID: string,
    DOMAIN: string
  ) => {
    /** Dùng Promise.all để gửi nhiều request cùng lúc */
    await Promise.all(
      products.map((product) =>
        createProductMerchant(ACCESS_TOKEN, PAGE_ID, product)
      )
    );
    /** update message đã tạo sản phẩm thành công */
    setLoadingText(t("product_sync_success"));
    /** Tạo QR code */
    const BASE_64_IMG = await generateQRCodeImage(`https://${DOMAIN}`);

    /**
     * Update QR code
     */
    updateQRCode && updateQRCode(BASE_64_IMG);

    onFinish && onFinish(PAGE_ID, ORG_ID);

    /**
     * Xoá text sau 5s
     */
    setTimeout(() => {
      // setLoadingText("");
      // setFinishInstalling(true);
      /** Tắt loading */
      setLoading(false);
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
    setLoadingText(t("syncing_products"));
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
    setLoadingText(t("sync_product_facebook_start"));
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
      setLoadingText(t("sync_product_facebook_note"));
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
    console.log(document, "documents");
    /** Tạo mock data file mới với dữ liệu đã cập nhật */
    const MOCK_DATA_FILE = new File(
      [document?.toString() || ""],
      "retify_started_knowledge.txt",
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
      headers: HEADERS,
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
  const handleLoginChatbox = async (access_token: string) => {
    /**================== Cập nhật trạng thái =================== */
    /** Bắt đầu loading */
    setLoading(true);
    /** Hiện text tiến trình */
    setLoadingText(t("starting_setup"));

    /**================== Login =================== */
    /** Cập nhạt Text tiến trình */
    setLoadingText(t("setting_up"));
    /** Kiểm tra token được return */
    if (access_token === "error" || !access_token) {
      /** Gọi handle Error */
      handleError(t("incorrect_token"));

      return;
    }
    /** Lưu token và state */
    setChatboxToken(access_token);
    /** ======================= Lấy danh sách page Retion ======================== */
    setLoadingText(t("fetching_organization_data"));
    /** Danh sách Tổ chức */
    const LIST_ORG = await fetchListOrg(access_token);
    /** Nếu không có Tổ chức, hoặc lỗi error */
    if (LIST_ORG === "error" || !LIST_ORG) {
      /**
       * Gọi handle Error
       */
      handleError(t("fetch_organization_list_failed"));

      return;
    }
    /** Nếu chỉ có 1 tổ chức, thì auto pick luôn, tránh user mới phải thao tác */
    if (LIST_ORG.length === 1) {
      /** Tắt loading và call function luôn */
      setLoading(false);
      setLoadingText("");
      await mainFunction(LIST_ORG[0].org_id, access_token);
      return;
    }

    /** Lưu danh sách Tổ chức */
    setOrganization(LIST_ORG);
    setLoading(false);
    setLoadingText("");
  };

  return (
    <div className="w-full h-full">
      {/* Nhúng component xử lý kết nối */}
      {/* <Suspense fallback={<div>Đang xử lý kết nối...</div>}>
        <ConnectHandler
          onComplete={(e) => {
            console.log("Xử lý token hoàn tất");
            setAccessToken(e);
          }}
        />
      </Suspense> */}

      {/* {access_token &&
        !loading &&
        !loading_text &&
        !finish_installing &&
        organization?.length === 0 && (
          <div className="h-full">
            <h4>{t("select_your_page")}</h4>
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
                  <div className="flex flex-col text-left">
                    <h4 className="truncate">{page.name}</h4>
                    <p className="text-sm truncate">{page.id}</p>
                  </div>
                </div>
              ))}
              {pages.length === 0 && (
                <div className="flex flex-col gap-y-2 w-full items-center py-4">
                  <h3>{t("page_not_found")}</h3>
                  <p>{t("create_fb_page_first")}</p>
                </div>
              )}
            </div>
          </div>
        )} */}
      {organization?.length > 1 && !loading && (
        <div className="h-full w-full">
          <h4>{t("select_your_organization")}</h4>
          <div className="flex flex-col gap-y-2 w-full">
            {organization.map((org: any) => (
              <div
                key={org?.org_id}
                className="flex w-full items-center gap-x-2 border border-gray-200 hover:bg-gray-100 rounded p-2 cursor-pointer"
                onClick={() => {
                  mainFunction(org?.org_id, chatbox_token);
                  // setOrganization([]);
                }}
              >
                <img
                  src={org?.org_info?.org_avatar || "./imgs/BBH.png"}
                  alt={"logo"}
                  style={{ objectFit: "cover" }}
                  className="w-8 h-8 rounded-lg flex justify-center items-center"
                />
                <div className="flex flex-col text-left w-full">
                  <h4 className="truncate w-full">{org?.org_info?.org_name}</h4>
                  <p className="truncate text-sm">{org?.org_id}</p>
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
            <p className="text-lg text-green-500">{t("connect_success")}</p>
            {/* <div className="flex flex-col items-center justify-center gap-y-2">
              <a
                // href="https://m.me/414786618395170"
                href={`https://merchant.vn/login?chat_access_token=${partner_token}&redirect=https://merchant.vn/a/product`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white px-4 py-2 rounded-md bg-blue-500"
              >
                Mở Merchant
              </a>

              <a
                href={`https://m.me/${selected_page}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white px-4 py-2 rounded-md bg-blue-500"
              >
                Mở Messenger
              </a>
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectToCRM;
