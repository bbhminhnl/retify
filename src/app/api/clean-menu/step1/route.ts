import { NextResponse } from "next/server";
import OpenAI from "openai";

const OPEN_AI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { fixedText } = await req.json();
  /**
   * Prompt
   */
  const PROMPTS = `
Văn bản sau đã được sửa lỗi:

"${fixedText}"

Yêu cầu:
1. Giữ lại dòng có món ăn và giá tiền, ví dụ: "Cà phê sữa đá 20k", "Bánh Mì - 25.000đ"
2. Loại bỏ:
   - Dòng tiêu đề/phân nhóm (vd: "THỊT BÒ", "HẢI SẢN", "ĐỒ UỐNG")
   - Dòng không có số tiền
   - Dòng chỉ chứa mô tả, trang trí, thông tin phụ
3. Bỏ các từ khóa không cần thiết: "Menu", "Thực đơn", "Đồ uống", các dấu như "---", "***", "::", emoji

Trả về danh sách món ăn và giá dạng thô, mỗi món một dòng.
`;

  try {
    /**
     * AI xử lý dữ liệu
     */
    const RES = await OPEN_AI.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: PROMPTS }],
      temperature: 0.3,
    });
    /**
     * FILTERED_TEXT
     */
    const FILTERED_TEXT = RES.choices[0].message.content || "";
    /**
     * Return
     */
    return NextResponse.json({ filteredText: FILTERED_TEXT });
  } catch (error) {
    return NextResponse.json({ error: "Failed at step 1" }, { status: 500 });
  }
}
