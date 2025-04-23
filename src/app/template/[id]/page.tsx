// import { notFound } from "next/navigation";
// import redis from "@/lib/redis";

// export default async function Page({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   /** Lấy id từ params */
//   /** params is already available synchronously */
//   const { id } = await params;
//   /** Kiểm tra id */
//   const RAW_DATA = await redis.get(id);
//   console.log(RAW_DATA, "RAW_DATA");
//   /** Kiểm tra dữ liệu */
//   if (!RAW_DATA) {
//     notFound();
//   }
//   /** Chuyển đổi dữ liệu từ JSON string sang object */
//   const DATA: DataItem[] = JSON.parse(RAW_DATA);

//   return (
//     <main className="p-8 max-w-3xl mx-auto space-y-6">
//       <h1 className="text-2xl font-bold">📦 Dữ liệu cho Template ID: {id}</h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         {DATA.length > 0 ? (
//           DATA.map((item, index) => (
//             <div key={index} className="bg-white p-4 rounded shadow-md">
//               <img
//                 src={item.image_url}
//                 alt={item.name}
//                 className="w-full h-48 object-cover rounded"
//               />
//               <h2 className="text-xl font-semibold mt-4">{item.name}</h2>
//               <p className="text-gray-500">
//                 {item.price} {item.unit}
//               </p>
//             </div>
//           ))
//         ) : (
//           <p>Không có dữ liệu để hiển thị.</p>
//         )}
//       </div>
//     </main>
//   );
// }

// import { notFound } from "next/navigation";
// import redis from "@/lib/redis";

// interface DataItem {
//   image_url: string;
//   name: string;
//   price: string;
//   unit: string;
// }

// interface PageProps {
//   params: Promise<{ id: string }>;
// }

// export default async function Page({ params }: PageProps) {
//   const { id } = await params;
//   console.log("Template ID:", id); // Log the ID

//   let RAW_DATA: string | null = null;
//   try {
//     RAW_DATA = await redis.get(id);
//     console.log("RAW_DATA:", RAW_DATA); // Log raw Redis data
//   } catch (error) {
//     console.error("Redis Fetch Error:", error);
//     notFound();
//   }

//   if (!RAW_DATA) {
//     console.log("No data found for ID:", id);
//     notFound();
//   }

//   let DATA: DataItem[] = [];
//   try {
//     DATA = JSON.parse(RAW_DATA);
//     console.log("Parsed DATA:", DATA); // Log parsed data
//     if (!Array.isArray(DATA)) {
//       console.error("Parsed data is not an array:", DATA);
//       notFound();
//     }
//   } catch (error) {
//     console.error(
//       "JSON Parse Error for ID:",
//       id,
//       "RAW_DATA:",
//       RAW_DATA,
//       "Error:",
//       error
//     );
//     notFound();
//   }

//   return (
//     <main className="p-8 max-w-3xl mx-auto space-y-6">
//       <h1 className="text-2xl font-bold">📦 Dữ liệu cho Template ID: {id}</h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         {DATA.length > 0 ? (
//           DATA.map((item, index) => (
//             <div key={index} className="bg-white p-4 rounded shadow-md">
//               <img
//                 src={item.image_url}
//                 alt={item.name}
//                 className="w-full h-48 object-cover rounded"
//               />
//               <h2 className="text-xl font-semibold mt-4">{item.name}</h2>
//               <p className="text-gray-500">
//                 {item.price} {item.unit}
//               </p>
//             </div>
//           ))
//         ) : (
//           <p>Không có dữ liệu để hiển thị.</p>
//         )}
//       </div>
//     </main>
//   );
// }
import { notFound } from "next/navigation";

interface DataItem {
  image_url: string;
  name: string;
  price: string;
  unit: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  // Hardcoded data for testing
  const DATA: DataItem[] = [
    {
      image_url: "https://via.placeholder.com/150",
      name: "Test Item",
      price: "100",
      unit: "USD",
    },
  ];

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
