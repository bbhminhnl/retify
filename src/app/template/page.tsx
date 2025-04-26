import TemplateClient from "./TemplateClient";
import { notFound } from "next/navigation";
import redis from "@/lib/redis";
/**
 * Lấy dữ liệu từ Redis
 */
interface PageProps {
  /** Lấy template_id từ query */
  searchParams: Promise<{ template_id?: string }>;
}
/**
 * Dynamic route
 */
export const dynamic = "force-dynamic";
/**
 * Revalidate every 0 seconds
 * Tức là mỗi lần truy cập sẽ lấy dữ liệu mới từ Redis
 */
export const revalidate = 0;

export default async function TemplatePage({ searchParams }: PageProps) {
  /** Lấy template_id từ query */
  const { template_id } = await searchParams;
  /** Kiểm tra template_id */
  if (!template_id) {
    return (
      <p className="p-4 text-red-600 w-full text-center font-medium">
        Thiếu template_id
      </p>
    );
  }
  /** Khai báo data */
  let data: any[] = [];

  try {
    /** Lấy dữ liệu từ Redis */
    const RAW = await redis.get(template_id);
    /** Nếu không tìm thấy dữ liệu hoặc dữ liệu quá hạn thì return */
    if (!RAW) {
      return (
        <p className="p-4 text-yellow-600 w-full text-center font-medium">
          Không tìm thấy dữ liệu hoặc dữ liệu đã quá hạn.
        </p>
      );
    }
    /** Chuyển đổi dữ liệu từ Redis về định dạng JSON */
    const PARSED = JSON.parse(RAW);
    /** Kiểm tra dữ liệu */
    if (!Array.isArray(PARSED)) notFound();
    /** Gán vào biến data */
    data = PARSED;
  } catch (error) {
    console.error("Lỗi Redis:", error);
    return (
      <p className="p-4 text-red-700 w-full text-center font-medium">
        Lỗi khi lấy dữ liệu.
      </p>
    );
  }

  return <TemplateClient rawData={data} template_id={template_id} />;
}
