import React, { useState } from "react";

import { formatCurrency } from "@/utils";

/** Interface Product */
interface ProductItemProps {
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
}

const ProductItemCustom = (props: ProductItemProps) => {
  /** Trạng thái edit */
  const [is_editing, setIsEditing] = useState(false);
  /** Sản phẩm */
  const [product, setProduct] = useState<ProductItemProps>(props);

  /** Hàm xử lý sự kiện khi thay đổi input
   * @param e Sự kiện thay đổi input
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };
  /**
   *  Hàm xử lý sự kiện khi nhấn nút edit
   * @returns void
   */
  const toggleEdit = () => setIsEditing(!is_editing);

  return (
    <div className="relative group flex flex-col items-center w-full max-w-[200px] p-2 rounded shadow-sm">
      {/* Nút Edit (hiện khi hover hoặc luôn hiện ở mobile) */}
      <button
        onClick={toggleEdit}
        className="absolute top-0 right-0 text-xs px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 
                    group-hover:block block md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:cursor-pointer"
      >
        {is_editing ? "Lưu" : "Sửa"}
      </button>

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
        {is_editing ? (
          <>
            <input
              className="text-sm border rounded w-full px-1 py-0.5 mb-1"
              name="name"
              value={product.name}
              onChange={handleChange}
              placeholder="Tên sản phẩm"
            />
            <input
              className="text-sm border rounded w-full px-1 py-0.5 mb-1"
              name="price"
              value={product.price}
              onChange={handleChange}
              placeholder="Giá sản phẩm"
              type="number"
            />
            <input
              className="text-sm border rounded w-full px-1 py-0.5 mb-1"
              name="unit"
              value={product.unit}
              onChange={handleChange}
              placeholder="Đơn vị"
            />
          </>
        ) : (
          <>
            <h1 className="text-sm font-medium truncate">{product?.name}</h1>
            <p className="text-sm font-semibold">
              {formatCurrency(product?.price)} {product?.unit || "đ"}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductItemCustom;
