import React, { useEffect, useState } from "react";

import { Trash } from "lucide-react";
import { formatCurrency } from "@/utils";

/** Interface Product */
interface ProductItemProps {
  /** ID sản phẩm */
  id?: string;
  /** Tên sản phẩm */
  name?: string;
  /** Giá sản phẩm */
  price?: number | string | undefined;
  /** Hình anh sản phẩm */
  product_image?: string;
  /** Loại sản phẩm */
  type?: string;
  /** Đơn vi tìm giá */
  unit?: string;
  /** Update data */
  onUpdate?: (product: ProductItemProps) => void;
  /** Delete data */
  onDelete?: (id: string) => void;
}

const ProductItemCustom = ({
  id,
  name,
  price,
  product_image,
  type = "product",
  unit,
  onUpdate,
  onDelete,
}: ProductItemProps) => {
  /** Trạng thái edit */
  const [is_editing, setIsEditing] = useState(false);
  /** Sản phẩm */
  const [product, setProduct] = useState<ProductItemProps>({
    id,
    name,
    price,
    product_image,
    type,
    unit,
  });

  /**
   *  Hàm xử lý sự kiện khi nhấn nút edit
   * @returns void
   */
  const toggleEdit = () => {
    /** Khi ấn lưu sẽ lưu lại giá trị product */
    if (onUpdate) {
      onUpdate(product);
    }
  };
  /** Khi tên, giá, hình anh, loại, đơn vi tìm giá thay đổi */
  useEffect(() => {
    setProduct({
      id,
      name,
      price,
      product_image,
      type,
      unit,
    });
  }, [name, price, product_image, type, unit]);

  return (
    <div className="relative group flex flex-col items-center w-full max-w-[200px] p-2 rounded shadow-md">
      <div className="absolute top-0 right-0 flex gap-x-2">
        {/* Nút Edit (hiện khi hover hoặc luôn hiện ở mobile) */}
        <button
          onClick={toggleEdit}
          className=" text-xs px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 
        group-hover:block block md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          Sửa
        </button>

        {/* Nút Xoa (hiện khi hover hoặc luôn hiện ở mobile) */}
        <button
          onClick={() => onDelete?.(id || "")}
          className=" text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 
        group-hover:block block md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          <Trash className="size-4" />
        </button>
      </div>

      {/* Ảnh sản phẩm */}
      <div className="w-full aspect-square bg-gray-200 flex items-center justify-center overflow-hidden rounded">
        <img
          src={product?.product_image || "/imgs/no_img.jpg"}
          alt={product?.name || "Product image"}
          width={200}
          height={200}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Thông tin sản phẩm */}
      <div className="w-full mt-2">
        <h1 className="text-sm font-medium truncate">{product?.name}</h1>
        <p className="text-sm font-semibold">
          {formatCurrency(product?.price)} {product?.unit || "đ"}
        </p>
      </div>
    </div>
  );
};

export default ProductItemCustom;
