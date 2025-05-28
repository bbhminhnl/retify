import React, { useEffect, useState } from "react";

import InputTitle from "./step3/InputTitle";
import Loading from "@/components/loading/Loading";
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
}: IProps) => {
  /** Đa ngôn ngữ */
  const t = useTranslations();

  /** Nhập trên shopify */
  const [shopify_name, setShopifyName] = useState("");

  /** Chatbox token */
  const [token_business, setTokenBusiness] = useState("");

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
    if (chatbox_token && !token_merchant) {
      fetchMerchantToken(chatbox_token);
    }
  }, [chatbox_token, token_merchant]);
  /** Nếu đã có token merchant thì lưu lại */
  useEffect(() => {
    if (token_merchant) {
      setTokenBusiness(token_merchant);
    }
  }, [token_merchant]);

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
  const pullProduct = async () => {
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
   * Hàm submit
   * @param shopify_name
   */
  const handleSubmit = async (shopify_name: string) => {
    /**
     * Tạo store
     */
    await addStoreName(shopify_name);
    /**
     * Uỷ quyền truy cập
     */
    const RES_SYNC_MERCHANT = await fetchShopifyLink();
    /** Link truy cập */
    if (RES_SYNC_MERCHANT) {
      window.open(RES_SYNC_MERCHANT, "_blank");
    }
    /** Pull product */
    const PULL_PRODUCT = await pullProduct();
    console.log(PULL_PRODUCT, "PULL_PRODUCT");
    /**
     * Lấy danh sách san pham
     */
    const PRODUCT_LIST = await fetchMerchantProduct();

    /** Lưu danh sách san pham */
    setListProducts && setListProducts(PRODUCT_LIST);

    /** Dong modal */
    closeModal();
    /**
     * Tắt loading
     */
    setLoading?.(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
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
              //   window.open(
              //     `https://${shopify_name}.myshopify.com/admin/oauth/authorize?client_id=dcfdf1b266b408747855729056ac5e32&scope=read_analytics%20read_assigned_fulfillment_orders%20write_assigned_fulfillment_orders%20read_customer_merge%20write_customer_merge%20read_customers%20write_customers%20read_discounts%20write_discounts%20read_draft_orders%20write_draft_orders%20read_files%20write_files%20read_fulfillments%20write_fulfillments%20read_gdpr_data_request%20read_gift_cards%20write_gift_cards%20read_inventory%20write_inventory%20read_legal_policies%20write_legal_policies%20read_locations%20read_marketing_events%20write_marketing_events%20read_merchant_managed_fulfillment_orders%20write_merchant_managed_fulfillment_orders%20read_metaobject_definitions%20write_metaobject_definitions%20read_metaobjects%20write_metaobjects%20read_online_store_navigation%20read_online_store_pages%20write_online_store_pages%20read_order_edits%20write_order_edits%20read_orders%20write_orders%20read_price_rules%20write_price_rules%20read_products%20write_products%20read_product_listings%20write_product_listings%20read_reports%20write_reports%20read_resource_feedbacks%20write_resource_feedbacks%20read_script_tags%20write_script_tags%20read_shipping%20write_shipping%20read_shopify_payments_accounts%20read_shopify_payments_bank_accounts%20read_shopify_payments_disputes%20read_shopify_payments_payouts%20read_content%20write_content%20read_themes%20write_themes%20read_third_party_fulfillment_orders%20write_third_party_fulfillment_orders%20read_translations%20write_translations&redirect_uri=https://merchant.vn/oauth/shopify&state=672d9e84fde3544cbb940f89`,
              //     "_blank"
              //   );
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
    </div>
  );
};

export default ConnectShopify;
