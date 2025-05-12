import { NextResponse } from "next/server";
import OpenAI from "openai";

const OPEN_AI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { normalizedText } = await req.json();
  /**
   * Prompt
   */
  const PROMPT = `
Danh sách món đã chuẩn hóa:

${normalizedText}

Yêu cầu:
1. Nếu món có phân loại size (nhỏ, vừa, lớn, S, M, L...):
   - Tách mỗi size thành một dòng
   - Thêm size vào tên món, ví dụ: "Trà Sữa (M) - 35000 - VND"
2. Nếu không có size, giữ nguyên

Chỉ trả lại danh sách món chuẩn, không tiêu đề, không đánh số.
`;

  try {
    /**
     * AI xử lý dữ liệu
     */
    const RES = await OPEN_AI.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: PROMPT }],
      temperature: 0.3,
    });
    /**
     * FINAL_TEXT
     */
    const FINAL_TEXT = RES.choices[0].message.content || "";
    /** Menu Item */
    const MENU_ITEMS = FINAL_TEXT.split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    /** Return */
    return NextResponse.json({ menuItems: MENU_ITEMS });
  } catch (error) {
    return NextResponse.json({ error: "Failed at step 3" }, { status: 500 });
  }
}
