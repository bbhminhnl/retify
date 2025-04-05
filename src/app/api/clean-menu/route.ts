import { NextResponse } from "next/server";
import OpenAI from "openai";
/**
 * Khai báo OpenAI
 */
const OPEN_AI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  /**
   * Nhận dữ liệu từ client
   */
  const { rawText } = await req.json();
  /**
   * Kiểm tra dữ liệu đầu vào
   */
  const PROMPT = `
Hãy xử lý văn bản menu ẩm thực sau (được trích xuất từ ảnh):

"${rawText}"

Yêu cầu xử lý và định dạng lại theo các quy tắc sau:

1. **Chỉ giữ lại thông tin tên món ăn/thức uống và giá tiền**, theo định dạng:
   **"Tên món - Giá - VND"**

2. **Loại bỏ** toàn bộ các thành phần không cần thiết sau:
   - Tiêu đề, tên nhà hàng, thông tin liên hệ
   - Các từ như: "Menu", "Thực đơn", "Đồ uống"
   - Mô tả nguyên liệu, thành phần, ghi chú phụ
   - Các ký tự trang trí hoặc đặc biệt như "***", "---", "::", v.v.

3. **Mỗi món tương ứng với một dòng riêng** trong kết quả.

4. **Chuẩn hóa giá tiền** như sau:
   - Nhận diện và xử lý các đơn vị: "nghìn đồng", "ngàn đồng", "triệu đồng"
     - Ví dụ: "50 nghìn đồng" → "50000", "1 triệu đồng" → "1000000"
   - Chuyển đổi các ký hiệu thường gặp:
     - "100k" → "100000"
     - "50.000đ", "50.000₫", "50k" → "50000"
   - Tất cả giá sau khi xử lý cần có hậu tố: **"- VND"**
   - Nếu giá không rõ đơn vị, mặc định hiểu là **VND**

**Ví dụ kết quả mong muốn:**
Phở Bò - 70000 - VND  
Bánh Xèo - 50000 - VND  
Bánh Mì - 30000 - VND  
Cà Phê - 20000 - VND  
`;

  //   5. Thêm prompt mô tả món ăn vào cuối mỗi món để tạo ảnh
  //      - Hạn chế thêm các từ dạng "đặc biệt", "ngon", "tươi ngon", "hấp dẫn", "độc đáo"
  //   Ví dụ kết quả:
  //   Phở Bò - 70.000 VND -  Phở bò truyền thống Việt Nam với nước dùng trong veo, thịt bò mềm, hành lá và rau thơm
  //   Bánh Xèo - 50.000 VND -  Bánh xèo giòn rụm, nhân tôm thịt, rau sống và nước chấm chua ngọt
  //   Bánh Mì - 30.000 VND -  Bánh mì thịt nướng, rau sống và nước sốt đặc biệt
  //   Cà Phê - 20.000 VND -  Cà phê sữa đá truyền thống Việt Nam, đậm đà và thơm ngon

  try {
    /**
     * Dùng OpenAI API để làm sạch dữ liệu menu
     */
    const RESPONSE = await OPEN_AI.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: PROMPT }],
      temperature: 0.3, // Giảm nhiệt độ để kết quả ổn định
    });
    /**
     * Kết quả trả về từ OpenAI
     */
    const CLEANED_TEXT = RESPONSE.choices[0].message.content;
    /**
     * Tách các món ăn thành từng dòng
     */
    const MENU_ITEMS = CLEANED_TEXT?.split("\n").filter(
      (line) => line.trim() !== ""
    );

    return NextResponse.json({ menuItems: MENU_ITEMS });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to clean menu data" },
      { status: 500 }
    );
  }
}
