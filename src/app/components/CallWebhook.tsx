// // components/CallWebhook.tsx
// "use client";

// import { useEffect } from "react";

// export default function CallWebhook() {
//   useEffect(() => {
//     // 1. Tạo payload đơn giản
//     const payload = {
//       org_id: "f48ef6f6bd05467b8b66b1602b27913f",
//       limit: 50,
//     };

//     // 2. Gọi API như bình thường
//     fetch("/api/facebook-webhook", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         // console.log("Webhook thành công:", data);
//         const DATA = data?.api_result?.data?.data;
//         const DATA_FILTER_FB = DATA?.filter(
//           (item: any) => item?.payload?.platform_type === "FB_MESS"
//         );
//         console.log(DATA_FILTER_FB, "data");
//       })
//       .catch((error) => console.error("Lỗi webhook:", error));
//   }, []); // Chỉ chạy 1 lần khi mount

//   return null; // Không render gì
// }
