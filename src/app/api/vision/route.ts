import vision, { protos } from "@google-cloud/vision";

import { NextResponse } from "next/server";

/** Properly typed image input preparation
 * @param {string} base64Image - Base64 encoded image
 * @returns {protos.google.cloud.vision.v1.IImage} - Image object for Vision API
 * @description
 * - Takes a base64 encoded image string
 * - Removes the data URL prefix if present
 * - Returns a properly typed image object for the Vision API
 * @throws {Error} - Throws an error if base64Image is missing
 */
function prepareImageInput(
  base64Image?: string
): protos.google.cloud.vision.v1.IImage {
  /** Nếu có base64Image thì throw lỗi*/
  if (!base64Image) throw new Error("Missing base64Image");

  /** Remove data URL prefix if present */
  const BASE64_DATA = base64Image.startsWith("data:")
    ? base64Image.split(",")[1]
    : base64Image;

  /** Return properly typed image object */
  return {
    content: BASE64_DATA,
  } as protos.google.cloud.vision.v1.IImage;
}

/** Hàm xử lý sự kiện POST
 * @param { Request } req - Đối tượng yêu cầu
 * @description
 * - Nhận base64Image hoặc imageUrl từ client
 * - Nếu có base64Image thì sử dụng nó
 * - Nếu không có base64Image thì sử dụng imageUrl để fetch và chuyển đổi thành base64
 * - Gọi Vision API để nhận diện văn bản và nhãn
 * - Trả về kết quả dưới dạng JSON
 * @returns { NextResponse }
 */
export async function POST(req: Request) {
  try {
    /** Nhận base64Image hoặc imageUrl từ client */
    const { base64Image, imageUrl } = await req.json();
    /**
     * Kiểm tra xem có base64Image hoặc imageUrl không
     */
    if (!base64Image && !imageUrl) {
      return NextResponse.json(
        { error: "Missing base64Image or imageUrl in request body" },
        { status: 400 }
      );
    }
    /** Tạo client */
    const CLIENT = new vision.ImageAnnotatorClient({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS || "{}"),
    });
    /** Tạo biến image */
    let image: protos.google.cloud.vision.v1.IImage | any;
    /** Nếu có base64Image thì sử dụng nó */
    if (base64Image) {
      image = prepareImageInput(base64Image);
    } else {
      /** Nếu không có base64Image thì sử dụng imageUrl để fetch và chuyển đổi thành base64 */
      const BASE64 = await fetchImageAsBase64(imageUrl!);
      /** Gọi hàm fetchImageAsBase64 để lấy base64 từ imageUrl */
      image = prepareImageInput(BASE64);
    }

    /** Explicitly type the detection requests */
    const TEXT_REQUEST: protos.google.cloud.vision.v1.IImageContext = {};
    /** Label request */
    const LABEL_REQUEST: protos.google.cloud.vision.v1.IImageContext = {};
    /** Gọi Vision API để nhận diện văn bản và nhãn */
    const [TEXT_RESULTS, LABEL_RESULTS] = await Promise.all([
      CLIENT.textDetection({ image, imageContext: TEXT_REQUEST }),
      CLIENT.labelDetection({ image, imageContext: LABEL_REQUEST }),
    ]);
    /** Trả về kết quả dưới dạng JSON */
    return NextResponse.json({
      texts: TEXT_RESULTS[0].textAnnotations?.map((t) => t.description),
      labels: LABEL_RESULTS[0].labelAnnotations?.map((l) => l.description),
    });
  } catch (error) {
    console.error("Vision API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Vision API failed" },
      { status: 500 }
    );
  }
}

/** Helper function with proper typing */
async function fetchImageAsBase64(url: string): Promise<string> {
  /**
   * Fetch image from URL
   */
  const RESPONSE = await fetch(url);
  /**
   * Check if response is ok or throw error
   */
  if (!RESPONSE.ok) throw new Error("Failed to fetch image from URL");
  /**
   * Convert response to ArrayBuffer and then to base64
   */
  const ARRAY_BUFFER = await RESPONSE.arrayBuffer();
  /** Return base64 */
  return Buffer.from(ARRAY_BUFFER).toString("base64");
}
