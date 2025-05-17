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
  /** connect to CRM */
  connect_to_crm: boolean;
  /** onFinish */
  on_finish_all: boolean;
  /** qr code */
  qr_code: string;
  /** page id */
  parent_page_id: string;
  /** is need to update */
  is_need_to_update_crm: boolean;
  /** fetching step 3-4 */
  fetching_step_3_4: boolean;
  /** fetching step 5 */
  fetching_step_4_5: boolean;
}
interface FormErrors {
  /** Thống tin cửa hàng */
  shop_name: string;
  /** Địa chỉ cửa hàng */
  shop_address: string;
  // thêm các field lỗi khác nếu có
}
