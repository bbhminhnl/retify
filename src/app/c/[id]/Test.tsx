// // app/c/[id]/page.tsx
// import { getLocale, getMessages } from "next-intl/server";

// import { notFound } from "next/navigation";

// interface PageProps {
//   params: { id: string };
// }

// export default async function Page({ params }: PageProps) {
//   //   const { id } = params;

//   // Lấy locale hiện tại
//   const locale = await getLocale();

//   // Lấy messages nếu bạn cần dùng `t()`
//   const messages = await getMessages();

//   // Trường hợp không có ID, redirect hoặc not found
//   //   if (!id) return notFound();

//   return (
//     <div>
//       {/* <h1>Trang doanh nghiệp ID: {id}</h1> */}
//       <p>Locale hiện tại: {locale}</p>
//       {/* Bạn có thể dùng messages hoặc `t()` từ useTranslations nếu client component */}
//     </div>
//   );
// }
