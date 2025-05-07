import { ImageAnnotatorClient } from "@google-cloud/vision";
import { NextResponse } from "next/server";

/** Khởi tạo client Google Vision */
const CLIENT = new ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

/**
 *  Hàm POST
 * @param request
 * @returns
 */
export async function POST(request: Request) {
  try {
    /**
     * Lấy data base64 tài liệu
     */
    const { imageBase64 } = await request.json();

    /** Loại bỏ header base64 nếu có */
    const BASE64_DATA = imageBase64.replace(
      /^data:image\/(png|jpe?g);base64,/,
      ""
    );

    /** Gọi Vision API để trích xuất text */
    const [result] = await CLIENT.textDetection({
      image: { content: BASE64_DATA },
    });
    /**
     * Full text
     */
    const FULL_TEXT = result.fullTextAnnotation?.text || "";

    /** Xử lý text thành JSON (tách món và giá) */
    const LINES = FULL_TEXT.split("\n");
    /**
     * Danh sách môn món ăn
     */
    const MENU_ITEMS = [];
    let currentItem = { name: "", price: "" };

    for (const line of LINES) {
      /**
       * Data line trim()
       */
      const TRIMMED_LINE = line.trim();
      /**
       * Khi khó trích xuat báo lỗi
       */
      if (!TRIMMED_LINE) continue;

      /** Phát hiện giá (regex tuỳ chỉnh theo menu) */
      const PRICE_MATCH = TRIMMED_LINE.match(
        /(\d{1,3}(?:[.,]\d{3})*)\s*(đ|vnd|k|$)/i
      );
      /**
       * Nếu có Giá match
       */
      if (PRICE_MATCH) {
        currentItem.price = PRICE_MATCH[0];
        MENU_ITEMS.push(currentItem);
        currentItem = { name: "", price: "" };
      } else {
        currentItem.name += TRIMMED_LINE + " ";
      }
    }
    /**
     * Tra ve JSON
     */
    return NextResponse.json({ success: true, data: MENU_ITEMS });
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      { success: false, error: "Failed to extract menu" },
      { status: 500 }
    );
  }
}

// import { NextRequest, NextResponse } from "next/server";

// import Tesseract from "tesseract.js";

// export async function POST(req: NextRequest) {
//   try {
//     const { imageUrl } = await req.json();

//     if (!imageUrl || typeof imageUrl !== "string") {
//       return NextResponse.json(
//         { error: "Vui lòng cung cấp một URL ảnh hợp lệ" },
//         { status: 400 }
//       );
//     }

//     const {
//       data: { text },
//     } = await Tesseract.recognize(imageUrl, "eng");

//     const result = {
//       extractedText: text,
//       timestamp: new Date().toISOString(),
//     };

//     return NextResponse.json(result, { status: 200 });
//   } catch (error) {
//     console.error("Lỗi khi xử lý ảnh:", error);
//     return NextResponse.json(
//       { error: "Đã xảy ra lỗi khi xử lý ảnh" },
//       { status: 500 }
//     );
//   }
// }
