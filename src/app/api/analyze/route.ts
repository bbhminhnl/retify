import { NextResponse } from "next/server";
import { getVisionClient } from "@/lib/googleVision";
import sharp from "sharp";

export const MENU_PATTERNS = {
  /** Cải thiện phát hiện tiêu đề mục trong menu tiếng Việt */
  SECTION:
    /^(?!.*\b(available|mon|tue|wed|thu|fri|sat|sun|am|pm|giờ|phục vụ)\b)[A-ZÀ-Ỹ][A-ZÀ-Ỹ\s]+$/i,

  /** Cải thiện phát hiện giá với định dạng tiền tệ Việt Nam */
  PRICE: /\b\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?\s*(?:₫|vnd|đ|d|k|nghìn)?\b/gi,

  /** Cải thiện danh sách từ khóa cần bỏ qua */
  IGNORE:
    /^(menu|thực đơn|quán|địa chỉ|hotline|====|http|\b(available|mon|tue|wed|thu|fri|sat|sun|\d+\s?[ap]m|giờ|phục vụ)\b)/i,

  /** Phát hiện đơn vị tiền tệ Việt Nam và quốc tế */
  CURRENCY: /\b(₫|vnd|đ|d|\$|€|usd|k|nghìn)\b/i,

  /** Định dạng giá tính theo nghìn đồng */
  THOUSAND_VND: /\b(nghìn đồng|giá tính theo nghìn)\b/i,

  /** Phát hiện đơn vị trong menu */
  UNIT: /\b(đĩa|plate|phần|serving|người|person|suất)\b/i,
};

export async function POST(request: Request) {
  try {
    /**
     * Lấy URL ảnh
     * @type {string}
     */
    const { imageUrl: IMAGE_URL } = await request.json();
    /**
     * Kiem tra url
     * @type {string}
     */
    if (!isValidImageUrl(IMAGE_URL)) {
      return NextResponse.json(
        { error: "URL ảnh không hợp lệ. Chỉ chấp nhận JPEG/PNG" },
        { status: 400 }
      );
    }
    /**
     * Phân tích ảnh
     */
    const { buffer } = await processImage(IMAGE_URL);
    /**
     * Phân tích menu
     */
    const [ocrResult] = await getVisionClient().textDetection({
      image: { content: buffer },
    });
    /**
     * Lay text menu
     */
    const RAW_TEXT = ocrResult.fullTextAnnotation?.text || "";

    /** Check if the menu uses thousand VND as base unit */
    const USES_THOUSAND_VND = MENU_PATTERNS.THOUSAND_VND.test(RAW_TEXT);
    const PARSED_DATA = parseVietnameseMenu(RAW_TEXT, USES_THOUSAND_VND);

    return NextResponse.json({
      success: true,
      data: PARSED_DATA,
      note: USES_THOUSAND_VND
        ? "Prices are displayed in thousands of VND"
        : undefined,
    });
  } catch (error: any) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Lỗi phân tích menu",
        suggestion: "Hãy chắc chắn ảnh rõ nét và định dạng đúng",
      },
      { status: 500 }
    );
  }
}

