import dynamic from "next/dynamic";

// Import dynamic vì Tiptap chỉ chạy được client-side
const MarkdownEditor = dynamic(
  () => import("@/app/components/MarkDown/MarkdownEditor"),
  {
    ssr: true,
  }
);

export default function EditorPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Tiptap Markdown Editor</h1>
      <MarkdownEditor />
    </div>
  );
}
