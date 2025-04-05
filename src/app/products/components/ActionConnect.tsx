"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Product {
  /**
   * List sản phẩm
   */
  products: MenuData[];
}
const ActionConnect = ({ products }: Product) => {
  /**
   * ROuter
   */
  const ROUTER = useRouter();
  /**
   * Trạng thái loading
   */
  const [loading, setLoading] = useState(false);

  /**
   *  Hàm xử lý sự kiện khi nhấn nút thêm sản phẩm
   * @param e
   */
  const handleAddProductAndNavigate = async (e: React.MouseEvent) => {
    /** Chặn hành vi mặc định của Link */
    e.preventDefault();
    /**
     * Thêm loading
     */
    setLoading(true);
    /** Sản phẩm mới */
    const NEW_PRODUCT = products.map((product: any) => ({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      product_image: `${product.image_url}`,
      type: "product",
      unit: product.unit,
    }));

    try {
      /**
       * Thêm sản phẩm mới vào danh sách sản phẩm
       */
      const RES = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        /** Gửi danh sách sản phẩm */
        body: JSON.stringify(NEW_PRODUCT),
      });
      /**
       * Kiểm tra xem có lỗi không
       */
      if (RES.ok) {
        console.log("Sản phẩm đã được thêm");
        /** Chuyển trang sau khi thành công */
        ROUTER.push("/connect");
      } else {
        console.error("Lỗi khi thêm sản phẩm");
      }
    } catch (error) {
      console.error("Lỗi mạng hoặc server:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-12">
      <button
        onClick={handleAddProductAndNavigate}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        disabled={loading} // Vô hiệu hóa nút khi đang xử lý
      >
        {loading ? "Processing..." : "Connect and Set Up"}
      </button>
    </div>
  );
};

export default ActionConnect;
