"use client";

import { EditorContent, useEditor } from "@tiptap/react";

import Highlight from "@tiptap/extension-highlight";
import { Markdown } from "tiptap-markdown";
import MenuBar from "./MenuBar";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { useState } from "react";

const Tiptap = () => {
  /** Lưu giá trị markdown */
  const [markdown, setMarkdown] = useState("");

  /** Khởi tạo editor với các extension */
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-4",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-4",
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: "my-custom-class",
        },
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
        bulletListMarker: "-",
        linkify: false,
        breaks: false,
      }),
    ],
    content: markdown,
    editorProps: {
      attributes: {
        class:
          "min-h-96 border rounded-md border-black px-3 py-2 prose prose-sm m-0 focus:outline-none bg-slate-50",
      },
    },
    onUpdate({ editor }) {
      const md = editor.storage.markdown.getMarkdown();
      setMarkdown(md);
    },
  });

  return (
    <>
      <div>
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
      <div className="bg-gray-100 rounded p-4">
        <h2 className="font-bold mb-2">Markdown output:</h2>
        <pre className="text-sm whitespace-pre-wrap">{markdown}</pre>
      </div>
    </>
  );
};

export default Tiptap;
