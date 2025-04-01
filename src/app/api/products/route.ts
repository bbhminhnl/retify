import { NextResponse } from "next/server";

export async function GET() {
  /** Danh sách sản phẩm MOCK*/
  const PRODUCT = [
    {
      id: 1,
      name: "Cốt dừa đá xay",
      price: 30000,
      product_image:
        "https://lypham.vn/wp-content/uploads/2024/09/ca-phe-cot-dua-da-xay.jpg",
      type: "product",
    },
    {
      id: 2,
      name: "Trà sữa trân châu",
      price: 20000,
      product_image:
        "https://cdn.nguyenkimmall.com/images/companies/_1/tin-tuc/kinh-nghiem-meo-hay/n%E1%BA%A5u%20%C4%83n/cach-lam-tran-chau-tra-sua_1.jpg",
      type: "product",
    },
    {
      id: 3,
      name: "Trà sữa trân châu đường đen",
      price: 30000,
      product_image:
        "https://xingfuvietnam.vn/wp-content/uploads/2023/02/xingfu-tra-sua-tran-chau-duong-den-2-FILEminimizer.jpg",
      type: "product",
    },
    {
      id: 4,
      name: "Trả đào cam sả",
      price: 20000,
      product_image:
        "https://lypham.vn/wp-content/uploads/2024/09/cach-lam-tra-dao-cam-sa.jpg",
      type: "product",
    },
    {
      id: 5,
      name: "Cà phê đen",
      price: 15000,
      product_image:
        "https://noithatcaphe.vn/images/2022/07/20/ca-phe-den-3.jpg",
      type: "product",
    },
    {
      id: 6,
      name: "Cà phê sữa",
      price: 30000,
      product_image:
        "https://classiccoffee.com.vn/files/common/uong-cafe-sua-co-tot-khong-luu-y-khi-uong-cafe-sua-b7nrl.png",
      type: "product",
    },
    {
      id: 7,
      name: "Sữa chua mít",
      price: 20000,
      product_image:
        "https://thucthan.com/media/2018/06/sua-chua-mit/sua-chua-mit-tran-chau-dua.jpg",
      type: "product",
    },
  ];

  return NextResponse.json(PRODUCT);
}
