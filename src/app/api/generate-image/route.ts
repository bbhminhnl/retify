import { NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * Khai báo OpenAI
 */
const OPEN_AI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { prompt: PROMPT } = await req.json();

  try {
    /**
     * Gọi OpenAI DALL-E API để tạo ảnh từ prompt
     * @param {string} model - Tên mô hình DALL-E
     */
    const RESPONSE = await OPEN_AI.images.generate({
      model: "dall-e-3",
      prompt: `Ảnh chụp món ăn: ${PROMPT}. Phong cách nhiếp ảnh ẩm thực chuyên nghiệp, ánh sáng tự nhiên, không chữ, độ phân giải cao`,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });
    /** URL Trả về */
    const IMAGE_URL = RESPONSE.data[0].url;
    /**
     * Trả về JSON
     * @param {string} image_url - URL của ảnh được tạo ra
     */
    return NextResponse.json({ image_url: IMAGE_URL });
  } catch (error) {
    console.error("DALL-E Error:", error);
    return NextResponse.json(
      { error: "Image generation failed" },
      { status: 500 }
    );
  }
}
