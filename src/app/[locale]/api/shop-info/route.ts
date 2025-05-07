import { NextResponse } from "next/server";
import redis from "@/lib/redis"; // Import Redis client

/** ✅ GET: Lấy thông tin cửa hàng từ Redis */
export async function GET(req: Request) {
  try {
    /** Lấy sessionId từ cookies hoặc headers nếu cần */
    const COOKIES = req.headers.get("cookie"); // Lấy cookies từ header

    /** Đọc sessionId từ cookie */
    const SESSION_ID = COOKIES
      ? COOKIES.split(";")
          .find((c) => c.trim().startsWith("sessionId="))
          ?.split("=")[1]
      : undefined;
    /** Kiểm tra sessionId
     * Nếu không có sessionId thì trả về lỗi 400
     */
    if (!SESSION_ID) {
      return NextResponse.json({ error: "Thiếu sessionId" }, { status: 400 });
    }

    /** Lấy thông tin cửa hàng từ Redis */
    const SHOP_INFORMATION = await redis.get(SESSION_ID + "_shop_information");
    /** nếu không có dữ liệu thì trả về chuỗi rỗng */
    if (!SHOP_INFORMATION) {
      return NextResponse.json([]);
    }

    /** Trả về thông tin cửa hàng */
    return NextResponse.json({
      shop_information: SHOP_INFORMATION,
    });
  } catch (error) {
    /** Kiểu hóa error như một đối tượng Error để có thể truy cập thuộc tính message */
    const ERROR = error as Error;
    /** Trả về lỗi 500 nếu có lỗi xảy ra */
    return NextResponse.json(
      {
        error: ERROR.message || "Lỗi server khi lấy thông tin cửa hàng",
      },
      { status: 500 }
    );
  }
}

/** ✅ PUT: Cập nhật thông tin cửa hàng */
export async function PUT(req: Request) {
  try {
    /** Body từ request */
    const BODY = await req.json(); // Nhận dữ liệu JSON từ client
    /** Lấy sessionId từ cookies hoặc headers nếu cần */
    const { session_id, content } = BODY; // Giải nén sessionId và content từ BODY

    /** Kiểm tra xem sessionId và content có hợp lệ không */
    if (!session_id || !content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    /** Lưu thông tin cửa hàng vào Redis với session_id */
    await redis.set(session_id + "_shop_information", content, { EX: 300 }); // TTL 5 phút
    /** Trả về thông báo thành công */
    return NextResponse.json({
      message: "Cập nhật thông tin cửa hàng thành công",
      shop_information: content, // Trả lại thông tin cửa hàng mới
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Lỗi server khi cập nhật thông tin cửa hàng",
      },
      { status: 500 }
    );
  }
}
