// import TemplateClient from "./TemplateClient";
// import redis from "@/lib/redis";

// export default async function TemplatePage({
//   searchParams,
// }: {
//   searchParams: { template_id?: string };
// }) {
//   const { template_id } = await searchParams;

//   if (!template_id) {
//     return <p className="p-4 text-red-500">❌ Thiếu template_id</p>;
//   }
//   /** Lấy key từ searchParams */
//   const KEY = `${template_id}`;
//   /** Lấy Raw data từ Redis */
//   const RAW = await redis.get(KEY);

import TemplateClient from "./TemplateClient";
//   return <TemplateClient rawData={RAW} template_id={template_id} />;
// }
// src/app/template/page.tsx
import { notFound } from "next/navigation";
import redis from "@/lib/redis";

interface DataItem {
  image_url: string;
  name: string;
  price: string;
  unit: string;
}

// Define PageProps with correct searchParams type
interface PageProps {
  searchParams: Promise<{ template_id?: string }>;
}

// Force dynamic rendering to ensure fresh data
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TemplatePage({ searchParams }: PageProps) {
  const { template_id } = await searchParams; // Await the Promise to get template_id
  console.log("Selected Template ID:", template_id);

  if (!template_id) {
    return (
      <p style={{ padding: "1rem", color: "#EF4444" }}>❌ Thiếu template_id</p>
    );
  }

  const KEY = `${template_id}`;
  let RAW: string | null = null;
  let DATA: DataItem[] = [];

  // Hardcoded data for testing Vercel rendering
  const HARDCODED_DATA: DataItem[] = [
    {
      image_url: "https://via.placeholder.com/150",
      name: `Test Item for ${template_id}`,
      price: "100",
      unit: "USD",
    },
  ];

  // Try fetching from Redis
  try {
    RAW = await redis.get(KEY);
    console.log("RAW Data for Key:", KEY, "Data:", RAW);

    if (!RAW) {
      console.log("No data found for Key:", KEY);
      // Use hardcoded data as fallback for debugging
      DATA = HARDCODED_DATA;
      console.log("Using Hardcoded Data:", DATA);
    } else {
      DATA = JSON.parse(RAW);
      if (!Array.isArray(DATA)) {
        console.error(
          "Parsed data is not an array for Key:",
          KEY,
          "Data:",
          DATA
        );
        notFound();
      }
    }
  } catch (error) {
    console.error("Error fetching/parsing data for Key:", KEY, "Error:", error);
    // Use hardcoded data as fallback for debugging
    DATA = HARDCODED_DATA;
    console.log("Using Hardcoded Data due to error:", DATA);
  }

  console.log("DATA:", DATA);
  console.log("DATA Length:", DATA.length);

  return <TemplateClient rawData={DATA} template_id={template_id} />;
}
