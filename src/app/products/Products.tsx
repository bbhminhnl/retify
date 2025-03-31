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
  /** MOCK DATA */
  const LIST_PRODUCT = [
    {
      id: 1,
      name: "Product 1",
      price: 100000,
      product_image: "/imgs/image.png",
      type: "product",
    },
    {
      id: 2,
      name: "Product 2",
      price: 200,
      product_image: "/imgs/image.png",
      type: "product",
    },
    {
      id: 3,
      name: "Product 3",
      price: 300,
      product_image: "/imgs/image.png",
      type: "product",
    },
    {
      id: 4,
      name: "Product 4",
      price: 400,
      product_image: "/imgs/image.png",
      type: "product",
    },
    {
      id: 5,
      name: "Product 5",
      price: 500,
      product_image: "/imgs/image.png",
      type: "product",
    },
    {
      id: 6,
      name: "Product 6",
      price: 600,
      product_image: "/imgs/image.png",
      type: "product",
    },
    {
      id: 7,
      name: "Product 7",
      price: 700,
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
