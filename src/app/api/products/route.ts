import { NextResponse } from "next/server";

let PRODUCTS = [] as any; // Danh sách sản phẩm

/** ✅ GET: Lấy danh sách sản phẩm */
export async function GET() {
  return NextResponse.json(PRODUCTS);
}

/** ✅ POST: Thêm một hoặc nhiều sản phẩm */
export async function POST(req: Request) {
  try {
    /**
     * Kiểm tra xem có sản phẩm nào trong danh sách không
     */
    const BODY = await req.json();

    /** Kiểm tra nếu `BODY` là một danh sách (mảng) */
    if (!Array.isArray(BODY)) {
      return NextResponse.json(
        { error: "Dữ liệu phải là một danh sách sản phẩm" },
        { status: 400 }
      );
    }

    /** Kiểm tra từng sản phẩm trong danh sách */
    const NEW_PRODUCT = BODY.map((product, index) => {
      if (!product.name || !product.price || !product.product_image) {
        throw new Error(`Sản phẩm thứ ${index + 1} thiếu thông tin`);
      }
      /** Trả về thông tin sản phẩm */
      return {
        id: PRODUCTS.length + 1 + index,
        name: product.name,
        price: product.price,
        product_image: product.product_image,
        type: "product",
      };
    });

    /** Thêm vào danh sách sản phẩm */
    PRODUCTS.push(...NEW_PRODUCT);
    /** Trả về danh sách sản phẩm mới */
    return NextResponse.json(NEW_PRODUCT, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Lỗi server" },
      { status: 500 }
    );
  }
}
