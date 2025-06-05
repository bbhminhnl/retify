import { NextResponse } from "next/server";
import OpenAI from "openai";

const OPEN_AI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { filteredText } = await req.json();
  /** Prompts */
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

✅ Nếu trước tên món phát hiện ký tự không cần thiết như "-" hoặc số thứ tự "1.", "2.", "3." thì tự động xoá.
✅ Mỗi dòng chỉ gồm **một món duy nhất**, không thêm bất kỳ mô tả hay thông tin nào khác.
✅ Nếu giá không rõ ràng hoặc nghi ngờ bị lỗi, **bỏ qua dòng đó**, **không được suy diễn tùy ý**.

❌ Không được thêm dòng tiêu đề như "Danh sách món ăn:"
❌ Không được đánh số thứ tự (1., 2., ...)
❌ Không bịa ra món ăn hoặc giá nếu không có trong văn bản.

⚠️ Nếu không có dòng nào hợp lệ, **trả về kết quả rỗng** (không được tạo ra dòng giả).
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
