// import Link from "next/link";
// import React from "react";

// const ActionConnect = () => {
//   return (
//     <div className="flex items-center justify-center h-12">
//       <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
//         <Link href="/connect" className="text-white">
//           Kết nối và cài đặt
//         </Link>
//       </button>
//     </div>
//   );
// };

// export default ActionConnect;
"use client"; // Vì dùng useRouter nên cần thêm dòng này

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Product {
  products: MenuData[]; // Sử dụng MenuData từ types/menu.d.ts
}
const ActionConnect = ({ products }: Product) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAddProductAndNavigate = async (e: React.MouseEvent) => {
    e.preventDefault(); // Chặn hành vi mặc định của Link

    setLoading(true);

    const NEW_PRODUCT = products.map((product: any) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      product_image: product.image_url,
      type: "product",
      unit: product.unit,
    }));

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(NEW_PRODUCT), // Gửi danh sách sản phẩm
      });

      if (res.ok) {
        console.log("Sản phẩm đã được thêm");
        router.push("/connect"); // Chuyển trang sau khi thành công
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
        {loading ? "Đang xử lý..." : "Kết nối và cài đặt"}
      </button>
    </div>
  );
};

export default ActionConnect;
