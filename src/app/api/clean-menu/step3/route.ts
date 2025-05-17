// import { NextResponse } from "next/server";
// import OpenAI from "openai";

// const OPEN_AI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// export async function POST(req: Request) {
//   const { normalizedText } = await req.json();
//   /**
//    * Prompt
//    */
//   const PROMPT = `
// Danh sách món đã chuẩn hóa:

// ${normalizedText}

// Yêu cầu:
// 1. Nếu món có phân loại size (nhỏ, vừa, lớn, S, M, L...):
//    - Tách mỗi size thành một dòng
//    - Thêm size vào tên món, ví dụ: "Trà Sữa (M) - 35000 - VND"
// 2. Nếu không có size, giữ nguyên
// 3. Tuyệt đối không được thêm - vào trước món ăn, gây nhàm lẫn

// Chỉ trả lại danh sách món chuẩn, không tiêu đề, không đánh số.
// `;

//   try {
//     /**
//      * AI xử lý dữ liệu
//      */
//     const RES = await OPEN_AI.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: PROMPT }],
//       temperature: 0.3,
//     });
//     /**
//      * FINAL_TEXT
//      */
//     const FINAL_TEXT = RES.choices[0].message.content || "";
//     /** Menu Item */
//     const MENU_ITEMS = FINAL_TEXT.split("\n")
//       .map((line) => line.trim())
//       .filter(Boolean);
//     /** Return */
//     return NextResponse.json({ menuItems: MENU_ITEMS });
//   } catch (error) {
//     return NextResponse.json({ error: "Failed at step 3" }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import OpenAI from "openai";
/** OPEN AI KEY */
const OPEN_AI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  /**
   * Lấy normalizedText
   */
  const { normalizedText } = await req.json();
  /** Prompt đầu ra */
  const PROMPT = `
Dưới đây là danh sách món ăn đã chuẩn hóa (tên - giá - đơn vị):

${normalizedText}

Yêu cầu:
1. Nếu món có phân loại size (nhỏ, vừa, lớn, S, M, L...):
   - Tách mỗi size thành một dòng riêng
   - Gộp size vào tên món, ví dụ: "Trà Sữa (M)"
2. Trả về kết quả dưới dạng JSON array, mỗi phần tử là object gồm:
   {
     "name": string,       // Tên món ăn (kèm size nếu có)
     "price": number,      // Giá món ăn đã chuẩn hóa
     "currency": string    // Đơn vị tiền tệ, viết hoa: VND, USD, EUR...
   }
3. Không thêm mô tả, không tiêu đề, không chú thích gì ngoài JSON thuần.

Ví dụ:
[
  {
    "name": "Trà Sữa (M)",
    "price": 35000,
    "currency": "VND"
  },
  {
    "name": "Bò xào rau muống",
    "price": 155000,
    "currency": "VND"
  }
]
`;

  try {
    /** RESPONSE */
    const RES = await OPEN_AI.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: PROMPT }],
      temperature: 0.3,
    });
    /** Dữ liệu raw */
    let raw = RES.choices[0].message.content || "";

    /** ⚠️ Loại bỏ ```json ... ``` nếu có */
    raw = raw.trim();
    /** Xử lý JSON */
    if (raw.startsWith("```json")) {
      raw = raw
        .replace(/^```json/, "")
        .replace(/```$/, "")
        .trim();
    } else if (raw.startsWith("```")) {
      raw = raw.replace(/^```/, "").replace(/```$/, "").trim();
    }
    /** Menu items */
    let menu_items = [];
    /**
     * Try parse JSON
     */
    try {
      menu_items = JSON.parse(raw);
    } catch (err) {
      console.error("❌ JSON parse error:", err);
      return NextResponse.json(
        { error: "Invalid JSON format from GPT" },
        { status: 500 }
      );
    }

    return NextResponse.json({ menuItems: menu_items });
  } catch (error) {
    console.error("❌ GPT processing error:", error);
    return NextResponse.json({ error: "Failed at step 3" }, { status: 500 });
  }
}
