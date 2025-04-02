// import { ImageAnnotatorClient } from "@google-cloud/vision";
// import { NextResponse } from "next/server";

// const client = new ImageAnnotatorClient();

// export async function POST(request: Request) {
//   try {
//     const { imageUrl } = await request.json();

//     // 1. Tải ảnh từ URL
//     const imageRes = await fetch(imageUrl);
//     const imageBuffer = await imageRes.arrayBuffer();

//     // 2. Gọi Google Vision API
//     const [result] = await client.textDetection({
//       image: { content: Buffer.from(imageBuffer) },
//     });

//     // 3. Phân tích kết quả OCR
//     const menuData = parseMenuText(result.fullTextAnnotation?.text || "");

//     return NextResponse.json(menuData);
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// // Hàm phân tích văn bản menu
// function parseMenuText(text: string) {
//   const lines = text.split("\n").filter((line) => line.trim());
//   const menuItems = [];

//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i];

//     // Tìm tên món và giá (tuỳ chỉnh theo định dạng menu)
//     const PRICE_MATCH = line.match(/(\d{1,3}(?:\.\d{3})*(?:,\d+)?)\s*₫/);
//     /** Phát hiện giá (regex tuỳ chỉnh theo menu) */
//     // const PRICE_MATCH = line.match(/(\d{1,3}(?:[.,]\d{3})*)\s*(đ|vnd|k|$)/i);
//     if (PRICE_MATCH) {
//       const price = parseFloat(
//         PRICE_MATCH[1].replace(/\./g, "").replace(",", ".")
//       );
//       const name = line.replace(PRICE_MATCH[0], "").trim();

//       if (name) {
//         menuItems.push({ name, price });
//       }
//     }
//   }

import { ImageAnnotatorClient } from "@google-cloud/vision";
//   return menuItems;
// }
import { NextResponse } from "next/server";
import sharp from "sharp";
/** Khơi tạo client */
const CLIENT = new ImageAnnotatorClient();
/**
 * Regex tìm giá (tuỳ chỉnh theo menu)
 */
const CURRENCY_REGEX =
  /(\$|\€|\¥|\£|\₫)\s*\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?|\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?\s*(USD|EUR|JPY|GBP|VND|₫)/g;
export async function POST(req: Request) {
  try {
    /** 1. Nhận URL ảnh từ client */
    const { imageUrl: IMAGE_URL } = await req.json();

    /** 2. Tải và tiền xử lý ảnh */
    const PROCESSED_IMAGE = await processImage(IMAGE_URL);

    /** 3. Gọi Google Vision OCR */
    const [ocrResult] = await CLIENT.textDetection({
      image: { content: PROCESSED_IMAGE },
    });

    /** 4. Phân tích menu */
    const MENU_ITEMS = parseMenu(ocrResult.fullTextAnnotation?.text || "");
    /**
     * 5. Tra ve kết quả
     */
    return NextResponse.json({ success: true, data: MENU_ITEMS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/** Tiền xử lý ảnh (tăng độ chính xác OCR) */
async function processImage(url: string): Promise<Buffer> {
  /**
   * Data Response
   */
  const RES = await fetch(url);
  /**
   * Buffer
   */
  const BUFFER_VALUE = Buffer.from(await RES.arrayBuffer());
  /**
   *  Xử lý ảnh
   */
  return sharp(BUFFER_VALUE)
    .greyscale()
    .normalize()
    .sharpen()
    .threshold(150)
    .toBuffer();
}

/** Phân tích văn bản thành menu */
function parseMenu(text: string): MenuItem[] {
  /**
   * Tìm tên món và giá
   */
  const LINES = text.split("\n").filter((l) => l.trim().length > 3);
  /**
   * Kết quả
   */
  const ITEMS: MenuItem[] = [];
  /**
   * Lặp tìm tên món và giá
   */
  for (const line of LINES) {
    /**
     * Tìm tên món và giá
     */
    const PRICE = [...line.matchAll(CURRENCY_REGEX)];
    /**
     * Kết quả
     */
    if (PRICE.length === 0) continue;
    /**
     * Tìm tên món
     */
    const LAST_PRICE = PRICE[PRICE.length - 1][0];
    /**
     * Tìm tên món
     */
    const NAME = line.replace(LAST_PRICE, "").trim();

    ITEMS.push({
      name: NAME,
      price: normalizePrice(LAST_PRICE),
      currency: detectCurrency(LAST_PRICE),
      originalText: line,
    });
  }

  return ITEMS;
}

/** Chuẩn hóa giá về số */
function normalizePrice(priceStr: string): number {
  const CLEAN_STR = priceStr.replace(/[^\d,.-]/g, "");

  /** Phát hiện định dạng (1.000,00 vs 1,000.00) */
  const IS_EUROPEAN_FORMAT = /,\d{2}$/.test(CLEAN_STR);

  return parseFloat(
    CLEAN_STR.replace(IS_EUROPEAN_FORMAT ? /\./g : /,/g, "").replace(
      IS_EUROPEAN_FORMAT ? "," : ".",
      "."
    )
  );
}

/** Xác định loại tiền tệ
 * @returns USD | EUR | VND | JPY | GBP
 */
function detectCurrency(priceStr: string): string {
  if (/\$|USD/.test(priceStr)) return "USD";
  if (/€|EUR/.test(priceStr)) return "EUR";
  if (/₫|VND/.test(priceStr)) return "VND";
  if (/¥|JPY/.test(priceStr)) return "JPY";
  if (/£|GBP/.test(priceStr)) return "GBP";
  return "UNKNOWN";
}
/**
 * Kết quả phân tích
 */
type MenuItem = {
  /**
   * Teen
   */
  name: string;
  /**
   * Giá
   */
  price: number;
  /**
   *    Loại tìm giá
   */
  currency: string;
  /**
   *    Văn bản góc
   */
  originalText?: string;
};
