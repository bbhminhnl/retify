import { NextResponse } from "next/server";

export async function GET() {
  /** Danh sách sản phẩm MOCK*/
  const PRODUCT = [
    {
      id: 1,
      name: "Cốt dừa đá xay",
      price: 30000,
      product_image:
        "https://static.botbanhang.vn/merchant/files/business_67d2932bab27af2383584987/1743442207865.png",
      type: "product",
    },
    {
      id: 2,
      name: "Trà sữa trân châu",
      price: 20000,
      product_image:
        "https://static.botbanhang.vn/merchant/files/business_67d2932bab27af2383584987/1743442207865.png",
      type: "product",
    },
    {
      id: 3,
      name: "Trà sữa trân châu đường đen",
      price: 30000,
      product_image:
        "https://static.botbanhang.vn/merchant/files/business_67d2932bab27af2383584987/1743442207865.png",
      type: "product",
    },
    {
      id: 4,
      name: "Trả đào cam sả",
      price: 20000,
      product_image:
        "https://static.botbanhang.vn/merchant/files/business_67d2932bab27af2383584987/1743442207865.png",
      type: "product",
    },
    {
      id: 5,
      name: "Cà phê đen",
      price: 15000,
      product_image:
        "https://static.botbanhang.vn/merchant/files/business_67d2932bab27af2383584987/1743442207865.png",
      type: "product",
    },
    {
      id: 6,
      name: "Cà phê sữa",
      price: 30000,
      product_image:
        "https://static.botbanhang.vn/merchant/files/business_67d2932bab27af2383584987/1743442207865.png",
      type: "product",
    },
    {
      id: 7,
      name: "Sữa chua mít",
      price: 20000,
      product_image:
        "https://static.botbanhang.vn/merchant/files/business_67d2932bab27af2383584987/1743442207865.png",
      type: "product",
    },
  ];

  return NextResponse.json(PRODUCT);
}
