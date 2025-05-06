// import {
//   MOCK_CATEGORIES,
//   MOCK_SETTING_DATA,
//   MOCK_STORE_DATA,
// } from "@/utils/data";
// import React, { useEffect, useRef, useState } from "react";

// import Loading from "@/components/loading/Loading";

// const IframeMerchant = ({
//   data_input,
//   step,
// }: {
//   data_input: any;
//   step: number;
// }) => {
//   /** Iframe Ref */
//   const IFRAME_REF = useRef<HTMLIFrameElement | null>(null);

//   /** Dữ liệu hiển thị */
//   const [data, setData] = useState<any[]>([]);
//   /**
//    * UseEffect
//    */
//   /** UseEffect*/
//   useEffect(() => {
//     /** Nếu step 3 */
//     if (step === 4) {
//       /** Lấy dữ liệu products */
//       fetchProducts();
//     }
//   }, [step]);

//   /** Lấy đata products */
//   const fetchProducts = async () => {
//     try {
//       /** Gọi API lấy products*/
//       const RESPONSE = await fetch("/api/products", {
//         headers: {
//           "Cache-Control": "no-store",
//         },
//       });
//       /** DATA JSON */
//       const DATA = await RESPONSE.json();
//       /** Lưu dữ liệu product */
//       // setProduct(DATA);
//       setData(DATA);
//       console.log(DATA, "DATA");
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     }
//   };
//   /** Loading */
//   const [loading, setLoading] = useState(false);
//   /** Hàm gửi thông tin đến Merchant */
//   const handleLoad = () => {
//     /** Cập nhật dữ liệu */
//     const MOCK_STORE_DATA_UPDATE = {
//       ...MOCK_CATEGORIES,
//       name: data_input.shop_name,
//       address: data_input.shop_address,
//       logo: data_input.logo,
//     };

//     const MOCK_CATEGORIES_UPDATE = MOCK_CATEGORIES.map((category) => {
//       return {
//         ...category,
//         products: data,
//       };
//     });

//     /** Kiểm tra Iframe */
//     if (IFRAME_REF.current && IFRAME_REF.current.contentWindow) {
//       /** Gửi thông tin đến Merchant */
//       IFRAME_REF.current.contentWindow.postMessage(
//         {
//           type: "PREVIEW",
//           from: "RETIFY",
//           preview_json: {
//             categories: MOCK_CATEGORIES_UPDATE,
//             store_data: MOCK_STORE_DATA_UPDATE,
//             setting_data: MOCK_SETTING_DATA,
//           },
//         },
//         "*"
//       );
//     }
//   };

//   /** Nhận message từ iframe gửi lên */
//   useEffect(() => {
//     /**
//      * Hàm xuất lý sự kiện thay đổi iframe
//      * @param event Sự kiện thay đổi iframe
//      */
//     const handleMessage = (event: MessageEvent) => {
//       console.log("Received message from iframe:", event.data);
//       /** Kiểm tra sự kiện từ Merchant */
//       if (event.data.type !== "PREVIEW" && event.data.from !== "SELLING_PAGE") {
//         /** Tạm thời chưa có Event */
//       } else {
//         /**
//          * Nhận event từ Merchant
//          */
//         if (event.data.data?.type === "get.data") {
//           /** Gửi data */
//           handleLoad();
//           /** Set loading */
//           setLoading(true);
//         }
//         /**
//          * Nhận data từ Merchant
//          */
//         if (event.data.data?.type === "get.data.success") {
//           setLoading(false);
//         }
//       }
//     };
//     /**
//      * Lisetner sự kiện thay đổi iframe
//      */
//     window.addEventListener("message", handleMessage);
//     /**
//      * Xoá lisetner sự kiện thay đổi iframe khi unmount
//      */
//     return () => window.removeEventListener("message", handleMessage);
//   }, []);

//   return (
//     <div className="w-full h-full flex">
//       {loading && <Loading size="lg" />}
//       <iframe
//         ref={IFRAME_REF}
//         src="https://shop.merchant.vn/template2?type=preview" // 👉 Thay URL bạn cần nhúng
//         width="100%"
//         height="100%"
//         style={{ border: "none" }}
//         title="Merchant Iframe"
//       />
//     </div>
//   );
// };

// export default IframeMerchant;
import {
  MOCK_CATEGORIES,
  MOCK_SETTING_DATA,
  MOCK_STORE_DATA,
} from "@/utils/data";
import React, { useEffect, useRef, useState } from "react";

import Loading from "@/components/loading/Loading";

const IframeMerchant = ({
  data_input,
  step,
}: {
  data_input: any;
  step: number;
}) => {
  const IFRAME_REF = useRef<HTMLIFrameElement | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [shouldSendData, setShouldSendData] = useState(false);

  // Fetch products when step === 4
  useEffect(() => {
    if (step === 4) {
      fetchProducts();
    }
  }, [step]);

  const fetchProducts = async () => {
    try {
      const RESPONSE = await fetch("/api/products", {
        headers: {
          "Cache-Control": "no-store",
        },
      });
      const DATA = await RESPONSE.json();
      setData(DATA);
      console.log(DATA, "DATA");
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Trigger handleLoad only when data is available and flag is true
  useEffect(() => {
    if (data.length > 0 && shouldSendData) {
      handleLoad();
      setLoading(true);
      setShouldSendData(false); // reset flag
    }
  }, [data, shouldSendData]);

  const handleLoad = () => {
    const MOCK_STORE_DATA_UPDATE = {
      ...MOCK_CATEGORIES,
      name: data_input.shop_name,
      address: data_input.shop_address,
      logo: data_input.logo,
    };

    const MOCK_CATEGORIES_UPDATE = MOCK_CATEGORIES.map((category) => ({
      ...category,
      products: data,
    }));

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
    const handleMessage = (event: MessageEvent) => {
      console.log("Received message from iframe:", event.data);
      if (event.data.type !== "PREVIEW" && event.data.from !== "SELLING_PAGE") {
        return;
      }

      if (event.data.data?.type === "get.data") {
        setShouldSendData(true);
      }

      if (event.data.data?.type === "get.data.success") {
        setLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="w-full h-full flex">
      {loading && <Loading size="lg" />}
      <iframe
        ref={IFRAME_REF}
        src="https://shop.merchant.vn/template2?type=preview"
        width="100%"
        height="100%"
        style={{ border: "none" }}
        title="Merchant Iframe"
      />
    </div>
  );
};

export default IframeMerchant;
