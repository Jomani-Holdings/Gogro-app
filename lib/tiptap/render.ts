import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/core";
import { editorExtensions } from "./extensions";

export function renderRichText(
  content: JSONContent | null | undefined
): string {
  if (!content) return "";
  try {
    return generateHTML(content, editorExtensions);
  } catch {
    return "";
  }
}
