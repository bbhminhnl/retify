// import { NextResponse } from "next/server";
// import OpenAI from "openai";
// /**
//  * Khai báo OpenAI
//  */
// const OPEN_AI = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export async function POST(req: Request) {
//   /**
//    * Nhận dữ liệu từ client
//    */
//   const { rawText } = await req.json();
//   //  - Tiêu đề, tên nhà hàng, thông tin liên hệ
//   /**
//    * Kiểm tra dữ liệu đầu vào
//    */
//   const PROMPT = `
// Hãy xử lý văn bản menu ẩm thực sau (được trích xuất từ ảnh):

// ${rawText}

// Yêu cầu xử lý và định dạng lại theo các quy tắc sau:

// 1. **Chỉ giữ lại thông tin tên món ăn/thức uống và giá tiền**, theo định dạng:
//    **"Tên món - Giá - VND"**

// 2. **Loại bỏ** toàn bộ các thành phần không cần thiết sau:
//    - Các từ như: "Menu", "Thực đơn", "Đồ uống"
//    - Mô tả nguyên liệu, thành phần, ghi chú phụ
//    - Các ký tự trang trí hoặc đặc biệt như "***", "---", "::", v.v.

// 3. **Mỗi món tương ứng với một dòng riêng** trong kết quả.

// 4. **Nếu một món có phân loại size (như nhỏ, vừa, lớn, S, M, L...)** thì:
//    - Tách thành **nhiều dòng**, mỗi dòng là một loại size với tên món có thêm size (vd: "Trà Sữa (L)")
//    - Gắn đúng giá tương ứng với từng size

// 5. **Chuẩn hóa giá tiền** như sau:
//    - Nhận diện và xử lý các đơn vị: "nghìn đồng", "ngàn đồng", "triệu đồng"
//      - Ví dụ: "50 nghìn đồng" → "50000", "1 triệu đồng" → "1000000"
//    - Chuyển đổi các ký hiệu thường gặp:
//      - "100k" → "100000"
//      - "50.000đ", "50.000₫", "50k" → "50000"
//    - Nếu có giá bằng **đơn vị nước ngoài (USD, EUR...)**, giữ nguyên đơn vị, định dạng:
//      **"Tên món - Giá - USD"**
//      (ví dụ: "Pizza - 5 - USD")
//    - Nếu giá không rõ đơn vị, mặc định hiểu là **VND**

// 6. **Tất cả giá sau khi xử lý cần có hậu tố đơn vị** theo đúng chuẩn:
//    - "Tên món - Giá - VND"
//    - hoặc "Tên món - Giá - USD/EUR..."

// **Ví dụ kết quả mong muốn:**
// Phở Bò - 70000 - VND
// Bánh Xèo - 50000 - VND
// Bánh Mì - 30000 - VND
// Cà Phê - 20000 - VND
// Trà Sữa (M) - 35000 - VND
// Trà Sữa (L) - 40000 - VND
// Pizza - 5 - USD
// `;

//   //   5. Thêm prompt mô tả món ăn vào cuối mỗi món để tạo ảnh
//   //      - Hạn chế thêm các từ dạng "đặc biệt", "ngon", "tươi ngon", "hấp dẫn", "độc đáo"
//   //   Ví dụ kết quả:
//   //   Phở Bò - 70.000 VND -  Phở bò truyền thống Việt Nam với nước dùng trong veo, thịt bò mềm, hành lá và rau thơm
//   //   Bánh Xèo - 50.000 VND -  Bánh xèo giòn rụm, nhân tôm thịt, rau sống và nước chấm chua ngọt
//   //   Bánh Mì - 30.000 VND -  Bánh mì thịt nướng, rau sống và nước sốt đặc biệt
//   //   Cà Phê - 20.000 VND -  Cà phê sữa đá truyền thống Việt Nam, đậm đà và thơm ngon

//   try {
//     /**
//      * Dùng OpenAI API để làm sạch dữ liệu menu
//      */
//     const RESPONSE = await OPEN_AI.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: PROMPT }],
//       temperature: 0.3, // Giảm nhiệt độ để kết quả ổn định
//     });
//     /**
//      * Kết quả trả về từ OpenAI
//      */
//     const CLEANED_TEXT = RESPONSE.choices[0].message.content;
//     /**
//      * Tách các món ăn thành từng dòng
//      */
//     const MENU_ITEMS = CLEANED_TEXT?.split("\n").filter(
//       (line) => line.trim() !== ""
//     );

