import { NextResponse } from "next/server";

export async function GET() {
  const products = [
    {
      id: 1,
      name: "Product 1",
      price: 100000,
      product_image:
        "https://static.botbanhang.vn/merchant/files/business_67d2932bab27af2383584987/1743442207865.png",
      type: "product",
    },
    {
      id: 2,
      name: "Product 2",
      price: 200,
      product_image:
        "https://static.botbanhang.vn/merchant/files/business_67d2932bab27af2383584987/1743442207865.png",
      type: "product",
    },
    {
      id: 3,
      name: "Product 3",
      price: 300,
      product_image:
        "https://static.botbanhang.vn/merchant/files/business_67d2932bab27af2383584987/1743442207865.png",
      type: "product",
    },
    {
      id: 4,
      name: "Product 4",
      price: 400,
      product_image:
        "https://static.botbanhang.vn/merchant/files/business_67d2932bab27af2383584987/1743442207865.png",
      type: "product",
    },
    {
      id: 5,
      name: "Product 5",
      price: 500,
      product_image:
        "https://static.botbanhang.vn/merchant/files/business_67d2932bab27af2383584987/1743442207865.png",
      type: "product",
    },
    {
      id: 6,
      name: "Product 6",
      price: 600,
      product_image:
        "https://static.botbanhang.vn/merchant/files/business_67d2932bab27af2383584987/1743442207865.png",
      type: "product",
    },
    {
      id: 7,
      name: "Product 7",
      price: 700,
      product_image:
        "https://static.botbanhang.vn/merchant/files/business_67d2932bab27af2383584987/1743442207865.png",
      type: "product",
    },
  ];

  return NextResponse.json(products);
}
