import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { rawText } = await req.json();

  const prompt = `
  Hãy xử lý văn bản menu ẩm thực sau (được trích xuất từ ảnh):
  "${rawText}"

  Yêu cầu:
  1. Chỉ giữ lại tên món và giá (định dạng "Tên món - Giá")
  2. Loại bỏ:
     - Tiêu đề/thông tin nhà hàng
     - Chữ "Menu", "Thực đơn", "Đồ uống"
     - Mô tả thành phần
     - Ký tự đặc biệt thừa (***, ---)
  3. Mỗi món nằm trên 1 dòng riêng
  4. Chuẩn hóa giá:
     - "100k" → "100.000 VND"
     - "50.000đ" → "50.000 VND"

  Ví dụ kết quả:
  Phở Bò - 70.000 VND
  Bánh Mì Thịt - 35.000 VND
  Cà Phê Đá - 25.000 VND
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3, // Giảm nhiệt độ để kết quả ổn định
    });

    const cleanedText = response.choices[0].message.content;
    const menuItems = cleanedText
      ?.split("\n")
      .filter((line) => line.trim() !== "");

    return NextResponse.json({ menuItems });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to clean menu data" },
      { status: 500 }
    );
  }
}
