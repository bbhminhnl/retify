"use client";

import { generateSessionId, getSessionId, storeSessionId } from "@/lib/session";
import { useEffect, useState } from "react";

import AddProductModal from "@/components/AddProductModal";
import DeleteProduct from "@/components/DeleteProduct";
import { IProductItem } from "@/types";
import InputAvatar from "../create-company-process/components/step3/InputAvatar";
import InputTitle from "../create-company-process/components/step3/InputTitle";
import Loading from "@/components/loading/Loading";
import ProductItemCustom from "../products/components/ProductItemCustom";
import async from "async"; // Nhập Async.js từ node_modules
import { isEmpty } from "lodash";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function TemplateClient({
  address,
  handleFinishPreview,
  step,
  onSelect,
  defaultValue,
}: {
  /** Địa chỉ */
  address: string;
  /**
   *  Hàm xuất dữ liệu preview
   * @param e string
   * @returns
   */
  handleFinishPreview?: (e: string) => void;
  /**
   * Bước hiện tại
   */
  step?: number;
  /**
   *  Hàm select
   * @param value
   * @returns
   */
  onSelect?: (value: any) => void;
  /** Gia tri mac dinh */
  defaultValue?: string;
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
  /**
   * UseEffect
   */
  useEffect(() => {
    /** Nếu step 3 */
    if (step === 3) {
      /** Lấy dữ liệu products */
      fetchProducts();
    }
  }, [step]);
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
      // setProduct(DATA);
      setData(DATA);
      console.log(DATA, "DATA");
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

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

  const [loading_shop, setLoadingShop] = useState(false);
  /**
   * Hàm gọi API tạo ảnh từ prompt
   */
  const searchShopInfo = async (query: string, data: any) => {
    if (!shop_name || !shop_address) {
      toast.error("Vui lòng nhập tên cửa hàng và địa chỉ cửa hàng.");
      if (!shop_name) {
        setErrors((prev) => {
          return {
            ...prev,
            shop_name: "Vui lòng nhập tên cửa hàng.",
          };
        });
      }
      if (!shop_address) {
        setErrors((prev) => {
          return {
            ...prev,
            shop_address: "Vui lòng nhập địa chỉ cửa hàng.",
          };
        });
      }
      return;
    }
    setLoadingShop(true);
    /** Key word search */
    let key_word = query ? query : "";
    /** Tìm kiếm thông tin cửa hàng */
    const RES = await fetch("/api/store-knowledge", {
      method: "POST",
      body: JSON.stringify({ query: key_word }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const DATA_STORE = await RES.json();
    console.log(DATA_STORE, "DATA_STORE");
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
        toast.success("Tìm kiếm thông tin cửa hàng thành công!");
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
      /** Trường hợp không có content */
      if (!results?.content) {
        /** Hiển thị lỗi */
        toast.error("Không tìm thấy thống tin cửa hàng");
        /** Lưu thông tin cửa hàng */
        const SHOP_INFO_RES = await fetch("/api/shop-info", {
          method: "PUT",
          body: JSON.stringify({
            session_id,
            content: "Không tìm thấy thông tin cửa hàng",
          }),
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
      // ROUTER.push("/editor"); // Custom router navigation (not using next/router)

      /** Cập nhật trạng thái hoàn thành bước Preview */
      handleFinishPreview && handleFinishPreview("success");
    } catch (error) {
      console.error("Lỗi mạng hoặc server:", error);
      /** Cập nhật trạng thái báo lỗi*/
      handleFinishPreview && handleFinishPreview("error");
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

  /** Avatar Shop */
  const [avatar_shop, setAvatarShop] = useState<string | null>("");
  /** Địa chỉ shop */
  const [shop_address, setShopAddress] = useState<string | null>("");
  /** Tên cửa hàng */
  const [shop_name, setShopname] = useState<string | null>("");
  /** Khai báo lỗi */
  const [errors, setErrors] = useState<{
    shop_name: string;
    shop_address: string;
  }>({
    shop_name: "",
    shop_address: "",
  });

  /** Hàm Upload Image */
  const handleOnSelect = () => {};

  return (
    <main className="py-2 px-1 max-w-3xl w-full mx-auto gap-y-4 relative">
      <div className="flex flex-col gap-y-4 ">
        <InputTitle
          value_input={shop_name || ""}
          setValueInput={(e) => {
            setShopname(e);
            setErrors({ ...errors, shop_name: "" });
          }}
          title="Shop Name"
          placeholder="Enter your shop name"
          error={errors?.shop_name}
        />
        <InputTitle
          value_input={shop_address || ""}
          setValueInput={(e) => {
            setShopAddress(e);
            setErrors({ ...errors, shop_address: "" });
          }}
          title="Shop Address"
          placeholder="Enter your shop address"
          error={errors?.shop_address}
        />
        <InputAvatar
          onSelect={handleOnSelect}
          defaultValue={avatar_shop || ""}
        />
      </div>

      <div className="flex flex-row items-center justify-between bg-white sticky top-0 z-10 py-2 w-full">
        <h1 className="md:text-2xl md:font-bold  text-xl font-medium ">Menu</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded text-sm"
        >
          Add Product
        </button>
      </div>
      <div>
        {error ? (
          <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-8">
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
              searchShopInfo(shop_name + " - " + shop_address || "", data);
            }}
            disabled={loading_shop}
            className="bg-blue-500 text-white px-4 py-2 font-medium rounded hover:bg-blue-700 cursor-pointer flex gap-x-2 items-center"
          >
            {loading_shop
              ? "Searching shop information..."
              : "Search shop information"}
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
