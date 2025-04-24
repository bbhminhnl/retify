import { NextResponse } from "next/server";
import redis from "@/lib/redis";

/**
 * POST /api/json
 * Body: { key: string, value: any }
 */
export async function POST(req: Request) {
  try {
    /**
     * Lấy dữ liệu từ body
     */
    const { key, value } = await req.json();
    /** Kiểm tra key và value */
    if (!key || !value) {
      return NextResponse.json(
        { success: false, error: "Thiếu key hoặc value" },
        { status: 400 }
      );
    }

    await redis.set(key, JSON.stringify(value));
    /** Thiết lập thời gian sống cho key */
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Lỗi khi xử lý yêu cầu" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/json?key=client_id__message_id
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    console.log(searchParams, "searchParams");
    /** Lấy key từ query */
    const KEY = searchParams.get("key");
    /** Kiểm tra key */
    if (!KEY) {
      return NextResponse.json(
        { success: false, error: "Thiếu key" },
        { status: 400 }
      );
    }

    const RAW_DATA = await redis.get(KEY);
    console.log(RAW_DATA, "RAW_DATA server");
    /** Kiểm tra dữ liệu */
    if (!RAW_DATA) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy dữ liệu" },
        { status: 404 }
      );
    }
    /** Chuyển đổi dữ liệu từ Redis về định dạng JSON */
    const DATA = JSON.parse(RAW_DATA);
    return NextResponse.json({ success: true, DATA });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Lỗi khi lấy dữ liệu từ Redis" },
      { status: 500 }
    );
  }
}
