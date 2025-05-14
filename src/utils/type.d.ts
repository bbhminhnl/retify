interface FormDataType {
  /** Bước */
  step: number;
  /** size công ty */
  company_size: string;
  /** Url ảnh */
  image_url: string;
  /** data input */
  data_input: Record<string, any>;
  /** data input */
  list_products: any[];
  /** errors */
  errors: FormErrors;
  /** Markdown */
  markdown: string;
  /** Internal Markdown */
  internal_markdown: string;
  /** access token*/
  access_token: string;
  /** Thông tin shop */
  shop_information: Record<string, any>;
  /** Địa chỉ cửa hàng */
  shop_address_detected: string;
  /** Thống tin cửa hàng */
  shop_name_detected: string;
}
interface FormErrors {
  /** Thống tin cửa hàng */
  shop_name: string;
  /** Địa chỉ cửa hàng */
  shop_address: string;
  // thêm các field lỗi khác nếu có
}