// ========== Vietnamese Menu Parser ==========
function parseVietnameseMenu(text: string, usesThousandVND: boolean = false) {
  /** Trích xử lý menu */
  const LINES = text.split("\n");
  /**
   * Kết quả phân tích menu
   */
  const RESULT = {
    section: "",
    items: [] as {
      name: string;
      price: number;
      currency: string;
      unit?: string;
    }[],
    footer: "",
    unit: usesThousandVND ? "nghìn đồng" : undefined,
  };
  /**
   * Section hiện tại
   */
  let current_section = "";
  /**
   * Footer information
   */
  let is_footer = false;
  /**
   * Lặp tìm tên món và giá
   */
  for (let i = 0; i < LINES.length; i++) {
    const LINE = LINES[i].trim();

    if (!LINE) continue;

    /** Detect section (Vietnamese headers) */
    if (MENU_PATTERNS.SECTION.test(LINE) && !current_section) {
      current_section = LINE;
      continue;
    }

    /** Detect footer information */
    if (MENU_PATTERNS.IGNORE.test(LINE)) {
      is_footer = true;
    }

    /** Handle menu items */
    if (!is_footer) {
      /**Try to find price in current line */
      const PRICE_DATA = extractVietnamesePrice(LINE, usesThousandVND);

      if (PRICE_DATA) {
        /** Case 1: Price is in the same line as item name */
        RESULT.items.push({
          name: LINE.replace(PRICE_DATA.originalMatch, "").trim(),
          price: PRICE_DATA.value,
          currency: PRICE_DATA.currency,
          unit: PRICE_DATA.unit,
        });
        continue;
      }

      /** Case 2: Price is on the next line */
      if (i + 1 < LINES.length) {
        const NEXT_LINE = LINES[i + 1].trim();
        const NEXT_LINE_PRICE = extractVietnamesePrice(
          NEXT_LINE,
          usesThousandVND
        );

        if (NEXT_LINE_PRICE) {
          RESULT.items.push({
            name: LINE,
            price: NEXT_LINE_PRICE.value,
            currency: NEXT_LINE_PRICE.currency,
            unit: NEXT_LINE_PRICE.unit,
          });
          i++; // Skip the price line
          continue;
        }
      }
    }

    /** Collect footer content */
    if (is_footer) {
      RESULT.footer += LINE + " ";
    }
  }

  RESULT.section = current_section;
  RESULT.footer = RESULT.footer.trim();

  return RESULT;
}

/** Enhanced Vietnamese price extraction */
function extractVietnamesePrice(
  text: string,
  usesThousandVND: boolean = false
): {
  value: number;
  currency: string;
  unit?: string;
  originalMatch: string;
} | null {
  /**
   * Kết quả phân tích giá
   */
  const PRICE_MATCH = text.match(MENU_PATTERNS.PRICE);
  /**
   * Không phát hiện giá trong menu
   */
  if (!PRICE_MATCH) return null;
  /**
   * Phát hiện giá trong menu
   */
  const [fullMatch] = PRICE_MATCH;
  /**
   * Phát hiện tiền tệ trong menu
   */
  const CURRENCY_MATCH = fullMatch.match(MENU_PATTERNS.CURRENCY);
  /**
   * Phát hiện tiền tệ trong menu
   */
  const CURRENCY = CURRENCY_MATCH?.[0]?.toLowerCase() || "";

  /** Extract numeric value */
  const NUMERIC_VALUE = parseFloat(
    fullMatch
      .replace(/[^\d,.]/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
  );

  /** Handle thousand VND case */
  let final_value = NUMERIC_VALUE;
  if (usesThousandVND || CURRENCY.includes("nghìn") || CURRENCY.includes("k")) {
    final_value = NUMERIC_VALUE * 1000;
  }

  /** Extract unit information */
  const UNIT_MATCH = text.match(MENU_PATTERNS.UNIT);
  const UNIT = UNIT_MATCH?.[0]?.toLowerCase();

  return {
    value: final_value,
    currency: detectVietnameseCurrency(CURRENCY),
    unit: UNIT,
    originalMatch: fullMatch,
  };
}

/** Improved Vietnamese currency detection */
function detectVietnameseCurrency(currencyStr: string): string {
  if (/\$|USD/i.test(currencyStr)) return "USD";
  if (/€|EUR/i.test(currencyStr)) return "EUR";
  if (/₫|vnd|đ|d|k|nghìn/i.test(currencyStr)) return "VND";
  if (/¥|JPY/i.test(currencyStr)) return "JPY";
  if (/£|GBP/i.test(currencyStr)) return "GBP";
  return "VND"; // Default to VND for Vietnamese menus
}

// ========== Helper Functions ==========
async function processImage(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Không thể tải ảnh từ URL");

  let buffer = Buffer.from(await response.arrayBuffer());

  // Process image to improve OCR accuracy
  buffer = await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .greyscale()
    .normalize()
    .sharpen()
    .toBuffer();

  return { buffer };
}

function isValidImageUrl(url: string) {
  try {
    const parsed = new URL(url);
    return /\.(jpe?g|png)$/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};
