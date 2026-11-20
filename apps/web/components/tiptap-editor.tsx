"use client";

import type { TipTapDoc } from "@srr/shared-types";
import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { CSSProperties } from "react";

type TipTapEditorProps = {
  content: TipTapDoc;
  onChange?: (doc: TipTapDoc) => void;
  editable?: boolean;
};

/** TipTap JSONContent and our TipTapDoc share the same wire shape at this boundary. */
function toEditorContent(doc: TipTapDoc): JSONContent {
  return doc as JSONContent;
}

function fromEditorContent(doc: JSONContent): TipTapDoc {
  return doc as TipTapDoc;
}

const shell: CSSProperties = {
  display: "grid",
  gap: "0.5rem",
};

const toolbar: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.35rem",
};

const toolButton: CSSProperties = {
  font: "inherit",
  fontSize: "0.9rem",
  padding: "0.35rem 0.6rem",
  border: "1px solid #c8c4b8",
  borderRadius: "0.3rem",
  background: "#fff",
  cursor: "pointer",
};

const toolButtonActive: CSSProperties = {
  ...toolButton,
  background: "#1a1a1a",
  color: "#f7f7f2",
  borderColor: "#1a1a1a",
};

const editorFrame: CSSProperties = {
  border: "1px solid #c8c4b8",
  borderRadius: "0.35rem",
  background: "#fff",
  padding: "0.75rem 0.9rem",
  minHeight: "10rem",
};

/** TipTap editor. Persists JSON via onChange. Read-only when editable=false. */
export function TipTapEditor({
  content,
  onChange,
  editable = true,
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: toEditorContent(content),
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => {
      if (!onChange) {
        return;
      }
      onChange(fromEditorContent(current.getJSON()));
    },
  });

  if (!editor) {
    return <div style={editorFrame}>Loading editor…</div>;
  }

  return (
    <div style={shell}>
      {editable ? (
        <div style={toolbar} role="toolbar" aria-label="Text formatting">
          <button
            type="button"
            style={editor.isActive("bold") ? toolButtonActive : toolButton}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            Bold
          </button>
          <button
            type="button"
            style={editor.isActive("italic") ? toolButtonActive : toolButton}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            Italic
          </button>
          <button
            type="button"
            style={
              editor.isActive("bulletList") ? toolButtonActive : toolButton
            }
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            Bullet list
          </button>
        </div>
      ) : null}
      <div style={editorFrame}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
