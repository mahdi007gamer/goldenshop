"use client";

import { useCallback, useRef, useState, useImperativeHandle, forwardRef, useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import UnderlineExtension from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, CheckSquare, AlignLeft, AlignCenter, AlignRight,
  Link2, ImageIcon, Video, Quote, Code, Code2, Minus, Undo2, Redo2,
  Type, Palette, Highlighter, RemoveFormatting,
} from "lucide-react";
import { ImageEditModal, type ImageEditState } from "./ImageEditModal";

/* ------------------------------------------------------------------ */
/*  Custom Image extension with class + data-link attributes           */
/* ------------------------------------------------------------------ */

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: { default: null },
      "data-link": { default: null },
    };
  },
});

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface TipTapEditorRef {
  getHtml: () => string;
  focus: () => void;
}

interface TipTapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  dir?: "rtl" | "ltr";
}

/* ------------------------------------------------------------------ */
/*  Toolbar button component                                           */
/* ------------------------------------------------------------------ */

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
        active
          ? "bg-gold/15 text-gold"
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-white/10 mx-0.5" />;
}

/* ------------------------------------------------------------------ */
/*  Image upload helper                                                */
/* ------------------------------------------------------------------ */

async function uploadImageToServer(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", "image");
  const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
  const json = await res.json();
  if (json.success && json.data?.url) return json.data.url;
  throw new Error(json.error?.message || "Image upload failed");
}

/* ------------------------------------------------------------------ */
/*  Main editor component                                              */
/* ------------------------------------------------------------------ */