//     return NextResponse.json({ menuItems: MENU_ITEMS });
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to clean menu data" },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import OpenAI from "openai";
/** OpenAI */
const OPEN_AI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { rawText } = await req.json();
  /** Chuẩn hoá dữ liệu */
  const STEP0_PROMPT = `
Đây là văn bản menu được trích xuất từ ảnh, có thể bị lỗi OCR:

"${rawText}"

Yêu cầu:
1. Sửa lỗi nhận diện ký tự phổ biến:
   - "di ng", "đi ng", "di nóng", "đi đá", "đi nong" → sửa thành: "đá/nóng" hoặc "đá hoặc nóng"
2. Tách từ bị dính liền nhau (vd: "BánhMì" → "Bánh Mì")
3. Hoàn chỉnh từ bị ngắt, thiếu do OCR (nếu đoán được)
4. Nếu dòng quá lỗi, không rõ nghĩa thì bỏ qua

Chỉ trả lại văn bản đã được sửa lỗi, chưa cần chuẩn hóa định dạng.
`;
  /** Chuẩn hoá  */
  const STEP1_PROMPT = (text: string) => `
Văn bản sau đã được sửa lỗi:

"${text}"

Yêu cầu:
1. Giữ lại dòng có món ăn và giá tiền, ví dụ: "Cà phê sữa đá 20k", "Bánh Mì - 25.000đ"
2. Loại bỏ:
   - Dòng tiêu đề/phân nhóm (vd: "THỊT BÒ", "HẢI SẢN", "ĐỒ UỐNG")
   - Dòng không có số tiền
   - Dòng chỉ chứa mô tả, trang trí, thông tin phụ
3. Bỏ các từ khóa không cần thiết: "Menu", "Thực đơn", "Đồ uống", các dấu như "---", "***", "::", emoji

Trả về danh sách món ăn và giá dạng thô, mỗi món một dòng.
`;
  /** Tổng hợp data đã chuẩn hoá chuyển thành menu */
  const STEP2_PROMPT = (text: string) => `
Dưới đây là danh sách món ăn và giá tiền:

${text}

Yêu cầu:
1. Chuẩn hóa giá tiền với các đơn vị:
   - "k", "K", "nghìn đồng", "ngàn đồng", "triệu đồng", "đ", "₫", "ng", "ngh"
   - Ví dụ: "50k" → "50000", "1 triệu đồng" → "1000000", "50ng" → "50000"
2. Nếu văn bản có ghi chung: **"Giá tính theo: nghìn đồng"**
   → Toàn bộ giá ghi dạng "50" cần hiểu là "50000"
3. Nếu giá nhỏ hơn 1000 nhưng không hợp lý cho món chính (ví dụ: "155") → suy luận là tính nghìn → "155000"
4. Nếu là giá USD, EUR → giữ nguyên đơn vị
5. Trả lại mỗi dòng theo đúng định dạng:
   **"Tên món - Giá - VND"**
   hoặc **"Tên món - Giá - USD" / "EUR"**

❌ Không thêm tiêu đề như "Danh sách món ăn:"
❌ Không đánh số thứ tự dòng (1., 2., ...)
✅ Chỉ mỗi dòng là một món.
`;
  /** Hiện danh sách Menu */
  const STEP3_PROMPT = (text: string) => `
Danh sách món đã chuẩn hóa:

${text}

Yêu cầu:
1. Nếu món có phân loại size (nhỏ, vừa, lớn, S, M, L...):
   - Tách mỗi size thành một dòng
   - Thêm size vào tên món, ví dụ: "Trà Sữa (M) - 35000 - VND"
2. Nếu không có size, giữ nguyên

Chỉ trả lại danh sách món chuẩn, không tiêu đề, không đánh số.
`;

  try {
    /**  Step 0 - Fix lỗi OCR */
    const STEP_0 = await OPEN_AI.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: STEP0_PROMPT }],
      temperature: 0.3,
    });
    /** Fixed Text */
    const FIXED_TEXT = STEP_0.choices[0].message.content || "";

    /** Step 1 - Lọc dòng hợp lệ */
    const STEP_1 = await OPEN_AI.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: STEP1_PROMPT(FIXED_TEXT) }],
      temperature: 0.3,
    });
    /** Data đã filter */
    const FILTERED_TEXT = STEP_1.choices[0].message.content || "";

    /** Step 2 - Chuẩn hóa giá */
    const STEP_2 = await OPEN_AI.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: STEP2_PROMPT(FILTERED_TEXT) }],
      temperature: 0.3,
    });
    /** Chuẩn hoá dữ liệu */
    const NORMALIZED_TEXT = STEP_2.choices[0].message.content || "";

    /** Step 3 - Tách size nếu có */
    const STEP_3 = await OPEN_AI.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: STEP3_PROMPT(NORMALIZED_TEXT) }],
      temperature: 0.3,
    });
    /** Đầu ra */
    const FINAL_MENU = STEP_3.choices[0].message.content || "";
    /** Xử lý thành menu */
    const MENU_ITEMS = FINAL_MENU.split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    return NextResponse.json({ menuItems: MENU_ITEMS });
  } catch (error) {
    console.error("❌ Error processing menu:", error);
    return NextResponse.json(
      { error: "Failed to process menu data" },
      { status: 500 }
    );
  }
}
