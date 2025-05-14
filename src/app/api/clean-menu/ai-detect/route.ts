import { NextResponse } from "next/server";
import OpenAI from "openai";

const OPEN_AI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  /** Raw text */
  const { rawText } = await req.json();

  console.log(rawText, "rawText");
  /** Prompt */
  const PROMPT = `
Đây là văn bản Markdown:
"${rawText}"

Hãy trích xuất các thông tin sau từ đoạn văn bản dưới đây và trả về **duy nhất một JavaScript object** dưới dạng sau (nếu không có thông tin thì giá trị là \`undefined\`):

{
  ai_detect_shop_name: string | undefined,
  ai_detect_shop_address: string | undefined,
  ai_detect_shop_phone: string | undefined,
  ai_detect_shop_open_time: string | undefined,
  ai_detect_shop_website: string | undefined
}

Chỉ trả về object JSON thuần — không thêm giải thích, không thêm mã lệnh, không bọc trong markdown.
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

    console.log(FIXED_TEXT, "FIXED_TEXT");
    /**
     * Trả về data fixed
     */
    return NextResponse.json({ fixedText: FIXED_TEXT });
  } catch (error) {
    return NextResponse.json({ error: "Failed at step 0" }, { status: 500 });
  }
}
