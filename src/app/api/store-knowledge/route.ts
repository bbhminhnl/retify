import { NextResponse } from "next/server";
import OpenAI from "openai";
/**
 * Khai báo OpenAI
 */
const OPEN_AI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;
const CX = process.env.GOOGLE_SEARCH_CX!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

export async function POST(req: Request) {
  /**
   * Nhận dữ liệu từ client
   */
  const { query, locale } = await req.json(); // Ví dụ: "Tiệm Bánh ABC, Quận 3"

  try {
    /** 1️⃣ Gọi Google Search */
    const SEARCH_URL = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
      query
    )}&key=${GOOGLE_API_KEY}&cx=${CX}`;
    /** Data trích xuất đươc từ google */
    const RES = await fetch(SEARCH_URL);
    /** Lấy dữ liệu trả về từ google */
    const DATA = await RES.json();
    console.log(DATA, "DATA");
    /** Kiểm tra dữ liệu trả về từ google */
    const RESULTS = DATA.items;
    /**
     * Kiểm tra dữ liệu trả về từ google
     * Nếu không có kết quả nào, trả về lỗi 404
     */
    if (!RESULTS) {
      return NextResponse.json(
        { error: "Không tìm thấy thông tin" },
        { status: 404 }
      );
    }
    console.log(RESULTS, "result");
    /**
     * Trích xuất các thông tin cần thiết từ kết quả tìm kiếm
     * Chỉ lấy title, link, snippet
     */
    const FORMATTED_DATA = RESULTS.map(
      (item: any, index: number) =>
        `#${index + 1}\nTitle: ${item.title}\nSnippet: ${item.snippet}\nLink: ${
          item.link
        }`
    ).join("\n\n");
    /** 2️⃣ Gửi đoạn kết quả đó cho GPT để trích xuất và viết tài liệu */
    const GPT_PROMPT = `
    Bạn là một trợ lý AI chuyên thu thập và tổng hợp thông tin doanh nghiệp từ dữ liệu tìm kiếm trực tuyến. Tôi sẽ cung cấp cho bạn một danh sách các kết quả tìm kiếm (từ Google Search, review, blog, …) về một cửa hàng. Các kết quả này có thể chứa thông tin không đồng nhất hoặc thiếu sót.
    
Hãy làm như sau:
1. **Trích xuất và tổng hợp thông tin chính xác nhất** về cửa hàng từ toàn bộ kết quả, gồm:
   - "name": Tên chính xác của cửa hàng
   - "address": Địa chỉ (nếu có)
   - "phone": Số điện thoại chính, bao gồm cả số điện thoại cửa hàng và tổng đài hotline (nếu xuất hiện). Nếu có nhiều số, hãy tổng hợp thành một mảng hoặc đưa số ưu tiên nếu rõ ràng, Nếu có địa chỉ chính xác, thì Số điện thoại cần phải theo địa chỉ đó, tránh trường hợp lấy nhầm cơ sở.
   - "hours": Thông tin về giờ hoạt động, có thể bao gồm giờ mở cửa, giờ đóng cửa, giờ hoạt động trong ngày. Nếu dữ liệu có nhiều biểu hiện (ví dụ: "Mở cửa 6:00, đóng cửa 21:00" hoặc "Giờ hoạt động: 6:00 - 21:00"), hãy chuẩn hóa thành định dạng rõ ràng, Giờ mở cửa cũng cần chính xác theo địa chỉ (Nếu có từ đầu vào) tránh trường hợp nhầm thời gian hoạt động của các cơ sở.
   - "website": Nếu có link chính thức hoặc liên kết tham khảo chính.

2. Nếu không tìm thấy một số thông tin nào đó, hãy đặt giá trị là "null" hoặc chuỗi rỗng "" (không tự bịa thêm thông tin).

3. Bạn hãy viết thêm, Tài liệu dạng hỏi đáp, thông tin cơ bản, Tài liệu để AI Agent trả lời:
   - Một đoạn giới thiệu ngắn gọn và chuyên nghiệp (dùng markdown) giới thiệu tổng quan về cửa hàng.
   - Một số câu hỏi thường gặp (FAQ) kèm câu trả lời ngắn gọn, liên quan đến giờ mở cửa, tổng đài, chất lượng phục vụ, …
      + Câu hỏi có dạng Q&A Dialogue Template:
          Câu hỏi: Tên cửa hàng là gì?
          Trả lời: Dạ quán Bún Bò Cô Hồng - Món Huế đậm đà
        Giữa các câu hỏi và câu trả lời có thể có nhiều dấu cách, hoặc xuống dòng, bạn hãy chuẩn hóa lại cho gọn gàng.

