"use client";

import { generateSessionId, getSessionId, storeSessionId } from "@/lib/session";
import { useEffect, useState } from "react";

import AddProductModal from "@/components/AddProductModal";
import DeleteProduct from "@/components/DeleteProduct";
import { IProductItem } from "@/types";
import Loading from "@/components/loading/Loading";
import ProductItemCustom from "../products/components/ProductItemCustom";
import async from "async"; // Nhập Async.js từ node_modules
import { isEmpty } from "lodash";
import { simpleUUID } from "@/utils";
import { useRouter } from "next/navigation";

export default function TemplateClient({
  template_id,
  rawData,
}: {
  template_id: string;
  rawData: any;
}) {
  /** Dữ liệu hiển thị */
  const [data, setData] = useState<any[]>([]);
  /** Error */
  const [error, setError] = useState<string | null>(null);
  /** Loading */
  const [loading, setLoading] = useState<boolean>(false);
  /** Mở modal */
  const [is_modal_open, setIsModalOpen] = useState(false);
  /** Edit Product */
  const [edit_product, setEditProduct] = useState<IProductItem | null>(null);
  /** Modal close */
  const [is_modal_delete, setIsModalDelete] = useState(false);
  /** Id Delete */
  const [id_delete, setIdDelete] = useState<string | null>(null);

  /** Router*/
  const ROUTER = useRouter();
  /**
   * Thêm ảnh mô tả cho sản phẩm
   * @param menuItems Danh sách các món ăn
   * @param callback Hàm gọi lại khi hoàn thành
   */
  const addImageDescription = (
    menuItems: any[],
    callback: (err: any, result?: any[]) => void
  ) => {
    /** 1 biến lưu giá trị */
    const UPDATED_MENU: any[] = [];

    /** Sử dụng async.eachSeries để xử lý tuần tự */
    async.eachSeries(
      menuItems,
      (item: any, done: (err?: any) => void) => {
        fetch(`/api/google-generate-img`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: item.name }),
        })
          .then((res) => res.json())
          .then((data) => {
            fetchUploadImage(data?.image)
              .then((imgUrl) => {
                UPDATED_MENU.push({ ...item, image_url: imgUrl || null });
                done(); // Chuyển sang món tiếp theo
              })
              .catch((error) => {
                console.error("Error uploading image:", error);
                UPDATED_MENU.push({ ...item, image_url: null });
                done(); // Tiếp tục dù có lỗi
              });
          })
          .catch((error) => {
            console.error("Error generating image:", error);
            UPDATED_MENU.push({ ...item, image_url: null });
            done(); // Tiếp tục dù có lỗi
          });
      },
      (err) => {
        if (err) {
          callback(err);
        } else {
          callback(null, UPDATED_MENU); // Trả về danh sách đã cập nhật
        }
      }
    );
  };

  /**
   * Hàm xử lý upload ảnh lên server
   * @param base64Image Luồng base64 của ảnh
   * @returns Promise trả về đường dẫn ảnh đã lưu
   */
  const fetchUploadImage = (base64Image: string): Promise<string> => {
    return new Promise((resolve) => {
      try {
        /** Giả định đây là ảnh PNG, bạn có thể đổi thành "image/jpeg" nếu cần */
        const MIME_TYPE = "image/png";
        /** Convert base64 → binary → File */
        const BYTE_STRING = atob(base64Image);
        /**
         * Chuyển đổi base64 thành Uint8Array
         */
        const BYTE_ARRAY = new Uint8Array(BYTE_STRING.length);
        /**
         * Chuyển đổi base64 thành Uint8Array
         */
        for (let i = 0; i < BYTE_STRING.length; i++) {
          BYTE_ARRAY[i] = BYTE_STRING.charCodeAt(i);
        }
        /**
         * Tạo đối tượng File từ Uint8Array
         */
        const FILE = new File([BYTE_ARRAY], "image.png", { type: MIME_TYPE });
        /**
         * Đưa vào FormData
         */
        const FORM_DATA = new FormData();
        FORM_DATA.append("file", FILE);
        /** Upload ảnh lên merchant */
        fetch(
          "https://api.merchant.vn/v1/internals/attachment/upload?path=&label=&folder_id=&root_file_id=",
          {
            method: "POST",
            body: FORM_DATA,
            headers: {
              "token-business":
                process.env.NEXT_PUBLIC_MERCHANT_TOKEN_BUSINESS || "",
            },
          }
        )
          .then((res) => res.json())
          .then((result) => {
            const FILE_PATH = result?.data?.file_path || "";
            resolve(FILE_PATH);
          })
          .catch((error) => {
            console.error("Upload failed:", error);
            resolve("");
          });
      } catch (error) {
        console.error("Upload failed:", error);
        resolve("");
      }
    });
  };
  /** Lấy dữ liệu từ Redis */
  useEffect(() => {
    const fetchData = () => {
      /** Kiểm tra dữ liệu raw data*/
      if (!rawData) {
        setError("Không tìm thấy dữ liệu hoặc dữ liệu đã quá hạn.");
        return;
      }
      /** Set loading  */
      setLoading(true);

      /** Lưu giá trị raw data
       * Đoạn này giả định rằng rawData đã là JSON
       */
      const PARSED_MENU = rawData.map((item: any, index: number) => ({
        ...item,
        id: item.id || simpleUUID(), // Nếu đã có id thì giữ nguyên, nếu chưa thì thêm id tạm
      }));
      console.log(PARSED_MENU, "PARSED_MENU");

      /** Set luôn data = raw data, bỏ qua bước xử lý ảnh */
      setData(PARSED_MENU);
      /** Tắt loading */
      setLoading(false);
      return;

      // Giả sử rawData đã là JSON
      /** Kiểm tra danh sách cơ bản có image_url */
      const HAS_IMAGE_URL = PARSED_MENU.every((item: any) => !!item.image_url);
      /** Nếu không có image_url thì gọi API để tạo ảnh */
      if (HAS_IMAGE_URL) {
        console.log("✅ Dữ liệu đã có image_url, không cần generate.");
        setData(PARSED_MENU);
        saveToRedis(PARSED_MENU);
        setLoading(false);
        return;
      }

      /** Sử dụng addImageDescription với Async.js */
      addImageDescription(PARSED_MENU, (err, updatedMenu) => {
        if (err) {
          setError("Dữ liệu bị lỗi hoặc không thể tạo ảnh.");
          console.error(err);
          setLoading(false);
          return;
        }

        console.log(updatedMenu, "UPDATED_MENU");
        setData(updatedMenu || []);
        saveToRedis(updatedMenu || []);
        setLoading(false);
      });
    };
    /**
     * Lưu dữ liệu vào Redis
     * @param updatedMenu Danh sách các món ăn đã được thêm ảnh mô tả
     */
    const saveToRedis = (updatedMenu: any[]) => {
      fetch("/api/json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: template_id,
          value: updatedMenu,
        }),
      })
        .then((res) => console.log(res, "RES"))
        .catch((err) => console.error("Error saving to Redis:", err));
    };

    fetchData();
  }, [rawData, template_id]);
  /** Input propmt*/
  const [input, setInput] = useState(``);
  /** Image */
  const [image, setImage] = useState<string | null>(null);
  /** Hàm gọi API tạo ảnh từ prompt
   * @param prompt Prompt tạo ảnh
   */
  const handleGenerateImage = async (prompt: string) => {
    try {
      const RES = await fetch("/api/google-generate-img", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt }),
      });
      const DATA = await RES.json();
      console.log(DATA, "DATA");
      setImage(DATA?.image);
      // const IMG_URL = await fetchUploadImage(DATA?.image);
      /** Trả về item và thêm image_url */
      // setImage(IMG_URL);
    } catch (error) {
      console.error("Lỗi mạng hoặc server:", error);
    }
  };

  const [loading_shop, setLoadingShop] = useState(false);
  /**
   * Hàm gọi API tạo ảnh từ prompt
   */
  const searchShopInfo = async (query: string, data: any) => {
    setLoadingShop(true);
    /** Key word search */
    let key_word = query
      ? query
      : // : "Buffet hải sản Cửu Vân Long - Số 10 Trần Phú - Hà Đông - Hà Nội";
        "Haidilao Vincom Trần Duy Hưng";
    const RES = await fetch("/api/store-knowledge", {
      method: "POST",
      body: JSON.stringify({ query: key_word }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const DATA_STORE = await RES.json();

    /** gọi hàm update tài liệu */
    handleAddDocument(data, DATA_STORE);
    /** Tắt loading */
    setLoadingShop(false);

    return;
  };

  /**
   *  Hàm gọi API tạo ảnh từ prompt
   * @param data
   * @param results
   * @returns
   */
  const handleAddDocument = async (data: any, results: any) => {
    /** Ensure sessionId is a string (fall back to a default string if undefined) */
    let session_id: string = getSessionId() ?? generateSessionId(); // Fallback to generateSessionId if undefined

    /** If sessionId was newly generated, store it in cookies */
    if (!getSessionId()) {
      storeSessionId(session_id);
    }
    /** Tajo 1 delay */
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    /** Sản phẩm mới */
    const NEW_PRODUCT = data.map((product: any) => ({
      id: product.id,
      name: product.name,
      price: Number(product.price) || product.price,
      product_image: `${product.image_url}`,
      type: "product",
      unit: product.unit,
    }));
    console.log(NEW_PRODUCT, "NEW_PRODUCT");
    try {
      /** Gửi sản phẩm mới */
      const PRODUCT_RES = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id, products: NEW_PRODUCT }), // Send sessionId
      });
      console.log(PRODUCT_RES, "PRODUCT_RES");
      /** Nếu không thành cong */
      if (!PRODUCT_RES.ok) {
        return;
      }

      console.log("✅ Sản phẩm đã được thêm");

      /** Gửi thông tin cửa hàng (nếu có) */
      if (results?.content) {
        const SHOP_INFO_RES = await fetch("/api/shop-info", {
          method: "PUT",
          body: JSON.stringify({ session_id, content: results.content }),
        });
        /** Kiem tra ket qua */
        if (SHOP_INFO_RES.ok) {
          console.log("✅ Cập nhật thông tin cửa hàng thành công");
        } else {
          console.warn("⚠️ Không thể cập nhật thông tin cửa hàng");
        }
      }

      /** Sau khi thành công, chờ 500ms rồi chuyển trang */
      await delay(500);
      /** Chuyển trang */
      ROUTER.push("/editor"); // Custom router navigation (not using next/router)
    } catch (error) {
      console.error("Lỗi mạng hoặc server:", error);
    } finally {
      // setLoading(false);
    }
  };

  /**
   *  Thêm sản phẩm mới
   * @param product Sản phẩm mới
   */
  const handleAddProduct = (product: IProductItem) => {
    setData((prevData) => [...prevData, product]);
  };
  return (
    <main className="px-3 py-2 max-w-3xl w-full mx-auto space-y-6 relative">
      <div className="flex md:flex-row flex-col items-center justify-between bg-white sticky top-0 z-10 py-2 w-full">
        <h1 className="md:text-2xl md:font-bold  text-xl font-medium ">
          Xem trước Menu và Cập nhật sản phẩm
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded text-sm"
        >
          Thêm sản phẩm
        </button>
      </div>
      <div>
        {error ? (
          <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
            ⚠️ {error}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {loading && (
              <div className="p-4 bg-gray-100 text-gray-500 rounded">
                <Loading size="lg" />
              </div>
            )}
            {!loading &&
              (data && data.length > 0 ? (
                data.map((item, index) => (
                  <ProductItemCustom
                    id={item.id}
                    key={item.id}
                    name={item.name}
                    price={item.price}
                    product_image={item.image_url}
                    unit={item?.unit}
                    type="product"
                    onUpdate={(product) => {
                      setIsModalOpen(true);
                      setEditProduct(product);
                    }}
                    onDelete={(id) => {
                      setIsModalDelete(true);
                      setIdDelete(id);
                    }}
                  />
                ))
              ) : (
                <div className="p-4 text-gray-500">Dữ liệu trống.</div>
              ))}
          </div>
        )}
      </div>
      {!loading && (
        <div className="flex w-full justify-center items-center sticky bottom-0 p-1">
          <button
            onClick={() => {
              searchShopInfo(input, data);
            }}
            disabled={loading_shop}
            className="bg-blue-500 text-white px-4 py-2 font-medium rounded hover:bg-blue-700 cursor-pointer flex gap-x-2 items-center"
          >
            {loading_shop
              ? "Đang tìm kiếm thông tin về cửa hàng"
              : "Tìm kiếm thông tin về cửa hàng"}
            <div>{loading_shop && <Loading color_white />}</div>
          </button>
        </div>
      )}
      <AddProductModal
        open={is_modal_open}
        onClose={() => {
          setIsModalOpen(false);
          setEditProduct(null);
        }}
        onSubmit={(product: IProductItem) => {
          /** Nếu có sản phẩm -> Case Edit */
          if (!isEmpty(edit_product)) {
            setData((prev) =>
              prev.map((p) => (p.id === product.id ? product : p))
            );
          } else {
            handleAddProduct(product);
          }
          /** Tắt modal và reset sản phẩm edit */
          setIsModalOpen(false);
          setEditProduct(null);
        }}
        product={edit_product || {}}
        type={isEmpty(edit_product) ? "add" : "edit"}
      />
      <DeleteProduct
        open={is_modal_delete} /* open={is_delete_modal_open} */
        onClose={() => setIsModalDelete(false)}
        onSubmit={() => {
          setIsModalDelete(false);
          setData((prev) => prev.filter((p) => p.id !== id_delete));
        }}
      />
    </main>
  );
}
