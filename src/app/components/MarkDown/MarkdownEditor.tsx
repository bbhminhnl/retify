"use client";

import { EditorContent, useEditor } from "@tiptap/react";

import { Markdown } from "tiptap-markdown";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState("## Xin chào!");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown.configure({
        html: true,
        tightLists: true,
        bulletListMarker: "-",
        linkify: false,
        breaks: false,
      }),
    ],
    content: markdown,
    onUpdate({ editor }) {
      const md = editor.storage.markdown.getMarkdown();
      setMarkdown(md);
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="border rounded p-4">
        <EditorContent editor={editor} />
      </div>

      <div className="bg-gray-100 rounded p-4">
        <h2 className="font-bold mb-2">Markdown output:</h2>
        <pre className="text-sm whitespace-pre-wrap">{markdown}</pre>
      </div>
    </div>
  );
}
