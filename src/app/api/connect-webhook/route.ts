import { NextRequest, NextResponse } from "next/server";

/** 1. Service xử lý webhook */
class WebhookService {
  static async processWebhookData(webhookData: any): Promise<string | null> {
    return webhookData.message?.message_attachments?.[0].payload?.url || null;
  }
}
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "https://example.com";
/** 2. Service xử lý API Vision */
class VisionApiService {
  static async processImage(imageUrl: string): Promise<any> {
    /** Gọi API Vision */
    const PAYLOAD = { imageUrl };
    /** Gọi API Vision */
    const VISION_RES = await fetch(`${DOMAIN}/api/vision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(PAYLOAD),
    });
    /** Kiểm tra kết quả trả về */
    if (!VISION_RES.ok) {
      throw new Error(`Vision API failed with status ${VISION_RES.status}`);
    }
    /** Trả về kết quả */
    return await VISION_RES.json();
  }
}

/** 3. Service ghi log */
class LoggerService {
  /** Ghi log dữ liệu webhook */
  static logReceivedWebhook(data: any): void {
    console.log("Webhook received:", JSON.stringify(data, null, 2));
  }
  /** Ghi log URL hình ảnh */
  static logImageUrl(imageUrl: string): void {
    console.log(imageUrl, "IMAGE_URL");
  }
  /** Ghi log kết quả API Vision */
  static logApiResult(result: any): void {
    console.log(result, "VISION_RESULT");
  }
  /** Ghi log lỗi */
  static logError(error: Error): void {
    console.error("Error processing webhook:", error);
  }
}

/** 4. Controller xử lý route */
export async function POST(req: NextRequest) {
  try {
    /** Nhận dữ liệu webhook */
    const WEBHOOK_DATA = await req.json();
    LoggerService.logReceivedWebhook(WEBHOOK_DATA);
    /** Kiểm tra dữ liệu webhook */
    if (WEBHOOK_DATA?.event === "message.update") {
      /** Khai báo lỗi */
      const ERROR = "Webhook event is message.update, ignoring...";
      /** Log lỗi */
      LoggerService.logError(ERROR as any);
      /** Bỏ qua event message.update */
      return NextResponse.json(
        {
          status: "error",
          message: "Webhook event is message.update, ignoring...",
        },
        { status: 403 }
      );
    }
    /** Xử lý dữ liệu webhook */
    const IMAGE_URL = await WebhookService.processWebhookData(WEBHOOK_DATA);
    if (!IMAGE_URL) {
      throw new Error("No image URL found in webhook data");
    }
    LoggerService.logImageUrl(IMAGE_URL);
    /** Tạo Storage key lưu giá trị JSON MENU */
    const STORAGE_KEY = `${WEBHOOK_DATA?.client_id}__${WEBHOOK_DATA?.message?.message_id}`;

    /** Gọi API xử lý hình ảnh */
    const VISION_RESULT = await VisionApiService.processImage(IMAGE_URL);
    LoggerService.logApiResult(VISION_RESULT);
    /** Tạo lại danh sách món ăn, chuẩn có tên, giá, đơn vị */
    const DATA_PROCESS = await processMenuText(VISION_RESULT.texts);
    LoggerService.logApiResult(DATA_PROCESS);

    console.log(VISION_RESULT, "VISION_RESULT");
    console.log(DATA_PROCESS, "DATA_PROCESS");

    /** Thêm ảnh mô tả cho từng món ăn */
    // const UPDATED_MENU = await addImageDescription(DATA_PROCESS);
    // LoggerService.logApiResult(UPDATED_MENU);
    console.log(STORAGE_KEY, "STORAGE_KEY");
    /** Lưu vào Redis */
    saveMenuToRedis(STORAGE_KEY, JSON.stringify(DATA_PROCESS));
    /** Lưu vào Redis thành công */
    // console.log("Menu data saved to Redis successfully");
    /**
     * Gọi API để gửi tin nhắn đến Facebook Messenger
     * @param {string} client_id - ID của client
     * @param {string} message_id - ID của tin nhắn
     * @param {string} menu_title - Tiêu đề của menu
     * @param {string} page_id - ID của trang
     * @description
     * - Gọi API để gửi tin nhắn đến Facebook Messenger
     * - Sử dụng template message để hiển thị menu
     * - Sử dụng đường dẫn đến menu đã được tạo
     * - Đường dẫn đến menu được tạo bằng cách kết hợp client_id và message_id
     * - Ví dụ: https://example.com/template/template_id=client_id_message_id
     */
    const GENERATE_TEMPLATE_MESSAGE = await generateTemplateMessage({
      client_id: WEBHOOK_DATA.client_id,
      message_id: WEBHOOK_DATA.message.message_id,
      menu_title: WEBHOOK_DATA.message.message_attachments[0].title,
      page_id: WEBHOOK_DATA.page_id,
    });
    console.log(GENERATE_TEMPLATE_MESSAGE, "generateTemplateMessage");
    /** Trả về response thành công */
    return NextResponse.json({
      status: "success",
      message: "Webhook processed by external API",
      vision_result: DATA_PROCESS,
    });
  } catch (error) {
    LoggerService.logError(error as Error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/** 5. Controller xử lý GET request */
export async function GET(req: NextRequest) {
  console.log("Webhook endpoint is active");
  return NextResponse.json(
    { status: "ready", message: "Webhook endpoint is active" },
    { status: 200 }
  );
}

/**
 * Hàm xử lý dữ liệu menu
 * @param rawText Danh sách văn bản nhận diện được từ Vision API
 * @returns Danh sách các món ăn đã được làm sạch và tách tên, giá, đơn vị
 */
const processMenuText = async (rawText: string[]) => {
  /** Bước 1: Gọi API làm sạch dữ liệu */
  const CLEAN_RES = await fetch(`${DOMAIN}/api/clean-menu`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rawText: rawText.join("\n") }),
  });
  /**
   * Kết quả trả về từ API
   */
  const { menuItems } = await CLEAN_RES.json();

  /** Bước 2: Tách tên và giá */
  const PARSED_MENU = menuItems.map((item: string) => {
    /** Tách tên và giá , đơn vị*/
    const [name, price, unit] = item.split(" - ");
    return { name, price, unit };
  });

  return PARSED_MENU;
};

/** Thêm ảnh mô tả cho sản phẩm
 * @param menuItems Danh sách các món ăn đã được làm sạch và tách tên, giá, đơn vị
 * @returns Danh sách các món ăn đã được thêm ảnh mô tả
 * @description
 * - Gọi API để tạo ảnh từ prompt
 * - Lưu ảnh vào server
 * - Trả về danh sách các món ăn đã được thêm ảnh mô tả
 * - Nếu có lỗi trong quá trình tạo ảnh, trả về null cho ảnh
 */
const addImageDescription = async (menuItems: any[]) => {
  /** Call api tạo ảnh minh hoạ cho món ăn */
  const UPDATED_MENU = await Promise.all(
    menuItems.map(async (item: any) => {
      try {
        /**
         * Gọi API để tạo ảnh từ prompt
         */
        const RES = await fetch(`${DOMAIN}/api/google-generate-img`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: item.name }),
        });
        /**
         * Kết quả trả về từ API tạo ảnh
         */
        const DATA = await RES.json();

        // const imageUrl = await saveImageToServer(data?.image);
        /**
         * Gọi API để lưu ảnh
         * @param base64Image Luồng base64 của ảnh
         * @returns {string} - Đường dẫn ảnh đã lưu
         */
        const IMG_URL = await fetchUploadImage(DATA?.image);
        /** Trả về item và thêm image_url */
        return { ...item, image_url: IMG_URL };
      } catch (error) {
        console.error("Error generating image:", error);
        return { ...item, image_url: null };
      } finally {
        // completed++;
        // setProgress(`${completed}/${totalItems}`);
        // if (completed === totalItems) {
        //   setProgress("Done");
        //   setTimeout(() => {
        //     setProgress(null);
        //   }, 2000);
        // }
      }
    })
  );
  return UPDATED_MENU;
};
/**
 * Hàm xử lý upload ảnh lên server
 * @param base64Image Luồng base64 của ảnh
 * @returns {string} - Đường dẫn ảnh đã lưu
 */

const fetchUploadImage = async (base64Image: string) => {
  try {
    /** Giả định đây là ảnh PNG, bạn có thể đổi thành "image/jpeg" nếu cần */
    const MIME_TYPE = "image/png";

    /** Convert base64 → binary → File */
    const BYTE_STRING = atob(base64Image);
    /**
     * Chuyển đổi base64 thành Uint8Array
     */
    const BYTE_ARRAY = new Uint8Array(BYTE_STRING.length);
    /**
     * Chuyển đổi base64 thành Uint8Array
     */
    for (let i = 0; i < BYTE_STRING.length; i++) {
      BYTE_ARRAY[i] = BYTE_STRING.charCodeAt(i);
    }
    /**
     * Tạo đối tượng File từ Uint8Array
     */
    const FILE = new File([BYTE_ARRAY], "image.png", { type: MIME_TYPE });

    /** Đưa vào FormData */
    const FORM_DATA = new FormData();
    /** đổi 'file' nếu API cần tên khác */
    FORM_DATA.append("file", FILE);
    /**
     * Gọi API để upload ảnh
     */
    const RES = await fetch(
      "https://api.merchant.vn/v1/internals/attachment/upload?path=&label=&folder_id=&root_file_id=",
      {
        method: "POST",
        body: FORM_DATA,
        headers: {
          "token-business":
            process.env.NEXT_PUBLIC_MERCHANT_TOKEN_BUSINESS || "",
        },
      }
    );
    /**
     * Kết quả trả về từ API dạng JSON
     */
    const RESULT = await RES.json();
    /**
     * URL ảnh
     */
    const FILE_PATH = RESULT?.data?.file_path || "";
    console.log(RESULT);
    /**
     * Tra ve URL ảnh
     */
    return FILE_PATH;
  } catch (error) {
    console.error("Upload failed:", error);
  }
};

/**
 * Hàm gửi tin nhắn đến Facebook Messenger
 * @param params Tham số bao gồm client_id, message_id, menu_title, page_id
 * @returns Kết quả trả về từ API Facebook Messenger
 */
async function generateTemplateMessage(params: TemplateParams) {
  /**
   * Định nghĩa LInk hiển thị data
   */
  const LINK = `${DOMAIN}/template?template_id=${params.client_id}__${params.message_id}`;
  /** Domain API Facebook */
  const FB_DOMAIN = process.env.NEXT_PUBLIC_FACEBOOK_DOMAIN;
  /** Token API Facebook */
  const FB_TOKEN = process.env.NEXT_PUBLIC_FACEBOOK_TOKEN;
  /** Kiểm tra token và domain */
  if (!FB_DOMAIN) {
    throw new Error("Facebook domain is not defined");
  }

  /**
   * Body gửi đi
   */
  const BODY = {
    access_token: FB_TOKEN,
    client_id: params.client_id,
    page_id: params.page_id,
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Preview Demo Menu",
          buttons: [
            {
              type: "web_url",
              url: LINK,
              title: "Preview",
            },
          ],
        },
      },
    },
  };
  /**
   * Gọi API Facebook Messenger
   */
  const SEND_MESSAGE = await fetch(FB_DOMAIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(BODY),
  });
  console.log(SEND_MESSAGE, "SEND_MESSAGE");
  /**
   * Kết quả trả về từ API Facebook Messenger
   */
  const RES = await SEND_MESSAGE.json();
  console.log(RES, "ress");
  /**
   * Kiểm tra kết quả trả về
   */
  return RES;
}

/**
 * Xử lý add vào redis
 */
const saveMenuToRedis = async (key: string, value: any) => {
  try {
    /** Lưu vào Redis với key: client_id__message_id */
    /** Parse JSON */
    const JSON_INPUT = JSON.parse(value);
    /** Gửi request lưu vào Redis */
    const RES = await fetch(`${DOMAIN}/api/json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: JSON_INPUT }), // gửi key và value
    });
    /** Kết quả sau khi parse json */
    const RESULT = await RES.json();

    console.log(RESULT, "RESULT");
    /** Kiểm tra kết quả */
    if (RESULT.success) {
      console.log("Lưu thành công vào Redis");
    } else {
      alert("Lưu thất bại!");
    }
  } catch (error) {
    console.error("Error saving to Redis:", error);
    return false;
  }
};
