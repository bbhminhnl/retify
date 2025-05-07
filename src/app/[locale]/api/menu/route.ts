import { NextResponse } from "next/server";

const MENU_REGEX = /(.+?)\s+(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{0,2})?\s*₫)/gi;

export async function POST(request: Request) {
  const { text } = await request.json();

  // Phân tích menu bằng regex
  const matches = [...text.matchAll(MENU_REGEX)];
  const items = matches.map((match) => ({
    name: match[1].trim(),
    price: parseFloat(match[2].replace(/[^\d.]/g, "")),
  }));

  return NextResponse.json({ items });
}
const SECTION_REGEX = /^[A-Z\s]+$/;

function parseAdvancedMenu(text: string) {
  const sections: Record<string, any> = {};
  let currentSection = "Khác";

  text.split("\n").forEach((line) => {
    if (SECTION_REGEX.test(line.trim())) {
      currentSection = line.trim();
      return;
    }

    const match = line.match(MENU_REGEX);
    if (match) {
      sections[currentSection] = sections[currentSection] || [];
      sections[currentSection].push({
        name: match[1].trim(),
        price: parseFloat(match[2].replace(/[^\d.]/g, "")),
      });
    }
  });

  return { sections };
}
