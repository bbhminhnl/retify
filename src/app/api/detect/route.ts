// import { HfInference } from "@huggingface/inference";
// import { NextResponse } from "next/server";
// import sharp from "sharp";

// const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// export async function POST(request: Request) {
//   try {
//     const { imageUrl } = await request.json();

//     // 1. Tải ảnh từ URL
//     const imageRes = await fetch(imageUrl);
//     if (!imageRes.ok) throw new Error("Failed to fetch image");

//     // 2. Xử lý ảnh
//     const buffer = Buffer.from(await imageRes.arrayBuffer());
//     const processedImage = await sharp(buffer)
//       .resize(800, 600, { fit: "inside" })
//       .jpeg({ quality: 80 })
//       .toBuffer();

//     // 3. Gọi model nhận diện
//     const result = await hf.imageClassification({
//       data: processedImage,
//       model: "google/vit-base-patch16-224",
//     });

//     // 4. Trả kết quả
//     return NextResponse.json(result);
//   } catch (error: any) {
//     return NextResponse.json(
//       { error: error.message || "Processing failed" },
//       { status: 500 }
//     );
//   }
// }

// export const dynamic = "force-dynamic"; // Tắt cache
