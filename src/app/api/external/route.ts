// app/api/external/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Gọi đến API bên ngoài (ví dụ: JSONPlaceholder)
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/todos/1"
    );

    // Nếu response không ok, throw error
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const externalData = await response.json();

    // Bạn có thể xử lý dữ liệu trước khi trả về
    const processedData = {
      ...externalData,
      additionalInfo: "This data was fetched from external API",
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(processedData);
  } catch (error) {
    console.error("Error fetching external API:", error);
    return NextResponse.json(
      { error: "Failed to fetch external data" },
      { status: 500 }
    );
  }
}
