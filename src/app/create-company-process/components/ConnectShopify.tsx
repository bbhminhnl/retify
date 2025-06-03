import React, { use, useEffect, useState } from "react";

import IframeModal from "./IframeModal";
import InputTitle from "./step3/InputTitle";
import Loading from "@/components/loading/Loading";
import { apiCommon } from "@/services/fetchApi";
import { toRenderDomain } from "@/utils";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

type IProps = {
  is_open: boolean;
  loading?: boolean;
  closeModal: () => void;
  setLoading?: (value: boolean) => void;
  chatbox_token?: string;
  token_merchant?: string;
  setTokenMerchant?: (value: string) => void;
  list_products?: any[];
  setListProducts?: (value: any) => void;
  handleOrgId?: (value?: string) => void;
  handlePageId?: (value?: string) => void;
};
const ConnectShopify = ({
  is_open,
  loading,
  closeModal,
  setLoading,
  chatbox_token,
  token_merchant,
  setTokenMerchant,
  list_products,
  setListProducts,
  handleOrgId,
  handlePageId,
}: IProps) => {
  /** Đa ngôn ngữ */
  const t = useTranslations();
  /** Hàm Error
   * @param message
   * @returns void
   * @description setLoading false
   * @description setLoadingText message
   * @description setTimeOut 2s setLoadingText ''
   */
  const handleError = (message: string) => {
    /** Tắt loading */
    // setLoading(false);
    // /** Hàm set loading text */
    // setLoadingText(message);

    toast.error(message);
    /** Set timeout */
    // setTimeout(() => setLoadingText(""), 2000);
  };

  /** Nhập trên shopify */
  const [shopify_name, setShopifyName] = useState("");

  /** Chatbox token */
  const [token_business, setTokenBusiness] = useState("");
  /**
   * const checking page
   */
  const [is_checking_page, setIsCheckingPage] = useState(false);

  /** Chọn Tổ chức để thêm page vào*/
  const [organization, setOrganization] = useState([]);
  /** Trạng thái loading modal */
  const [loading_in_modal, setLoadingInModal] = useState(false);

  /** Hàm lấy token merchant
   * @param chatbox_token
   */
  const fetchMerchantToken = async (chatbox_token: string) => {
    try {
      setLoading?.(true);
      const RES = await fetch(
        `https://api.merchant.vn/v1/auth/chatbox_login?access_token=${chatbox_token}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(RES, "RES");
      const DATA = await RES.json();
      console.log(DATA, "DATA");
      setTokenMerchant?.(DATA?.data?.branch?.token_business);
    } catch {
    } finally {
      setLoading?.(false);
    }
  };
  /** Khi chatbox token thay đổi */
  useEffect(() => {
    if (chatbox_token && !token_merchant && is_checking_page) {
      fetchMerchantToken(chatbox_token);
    }
  }, [chatbox_token, token_merchant, is_checking_page]);
  /** Nếu đã có token merchant thì lưu lại */
  useEffect(() => {
    if (token_merchant && is_checking_page) {
      setTokenBusiness(token_merchant);
    }
  }, [token_merchant, is_checking_page]);

  useEffect(() => {
    /** Khi vào lần đầu và có chatbox token */
    const runChatboxProcess = async () => {
      if (!is_checking_page && chatbox_token) {
        /** Tạo chọn bm và tạo page moi */
        await chatboxProcess(chatbox_token);
      }
    };

    runChatboxProcess();
  }, [is_checking_page, chatbox_token]);

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
    // setLoadingText(t("creating_page"));
    /**
     * Endpoint tạo page
     */
    const END_POINT = "app/page/create_website_page";

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

    // /** Tạo QR code */
    // const BASE_64_IMG = await generateQRCodeImage(
    //   `https://retify.ai/c/${RES?.data?.fb_page_id}`
    // );
    // /**
    //  * Update QR code
    //  */
    // updateQRCode && updateQRCode(BASE_64_IMG);
    return RES?.data?.fb_page_id;
  };

  /** Function chính
   * @param ORG_ID
   * @param PAGE_ID
   * @param ACCESS_TOKEN
   */
  const mainChatboxFunction = async (ORG_ID: string, ACCESS_TOKEN: string) => {
    try {
      /** Cập nhật loading */
      // setLoading(true);

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
      const DOMAIN = toRenderDomain("test");

      /** check page
       * Nếu không có page nào trùng với form tên page mới tạo
       */
      if (list_page.length === 0 || !list_page) {
        /** Tạo page */
        const PAGE_ID = await createPage(ORG_ID, ACCESS_TOKEN, DOMAIN);
        setIsCheckingPage(true);
        /** Cập nhật page id */
        handlePageId && handlePageId(PAGE_ID);

        setLoadingInModal(false);
      }

      /** check page
       * Nếu có 1 page trùng với form tên page mới tạo
       */
      if (list_page.length > 0) {
        /** Cập nhật page id */
        handlePageId && handlePageId(list_page[0]?.page_id);

        /** Đổi tên page */
        // await changePageName(list_page[0]?.page_id, DOMAIN, ACCESS_TOKEN);

        /** Kết nối Chatbox */
        // await handleConnectToChatBox(
        //   ORG_ID,
        //   list_page[0]?.page_id,
        //   ACCESS_TOKEN
        // );
        setIsCheckingPage(true);
        setLoadingInModal(false);
      }
    } catch (error) {
      /** Hiện lỗi */
      // handleErrorByCode(error, handleError);
      // setLoading(false);
    }
  };
  /**
   *  Đổi tên page
   * @param page_id
   * @param name
   * @param ACCESS_TOKEN
   */
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
  /**
   *  Kết nối Chatbox
   * @param chatbox_token
   * @returns
   */
  const chatboxProcess = async (chatbox_token: string) => {
    /**
     * setLoading process
     */
    setLoadingInModal(true);
    const LIST_ORG = await fetchListOrg(chatbox_token);
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
      /** Cập nhật Tổ chức */
      handleOrgId && handleOrgId(LIST_ORG[0]?.org_id || "");

      /** Tắt loading và call function luôn */
      // setLoading(false);
      // setLoadingText("");
      await mainChatboxFunction(LIST_ORG[0].org_id, chatbox_token);
      return;
    }

    /** Lưu danh sách Tổ chức */
    setOrganization(LIST_ORG);
    setLoadingInModal(false);
    // setLoadingText("");
  };

  /**
   *  Hàm tạo store
   * @param shopify_name
   */
  const addStoreName = async (shopify_name: string) => {
    /**
     * Tạo store
     */
    const END_POINT = `https://api-product.merchant.vn/integration/create_integration`;
    /**
     *   Body
     */
    const BODY = {
      platform: "SHOPIFY",
      store: shopify_name.toLocaleLowerCase(),
    };
    /** call api */
    const RES = await fetch(END_POINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token-business": token_business,
      },
      body: JSON.stringify(BODY),
    });

    console.log(RES, "res");
    /**
     * Khi ok thì hiện toast thông
     */
    if (RES.ok) {
      toast.success(t("connect_shopify_success"));
    }
    /** parse data */
    const DATA = await RES.json();
    console.log(DATA, "DATA");
  };
  /**
   *  Lấy link shopify
   * @returns
   */
  const fetchShopifyLink = async () => {
    /**
     * Tạo store
     */
    const END_POINT = `https://api-product.merchant.vn/integration/authorization?platform=SHOPIFY`;
    /**
     *   Body
     */
    const RES = await fetch(END_POINT, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "token-business": token_business,
      },
    });
    console.log(RES, "res");
    /**
     * Khi ok thì hiện toast thành công
     */
    if (RES.ok) {
      toast.success(t("authorization_shopify_success"));
    }
    /** parse data */
    const DATA = await RES.json();
    console.log(DATA, "DATA");
    return DATA.url;
  };

  /**
   *  pull sản phẩm về
   * @returns
   */
  const pullProduct = async (token_business: string) => {
    /**
     * End point
     */
    const END_POINT = `https://api-product.merchant.vn/integration/integrated_action?platform=SHOPIFY&action=PULL_PRODUCT`;
    /** Call api */
    const RES = await fetch(END_POINT, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "token-business": token_business,
      },
    });
    console.log(RES, "res");
    /** Hiện toast báo thành công */
    if (RES.ok) {
      toast.success(t("pull_product_success"));
    }
    const DATA = await RES.json();
    console.log(DATA, "DATA");
    return DATA.url;
  };

  const fetchMerchantProduct = async () => {
    /**
     * End point
     */
    const END_POINT = `https://api-product.merchant.vn/product/get_product`;
    /**
     *   Khai báo body
     */
    const BODY = {
      sort: {
        createdAt: "desc",
      },
      limit: 50,
      skip: 0,
      variant_options: true,
    };
    /** call api */
    const RES = await fetch(END_POINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token-business": token_business,
      },
      body: JSON.stringify(BODY),
    });
    /**
     * parse data
     */
    const DATA = await RES.json();
    console.log(DATA, "DATA");
    return DATA;
  };

  /**
   * Iframe url
   */
  const [iframe_url, setIframeUrl] = useState<string | null>(null);
  /**
   * After iframe callback
   */
  const [afterIframeCallback, setAfterIframeCallback] = useState<() => void>(
    () => () => {}
  );
  /**
   * Hàm submit
   * @param shopify_name
   */
  const handleSubmit = async (shopify_name: string) => {
    /**
     * Tạo store
     */
    await addStoreName(shopify_name);
    /** Lấy link shopify */
    const RES_SYNC_MERCHANT = await fetchShopifyLink();

    /** Nếu k có thì return */
    if (!RES_SYNC_MERCHANT) return;

    /** 1. Check nếu là WebView thì gửi postMessage cho native app */
    const IS_MOBILE_WEBVIEW =
      /wv|WebView|(iPhone|Android).*(Version\/[\d.]+)? Chrome\/[.0-9]* Mobile/.test(
        navigator.userAgent
      );
    const PAYLOAD = {
      type: "page.OPEN_SHOPIFY_OAUTH",
      url: RES_SYNC_MERCHANT,
    };

    /** Android WebView */
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(PAYLOAD));
    }

    // window.open(RES_SYNC_MERCHANT, "_blank");

    /** 2. Nếu là web browser, mở iframe */
    // setIframeUrl(RES_SYNC_MERCHANT);
    // /**
    //  * Sử dụng callback sau khi iframe hóa
    //  */
    // setAfterIframeCallback(() => async () => {
    //   /**
    //    * Pull product
    //    */
    //   const PULL_PRODUCT = await pullProduct();
    //   console.log(PULL_PRODUCT, "PULL_PRODUCT");
    //   /**
    //    * Lấy danh sách san pham
    //    */
    //   const PRODUCT_LIST = await fetchMerchantProduct();
    //   /** Lưu danh sách sản phẩm */
    //   setListProducts?.(PRODUCT_LIST);
    //   closeModal();
    //   setLoading?.(false);
    // });
  };

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      console.log(event.data, "event data");
      try {
        /**
         * Parse data
         */
        const DATA =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        /** Check sự kiện */
        if (DATA?.type === "page.shopify") {
          /** Pull product*/
          const PULL_PRODUCT = await pullProduct(token_business);
          console.log(PULL_PRODUCT, "PULL_PRODUCT");
          /** Lấy list sản phẩm từ merchant */
          const PRODUCT_LIST = await fetchMerchantProduct();
          /** Gọi hàm và callback data */
          setListProducts?.(PRODUCT_LIST);
          closeModal();
          setLoading?.(false);
        }
      } catch (e) {
        console.error("Error handling native message:", e);
      }
    };
    /** Nhận message */
    window.addEventListener("message", handleMessage);
    /** unmount */
    return () => window.removeEventListener("message", handleMessage);
  }, [token_business]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      {!is_checking_page ? (
        <div className="flex flex-col bg-white w-full md:max-w-[400px] mx-4 md:mx-auto gap-4 rounded-2xl p-6 shadow-lg">
          {organization?.length > 1 && !loading_in_modal && (
            <div className="h-full w-full">
              <h4>{t("select_your_organization")}</h4>
              <div className="flex flex-col gap-y-2 w-full">
                {organization.map((org: any) => (
                  <div
                    key={org?.org_id}
                    className="flex w-full items-center gap-x-2 border border-gray-200 hover:bg-gray-100 rounded p-2 cursor-pointer"
                    onClick={() => {
                      mainChatboxFunction(org?.org_id, chatbox_token || "");
                      // setOrganization([]);
                      handleOrgId && handleOrgId(org?.org_id);
                    }}
                  >
                    <img
                      src={org?.org_info?.org_avatar || "/imgs/BBH.png"}
                      alt={"logo"}
                      style={{ objectFit: "cover" }}
                      className="w-8 h-8 rounded-lg flex justify-center items-center"
                    />
                    <div className="flex flex-col text-left w-full">
                      <h4 className="truncate w-full">
                        {org?.org_info?.org_name}
                      </h4>
                      <p className="truncate text-sm">{org?.org_id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {loading_in_modal && (
            <div className="flex items-center justify-center h-full">
              <Loading size="md" />
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col bg-white w-full md:max-w-[400px] mx-4 md:mx-auto gap-4 rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">
              {t("connect_shopify_title")}
            </h2>
            <p className="text-sm text-gray-600">
              {t("connect_shopify_description")}
            </p>
          </div>
          <InputTitle
            value_input={shopify_name || ""}
            setValueInput={(e) => {
              setShopifyName(e);
            }}
            title={t("shop_name")}
            placeholder={t("enter_shop_name")}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => closeModal()}
              className="px-4 py-2 cursor-pointer hover:bg-gray-600 text-sm font-medium text-white bg-gray-500 rounded-lg w-full"
            >
              {t("cancel")}
            </button>
            <button
              onClick={async () => {
                /** Nếu chưa nhập tên cửa hàng thì show toast lỗi và return */
                if (shopify_name === "") {
                  toast.error(t("enter_shop_name"));
                  return;
                }
                setLoading?.(true);

                await handleSubmit(shopify_name);

                /** Delay 2s để tắt loading */
                //   setTimeout(() => {
                //     /** tắt Trạng thái mở modal */
                //     closeModal();
                //     /** Tắt loading */
                //     setLoading?.(false);
                //   }, 2000);
              }}
              disabled={loading}
              className="flex justify-center cursor-pointer hover:bg-blue-500 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg w-full "
            >
              <div className="truncate w-full">{t("connect")}</div>
              {loading && <Loading size="sm" color_white />}
            </button>
          </div>
        </div>
      )}
      {/* {iframe_url && (
        <IframeModal
          url={iframe_url}
          onClose={() => {
            setIframeUrl(null);
            afterIframeCallback?.();
          }}
        />
      )} */}
    </div>
  );
};

export default ConnectShopify;
