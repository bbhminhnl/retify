// import { NextResponse } from "next/server";
// // app/api/json/route.ts
// import { redis } from "@/lib/redis";

// export async function POST(req: Request) {
//   const json = await req.json();

//   await redis.set("my-json", JSON.stringify(json));
//   return NextResponse.json({ success: true });
// }

import { NextResponse } from "next/server";
// app/api/json/route.ts
import redis from "@/lib/redis";

export async function POST(req: Request) {
  const { key, value } = await req.json();
  /** Kiểm tra key và value */
  if (!key || !value) {
    return NextResponse.json(
      { success: false, error: "Thiếu key hoặc value" },
      { status: 400 }
    );
  }

  /** Lưu vào Redis với key: client_id__message_id */
  await redis.set(key, JSON.stringify(value));
  return NextResponse.json({ success: true });
}

/** GET dữ liệu theo `key` (client_id__message_id) */
export async function GET(req: Request) {
  /** lấy params trên url */
  const { searchParams } = new URL(req.url);
  /** lấy key từ params */
  const KEY = searchParams.get("key"); // hoặc có thể lấy từ params nếu cần
  /** Lấy key */
  if (!KEY) {
    return NextResponse.json(
      { success: false, error: "Thiếu key" },
      { status: 400 }
    );
  }
  /** Lưu thông tin raw data */
  const RAW_DATA = await redis.get(KEY);
  /** Kiểm tra dữ liệu */
  const VALUE = RAW_DATA ? JSON.parse(RAW_DATA) : null;
  /** Trả về thông tin */
  return NextResponse.json({ data: VALUE });
}
