import { Node } from "@tiptap/core";

export const EMAIL_BUTTON_STYLE =
  "display:inline-block;padding:12px 24px;background:#F36C21;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;line-height:1.4;";

export const EmailButton = Node.create({
  name: "emailButton",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      href: {
        default: "",
        parseHTML: (element) => element.getAttribute("href") ?? "",
      },
      label: {
        default: "Click here",
        parseHTML: (element) => element.textContent ?? "",
      },
      align: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-align") ?? "center",
      },
    };
  },

  parseHTML() {
    return [{ tag: "a[data-email-button]" }];
  },

  renderHTML({ node }) {
    const align = node.attrs.align === "left" ? "left"
      : node.attrs.align === "right" ? "right"
      : "center";
    return [
      "p",
      { style: `margin:20px 0;text-align:${align};` },
      [
        "a",
        {
          href: node.attrs.href,
          style: EMAIL_BUTTON_STYLE,
          "data-email-button": "true",
          target: "_blank",
          rel: "noopener",
        },
        node.attrs.label,
      ],
    ];
  },

  renderText({ node }) {
    return node.attrs.label ?? "";
  },
});