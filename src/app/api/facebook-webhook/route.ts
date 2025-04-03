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

import { NextRequest, NextResponse } from "next/server";

/** Config API webhook*/
const PROCESS_API_URL =
  "https://chatbox-billing.botbanhang.vn/app/webhook/get_webhook_history";
/**
 * config access token
 */
const ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNmI1ZWNjZGIyZjk3NGRhNDkyNDBjNzM4YWI0MjZjNTQiLCJmYl9zdGFmZl9pZCI6IjEwNDkyMzQ4NzM0ODUwMjkiLCJpc19kaXNhYmxlIjpmYWxzZSwiX2lkIjoiNjcwMGI0ZGZkMDM4NTYwOTFlM2I5OGU3IiwiaWF0IjoxNzQzMzk0OTI0LCJleHAiOjMxNTUzNDMzOTQ5MjR9.iuNuRGQnOmlI2_wY0GliyMkn72_IcQmHSt0b0mwjOsc";

/**
 * Hàm POST để nhận webhook và xử lý ngay bằng API khác
 */
export async function POST(req: NextRequest) {
  try {
    /** 1. Nhận dữ liệu webhook */
    const WEBHOOK_DATA = await req.json();
    console.log("Webhook received:", JSON.stringify(WEBHOOK_DATA, null, 2));

    /** 2. Chuẩn bị data để gửi đến API xử lý */
    const PAYLOAD = {
      event_type: "webhook_received",
      timestamp: new Date().toISOString(),
      data: WEBHOOK_DATA,
    };

    /** 3. Call API xử lý */
    const API_RESPONSE = await fetch(PROCESS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify(PAYLOAD),
    });

    /** 4. Kiểm tra kết quả từ API */
    if (!API_RESPONSE.ok) {
      throw new Error(`API request failed with status ${API_RESPONSE.status}`);
    }

    const RESULT = await API_RESPONSE.json();
    console.log("API processing result:", RESULT);

    /** 5. Trả về response thành công */
    return NextResponse.json({
      status: "success",
      message: "Webhook processed by external API",
      api_result: RESULT,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Hàm GET đơn giản (nếu cần cho verification)
 */
export async function GET(req: NextRequest) {
  return NextResponse.json(
    { status: "ready", message: "Webhook endpoint is active" },
    { status: 200 }
  );
}
