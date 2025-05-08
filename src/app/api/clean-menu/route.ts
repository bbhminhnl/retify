import { NextResponse } from "next/server";
import OpenAI from "openai";
/**
 * Khai báo OpenAI
 */
const OPEN_AI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  /**
   * Nhận dữ liệu từ client
   */
  const { rawText } = await req.json();
  //  - Tiêu đề, tên nhà hàng, thông tin liên hệ
  /**
   * Kiểm tra dữ liệu đầu vào
   */
  const PROMPT = `
Hãy xử lý văn bản menu ẩm thực sau (được trích xuất từ ảnh):

${rawText}

Yêu cầu xử lý và định dạng lại theo các quy tắc sau:

1. **Chỉ giữ lại thông tin tên món ăn/thức uống và giá tiền**, theo định dạng:
   **"Tên món - Giá - VND"**

2. **Loại bỏ** toàn bộ các thành phần không cần thiết sau:
   - Các từ như: "Menu", "Thực đơn", "Đồ uống"
   - Mô tả nguyên liệu, thành phần, ghi chú phụ
   - Các ký tự trang trí hoặc đặc biệt như "***", "---", "::", v.v.

3. **Mỗi món tương ứng với một dòng riêng** trong kết quả.

4. **Nếu một món có phân loại size (như nhỏ, vừa, lớn, S, M, L...)** thì:
   - Tách thành **nhiều dòng**, mỗi dòng là một loại size với tên món có thêm size (vd: "Trà Sữa (L)")
   - Gắn đúng giá tương ứng với từng size

5. **Chuẩn hóa giá tiền** như sau:
   - Nhận diện và xử lý các đơn vị: "nghìn đồng", "ngàn đồng", "triệu đồng"
     - Ví dụ: "50 nghìn đồng" → "50000", "1 triệu đồng" → "1000000"
   - Chuyển đổi các ký hiệu thường gặp:
     - "100k" → "100000"
     - "50.000đ", "50.000₫", "50k" → "50000"
   - Nếu có giá bằng **đơn vị nước ngoài (USD, EUR...)**, giữ nguyên đơn vị, định dạng:
     **"Tên món - Giá - USD"**
     (ví dụ: "Pizza - 5 - USD")
   - Nếu giá không rõ đơn vị, mặc định hiểu là **VND**

6. **Tất cả giá sau khi xử lý cần có hậu tố đơn vị** theo đúng chuẩn:
   - "Tên món - Giá - VND"
   - hoặc "Tên món - Giá - USD/EUR..."

**Ví dụ kết quả mong muốn:**
Phở Bò - 70000 - VND
Bánh Xèo - 50000 - VND
Bánh Mì - 30000 - VND
Cà Phê - 20000 - VND
Trà Sữa (M) - 35000 - VND
Trà Sữa (L) - 40000 - VND
Pizza - 5 - USD
`;

  //   5. Thêm prompt mô tả món ăn vào cuối mỗi món để tạo ảnh
  //      - Hạn chế thêm các từ dạng "đặc biệt", "ngon", "tươi ngon", "hấp dẫn", "độc đáo"
  //   Ví dụ kết quả:
  //   Phở Bò - 70.000 VND -  Phở bò truyền thống Việt Nam với nước dùng trong veo, thịt bò mềm, hành lá và rau thơm
  //   Bánh Xèo - 50.000 VND -  Bánh xèo giòn rụm, nhân tôm thịt, rau sống và nước chấm chua ngọt
  //   Bánh Mì - 30.000 VND -  Bánh mì thịt nướng, rau sống và nước sốt đặc biệt
  //   Cà Phê - 20.000 VND -  Cà phê sữa đá truyền thống Việt Nam, đậm đà và thơm ngon

  try {
    /**
     * Dùng OpenAI API để làm sạch dữ liệu menu
     */
    const RESPONSE = await OPEN_AI.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: PROMPT }],
      temperature: 0.3, // Giảm nhiệt độ để kết quả ổn định
    });
    /**
     * Kết quả trả về từ OpenAI
     */
    const CLEANED_TEXT = RESPONSE.choices[0].message.content;
    /**
     * Tách các món ăn thành từng dòng
     */
    const MENU_ITEMS = CLEANED_TEXT?.split("\n").filter(
      (line) => line.trim() !== ""
    );

    return NextResponse.json({ menuItems: MENU_ITEMS });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to clean menu data" },
      { status: 500 }
    );
  }
}

// import { NextResponse } from "next/server";
// import OpenAI from "openai";

