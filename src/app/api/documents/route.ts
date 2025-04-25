import { NextResponse } from "next/server";

let SHOP_INFORMATION_DOCUMENT = ""; // Lưu thông tin cửa hàng dưới dạng chuỗi

/** ✅ GET: Lấy thông tin cửa hàng */
export async function GET() {
  return NextResponse.json({
    document: SHOP_INFORMATION_DOCUMENT,
  });
}

/** ✅ PUT: Cập nhật thông tin cửa hàng */
export async function PUT(req: Request) {
  try {
    /** Nhận dữ liệu từ client */
    const BODY = await req.text(); // Nhận chuỗi từ client
    /** Kiểm tra xem BODY có phải là chuỗi không */
    if (typeof BODY !== "string" || BODY.trim() === "") {
      return NextResponse.json(
        { error: "Thông tin cửa hàng không hợp lệ" },
        { status: 400 }
      );
    }
    /** Lưu thông tin body */
    SHOP_INFORMATION_DOCUMENT = BODY.trim();
    /** Trả về thông báo thành công */
    return NextResponse.json(
      {
        message: "Cập nhật thông tin cửa hàng thành công",
        document: SHOP_INFORMATION_DOCUMENT,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Lỗi server khi cập nhật thông tin cửa hàng",
      },
      { status: 500 }
    );
  }
}
