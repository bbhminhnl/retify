import { notFound } from "next/navigation";
import redis from "@/lib/redis";

/**
 * Data Item
 */
interface DataItem {
  /** Tên món ăn */
  image_url: string;
  /** Đường dẫn ảnh */
  name: string;
  /** Tên món ăn */
  price: string;
  /** Giá món ăn */
  unit: string;
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  /** Lấy id từ params */
  const { id } = await params; // params is already available synchronously
  /** Kiểm tra id */
  const RAW_DATA = await redis.get(id);
  console.log(RAW_DATA, "RAW_DATA");
  /** Kiểm tra dữ liệu */
  if (!RAW_DATA) {
    notFound();
  }
  /** Chuyển đổi dữ liệu từ JSON string sang object */
  const DATA: DataItem[] = JSON.parse(RAW_DATA);

  return (
    <main className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">📦 Dữ liệu cho Template ID: {id}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {DATA.length > 0 ? (
          DATA.map((item, index) => (
            <div key={index} className="bg-white p-4 rounded shadow-md">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-48 object-cover rounded"
              />
              <h2 className="text-xl font-semibold mt-4">{item.name}</h2>
              <p className="text-gray-500">
                {item.price} {item.unit}
              </p>
            </div>
          ))
        ) : (
          <p>Không có dữ liệu để hiển thị.</p>
        )}
      </div>
    </main>
  );
}
