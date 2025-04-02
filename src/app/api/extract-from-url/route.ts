// import { ImageAnnotatorClient } from "@google-cloud/vision";
// import { NextResponse } from "next/server";
// import path from "path";

// // Đường dẫn tuyệt đối đến file key (sử dụng `process.cwd()`)
// const KEY_PATH = path.join(process.cwd(), "src/app/api/google-vision-key.json");
// console.log(KEY_PATH);
// const client = new ImageAnnotatorClient({
//   keyFilename: KEY_PATH, // Sử dụng đường dẫn tuyệt đối
// });

// export async function POST(request: Request) {
//   try {
//     const { imageUrl } = await request.json();

//     console.log(imageUrl, "url");

//     // Tải ảnh từ URL và chuyển sang base64
//     const fetchResponse = await fetch(imageUrl);
//     const arrayBuffer = await fetchResponse.arrayBuffer();
//     const base64Image = Buffer.from(arrayBuffer).toString("base64");

//     // Gọi Google Vision API
//     const [result] = await client.textDetection({
//       image: { content: base64Image },
//     });

//     const fullText = result.fullTextAnnotation?.text || "";

//     // Xử lý text thành JSON (tùy chỉnh theo menu của bạn)
//     const lines = fullText.split("\n");
//     const menuItems = [];
//     let currentItem = { name: "", price: "" };

//     for (const line of lines) {
//       const trimmedLine = line.trim();
//       if (!trimmedLine) continue;

//       // Regex phát hiện giá (ví dụ: 50.000đ, 120k)
//       const priceMatch = trimmedLine.match(
//         /(\d{1,3}(?:[.,]\d{3})*)\s*(đ|vnd|k)/i
//       );
//       if (priceMatch) {
//         currentItem.price = priceMatch[0];
//         menuItems.push(currentItem);
//         currentItem = { name: "", price: "" };
//       } else {
//         currentItem.name += trimmedLine + " ";
//       }
//     }

//     return NextResponse.json({ success: true, data: menuItems });
//   } catch (error) {
//     console.error("Error processing image URL:", error);
//     return NextResponse.json(
//       { success: false, error: "Failed to extract menu from URL" },
//       { status: 500 }
//     );
//   }
// }
