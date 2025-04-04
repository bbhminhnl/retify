import { GoogleGenAI } from "@google/genai";

export const runtime = "edge"; // Tùy chọn cho Edge Runtime

export async function POST(request: Request) {
  try {
    /**
     * Key Gemini
     */
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    /**
     * Khai báo GoogleGenAI
     */
    const GEN_AI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    /**
     * Nhận dữ liệu từ client
     */
    const { prompt } = await request.json();

    // const response = await genAI.models.generateImages({
    //   model: "imagen-3.0-generate-002",
    //   prompt: `Ảnh chụp món ăn: ${prompt}. Phong cách nhiếp ảnh ẩm thực chuyên nghiệp, ánh sáng tự nhiên, không chữ, độ phân giải cao`,
    //   config: {
    //     numberOfImages: 1,
    //     includeRaiReason: true,
    //   },
    // });
    /**
     * Gọi API Gemini để tạo ảnh từ prompt
     */
    const RES = await GEN_AI.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: prompt,
      config: {
        responseModalities: ["Text", "Image"],
      },
    });

    // console.debug(response?.generatedImages?.[0]?.image?.imageBytes);
    // console.debug(response1?.candidates[0]?.content?.parts[0], "response");

    // Sử dụng model có hỗ trợ tạo ảnh (ví dụ: gemini-1.5-pro-latest)
    // const response = genAI.models.generateImages({
    //   model: "gemini-2.0-flash-exp-image-generation",
    //   prompt: "A flying cat",
    //   config: {
    //     numberOfImages: 1,
    //     includeRaiReason: true,
    //   },
    // });

    // const response = await genAI.models.generateContent({
    //   model: "gemini-2.0-flash-001",
    //   contents: "Why is the sky blue?",
    // });
    // console.log(response.candidates[0].content.parts[0], "response");
    // console.log(response, "response");
    // const response = await result.response;
    // const text = response.text();

    // // Gemini hiện tại không trả về ảnh trực tiếp mà chỉ mô tả ảnh
    // // Bạn có thể sử dụng API khác để chuyển mô tả thành ảnh
    // // Hoặc xử lý nếu có dữ liệu ảnh trong response
    const IMAGE =
      RES?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ?? "";

    /**
     * Trả về JSON
     */
    return new Response(
      JSON.stringify({
        image: IMAGE,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    // return new Response(JSON.stringify({ description: text }), {
    //   status: 200,
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // });
  } catch (error) {
    console.error("Error generating image:", error);
    return new Response(JSON.stringify({ error: "Failed to generate image" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
