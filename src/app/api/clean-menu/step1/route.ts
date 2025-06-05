import { NextResponse } from "next/server";
import OpenAI from "openai";

const OPEN_AI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { fixedText } = await req.json();
  /**
   * Prompt
   */
  const PROMPTS = `
Dưới đây là văn bản sau khi đã được sửa lỗi chính tả:

"${fixedText}"

Nhiệm vụ:
Trích xuất **các dòng mô tả món ăn kèm giá tiền** từ văn bản trên.

Yêu cầu:
1. Chỉ giữ lại các dòng có chứa món ăn và giá tiền.
2. Loại bỏ các dòng sau:
   - Dòng tiêu đề, tên nhóm món (như: THỊT BÒ, HẢI SẢN, ĐỒ UỐNG...)
   - Dòng không có số tiền
   - Dòng chỉ có mô tả phụ, trang trí, biểu tượng, emoji, hoặc các ký tự như --- , *** , ::
   - Dòng chứa từ khóa không cần thiết như: "Menu", "Thực đơn", "Đồ uống", v.v.
3. Không được bịa ra dữ liệu. Nếu không có dòng hợp lệ, kết quả trả về phải rỗng.

Chỉ trả về danh sách món ăn và giá (nếu có), mỗi dòng một món. Không thêm bất kỳ nội dung nào khác.
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
