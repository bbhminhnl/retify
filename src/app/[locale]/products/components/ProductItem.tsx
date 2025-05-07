import Image from "next/image";
import React from "react";
// import Button from "@/assets/icons/Button.svg";
import { formatCurrency } from "@/utils";

interface ProductItemProps {
  /**
   * Product name
   */
  name?: string;
  /**
   * Giá sản phẩm
   */
  price?: number;
  /** Ảnh sản phẩm */
  product_image?: string;
  /** Loại sản phẩm */
  type?: string;
}
const ProductItem = (data: ProductItemProps) => {
  return (
    <div className="flex flex-col items-center w-full max-w-[200px]">
      {/* Ảnh sản phẩm */}
      <div className="w-full aspect-square bg-gray-200 flex items-center justify-center overflow-hidden rounded">
        <Image
          src={data.product_image || ""}
          alt={data.name || "Product image"}
          width={200}
          height={200}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Thông tin sản phẩm */}
      <div className="w-full">
        <h1 className="text-sm font-medium truncate">{data.name}</h1>
        <p className="text-sm font-semibold">
          {formatCurrency(data?.price || 0)}
        </p>
      </div>
    </div>
  );
};

export default ProductItem;
