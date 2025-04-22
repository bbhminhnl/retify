import { NextRequest, NextResponse } from "next/server";
import { QA, StoreDetails } from "@/types/store";
import {
  buildSearchQuery,
  extractStoreDetails,
  generateQA,
  parseSearchText,
  searchStoreInfo,
} from "@/lib/search";

export async function POST(request: NextRequest) {
  try {
    // Lấy text từ body request
    const { searchText } = await request.json();

    if (!searchText || typeof searchText !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing search text" },
        { status: 400 }
      );
    }

    // Bước 1: Phân tích text đầu vào
    const storeInfo = parseSearchText(searchText);

    // Bước 2: Tạo truy vấn tìm kiếm
    const query = buildSearchQuery(storeInfo);

    // Bước 3: Gọi Google Custom Search API
    const searchResults = await searchStoreInfo(query);

    // Bước 4: Trích xuất thông tin và đóng gói Q&A
    const storeDetails = extractStoreDetails(searchResults);
    const qa = generateQA(storeDetails);

    return NextResponse.json({ storeDetails, qa });
  } catch (error) {
    console.error("Error processing store info:", error);
    return NextResponse.json(
      { error: "Failed to process store info" },
      { status: 500 }
    );
  }
}
