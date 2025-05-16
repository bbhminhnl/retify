import QRCode from "qrcode";
import { toast } from "react-toastify";

/** FromatCurrency
 * @param {string} value - The value to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (value?: string | number | undefined) => {
  /**
   * Kiểm tra nếu không có value thì trả về ''
   */
  if (!value) return "";
  /**
   * Chuyển value thành số và loại bỏ dấu chấm
   */
  const NUM_VALUE = parseFloat(value.toString().replace(/\./g, ""));
  /**
   * Kiểm tra nếu value không phải là số thì trả về ''
   */
  if (isNaN(NUM_VALUE)) return "";
  /**
   * Trả về value đã format
   */
  return NUM_VALUE.toLocaleString("vi-VN");
};
/**
 * Tạo một ID ngẫu nhiên
 * @param {number} length - Độ dài của ID
 * @returns {string} - ID ngẫu nhiên
 */
export const MENU_PATTERNS = {
  /** Cải thiện phát hiện tiêu đề mục trong menu tiếng Việt */
  SECTION:
    /^(?!.*\b(available|mon|tue|wed|thu|fri|sat|sun|am|pm|giờ|phục vụ)\b)[A-ZÀ-Ỹ][A-ZÀ-Ỹ\s]+$/i,

  /** Cải thiện phát hiện giá với định dạng tiền tệ Việt Nam */
  PRICE: /\b\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?\s*(?:₫|vnd|đ|d|k|nghìn)?\b/gi,

  /** Cải thiện danh sách từ khóa cần bỏ qua */
  IGNORE:
    /^(menu|thực đơn|quán|địa chỉ|hotline|====|http|\b(available|mon|tue|wed|thu|fri|sat|sun|\d+\s?[ap]m|giờ|phục vụ)\b)/i,

  /** Phát hiện đơn vị tiền tệ Việt Nam và quốc tế */
  CURRENCY: /\b(₫|vnd|đ|d|\$|€|usd|k|nghìn)\b/i,

  /** Định dạng giá tính theo nghìn đồng */
  THOUSAND_VND: /\b(nghìn đồng|giá tính theo nghìn)\b/i,

  /** Phát hiện đơn vị trong menu */
  UNIT: /\b(đĩa|plate|phần|serving|người|person|suất)\b/i,
};

/** Hàm sinh ra UUID ngẫu nhiên
 * @returns {string} - UUID ngẫu nhiên
 */
export function simpleUUID(): string {
  return Math.random().toString(36).substring(2, 10);
}
/**
 * Hàm sao chép văn bản vào clipboard và hiển thị thông báo thành công
 * @param text Văn bản cần sao chép
 * @param onError Callback khi sao chép thất bại (tùy chọn)
 */
export function copyToClipboard(text: string, onError?: (error: any) => void) {
  /** Kiểm tra nếu trình duyệt hỗ trợ Clipboard API */
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // showSuccessMessage('Đã sao chép thành công!')
        toast.success("Đã sao chép thành công!");
      })
      .catch((error) => {
        console.error("Lỗi khi sao chép:", error);
        onError && onError(error);
      });
  } else {
    /** Trường hợp trình duyệt không hỗ trợ Clipboard API, sử dụng phương pháp cũ */
    try {
      /**
       * Tạo một phần tử TEXT_AREA ẩn để sao chép văn bản
       */
      const TEXT_AREA = document.createElement("textarea");
      /**
       * Gán văn bản cần sao chép vào phần tử TEXT_AREA
       */
      TEXT_AREA.value = text;
      /** Đảm bảo phần tử này không hiển thị trên màn hình */
      TEXT_AREA.style.position = "fixed";
      /**
       * Đặt opacity = 0 để ẩn phần tử
       */
      TEXT_AREA.style.opacity = "0";
      /**
       * Thêm phần tử TEXT_AREA vào body
       */
      document.body.appendChild(TEXT_AREA);
      /**
       * Focus vào phần tử TEXT_AREA
       */
      TEXT_AREA.focus();
      /**
       * Chọn toàn bộ văn bản trong phần tử TEXT_AREA
       */
      TEXT_AREA.select();
      /**
       * Thực hiện lệnh sao chép
       */
      const SUCCESSFUL = document.execCommand("copy");
      /**
       * Kiểm tra xem sao chép có thành công không
       */
      if (SUCCESSFUL) {
        /**
         * Hiển thị thông báo thành công
         */
        // showSuccessMessage('Đã sao chép thành công!')
        toast.success("Đã sao chép thành công!");
      } else {
        throw new Error("Không thể sao chép");
      }
    } catch (error) {
      console.error("Lỗi khi sao chép:", error);
      /**
       * Gọi hàm onError nếu có
       */
      onError && onError(error);
    } finally {
      /** Kiểm tra nếu textArea đã được thêm vào DOM thì xóa nó đi */
      const TEXT_AREA = document.querySelector("textarea");
      /**
       * Xóa phần tử TEXT_AREA khỏi body
       */
      if (TEXT_AREA) {
        /**
         * Xóa phần tử TEXT_AREA khỏi body
         */
        document.body.removeChild(TEXT_AREA);
      }
    }
  }
}

/**
 * Hàm generate QR code base64 từ chuỗi đầu vào
 * @param text Chuỗi cần chuyển thành QR
 * @returns Chuỗi base64 ảnh PNG QR code
 */
export async function generateQRCodeImage(text: string): Promise<string> {
  try {
    /**
     * Tạo QR code tuần nây
     */
    const DATA_URL = await QRCode.toDataURL(text);
    /** Đây là một ảnh PNG base64 */
    return DATA_URL;
  } catch (err) {
    console.error("Lỗi khi tạo QR Code:", err);
    throw err;
  }
}

/**
 *  Hàm tạo domain cho app
 * @param name Tên cơ quan
 * @returns
 */
export function toRenderDomain(name: string): string {
  /**
   * update domain
   */
  const NORMALIZED = removeVietnameseTones(name)
    .toLowerCase()
    .trim()
    /** Loại ký tự đặc biệt ngoại trừ khoảng trắng và dấu gạch ngang */
    .replace(/[^a-z0-9\s-]/g, "")
    /** Đổi khoảng trắng thành dấu gạch ngang */
    .replace(/\s+/g, "-")
    /** Gộp các dấu - liên tiếp thành 1 */
    .replace(/-+/g, "-");

  return `https://${NORMALIZED}.retify.ai`;
}

/** Hàm loại bỏ dấu tiếng Việt
 * @param str Tên cơ quan
 */
const removeVietnameseTones = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};
