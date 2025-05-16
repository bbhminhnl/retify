import { NextResponse } from "next/server";
import OpenAI from "openai";

const OPEN_AI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { filteredText } = await req.json();
  /**
   * Prompt
   */
  const PROMPTS = `
Dưới đây là danh sách món ăn và giá tiền:

${filteredText}

Yêu cầu:
1. Chuẩn hóa giá tiền với các đơn vị:
   - "k", "K", "nghìn đồng", "ngàn đồng", "triệu đồng", "đ", "₫", "ng", "ngh"
   - Ví dụ: "50k" → "50000", "1 triệu đồng" → "1000000", "50ng" → "50000"
2. Nếu văn bản có ghi chung: **"Giá tính theo: nghìn đồng"**
   → Toàn bộ giá ghi dạng "50" cần hiểu là "50000"
3. Nếu giá nhỏ hơn 1000 nhưng không hợp lý cho món chính (ví dụ: "155") → suy luận là tính nghìn → "155000"
4. Nếu là giá USD, EUR → giữ nguyên đơn vị
5. Trả lại mỗi dòng theo đúng định dạng:
   **"Tên món - Giá - VND"**
   hoặc **"Tên món - Giá - USD" / "EUR"**

❌ Không thêm tiêu đề như "Danh sách món ăn:"
❌ Không đánh số thứ tự dòng (1., 2., ...)
✅ Nếu trước tên món phát hiện "-" hoặc "1." thì tự động xoá đi
✅ Chỉ mỗi dòng là một món.
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
     * NORMALIZED_TEXT
     */
    const NORMALIZED_TEXT = RES.choices[0].message.content || "";
    /**
     * return
     */
    return NextResponse.json({ normalizedText: NORMALIZED_TEXT });
  } catch (error) {
    return NextResponse.json({ error: "Failed at step 2" }, { status: 500 });
  }
}
