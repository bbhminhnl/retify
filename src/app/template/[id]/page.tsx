import { notFound } from "next/navigation";
import redis from "@/lib/redis"; // Đảm bảo bạn đã import redis ở đây

interface Props {
  params: {
    id: string;
  };
}

export default async function TemplatePage({ params }: Props) {
  /** Bạn phải await params trước khi sử dụng chúng. */
  const { id } = await params;

  /** Lấy dữ liệu từ Redis bằng key là `id` */
  const RAW_DATA = await redis.get(id);
  console.log(RAW_DATA, "RAW_DATA");
  if (!RAW_DATA) {
    /** Nếu không có dữ liệu, trả về trang không tìm thấy */
    notFound();
  }

  /** Parse dữ liệu Redis */
  const DATA = JSON.parse(RAW_DATA as string);

  return (
    <main className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">📦 Dữ liệu cho Template ID: {id}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {DATA && DATA.length > 0 ? (
          DATA.map((item: any, index: number) => (
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
