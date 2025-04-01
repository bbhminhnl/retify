"use client";

import React, { useEffect, useState } from "react";

import ProductItem from "./components/ProductItem";

/**
 * Interface Product
 */
type Product = {
  /**
   * id
   */
  id: number;
  /** Tên */
  name: string;
  /** Giá */
  price: number;
  /** IMG */
  product_image: string;
  /** Type */
  type: string;
};

function Product() {
  /** Danh sách sản phẩm MOCK*/
  const LIST_PRODUCT = [
    {
      id: 1,
      name: "Cốt dừa đá xay",
      price: 30000,
      product_image: "/imgs/image.png",
      type: "product",
    },
    {
      id: 2,
      name: "Trà sữa trân châu",
      price: 20000,
      product_image: "/imgs/image.png",
      type: "product",
    },
    {
      id: 3,
      name: "Trà sữa trân châu đường đen",
      price: 30000,
      product_image: "/imgs/image.png",
      type: "product",
    },
    {
      id: 4,
      name: "Trả đào cam sả",
      price: 20000,
      product_image: "/imgs/image.png",
      type: "product",
    },
    {
      id: 5,
      name: "Cà phê đen",
      price: 15000,
      product_image: "/imgs/image.png",
      type: "product",
    },
    {
      id: 6,
      name: "Cà phê sữa",
      price: 30000,
      product_image: "/imgs/image.png",
      type: "product",
    },
    {
      id: 7,
      name: "Sữa chua mít",
      price: 20000,
      product_image: "/imgs/image.png",
      type: "product",
    },
  ];
  /**
   * List product
   */
  const [products, setProducts] = useState<Product[]>([]);
  /**
   * Fetch list product
   */
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);
  return (
    <div className="md:container md:mx-auto p-2 px-4">
      <h2 className="text-2xl font-bold">Menu</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ">
        {LIST_PRODUCT.map((item) => {
          return (
            <ProductItem
              key={item.id}
              name={item.name}
              price={item.price}
              product_image={item.product_image}
              type={item.type}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Product;
