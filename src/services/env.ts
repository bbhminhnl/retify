/** API HOST THEO 3 MÔI TRƯỜNG */
export const API_HOST: { [index: string]: { [index: string]: string } } = {
  /** môi trường development */
  development: {},
  /** môi trường production */
  production: {
    public: "https://chatbox-public-v2.botbanhang.vn",
    billing: "https://chatbox-billing.botbanhang.vn",
    service: "https://chatbox-service-v3.botbanhang.vn",
    setting: "https://chatbox-service-v3.botbanhang.vn",
    llm_no_proxy: "https://chatbox-llm.botbanhang.vn",
    merchant: "https://api.merchant.vn",
    merchant_product: "https://api-product.merchant.vn",

    image: "https://cdn.botbanhang.vn",
    api: "https://chatbox-service.botbanhang.vn/v1",
    message: "https://chatbot-api.botbanhang.vn",
    ai: "https://chatbox-ai.botbanhang.vn/app",
    llm_ai: "https://chatbox-llm.botbanhang.vn/app/config/proxy",
  },
};