export const TipTapEditor = forwardRef<TipTapEditorRef, TipTapEditorProps>(
  function TipTapEditor(
    { value, onChange, placeholder = "Write something...", minHeight = 250, dir = "ltr" },
    ref
  ) {
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [editingImage, setEditingImage] = useState<{
      attrs: Record<string, string>;
      nodePos: number;
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
        }),
        CustomImage.configure({
          HTMLAttributes: { loading: "lazy" },
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer" },
        }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        UnderlineExtension,
        Highlight.configure({ multicolor: true }),
        Color,
        TextStyle,
        Placeholder.configure({ placeholder }),
      ],
      content: value,
      editorProps: {
        attributes: {
          dir,
          spellcheck: "false",
        },
        handleDoubleClickOn(view, pos, node) {
          // Handle double-click on image nodes
          if (node.type.name === "image") {
            const $pos = view.state.doc.resolve(pos);
            const nodePos = $pos.start($pos.depth);
            const attrs = node.attrs as Record<string, string>;
            setEditingImage({ attrs, nodePos });
            setImageModalOpen(true);
            return true;
          }
          return false;
        },
      },
      onUpdate: ({ editor: ed }) => {
        onChange(ed.getHTML());
      },
    });

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getHtml: () => editor?.getHTML() ?? "",
      focus: () => editor?.commands.focus(),
    }));

    /* ---------- Image insert ---------- */
    const handleImageInsert = useCallback(() => {
      fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editor) return;
        try {
          const url = await uploadImageToServer(file);
          editor.chain().focus().setImage({ src: url, alt: "", title: "" }).run();
        } catch (err) {
          console.error("Image upload failed:", err);
        }
        e.target.value = "";
      },
      [editor]
    );

    /* ---------- Image edit modal ---------- */
    const handleImageSave = useCallback(
      (state: ImageEditState) => {
        if (!editor || !editingImage) return;
        editor.chain().focus().updateAttributes("image", {
          src: state.src,
          alt: state.alt,
          title: state.title,
          width: state.width || undefined,
          height: state.height || undefined,
          class: [
            state.alignment !== "none" ? `image-align-${state.alignment}` : "",
            state.wrap !== "none" ? `image-style-side-${state.wrap}` : "",
          ].filter(Boolean).join(" ") || undefined,
          "data-link": state.link || undefined,
        }).run();
        setImageModalOpen(false);
        setEditingImage(null);
      },
      [editor, editingImage]
    );

    const handleImageRemove = useCallback(() => {
      if (!editor || !editingImage) return;
      editor.chain().focus().deleteRange({
        from: editingImage.nodePos,
        to: editingImage.nodePos + 1,
      }).run();
      setImageModalOpen(false);
      setEditingImage(null);
    }, [editor, editingImage]);

    /* ---------- Video insert ---------- */
    const handleVideoInsert = useCallback(() => {
      const url = prompt("Enter video URL (YouTube, Vimeo, MP4):");
      if (!url || !editor) return;
      editor.chain().focus().setContent(`<video src="${url}" controls></video>`).run();
    }, [editor]);

    if (!editor) {
      return (
        <div
          className="bg-obsidian border border-white/10 rounded-xl flex items-center justify-center"
          style={{ minHeight: `${minHeight}px` }}
        >
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            Loading editor...
          </div>
        </div>
      );
    }

    return (
      <div className="tiptap-editor-wrapper" dir={dir}>
        {/* Toolbar */}
        <div className="tiptap-toolbar">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo2 size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo2 size={14} />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            <Heading1 size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2 size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
          >
            <Heading3 size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            active={editor.isActive("paragraph")}
            title="Paragraph"
          >
            <Type size={14} />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Bold"
          >
            <Bold size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Italic"
          >
            <Italic size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            title="Underline"
          >
            <UnderlineIcon size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            title="Strikethrough"
          >
            <Strikethrough size={14} />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => {
              const color = prompt("Enter color (hex, rgb, or name):", "#FFD700");
              if (color) editor.chain().focus().setColor(color).run();
            }}
            title="Text Color"
          >
            <Palette size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            active={editor.isActive("highlight")}
            title="Highlight"
          >
            <Highlighter size={14} />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Ordered List"
          >
            <ListOrdered size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            active={editor.isActive("taskList")}
            title="Check List"
          >
            <CheckSquare size={14} />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
            title="Align Left"
          >
            <AlignLeft size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
            title="Align Center"
          >
            <AlignCenter size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
            title="Align Right"
          >
            <AlignRight size={14} />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => {
              const url = prompt("Enter URL:");
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }}
            active={editor.isActive("link")}
            title="Link"
          >
            <Link2 size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={handleImageInsert}
            title="Insert Image"
          >
            <ImageIcon size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={handleVideoInsert}
            title="Insert Video"
          >
            <Video size={14} />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Blockquote"
          >
            <Quote size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
            title="Code Block"
          >
            <Code2 size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            title="Inline Code"
          >
            <Code size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            <Minus size={14} />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            title="Clear Formatting"
          >
            <RemoveFormatting size={14} />
          </ToolbarButton>
        </div>

        {/* Editor content */}
        <div className="tiptap-editor-container" style={{ minHeight: `${minHeight}px` }}>
          <EditorContent editor={editor} />
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Image edit modal */}
        {editingImage && (
          <ImageEditModal
            open={imageModalOpen}
            initialState={{
              src: editingImage.attrs.src || "",
              alt: editingImage.attrs.alt || "",
              title: editingImage.attrs.title || "",
              width: editingImage.attrs.width || "",
              height: editingImage.attrs.height || "",
              alignment: (() => {
                const cls = editingImage.attrs.class || "";
                if (cls.includes("image-align-left")) return "left" as const;
                if (cls.includes("image-align-right")) return "right" as const;
                if (cls.includes("image-align-center")) return "center" as const;
                return "none" as const;
              })(),
              wrap: (() => {
                const cls = editingImage.attrs.class || "";
                if (cls.includes("image-style-side-left")) return "left" as const;
                if (cls.includes("image-style-side-right")) return "right" as const;
                return "none" as const;
              })(),
              link: editingImage.attrs["data-link"] || "",
            }}
            onSave={handleImageSave}
            onCancel={() => {
              setImageModalOpen(false);
              setEditingImage(null);
            }}
            onRemove={handleImageRemove}
          />
        )}
      </div>
    );
  }
);
