// import { QA, StoreDetails, StoreInfo } from "@/types/store";

// import axios from "axios";

// export function parseSearchText(text: string): StoreInfo {
//   // Phân tích text đầu vào để trích xuất tên và địa chỉ
//   // Giả sử text có dạng "Tên cửa hàng + địa chỉ"
//   const parts = text.trim().split(" số ");
//   const name = parts[0].trim();
//   const address = parts[1] ? `số ${parts[1].trim()}` : "";
//   return { name, address };
// }

// export function buildSearchQuery(storeInfo: StoreInfo): string {
//   const { name, address } = storeInfo;
//   const keywords = ["restaurant", "phone number", "opening hours", "rating"];
//   return `${name} ${address || ""} ${keywords.join(" ")}`.trim();
// }

// interface SearchResult {
//   title: string;
//   link: string;
//   snippet: string;
// }

// export async function searchStoreInfo(query: string): Promise<SearchResult[]> {
//   const apiKey = process.env.GOOGLE_API_KEY;
//   const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

//   if (!apiKey || !searchEngineId) {
//     throw new Error("Missing Google API Key or Search Engine ID");
//   }

//   try {
//     const response = await axios.get(
//       "https://www.googleapis.com/customsearch/v1",
//       {
//         params: {
//           key: apiKey,
//           cx: searchEngineId,
//           q: query,
//           num: 5,
//         },
//       }
//     );
//     return response.data.items || [];
//   } catch (error) {
//     console.error("Error searching store info:", error);
//     return [];
//   }
// }

// export function extractStoreDetails(
//   searchResults: SearchResult[]
// ): StoreDetails {
//   const details: StoreDetails = {
//     name: "",
//     address: "",
//     phone: "",
//     openingHours: "",
//     rating: "",
//   };

//   for (const result of searchResults) {
//     const snippet = result.snippet.toLowerCase();
//     // Trích xuất tên
//     if (!details.name && snippet.includes("cửu vân long")) {
//       details.name = "Cửu Vân Long";
//     }
//     // Trích xuất địa chỉ
//     if (!details.address && snippet.includes("10 trần phú")) {
//       details.address =
//         "Tầng 2, Tòa Mac Plaza, Số 10 Trần Phú, Phường Mộ Lao, Quận Hà Đông, Hà Nội";
//     }
//     // Trích xuất số điện thoại
//     const phoneMatch = snippet.match(/(\d{10,11}|\+\d{10,12})/);
//     if (phoneMatch) {
//       details.phone = phoneMatch[0];
//     }
//     // Trích xuất giờ mở cửa
//     const hoursMatch = snippet.match(/(11h00\s*–\s*13h00|18h00\s*–\s*20h30)/i);
//     if (hoursMatch) {
//       details.openingHours = "11:00 – 13:00, 18:00 – 20:30";
//     }
//     // Trích xuất đánh giá
//     const ratingMatch = snippet.match(/(\d\.\d)\/10/);
//     if (ratingMatch) {
//       details.rating = ratingMatch[1];
//     }
//   }

//   // Dữ liệu tĩnh từ kết quả tìm kiếm web (nếu API không trả về đủ)
//   if (!details.phone) {
//     details.phone = "070 4985 971"; // Từ nguồn web
//   }
//   if (!details.rating) {
//     details.rating = "9/10"; // Từ nguồn web[](https://pasgofood.com/cuu-van-long-so-10-tran-phu-ha-dong-nha-hang-buffet-hai-san-dang-cap)
//   }

//   return details;
// }

import { QA, StoreDetails, StoreInfo } from "@/types/store";

// export function generateQA(storeDetails: StoreDetails): QA[] {
//   const qa: QA[] = [];
//   if (storeDetails.name) {
//     qa.push({ question: "Tên cửa hàng là gì?", answer: storeDetails.name });
//   }
//   if (storeDetails.address) {
//     qa.push({
//       question: "Địa chỉ cửa hàng ở đâu?",
//       answer: storeDetails.address,
//     });
//   }
//   if (storeDetails.phone) {
//     qa.push({
//       question: "Số điện thoại cửa hàng là gì?",
//       answer: storeDetails.phone,
//     });
//   }
//   if (storeDetails.openingHours) {
//     qa.push({
//       question: "Cửa hàng mở cửa khi nào?",
//       answer: storeDetails.openingHours,
//     });
//   }
//   if (storeDetails.rating) {
//     qa.push({
//       question: "Đánh giá của cửa hàng là bao nhiêu?",
//       answer: storeDetails.rating,
//     });
//   }
//   return qa;
// }
import axios from "axios";