### Dữ liệu tìm kiếm được cung cấp:
    ${FORMATTED_DATA}

Ví dụ:
- Title: Bún Bò Cô Hồng – Món Huế đậm đà
  Snippet: Quán ăn nổi tiếng tại 45 Nguyễn Trãi, Quận 1, TP.HCM. Gọi 0909123456 hoặc tổng đài 1900 1234 để đặt món. Mở cửa từ 6:00 đến 21:00.
  Link: https://maps.google.com/bunbo1

- Title: Bún bò Cô Hồng trên Foody
  Snippet: Địa chỉ: 45 Nguyễn Trãi, Quận 1, TP.HCM. Có hỗ trợ giao hàng, tuy nhiên số điện thoại không được hiển thị rõ.
  Link: https://foody.vn/...

- Title: Review quán bún bò ngon tại Sài Gòn
  Snippet: Cửa hàng Cô Hồng nằm gần chợ Bến Thành, không gian ấm cúng, giờ hoạt động: 06:00 - 21:00, liên hệ qua 0909123456.
  Link: https://reviewfood.vn/...
    `;

    const GPT_PROMPT_EN = `
You are an AI assistant specializing in collecting and synthesizing business information from online search results. I will provide you with a list of search results (from Google Search, review sites, blogs, etc.) related to a specific store. These results may contain inconsistent or incomplete information.

Your task:

1. **Extract and consolidate the most accurate and relevant information** about the store from all results, including:
   - "name": The exact name of the store
   - "address": Physical address (if available)
   - "phone": Primary phone number(s), including store and hotline numbers if mentioned. If there are multiple numbers, return them as an array or prioritize the main one if clearly indicated. Make sure the phone number corresponds to the specific address, to avoid mismatch across branches.
   - "hours": Opening hours — include both opening and closing times or operating range during the day. If formats vary (e.g., "Opens at 6:00 AM, closes at 9:00 PM" vs. "Hours: 6:00 AM - 9:00 PM"), normalize them to a clear and consistent format. Again, be mindful of mismatched hours between branches if the address is provided.
   - "website": Official website link or main reference link (if available).

2. If any information is missing, set its value as "null" or an empty string "" (do not make up or assume any data).

3. Additionally, create useful reference content in a Q&A format for an AI Agent to respond:
   - A short, professional overview of the store written in **markdown**.
   - A list of **frequently asked questions (FAQs)** with brief and clear answers related to hours, contact, service quality, etc.
     + Format each Q&A clearly using this pattern:
         Question: What is the name of the store?  
         Answer: It's **Bún Bò Cô Hồng – Authentic Hue-style noodles**  
       Normalize inconsistent formatting like random spacing or line breaks for clarity.

### Note: Do not translate or alter brand names, phone numbers, or website URLs such as "xanhSM", "BBH", etc.

### Search data provided:
${FORMATTED_DATA}

Example:
- Title: Bún Bò Cô Hồng – Authentic Hue-style noodles  
  Snippet: A popular spot at 45 Nguyễn Trãi, District 1, Ho Chi Minh City. Call 0909123456 or hotline 1900 1234 to place orders. Open from 6:00 AM to 9:00 PM.  
  Link: https://maps.google.com/bunbo1

- Title: Bún Bò Cô Hồng on Foody  
  Snippet: Address: 45 Nguyễn Trãi, District 1, HCMC. Delivery available, but phone number is not clearly listed.  
  Link: https://foody.vn/...

- Title: Best Bún Bò spots in Saigon  
  Snippet: Cô Hồng restaurant near Bến Thành Market. Cozy space. Hours: 6:00 AM - 9:00 PM. Contact: 0909123456.  
  Link: https://reviewfood.vn/...
`;

    /**
     * Gọi OpenAI API để xử lý dữ liệu
     * Với Prompt custom
     */
    /**
     * Dùng OpenAI API để làm sạch dữ liệu menu
     */
    const GPT_RESPONSE = await OPEN_AI.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: locale === "en" ? GPT_PROMPT_EN : GPT_PROMPT },
      ],
      temperature: 0.3, // Giảm nhiệt độ để kết quả ổn định
    });
    /**
     * Kết quả trả về từ OpenAI
     * Chỉ lấy phần nội dung chính
     */
    const AI_CONTENT = GPT_RESPONSE.choices[0].message.content;
    console.log(AI_CONTENT, "AI_CONTENT");
    /**
     * Trả về JSON
     * Chỉ lấy phần nội dung chính
     */
    return NextResponse.json({
      success: true,
      content: AI_CONTENT,
      //   data: RESULTS,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Xử lý thất bại" }, { status: 500 });
  }
}
