// import { NextResponse } from "next/server";
// import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// interface MenuRequest {
//   texts: string[];
//   labels: string[];
// }

// export async function POST(req: Request) {
//   const { texts, labels } = (await req.json()) as MenuRequest;

//   const prompt = `
//   Tạo menu ẩm thực từ dữ liệu sau:
//   - Văn bản: ${texts?.join(", ") || "Không có"}
//   - Nhãn: ${labels?.join(", ") || "Không có"}

//   Trả về JSON theo format:
//   {
//     "name_vi": string,
//     "name_en": string,
//     "price": string,
//     "description": string,
//     "image_prompt": string
//   }

//   Yêu cầu:
//   - Mô tả dưới 30 từ, giọng quảng cáo
//   - Giá định dạng "XXX.000 VND"
//   - image_prompt ngắn gọn, tập trung vào món ăn
//   `;

//   try {
//     const completion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: prompt }],
//       temperature: 0.7,
//     });

//     const content = completion.choices[0].message.content;
//     const menuData = JSON.parse(content || "{}");

//     return NextResponse.json(menuData);
//   } catch (error) {
//     return NextResponse.json(
//       { error: "AI generation failed" },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import OpenAI from "openai";
/**
 * Khai báo OPEN AI
 */
const OPEN_AI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
/**
 * Khai báo interface cho request
 */
interface MenuRequest {
  texts: string[];
  labels: string[];
}

export async function POST(req: Request) {
  /**
   * Nhận dữ liệu từ client
   */
  const { texts, labels } = (await req.json()) as MenuRequest;
  /**
   * Tạo prompt cho AI
   */
  const PROMPT = `
  Tạo menu ẩm thực từ dữ liệu sau:
  - Văn bản: ${texts?.join(", ") || "Không có"}
  - Nhãn: ${labels?.join(", ") || "Không có"}

  Trả về JSON theo format:
  {
    "name_vi": string,
    "name_en": string,
    "price": string,
    "image_prompt": string
    }
    
    Yêu cầu:
    - Mô tả dưới 30 từ, giọng quảng cáo
    - Giá định dạng "XXX.000 VND"
    - image_prompt ngắn gọn, tập trung vào món ăn
    `;

  // "description": string,
  /**
   * Gọi OpenAI API để tạo menu
   */
  try {
    const COMPLETION = await OPEN_AI.chat.completions.create({
      model: "gpt-3.5-turbo",
      //   model: "gpt-4",
      messages: [{ role: "user", content: PROMPT }],
      temperature: 0.7,
    });
    /**
     * Lấy nội dung từ phản hồi
     */
    const CONTENT = COMPLETION.choices[0].message.content;
    /**
     * Chuyển đổi nội dung thành JSON
     */
    if (!CONTENT) throw new Error("No content from AI");
    /**
     * Chuyển đổi nội dung thành JSON
     */
    const MENU_DATA = JSON.parse(CONTENT);
    return NextResponse.json(MENU_DATA);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}