// const OPEN_AI = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export async function POST(req: Request) {
//   /** Raw text */
//   const { rawText } = await req.json();
//   /** Prompt */
//   const STEP0_PROMPT = `
// Văn bản sau có thể bị lỗi do nhận dạng ảnh (OCR):

// "${rawText}"

// Hãy hiệu chỉnh lại văn bản để:
// - Sửa lỗi chính tả, ký tự sai (vd: "di ng" → "đá/nóng")
// - Tách từ dính liền (vd: "BánhMì" → "Bánh Mì")
// - Sửa hoặc bổ sung ngữ nghĩa để hợp lý với ngữ cảnh menu món ăn
// - Bỏ qua dòng nếu quá lỗi hoặc không rõ nghĩa

// Chỉ trả lại văn bản đã hiệu chỉnh, chưa cần xử lý định dạng hay giá.
// `;
//   /** Prompt Step 1 */
//   const STEP1_PROMPT = (text: string) => `
// Hãy làm sạch văn bản menu sau:

// "${text}"

// Yêu cầu:
// - Chỉ giữ lại dòng có món ăn và giá tiền
// - Loại bỏ từ như: "Menu", "Thực đơn", "Đồ uống"
// - Bỏ mô tả nguyên liệu, thành phần, ghi chú phụ
// - Xóa ký tự trang trí như "***", "---", "::", emoji

// Chỉ giữ lại danh sách dòng có dạng: tên món + giá (chưa cần chuẩn hóa).
// `;

//   /** Prompt Step 2 */
//   const STEP2_PROMPT = (text: string) => `
// Danh sách món sau đã được làm sạch, nhưng giá tiền chưa chuẩn hóa:

// ${text}

// Hãy chuẩn hóa giá và định dạng mỗi dòng theo quy tắc:

// 1. Giá "100k" → "100000", "50.000đ" → "50000"
// 2. "50 nghìn đồng" → "50000", "1 triệu đồng" → "1000000"
// 3. Nếu đơn vị ngoại tệ như USD, EUR → giữ nguyên (Pizza - 5 - USD)
// 4. Nếu không rõ đơn vị, mặc định là VND

// Định dạng chuẩn: **"Tên món - Giá - VND"** (hoặc USD...)
// `;

//   /** Prompt Step 3 */
//   const STEP3_PROMPT = (text: string) => `
// Danh sách món đã chuẩn hóa sau:

// ${text}

// Nếu có món phân loại size (nhỏ, vừa, lớn, S, M, L...), hãy:
// - Tách thành từng dòng riêng: vd "Trà Sữa (M) - 35000 - VND"
// - Mỗi size một dòng

// Nếu không có size thì giữ nguyên. Trả lại kết quả theo định dạng yêu cầu.
// `;

//   try {
//     /** STEP 0: Sửa lỗi văn bản */
//     const STEP_0 = await OPEN_AI.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: STEP0_PROMPT }],
//       temperature: 0.3,
//     });
//     /**
//      * Cleaned text
//      */
//     const CLEANED_TEXT_STEP_0 = STEP_0.choices[0].message.content || "";

//     /** STEP 1: Làm sạch dòng rác */
//     const STEP_1 = await OPEN_AI.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: STEP1_PROMPT(CLEANED_TEXT_STEP_0) }],
//       temperature: 0.3,
//     });
//     /**
//      * Cleaned text
//      */
//     const CLEANED_TEXT_STEP_1 = STEP_1.choices[0].message.content || "";

//     /** STEP 2: Chuẩn hóa giá tiền */
//     const STEP_2 = await OPEN_AI.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: STEP2_PROMPT(CLEANED_TEXT_STEP_1) }],
//       temperature: 0.3,
//     });
//     /**
//      * Cleaned text
//      */
//     const CLEANED_TEXT_STEP_2 = STEP_2.choices[0].message.content || "";

//     /** STEP 3: Tách size món nếu có */
//     const STEP_3 = await OPEN_AI.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: STEP3_PROMPT(CLEANED_TEXT_STEP_2) }],
//       temperature: 0.3,
//     });
//     /**
//      * Final menu
//      */
//     const FINAL_MENu = STEP_3.choices[0].message.content || "";
//     /**
//      * Tách các món ăn thành từng dòng
//      */
//     const MENU_ITEMS = FINAL_MENu.split("\n").filter(
//       (line) => line.trim() !== ""
//     );
//     /**
//      * Return cleaned menu
//      */
//     return NextResponse.json({ menuItems: MENU_ITEMS });
//   } catch (error) {
//     console.error("Error processing menu:", error);
//     return NextResponse.json(
//       { error: "Failed to process menu data" },
//       { status: 500 }
//     );
//   }
// }
