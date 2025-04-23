import TemplateClient from "./TemplateClient";
import redis from "@/lib/redis";

export default async function TemplatePage({
  searchParams,
}: {
  searchParams: { template_id?: string };
}) {
  const { template_id } = await searchParams;

  if (!template_id) {
    return <p className="p-4 text-red-500">❌ Thiếu template_id</p>;
  }
  /** Lấy key từ searchParams */
  const KEY = `${template_id}`;
  /** Lấy Raw data từ Redis */
  const RAW = await redis.get(KEY);

  return <TemplateClient rawData={RAW} template_id={template_id} />;
}
