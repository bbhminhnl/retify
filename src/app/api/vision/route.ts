// import { ImageAnnotatorClient } from "@google-cloud/vision";
// import { NextResponse } from "next/server";
// import sharp from "sharp";
// /** Khơi tạo client */
// const CLIENT = new ImageAnnotatorClient();
// /**
//  * Regex tìm giá (tuỳ chỉnh theo menu)
//  */
// const CURRENCY_REGEX =
//   /(\$|\€|\¥|\£|\₫)\s*\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?|\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?\s*(USD|EUR|JPY|GBP|VND|₫)/g;
// export async function POST(req: Request) {
//   try {
//     /** 1. Nhận URL ảnh từ client */
//     const { image_url: IMAGE_URL } = await req.json();

//     /** 2. Tải và tiền xử lý ảnh */
//     const PROCESSED_IMAGE = await processImage(IMAGE_URL);

//     /** 3. Gọi Google Vision OCR */
//     const [ocrResult] = await CLIENT.textDetection({
//       image: { content: PROCESSED_IMAGE },
//     });

//     /** 4. Phân tích menu */
//     const MENU_ITEMS = parseMenu(ocrResult.fullTextAnnotation?.text || "");
//     /**
//      * 5. Tra ve kết quả
//      */
//     return NextResponse.json({ success: true, data: MENU_ITEMS });
//   } catch (error: any) {
//     return NextResponse.json(
//       { success: false, error: error.message },
//       { status: 500 }
//     );
//   }
// }

// /** Tiền xử lý ảnh (tăng độ chính xác OCR) */
// async function processImage(url: string): Promise<Buffer> {
//   /**
//    * Data Response
//    */
//   const RES = await fetch(url);
//   /**
//    * Buffer
//    */
//   const BUFFER_VALUE = Buffer.from(await RES.arrayBuffer());
//   /**
//    *  Xử lý ảnh
//    */
//   return sharp(BUFFER_VALUE)
//     .greyscale()
//     .normalize()
//     .sharpen()
//     .threshold(150)
//     .toBuffer();
// }

// /** Phân tích văn bản thành menu */
// function parseMenu(text: string): MenuItem[] {
//   /**
//    * Tìm tên món và giá
//    */
//   const LINES = text.split("\n").filter((l) => l.trim().length > 3);
//   /**
//    * Kết quả
//    */
//   const ITEMS: MenuItem[] = [];
//   /**
//    * Lặp tìm tên món và giá
//    */
//   for (const line of LINES) {
//     /**
//      * Tìm tên món và giá
//      */
//     const PRICE = [...line.matchAll(CURRENCY_REGEX)];
//     /**
//      * Kết quả
//      */
//     if (PRICE.length === 0) continue;
//     /**
//      * Tìm tên món
//      */
//     const LAST_PRICE = PRICE[PRICE.length - 1][0];
//     /**
//      * Tìm tên món
//      */
//     const NAME = line.replace(LAST_PRICE, "").trim();

//     ITEMS.push({
//       name: NAME,
//       price: normalizePrice(LAST_PRICE),
//       currency: detectCurrency(LAST_PRICE),
//       originalText: line,
//     });
//   }

//   return ITEMS;
// }

// /** Chuẩn hóa giá về số */
// function normalizePrice(priceStr: string): number {
//   const CLEAN_STR = priceStr.replace(/[^\d,.-]/g, "");

//   /** Phát hiện định dạng (1.000,00 vs 1,000.00) */
//   const IS_EUROPEAN_FORMAT = /,\d{2}$/.test(CLEAN_STR);

//   return parseFloat(
//     CLEAN_STR.replace(IS_EUROPEAN_FORMAT ? /\./g : /,/g, "").replace(
//       IS_EUROPEAN_FORMAT ? "," : ".",
//       "."
//     )
//   );
// }

// /** Xác định loại tiền tệ
//  * @returns USD | EUR | VND | JPY | GBP
//  */
// function detectCurrency(priceStr: string): string {
//   if (/\$|USD/.test(priceStr)) return "USD";
//   if (/€|EUR/.test(priceStr)) return "EUR";
//   if (/₫|VND/.test(priceStr)) return "VND";
//   if (/¥|JPY/.test(priceStr)) return "JPY";
//   if (/£|GBP/.test(priceStr)) return "GBP";
//   return "UNKNOWN";
// }
// /**
//  * Kết quả phân tích
//  */
// type MenuItem = {
//   /**
//    * Teen
//    */
//   name: string;
//   /**
//    * Giá
//    */
//   price: number;
//   /**
//    *    Loại tìm giá
//    */
//   currency: string;
//   /**
//    *    Văn bản góc
//    */
//   originalText?: string;
// };
// import { NextResponse } from "next/server";
// import vision from "@google-cloud/vision";

// const client = new vision.ImageAnnotatorClient({
//   credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS!),
// });

// export async function POST(req: Request) {
//   const { url } = await req.json();

//   try {
//     const [textResult] = await client.textDetection(url);
//     const [labelResult] = await client.labelDetection(url);

//     return NextResponse.json({
//       texts: textResult.textAnnotations?.map((t) => t.description),
//       labels: labelResult.labelAnnotations?.map((l) => l.description),
//     });
//   } catch (error) {
//     return NextResponse.json({ error: "Vision API failed" }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";
/** Khai báo client */
const CLIENT = new vision.ImageAnnotatorClient({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS!),
});

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
