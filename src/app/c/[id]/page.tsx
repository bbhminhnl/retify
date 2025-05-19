import { getLocale, getMessages } from "next-intl/server";

import { notFound } from "next/navigation";

interface PageProps {
  params: Record<string, string>;
}

export default async function Page({ params }: PageProps) {
  /** Bắt buộc chờ params trước khi truy cập id */
  const id = (await params)?.id;

  /** Lấy locale và messages */
  const locale = await getLocale();
  const messages = await getMessages();

  if (!id) return notFound();

  return (
    <div className="flex w-screen h-screen">
      {/* <h1>Trang doanh nghiệp ID: {id}</h1> */}
      {/* <p>Locale hiện tại: {locale}</p> */}

      <div className="flex w-screen h-screen">
        <iframe
          src="http://localhost:5173/view-screen?page_id=752538628164226"
          className="w-screen h-screen"
        />
      </div>
    </div>
  );
}
