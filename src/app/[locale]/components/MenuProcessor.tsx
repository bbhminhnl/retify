"use client";

import { useRef, useState } from "react";

import { ImageAnnotatorClient } from "@google-cloud/vision";
import { OpenAI } from "openai";

const MenuProcessor = () => {
  /**
   * State Kết quả
   */
  const [result, setResult] = useState<any>(null);
  /**
   * State loading
   */
  const [isLoading, setIsLoading] = useState(false);
  /**
   * Ref input file
   */
  const FILE_INPUT_REF = useRef<HTMLInputElement>(null);

  /** Khởi tạo clients (chỉ chạy trên server-side) */
  const VISION_CLIENT = new ImageAnnotatorClient({
    credentials: JSON.parse(process.env.NEXT_PUBLIC_GOOGLE_CREDENTIALS!),
  });
  /** AI */
  const OPEN_AI = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY!,
    /** Chỉ dùng cho demo, production nên gọi qua API route */
    dangerouslyAllowBrowser: true,
  });

  /**
   *  Phân tích menu
   * @param file File
   */
  const processMenu = async (file: File) => {
    setIsLoading(true);
    try {
      /** 1. Tiền xử lý ảnh */
      const IMAGE_BUFFER = await readFileAsBuffer(file);

      /** 2. OCR bằng Google Vision */
      const OCR_TEXT = await runOCR(IMAGE_BUFFER);

      /** 3. AI phân tích cấu trúc menu */
      const MENU_DATA = await analyzeWithAI(OCR_TEXT);

      setResult(MENU_DATA);
    } finally {
      setIsLoading(false);
    }
  };

  /**x Hàm phụ trợ
   * @param file File
   */
  const readFileAsBuffer = (file: File): Promise<Buffer> => {
    return new Promise((resolve) => {
      const READER = new FileReader();
      READER.onload = (e) =>
        resolve(Buffer.from(e.target?.result as ArrayBuffer));
      READER.readAsArrayBuffer(file);
    });
  };
  /**
   *  OCR bằng Google Vision
   * @param buffer Buffer
   * @returns
   */
  const runOCR = async (buffer: Buffer): Promise<string> => {
    const [result] = await VISION_CLIENT.textDetection({
      image: { content: buffer },
    });
    return result.fullTextAnnotation?.text || "";
  };
  /**
   *  AI phân tích cấu trúc menu
   * @param text Văn bản
   * @returns
   */
  const analyzeWithAI = async (text: string) => {
    const PROMPT = `
    Phân tích menu sau thành JSON với cấu trúc:
    {
      "restaurantName": string,
      "sections": {
        "sectionName": {
          "description": string,
          "items": { "name": string, "price": number, "description": string }[]
        }[]
      }
    }
    
    Văn bản:
    ${text.substring(0, 3000)} // Giới hạn token
    `;

    const RESPONSE = await OPEN_AI.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: PROMPT }],
      temperature: 0.3,
    });

    return JSON.parse(RESPONSE.choices[0].message.content || "{}");
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <input
        type="file"
        ref={FILE_INPUT_REF}
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && processMenu(e.target.files[0])}
        className="hidden"
      />

      <button
        onClick={() => FILE_INPUT_REF.current?.click()}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg mb-4"
      >
        {isLoading ? "Đang xử lý..." : "Tải lên ảnh Menu"}
      </button>

      {result && (
        <div className="mt-6 space-y-8">
          <h2 className="text-2xl font-bold">
            {result.restaurantName || "Menu"}
          </h2>

          {Object.entries(result.sections || {}).map(
            ([sectionName, section]: [string, any]) => (
              <div key={sectionName} className="border rounded-lg p-4">
                <h3 className="font-bold text-lg mb-2">{sectionName}</h3>
                {section.description && (
                  <p className="text-gray-600 mb-3">{section.description}</p>
                )}

                <div className="space-y-2">
                  {section.items?.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between border-b pb-2"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-gray-500">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <p className="text-green-600 font-medium">
                        {item.price?.toLocaleString("vi-VN")}₫
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default MenuProcessor;
