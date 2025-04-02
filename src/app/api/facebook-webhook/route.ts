// import { NextRequest, NextResponse } from "next/server";
// // import vision from "@google-cloud/vision";
// // import fetch from "node-fetch";

// // const client = new vision.ImageAnnotatorClient({
// //   keyFilename: process.env.GOOGLE_CLOUD_KEY_PATH,
// // });

// /**
//  * Hàm get
//  * @param req
//  * @returns
//  */
// export async function GET(req: NextRequest) {
//   /** Token verify */
//   const VERIFY_TOKEN = "YOUR_VERIFY_TOKEN";
//   /** Mode
//    * Thường mặc định là subscribe
//    */
//   const MODE = req.nextUrl.searchParams.get("hub.mode");
//   /** Lấy token */
//   const TOKEN = req.nextUrl.searchParams.get("hub.verify_token");
//   /**
//    * Lấy challenge
//    */
//   const CHALLENGE = req.nextUrl.searchParams.get("hub.challenge");
//   /** Nếu mode la subscribe và token trung khớp */
//   if (MODE === "subscribe" && TOKEN === VERIFY_TOKEN) {
//     return new NextResponse(CHALLENGE, { status: 200 });
//   }
//   return new NextResponse("Verification failed", { status: 403 });
// }

// /**
//  * Hàm Post
//  * @param req
//  * @returns
//  */
// export async function POST(req: NextRequest) {
//   /** Lấy body  dang JSON*/
//   const BODY = await req.json();
//   console.log("Webhook data:", BODY);
//   /** Nếu có entry và entry[0].changes */
//   if (BODY.entry && BODY.entry[0].changes) {
//     /** Lưu giá trị entry[0].changes */
//     const CHANGES = BODY.entry[0].changes[0];
//     /** Nếu field la messages và message_type la image */
//     if (
//       CHANGES.field === "messages" &&
//       CHANGES.value.message_type === "image"
//     ) {
//       /** Kiểm trả hình ảnh */
//       const IMAGE_URL = CHANGES.value.attachment.payload.url;
//       //   const result = await processImage(imageUrl);
//       //   console.log("Processed result:", result);
//     }
//   }

//   return new NextResponse("Webhook received", { status: 200 });
// }

// // async function processImage(imageUrl: string) {
// //   try {
// //     // Tải hình ảnh từ URL
// //     const response = await fetch(imageUrl);
// //     const buffer = await response.buffer();

// //     // Gửi hình ảnh đến Google Vision API
// //     const [result] = await client.textDetection({
// //       image: { content: buffer },
// //     });

// //     // Chuyển đổi kết quả thành JSON
// //     const textAnnotations = result.textAnnotations;
// //     const jsonResult = {
// //       detectedText: textAnnotations.length > 0 ? textAnnotations[0].description : "No text detected",
// //       boundingPoly: textAnnotations.length > 0 ? textAnnotations[0].boundingPoly : null,
// //     };

// //     return jsonResult;
// //   } catch (error) {
// //     console.error("Error processing image:", error);
// //     return { error: "Failed to process image" };
// //   }
// // }
