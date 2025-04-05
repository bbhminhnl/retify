// }
import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";
/** Khai báo client */

/** Khởi tạo client Vision API */
const CLIENT = new vision.ImageAnnotatorClient();
export async function POST(req: Request) {
  /**
   * Nhận base64 từ client
   */
  const { base64Image } = await req.json();

  try {
    /**
     * Xử lý text
     */
    const [textResult] = await CLIENT.textDetection({
      image: { content: base64Image.split(",")[1] },
    });
    /**
     * Xử lý nhãn
     */
    const [labelResult] = await CLIENT.labelDetection({
      image: { content: base64Image.split(",")[1] },
    });

    /**
     * Trả về kết quả
     * @description
     * - texts: Danh sách văn bản nhận diện được
     * - labels: Danh sách nhãn nhận diện được
     */
    return NextResponse.json({
      // texts: RAW_TEXT,
      texts: textResult.textAnnotations?.map((t) => t.description),
      // labels: labelResult.labelAnnotations?.map((l) => l.description),
    });
  } catch (error) {
    console.error("Vision API Error:", error);
    return NextResponse.json({ error: "Vision API failed" }, { status: 500 });
  }
}
