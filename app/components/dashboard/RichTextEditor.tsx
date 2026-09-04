"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import {
  Bold,
  Italic,
  Undo,
  Redo,
  List,
  ListOrdered,
  Heading2,
  Link as LinkIcon,
  RemoveFormatting,
} from "lucide-react";
import { useCallback } from "react";
import { editorExtensions } from "@/lib/tiptap/extensions";

export type EditorVariable = { key: string; label: string };

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-md border transition-colors ${
        active
          ? "bg-navy text-white border-navy"
          : "bg-white text-textdark border-grey/40 hover:border-navy"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  variables,
}: {
  value: JSONContent | null;
  onChange: (content: JSONContent) => void;
  variables?: EditorVariable[];
}) {
  const editor = useEditor({
    extensions: editorExtensions,
    content: value ?? undefined,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl ?? "");
    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const insertVariable = useCallback(
    (key: string) => {
      if (!editor) return;
      editor.chain().focus().insertContent(`{{${key}}} `).run();
    },
    [editor]
  );

  if (!editor) {
    return <div className="h-40 bg-grey/20 rounded-lg" />;
  }

  return (
    <div className="border border-grey/60 rounded-lg bg-white overflow-hidden">
      {variables && variables.length > 0 && (
        <div className="p-2 border-b border-grey/40 bg-offwhite">
          <p className="text-xs font-semibold text-textdark/50 mb-2">
            Insert variable
          </p>
          <div className="flex flex-wrap gap-1.5">
            {variables.map((variable) => (
              <button
                key={variable.key}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => insertVariable(variable.key)}
                title={`Insert {{${variable.key}}}`}
                className="inline-flex items-center rounded-full border border-navy/30 bg-white px-2.5 py-1 text-xs font-medium text-navy hover:bg-navy hover:text-white transition-colors"
              >
                {`{{${variable.key}}}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1 p-2 border-b border-grey/40 bg-offwhite">
        <ToolbarButton
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Heading"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Link"
          active={editor.isActive("link")}
          onClick={setLink}
        >
          <LinkIcon size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Clear formatting"
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
        >
          <RemoveFormatting size={16} />
        </ToolbarButton>
        <span className="mx-1 w-px bg-grey/40" />
        <ToolbarButton
          title="Undo"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Redo"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo size={16} />
        </ToolbarButton>
      </div>

      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[240px] focus:outline-none [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-5 [&_ul]:pl-5 [&_a]:text-orange [&_a]:underline [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-4 [&_p]:mt-2"
      />
    </div>
  );
}
