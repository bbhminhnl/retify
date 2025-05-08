import {
  MOCK_CATEGORIES,
  MOCK_SETTING_DATA,
  MOCK_STORE_DATA,
} from "@/utils/data";
import React, { useEffect, useRef, useState } from "react";

import Loading from "@/components/loading/Loading";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

const IframeMerchant = ({
  data_input,
  step,
}: {
  data_input: any;
  step: number;
}) => {
  /** Đa ngôn ngữ */
  const t = useTranslations();
  /** Ref */
  const IFRAME_REF = useRef<HTMLIFrameElement | null>(null);
  /**
   * Dữ liệu products
   */
  const [data, setData] = useState<any[]>([]);
  /** Loading */
  const [loading, setLoading] = useState(false);
  /** Cấp nhật dữ liệu */
  const [should_send_data, setShouldSendData] = useState(false);

  /** Fetch products when step === 4 */
  useEffect(() => {
    /** Buowsc 4 thì lấy dữ liệu */
    if (step === 4) {
      fetchProducts();
    }
  }, [step]);

  /** Hmaf lấy dữ liệu */
  const fetchProducts = async () => {
    try {
      /**
       * Gọi API lấy dữ liệu
       */
      const RESPONSE = await fetch("/api/products", {
        headers: {
          "Cache-Control": "no-store",
        },
      });
      /**
       * Lấy dữ liệu
       */
      const DATA = await RESPONSE.json();
      /**
       * Lưu dữ liệu
       */
      setData(DATA);
      console.log(DATA, "DATA");
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(t("error_fetching_products") + error);
    }
  };

  /**  Trigger handleLoad only when data is available and flag is true*/
  useEffect(() => {
    /** Kiem tra data va flag */
    if (data.length > 0 && should_send_data) {
      handleLoad();
      setLoading(true);
      setShouldSendData(false); // reset flag
    }
  }, [data, should_send_data]);

  /** Hàm xử lý dữ liệu gửi sang Merchant */
  const handleLoad = () => {
    /** Update dữ liệu store */
    const MOCK_STORE_DATA_UPDATE = {
      ...MOCK_STORE_DATA,
      name: data_input.shop_name,
      address: data_input.shop_address,
      logo: data_input.shop_avatar,
    };
    /** Update dữ liệu sản phẩm */
    const MOCK_CATEGORIES_UPDATE = MOCK_CATEGORIES.map((category) => ({
      ...category,
      name: t("products_list"),
      products: data,
    }));
    /** Check Iframe và gửi dữ liệu post Message */
    if (IFRAME_REF.current?.contentWindow) {
      IFRAME_REF.current.contentWindow.postMessage(
        {
          type: "PREVIEW",
          from: "RETIFY",
          preview_json: {
            categories: MOCK_CATEGORIES_UPDATE,
            store_data: MOCK_STORE_DATA_UPDATE,
            setting_data: MOCK_SETTING_DATA,
          },
        },
        "*"
      );
    }
  };

  useEffect(() => {
    /**
     *
     * @param event Sự kiện thay đổi iframe
     * @returns
     */
    const handleMessage = (event: MessageEvent) => {
      console.log("Received message from iframe:", event.data);
      /** Kiểm tra sự kiện từ Merchant */
      if (event.data.type !== "PREVIEW" && event.data.from !== "SELLING_PAGE") {
        return;
      }
      /** Kiểm tra sự kiện từ Merchant */
      if (event.data.data?.type === "get.data") {
        setShouldSendData(true);
      }
      /** Kiểm tra sự kiện từ Merchant success */
      if (event.data.data?.type === "get.data.success") {
        setLoading(false);
      }
    };
    /** Add event listener */
    window.addEventListener("message", handleMessage);
    /** Remove event listener */
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="w-full h-full flex">
      {loading && <Loading size="lg" />}
      <div className={`${loading ? "hidden" : "block"} w-full`}>
        <iframe
          ref={IFRAME_REF}
          src="https://shop.merchant.vn/template2?type=preview"
          width="100%"
          height="100%"
          style={{ border: "none" }}
          title="Merchant Iframe"
        />
      </div>
    </div>
  );
};

export default IframeMerchant;
