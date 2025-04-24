import { NextResponse } from "next/server";
// app/api/web-info/route.ts
import axios from "axios";
/** Lấy thông tin google API key */
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;
/** Lấy thông tin google search key */
const CX = process.env.GOOGLE_SEARCH_CX!;

export async function POST(req: Request) {
  const { query } = await req.json(); // ví dụ: "Cafe ABC 123 Nguyễn Trãi HCM"

  try {
    const URL = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
      query
    )}&key=${GOOGLE_API_KEY}&cx=${CX}`;
    console.log(URL);
    const { data } = await axios.get(URL);

    const RESULTS =
      data.items?.map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        displayLink: item.displayLink,
      })) || [];

    return NextResponse.json({ results: RESULTS });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
