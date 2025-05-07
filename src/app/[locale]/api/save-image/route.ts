import { promises as fs } from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    /** Nhận base64 từ client */
    const { base64Image } = await request.json();

    /** Chuyển đổi Base64 sang Buffer */
    const BUFFER = base64ToBuffer(base64Image);

    /** Tạo tên file ngẫu nhiên */
    const FILE_NAMES = `image-${Date.now()}.png`;
    /** Đường dẫn lưu file */
    const OUTPUT_PATH = path.join(
      process.cwd(),
      "public",
      "images",
      FILE_NAMES
    );

    /** Đảm bảo thư mục tồn tại */
    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });

    /** Lưu file */
    await fs.writeFile(OUTPUT_PATH, BUFFER);

    /** Trả về đường dẫn public */
    const PUBLIC_URL = `/images/${FILE_NAMES}`;
    /**
     * Trả về JSON
     * @param {string}
     * image_url - URL của ảnh được tạo ra
     */
    return new Response(
      JSON.stringify({ success: true, imageUrl: PUBLIC_URL }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error saving image:", error);
    return new Response(JSON.stringify({ success: false, error: error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
/**
 *  Chuyển đổi Base64 sang Buffer
 * @param {string} base64String - Chuỗi Base64
 * @param base64String
 * @returns
 */
function base64ToBuffer(base64String: string): Buffer {
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64Data, "base64");
}
