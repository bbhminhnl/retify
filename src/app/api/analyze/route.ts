import { NextResponse } from "next/server";
import { getVisionClient } from "@/lib/googleVision";
import sharp from "sharp";

export const MENU_PATTERNS = {
  // Cải thiện phát hiện tiêu đề mục trong menu tiếng Việt
  SECTION:
    /^(?!.*\b(available|mon|tue|wed|thu|fri|sat|sun|am|pm|giờ|phục vụ)\b)[A-ZÀ-Ỹ][A-ZÀ-Ỹ\s]+$/i,

  // Cải thiện phát hiện giá với định dạng tiền tệ Việt Nam
  PRICE: /\b\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?\s*(?:₫|vnd|đ|d|k|nghìn)?\b/gi,

  // Cải thiện danh sách từ khóa cần bỏ qua
  IGNORE:
    /^(menu|thực đơn|quán|địa chỉ|hotline|====|http|\b(available|mon|tue|wed|thu|fri|sat|sun|\d+\s?[ap]m|giờ|phục vụ)\b)/i,

  // Phát hiện đơn vị tiền tệ Việt Nam và quốc tế
  CURRENCY: /\b(₫|vnd|đ|d|\$|€|usd|k|nghìn)\b/i,

  // Định dạng giá tính theo nghìn đồng
  THOUSAND_VND: /\b(nghìn đồng|giá tính theo nghìn)\b/i,

  // Phát hiện đơn vị trong menu
  UNIT: /\b(đĩa|plate|phần|serving|người|person|suất)\b/i,
};

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!isValidImageUrl(imageUrl)) {
      return NextResponse.json(
        { error: "URL ảnh không hợp lệ. Chỉ chấp nhận JPEG/PNG" },
        { status: 400 }
      );
    }

    const { buffer } = await processImage(imageUrl);
    const [ocrResult] = await getVisionClient().textDetection({
      image: { content: buffer },
    });
    const rawText = ocrResult.fullTextAnnotation?.text || "";

    // Check if the menu uses thousand VND as base unit
    const usesThousandVND = MENU_PATTERNS.THOUSAND_VND.test(rawText);
    const parsedData = parseVietnameseMenu(rawText, usesThousandVND);

    return NextResponse.json({
      success: true,
      data: parsedData,
      note: usesThousandVND
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
  const lines = text.split("\n");
  const result = {
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

  let currentSection = "";
  let isFooter = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    // Detect section (Vietnamese headers)
    if (MENU_PATTERNS.SECTION.test(line) && !currentSection) {
      currentSection = line;
      continue;
    }

    // Detect footer information
    if (MENU_PATTERNS.IGNORE.test(line)) {
      isFooter = true;
    }

    // Handle menu items
    if (!isFooter) {
      // Try to find price in current line
      const priceData = extractVietnamesePrice(line, usesThousandVND);

      if (priceData) {
        // Case 1: Price is in the same line as item name
        result.items.push({
          name: line.replace(priceData.originalMatch, "").trim(),
          price: priceData.value,
          currency: priceData.currency,
          unit: priceData.unit,
        });
        continue;
      }

      // Case 2: Price is on the next line
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        const nextLinePrice = extractVietnamesePrice(nextLine, usesThousandVND);

        if (nextLinePrice) {
          result.items.push({
            name: line,
            price: nextLinePrice.value,
            currency: nextLinePrice.currency,
            unit: nextLinePrice.unit,
          });
          i++; // Skip the price line
          continue;
        }
      }
    }

    // Collect footer content
    if (isFooter) {
      result.footer += line + " ";
    }
  }

  result.section = currentSection;
  result.footer = result.footer.trim();

  return result;
}

// Enhanced Vietnamese price extraction
function extractVietnamesePrice(
  text: string,
  usesThousandVND: boolean = false
): {
  value: number;
  currency: string;
  unit?: string;
  originalMatch: string;
} | null {
  const priceMatch = text.match(MENU_PATTERNS.PRICE);
  if (!priceMatch) return null;

  const [fullMatch] = priceMatch;
  const currencyMatch = fullMatch.match(MENU_PATTERNS.CURRENCY);
  const currency = currencyMatch?.[0]?.toLowerCase() || "";

  // Extract numeric value
  const numericValue = parseFloat(
    fullMatch
      .replace(/[^\d,.]/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
  );

  // Handle thousand VND case
  let finalValue = numericValue;
  if (usesThousandVND || currency.includes("nghìn") || currency.includes("k")) {
    finalValue = numericValue * 1000;
  }

  // Extract unit information
  const unitMatch = text.match(MENU_PATTERNS.UNIT);
  const unit = unitMatch?.[0]?.toLowerCase();

  return {
    value: finalValue,
    currency: detectVietnameseCurrency(currency),
    unit: unit,
    originalMatch: fullMatch,
  };
}

// Improved Vietnamese currency detection
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
