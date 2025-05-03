import { NextResponse } from "next/server";
import redis from "@/lib/redis"; // Import Redis client

/** ✅ GET: Lấy danh sách sản phẩm từ Redis */
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

    /** Lấy dữ liệu sản phẩm từ Redis với sessionId */
    const PRODUCTS = await redis.get(SESSION_ID + "_products");

    /** Kiểm tra và parse sản phẩm từ Redis nếu có */
    if (!PRODUCTS) {
      return NextResponse.json([]); // Trả về mảng rỗng nếu không có dữ liệu
    }
    /** Trả về danh sách sản phẩm */
    return NextResponse.json(JSON.parse(PRODUCTS)); // Chuyển đổi từ JSON về mảng sản phẩm
  } catch (error) {
    /** Kiểu hóa error như một đối tượng Error để có thể truy cập thuộc tính message */
    return NextResponse.json(
      { error: "Lỗi khi lấy dữ liệu sản phẩm từ Redis" },
      { status: 500 }
    );
  }
}

/** ✅ POST: Thêm một hoặc nhiều sản phẩm */
export async function POST(req: Request) {
  try {
    /** Body từ request */
    const BODY = await req.json(); // Lấy dữ liệu từ body của request
    /** Lấy sessionId từ body */
    const SESSION_ID = BODY.session_id; // Lấy sessionId từ body
    /** Kiểm tra xem sessionId có hợp lệ không */
    if (!SESSION_ID) {
      return NextResponse.json({ error: "Thiếu sessionId" }, { status: 400 });
    }
    /** Lấy danh sách sản phẩm từ body */
    const PRODUCTS = BODY.products;

    /** Kiểm tra dữ liệu đầu vào */
    if (!Array.isArray(PRODUCTS)) {
      return NextResponse.json(
        { error: "Dữ liệu phải là một danh sách sản phẩm" },
        { status: 400 }
      );
    }
    /** Kiểm tra từng sản phẩm trong danh sách
     * Nếu sản phẩm không có tên, giá hoặc hình ảnh thì trả về lỗi
     */
    const NEW_PRODUCT = PRODUCTS.map((product, index) => {
      if (!product.name || !product.price || !product.product_image) {
        throw new Error(`Sản phẩm thứ ${index + 1} thiếu thông tin`);
      }
      /** Lưu lại đúng format upload lên Merchant */
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        product_image: product.product_image,
        type: "product",
      };
    });

    /** Lưu vào Redis Cloud với TTL (ví dụ: 10 phút) */
    await redis.set(SESSION_ID + "_products", JSON.stringify(NEW_PRODUCT), {
      EX: 300, // TTL 10 phút
    });

    return NextResponse.json(NEW_PRODUCT, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Lỗi server" },
      { status: 500 }
    );
  }
}

/** ❌ DELETE: Xóa session sản phẩm */
export async function DELETE(req: Request) {
  try {
    const cookies = req.headers.get("cookie"); // Lấy cookies từ header

    // Đọc sessionId từ cookie
    const sessionId = cookies
      ? cookies
          .split(";")
          .find((c) => c.trim().startsWith("sessionId="))
          ?.split("=")[1]
      : undefined;

    if (!sessionId) {
      return NextResponse.json({ error: "Thiếu sessionId" }, { status: 400 });
    }

    // Xóa session từ Redis Cloud
    await redis.del(sessionId + "_products");

    return NextResponse.json({ message: "Đã xóa session sản phẩm." });
  } catch (error) {
    return NextResponse.json(
      { error: "Lỗi khi xóa session sản phẩm" },
      { status: 500 }
    );
  }
}
