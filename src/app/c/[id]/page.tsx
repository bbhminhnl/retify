import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  /** Lấy id từ params */
  const { id } = await params;

  /** Validate ID */
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return notFound();
  }

  /** Iframe URL */
  const IFRAME_URL = process.env.IFRAME_BASE_URL || "http://localhost:5173";
  /** IFRAME SOURCE */
  const SRC = `${IFRAME_URL}/view-screen?page_id=${encodeURIComponent(id)}`;

  return (
    <iframe
      src={SRC}
      className="w-full h-full"
      title="Embedded Content"
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
