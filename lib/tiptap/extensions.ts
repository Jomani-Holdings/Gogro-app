import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

export const editorExtensions = [
  StarterKit,
  Link.configure({
    openOnClick: false,
    autolink: true,
    defaultProtocol: "https",
  }),
];
