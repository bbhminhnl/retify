import {
  BlockQuoteIcon,
  BoldIcon,
  ChevronDownIcon,
  CodeIcon,
  ImageIcon,
  ItalicIcon,
  ListBulletIcon,
  NumberListIcon,
  PaintIcon,
  RedoIcon,
  StrikeThroughIcon,
  TableIcon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  UnderlineIcon,
  UndoIcon,
} from "@/components/icons";
import React, { useRef, useState } from "react";

import { DropdownWrapper } from "./DropDownWrapper";

const HEADING = [
  { level: 1, label: "Heading 1" },
  { level: 2, label: "Heading 2" },
  { level: 3, label: "Heading 3" },
  { level: 4, label: "Heading 4" },
  { level: 5, label: "Heading 5" },
  { level: 6, label: "Heading 6" },
];

interface Props {
  editor: any;
  uploadImage: (file: File) => Promise<string>;
}

const MenuBar: React.FC<Props> = ({ editor, uploadImage }) => {
  const [openHeading, setOpenHeading] = useState(false);

  const command = (cmd: string) => {
    const chain = editor.chain().focus();
    switch (cmd) {
      case "toggleBold":
        chain.toggleBold().run();
        break;
      case "toggleItalic":
        chain.toggleItalic().run();
        break;
      case "toggleStrike":
        chain.toggleStrike().run();
        break;
      case "toggleUnderline":
        chain.toggleUnderline().run();
        break;
      case "toggleBlockquote":
        chain.toggleBlockquote().run();
        break;
      case "toggleBulletList":
        chain.toggleBulletList().run();
        break;
      case "toggleOrderedList":
        chain.toggleOrderedList().run();
        break;
      case "toggleTaskList":
        chain.toggleTaskList().run();
        break;
      case "toggleCodeBlock":
        chain.toggleCodeBlock().run();
        break;
      case "setHorizontalRule":
        chain.setHorizontalRule().run();
        break;
      case "undo":
        editor.commands.undo();
        break;
      case "redo":
        editor.commands.redo();
        break;
      default:
        break;
    }
  };

  const changeHeading = (level: number) => {
    editor.chain().focus().toggleHeading({ level }).run();
    setOpenHeading(false);
  };

  const alignText = (alignment: "left" | "center" | "right") => {
    editor.chain().focus().setTextAlign(alignment).run();
  };

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const insertImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      uploadImage(file)
        .then((url) => {
          editor.commands.insertContent({
            type: "resizableImage",
            attrs: {
              src: url,
              alt: file.name,
            },
          });
        })
        .catch(console.error);
    };
    input.click();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border border-gray-300 rounded-md">
      <button
        onClick={() => command("undo")}
        className="disabled:opacity-30"
        disabled={!editor?.can().undo()}
      >
        <UndoIcon className="w-5 h-5" />
      </button>
      <button
        onClick={() => command("redo")}
        className="disabled:opacity-30"
        disabled={!editor?.can().redo()}
      >
        <RedoIcon className="w-5 h-5" />
      </button>

      <span className="w-px h-5 bg-gray-300 mx-1" />

      <DropdownWrapper
        open={openHeading}
        onClose={() => setOpenHeading(false)}
        trigger={
          <button
            onClick={() => setOpenHeading(!openHeading)}
            className={`flex items-center justify-between text-sm gap-2 w-36 px-2 py-1 rounded border ${
              editor?.isActive("heading")
                ? "text-blue-600 border-blue-600 bg-blue-50"
                : "border-gray-300"
            }`}
          >
            {HEADING.map((heading) =>
              editor?.isActive("heading", { level: heading.level }) ? (
                <span key={heading.level} className="text-blue-600">
                  {heading.label}
                </span>
              ) : null
            )}
            {!editor?.isActive("heading") && <span>Paragraph</span>}
            <ChevronDownIcon className="w-4 h-4" />
          </button>
        }
        content={
          <div className="w-36 bg-white border border-gray-300 rounded shadow-lg p-2 z-10">
            <div
              className={`hover:bg-slate-100 rounded-md py-1 px-2 cursor-pointer ${
                !editor?.isActive("heading") ? "bg-blue-200" : ""
              }`}
              onClick={() => {
                editor.chain().focus().setParagraph().run();
                setOpenHeading(false);
              }}
            >
              Paragraph
            </div>
            {HEADING.map((heading) => (
              <div
                key={heading.level}
                className={`hover:bg-slate-100 rounded-md py-1 px-2 cursor-pointer ${
                  editor?.isActive("heading", { level: heading.level })
                    ? "bg-blue-200"
                    : ""
                }`}
                onClick={() => changeHeading(heading.level)}
              >
                {heading.label}
              </div>
            ))}
          </div>
        }
      />

      <button
        onClick={() => command("toggleBold")}
        className={editor?.isActive("bold") ? "active" : ""}
      >
        <BoldIcon className="w-5 h-5" />
      </button>
      <button
        onClick={() => command("toggleItalic")}
        className={editor?.isActive("italic") ? "active" : ""}
      >
        <ItalicIcon className="w-5 h-5" />
      </button>
      <button
        onClick={() => command("toggleUnderline")}
        className={editor?.isActive("underline") ? "active" : ""}
      >
        <UnderlineIcon className="w-5 h-5" />
      </button>
      <button
        onClick={() => command("toggleStrike")}
        className={editor?.isActive("strike") ? "active" : ""}
      >
        <StrikeThroughIcon className="w-5 h-5" />
      </button>

      <span className="w-px h-5 bg-gray-300 mx-1" />

      <button onClick={() => command("setHorizontalRule")}>—</button>
      <button
        onClick={() => command("toggleBlockquote")}
        className={editor?.isActive("blockquote") ? "active" : ""}
      >
        <BlockQuoteIcon className="w-5 h-5" />
      </button>

      <span className="w-px h-5 bg-gray-300 mx-1" />

      <button
        onClick={() => command("toggleBulletList")}
        className={editor?.isActive("bulletList") ? "active" : ""}
      >
        <ListBulletIcon className="w-5 h-5" />
      </button>
      <button
        onClick={() => command("toggleOrderedList")}
        className={editor?.isActive("orderedList") ? "active" : ""}
      >
        <NumberListIcon className="w-5 h-5" />
      </button>
      <button
        onClick={() => command("toggleTaskList")}
        className={editor?.isActive("taskList") ? "active" : ""}
      >
        ☑
      </button>

      <button
        onClick={() => alignText("left")}
        className={editor?.isActive({ textAlign: "left" }) ? "active" : ""}
      >
        <TextAlignLeftIcon className="w-5 h-5" />
      </button>
      <button
        onClick={() => alignText("center")}
        className={editor?.isActive({ textAlign: "center" }) ? "active" : ""}
      >
        <TextAlignCenterIcon className="w-5 h-5" />
      </button>
      <button
        onClick={() => alignText("right")}
        className={editor?.isActive({ textAlign: "right" }) ? "active" : ""}
      >
        <TextAlignRightIcon className="w-5 h-5" />
      </button>

      <span className="w-px h-5 bg-gray-300 mx-1" />

      <button onClick={insertTable}>
        <TableIcon className="w-5 h-5" />
      </button>
      <button onClick={insertImage}>
        <ImageIcon className="w-5 h-5" />
      </button>

      <label className="relative w-5 h-5 cursor-pointer">
        <PaintIcon
          style={{ color: editor.getAttributes("textStyle")?.color || "#000" }}
          className="w-5 h-5"
        />
        <input
          type="color"
          className="absolute bottom-0 left-0 w-0 h-0"
          onChange={(e) => editor.commands.setColor(e.target.value)}
        />
      </label>

      <button
        onClick={() => command("toggleCodeBlock")}
        className={editor?.isActive("codeBlock") ? "active" : ""}
      >
        <CodeIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default MenuBar;
