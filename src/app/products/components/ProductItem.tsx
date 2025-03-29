import Image from "next/image";
import React from "react";
// import Button from "@/assets/icons/Button.svg";
import { formatCurrency } from "@/utils";

interface ProductItemProps {
  /**
   * Product name
   */
  name?: string;
  price?: number;
  product_image?: string;
  type?: string;
}
const ProductItem = (data: ProductItemProps) => {
  return (
    <div className="flex flex-col gap-y-2 h-fit w-fit relative overflow-hidden ">
      <div className="relative w-full">
        {data.product_image ? (
          <Image
            src={data.product_image}
            alt=""
            width={200}
            height={200}
            className="rounded"
          />
        ) : (
          <div className=" bg-gray-300 rounded-xl flex items-center justify-center text-2xl">
            48x48
          </div>
        )}
        {/* Nút "+" nằm gọn bên trong */}
        <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-2xl cursor-pointer hover:bg-gray-800">
          +
        </div>
      </div>
      <div className="">
        <h1 className="text-sm font-medium">{data.name}</h1>
        <p className="text-sm font-semibold">
          {formatCurrency(data?.price || 0)}
        </p>
      </div>
    </div>
  );
};

export default ProductItem;
