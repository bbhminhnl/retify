"use client";

import { useEffect, useState } from "react";

import AddProductModal from "@/components/AddProductModal";
import DeleteProduct from "@/components/DeleteProduct";
import { IProductItem } from "@/types";
import InputAvatar from "../../create-company-process/components/step3/InputAvatar";
import InputTitle from "../../create-company-process/components/step3/InputTitle";
import Loading from "@/components/loading/Loading";
import ProductItemCustom from "../../products/components/ProductItemCustom";
import async from "async"; // Nhập Async.js từ node_modules
import { isEmpty } from "lodash";
import { useTranslations } from "next-intl";

type IDataInput = {
  /**
   * Tên shop
   */
  shop_name?: string;
  /**Địa chỉ shop */
  shop_address?: string;
  /** Avatar shop */
  shop_avatar?: string;
};
export default function TemplateClient({
  step,
  data_input,
  setDataInput,
  list_products,
  setListProducts,
  updateLogo,
  errors_input,
  setErrorsInput,
}: {
  /**
   * Bước hiện tại
   */
  step?: number;
  /** Dữ liệu input */
  data_input?: IDataInput;
  /** Hàm set dữ liệu input */
  setDataInput?: (value: IDataInput) => void;
  /** Danh sách products */
  list_products?: IProductItem[];
  /** Hàm set danh sách products */
  setListProducts?: (value: IProductItem[]) => void;
  /** hàm Update logo */
  updateLogo?: (value: any) => void;
  /** Errors */
  errors_input?: {
    shop_name: string;
    shop_address: string;
  };
  setErrorsInput?: (value: any) => void;
}) {
  /** Đa ngôn ngữ */
  const t = useTranslations();
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
  /** Data Input */
  const [data_input_local, setDataInputLocal] = useState<IDataInput>({});

  useEffect(() => {
    if (errors_input) {
      setErrors(errors_input);
    }
  }, [errors_input]);

  /** UseEffect*/
  useEffect(() => {
    if (list_products) {
      setData(list_products);
    }
  }, [list_products]);

  /**
   * UseEffect
   */
  useEffect(() => {
    if (data_input) {
      setDataInputLocal(data_input);
    }
  }, [data_input]);

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
  const fetchUploadImage = (file: any): Promise<string> => {
    return new Promise((resolve) => {
      try {
        // /** Giả định đây là ảnh PNG, bạn có thể đổi thành "image/jpeg" nếu cần */
        // const MIME_TYPE = "image/png";
        // /** Convert base64 → binary → File */
        // const BYTE_STRING = atob(base64Image);
        // /**
        //  * Chuyển đổi base64 thành Uint8Array
        //  */
        // const BYTE_ARRAY = new Uint8Array(BYTE_STRING.length);
        // /**
        //  * Chuyển đổi base64 thành Uint8Array
        //  */
        // for (let i = 0; i < BYTE_STRING.length; i++) {
        //   BYTE_ARRAY[i] = BYTE_STRING.charCodeAt(i);
        // }
        // /**
        //  * Tạo đối tượng File từ Uint8Array
        //  */
        // const FILE = new File([BYTE_ARRAY], "image.png", { type: MIME_TYPE });
        /**
         * Đưa vào FormData
         */
        const FORM_DATA = new FormData();
        FORM_DATA.append("file", file);
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

  /**
   *  Thêm sản phẩm mới
   * @param product Sản phẩm mới
   */
  const handleAddProduct = (product: IProductItem) => {
    /** Thêm sản phẩm mới về danh sách */
    const LIST_PRODUCTS = [...data, product];
    setListProducts && setListProducts(LIST_PRODUCTS);
  };

  /** Khai báo lỗi */
  const [errors, setErrors] = useState<{
    shop_name: string;
    shop_address: string;
  }>({
    shop_name: "",
    shop_address: "",
  });

  return (
    <main className="py-2 px-1 max-w-3xl w-full mx-auto gap-y-4 relative">
      <div className="flex flex-col gap-y-4 ">
        <InputTitle
          value_input={data_input_local?.shop_name || ""}
          setValueInput={(e) => {
            // setShopname(e);
            setDataInputLocal({ ...data_input_local, shop_name: e.trim() });
            setDataInput &&
              setDataInput({ ...data_input, shop_name: e.trim() });
            setErrors({ ...errors, shop_name: "" });
            setErrorsInput &&
              setErrorsInput({ ...errors_input, shop_name: "" });
          }}
          title={t("shop_name")}
          placeholder={t("enter_shop_name")}
          error={errors?.shop_name}
        />
        <InputTitle
          value_input={data_input_local?.shop_address || ""}
          setValueInput={(e) => {
            // setShopAddress(e);
            setDataInputLocal({ ...data_input_local, shop_address: e.trim() });
            setDataInput &&
              setDataInput({ ...data_input, shop_address: e.trim() });
            setErrors({ ...errors, shop_address: "" });
            setErrorsInput &&
              setErrorsInput({ ...errors_input, shop_address: "" });
          }}
          title={t("shop_address")}
          placeholder={t("enter_shop_address")}
          error={errors?.shop_address}
        />
        <InputAvatar
          onSelect={(e) => updateLogo && updateLogo(e)}
          defaultValue={data_input_local?.shop_avatar || ""}
        />
      </div>

      <div className="flex flex-row items-center justify-between bg-white sticky top-0 z-10 py-2 w-full">
        <h1 className="md:text-2xl md:font-bold  text-xl font-medium ">Menu</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded text-sm"
        >
          {t("add_product")}
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
                <div className="p-4 text-gray-500">{t("no_data")}</div>
              ))}
          </div>
        )}
      </div>
      {/* {!loading && (
        <div className="flex w-full justify-center items-center sticky bottom-0 p-1">
          <button
            onClick={() => {
              searchShopInfo(
                data_input_local?.shop_name +
                  " - " +
                  data_input_local?.shop_address || "",
                data
              );
            }}
            disabled={loading_shop}
            className="bg-blue-500 text-white px-4 py-2 font-medium rounded hover:bg-blue-700 cursor-pointer flex gap-x-2 items-center"
          >
            {loading_shop ? t("searching_shop") : t("search_shop")}
            <div>{loading_shop && <Loading color_white />}</div>
          </button>
        </div>
      )} */}
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

          const new_data = data.filter((p) => p.id !== id_delete);
          setListProducts && setListProducts(new_data);
        }}
      />
    </main>
  );
}
