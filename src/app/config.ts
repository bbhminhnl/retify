/** Cấu hình mặc định cho dự án nhỏ */
export const config = {
  openAI: {
    model: "gpt-3.5-turbo", // Miễn phí với tài khoản OpenAI
    endpoint: "https://api.openai.com/v1/chat/completions",
    maxTokens: 500,
  },
  menuPatterns: {
    priceFormats:
      /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?\s*(?:₫|vnd|đ)|(?:\$|€)\s*\d+\.\d{2})/gi,
    ignoreLines: /^(menu|quán|địa chỉ|hotline|====)/i,
  },
};
