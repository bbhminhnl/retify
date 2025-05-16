import { NextResponse } from "next/server";
import OpenAI from "openai";

const OPEN_AI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  /** Raw text */
  const { rawText } = await req.json();
  /** Prompt */
  const PROMPT = `
Đây là văn bản menu được trích xuất từ ảnh, có thể bị lỗi OCR:

"${rawText}"

Yêu cầu:
1. Sửa lỗi như "di ng", "đi ng", "di nóng" → "đá/nóng"
2. Tách từ dính liền
3. Hoàn chỉnh từ bị thiếu do OCR
4. Dòng quá lỗi thì bỏ
5. Tuyệt đối không được thêm - vào trước món ăn, gây nhầm lẫn

Chỉ trả lại văn bản đã sửa lỗi, mỗi dòng là một món hoặc mô tả.
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
     * Data fixed
     */
    const FIXED_TEXT = RES.choices[0].message.content || "";
    /**
     * Trả về data fixed
     */
    return NextResponse.json({ fixedText: FIXED_TEXT });
  } catch (error) {
    return NextResponse.json({ error: "Failed at step 0" }, { status: 500 });
  }
}