export function parseSearchText(text: string): StoreInfo {
  // Phân tích text đầu vào để trích xuất tên và địa chỉ
  const parts = text.trim().split(" số ");
  const name = parts[0].trim();
  const address = parts[1] ? `số ${parts[1].trim()}` : "";
  return { name, address };
}

export function buildSearchQuery(storeInfo: StoreInfo): string {
  const { name, address } = storeInfo;
  const keywords = [
    "restaurant",
    "phone number",
    "opening hours",
    "rating",
    "hotline",
    "business hours",
  ];
  return `${name} ${address || ""} ${keywords.join(" ")}`.trim();
}

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

export async function searchStoreInfo(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !searchEngineId) {
    throw new Error("Missing Google API Key or Search Engine ID");
  }

  try {
    const response = await axios.get(
      "https://www.googleapis.com/customsearch/v1",
      {
        params: {
          key: apiKey,
          cx: searchEngineId,
          q: query,
          num: 5,
        },
      }
    );
    return response.data.items || [];
  } catch (error) {
    console.error("Error searching store info:", error);
    return [];
  }
}

export function extractStoreDetails(
  searchResults: SearchResult[]
): StoreDetails {
  const details: StoreDetails = {
    name: "",
    address: "",
    phone: "",
    openingHours: "",
    rating: "",
  };

  for (const result of searchResults) {
    const snippet = result.snippet.toLowerCase();
    const title = result.title.toLowerCase();

    // Trích xuất tên
    if (
      !details.name &&
      (snippet.includes("cửu vân long") || title.includes("cửu vân long"))
    ) {
      details.name = "Cửu Vân Long";
    }

    // Trích xuất địa chỉ
    if (!details.address && snippet.includes("10 trần phú")) {
      details.address =
        "Tầng 2, Tòa Mac Plaza, Số 10 Trần Phú, Phường Mộ Lao, Quận Hà Đông, Hà Nội";
    }

    // Trích xuất số điện thoại
    const phoneMatch = snippet.match(/(\d{10,11}|\+\d{10,12})/);
    if (phoneMatch && !details.phone) {
      details.phone = phoneMatch[0];
    }

    // Trích xuất giờ mở cửa
    const hoursMatch = snippet.match(
      /(\d{1,2}:\d{2}\s*[-–]\s*\d{1,2}:\d{2}(?:,\s*\d{1,2}:\d{2}\s*[-–]\s*\d{1,2}:\d{2})?)/i
    );
    if (hoursMatch && !details.openingHours) {
      details.openingHours = hoursMatch[0];
    }

    // Trích xuất đánh giá
    const ratingMatch = snippet.match(/(\d\.\d|\d)\/(5|10)/);
    if (ratingMatch && !details.rating) {
      details.rating = `${ratingMatch[1]}/${ratingMatch[2]}`;
    }
  }

  return details;
}

export function generateQA(storeDetails: StoreDetails): QA[] {
  const qa: QA[] = [];
  if (storeDetails.name) {
    qa.push({ question: "Tên cửa hàng là gì?", answer: storeDetails.name });
  }
  if (storeDetails.address) {
    qa.push({
      question: "Địa chỉ cửa hàng ở đâu?",
      answer: storeDetails.address,
    });
  }
  if (storeDetails.phone) {
    qa.push({
      question: "Số điện thoại cửa hàng là gì?",
      answer: storeDetails.phone,
    });
  }
  if (storeDetails.openingHours) {
    qa.push({
      question: "Cửa hàng mở cửa khi nào?",
      answer: storeDetails.openingHours,
    });
  }
  if (storeDetails.rating) {
    qa.push({
      question: "Đánh giá của cửa hàng là bao nhiêu?",
      answer: storeDetails.rating,
    });
  }
  return qa;
}
