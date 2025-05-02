import { API_HOST } from "./env";
import { request } from "./request";
/** Đường dẫn host */
export const HOST: { [index: string]: string } =
  API_HOST[process.env.NEXT_PUBLIC_ENV || "production"];

/** đầu vào của api */
interface InputRequestApi {
  /** điểm cuối api */
  end_point?: string;
  /** dữ liệu gửi đi */
  body?: any;
  /** service_type */
  service_type?: string;
  /** phương thức gọi api */
  method?: string;
  /** headers */
  headers?: any;
}
/** Fetch api
 * @param url
 * @param method
 * @param body
 * @param headers
 * @returns Data
 */
export const fetchApi = async (
  url: string,
  method = "POST",
  body: {},
  headers?: {}
) => {
  /**
   * fetch data
   */
  const RES = await fetch(url, {
    method: method,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
  /** Trả về data json */
  return RES.json();
};
/** Hàm dùng chung để gọi API
 * @param end_point đường dẫn cuối của api
 * @param body dữ liệu gửi đi
 * @param service_type loại dịch vụ
 * @param method phương thức gọi api
 */
export async function apiCommon({
  end_point,
  body,
  service_type = "billing",
  method = "POST",
  headers,
}: InputRequestApi) {
  try {
    /** Đường dẫn API */
    const URI = `${HOST[service_type]}/${end_point}`;

    /** Nếu là dịch vụ ảnh thì chỉ trả về đường dẫn URI */
    if (service_type === "image") {
      /**
       * Trả về đường dẫn ảnh
       */
      return URI;
    }
    /**
     * Gọi API
     */
    const DATA = await request({
      uri: URI,
      method: method,
      headers: {
        Authorization: getAccessToken(),
        ...headers,
      },
      body,
    });
    /**
     * Trả về dữ liệu
     */
    return DATA;
  } catch (e) {
    console.error(`Lỗi khi gọi API ${service_type}:`, e);
    /**
     * Nếu có lỗi thì ném ra
     */
    throw e;
  }
}

/** hàm lấy access_token */
export function getAccessToken() {
  /** Lấy Access Token từ localStorage */
  const ACCESS_TOKEN = localStorage.getItem("token");
  /**
   * Nếu không có Access Token thì chuyển hướng về trang login
   */
  return ACCESS_TOKEN;
}
