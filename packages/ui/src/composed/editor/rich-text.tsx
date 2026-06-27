"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { cn } from "@workspace/ui/lib/utils";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Highlighter,
  ImageIcon,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Minus,
  Palette,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

export type RichTextEditorProps = {
  className?: string;
  labels?: Partial<RichTextEditorLabels>;
  onChange?: (value: string) => void;
  placeholder?: string;
  value?: string;
};

type RichTextEditorLabels = {
  advancedHtml: string;
  backgroundColor: string;
  bold: string;
  bulletedList: string;
  clear: string;
  code: string;
  divider: string;
  font: string;
  heading2: string;
  heading3: string;
  heading4: string;
  image: string;
  imagePrompt: string;
  italic: string;
  link: string;
  linkPrompt: string;
  numberedList: string;
  paragraph: string;
  quote: string;
  redo: string;
  size: string;
  strike: string;
  textAlignCenter: string;
  textAlignLeft: string;
  textAlignRight: string;
  textColor: string;
  undo: string;
};

const allowedTags = new Set([
  "A",
  "B",
  "BLOCKQUOTE",
  "BR",
  "CODE",
  "DIV",
  "EM",
  "H2",
  "H3",
  "H4",
  "HR",
  "I",
  "IMG",
  "LI",
  "OL",
  "P",
  "PRE",
  "S",
  "SPAN",
  "STRONG",
  "TABLE",
  "TBODY",
  "TD",
  "TH",
  "THEAD",
  "TR",
  "U",
  "UL",
]);

const allowedAttrs = new Set([
  "alt",
  "colspan",
  "href",
  "rowspan",
  "src",
  "style",
  "target",
  "title",
]);

const allowedStyles = new Set([
  "background-color",
  "color",
  "font-family",
  "font-size",
  "text-align",
]);

const fontFamilies = [
  { label: "Sans", value: "Arial, Helvetica, sans-serif" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Mono", value: "'SFMono-Regular', Consolas, monospace" },
  { label: "System", value: "system-ui, sans-serif" },
];

const fontSizes = [
  { label: "12", value: "12px" },
  { label: "14", value: "14px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "24", value: "24px" },
  { label: "30", value: "30px" },
];

function sanitizeStyle(value: string) {
  return value
    .split(";")
    .map((rule) => rule.trim())
    .filter(Boolean)
    .map((rule) => {
      const [rawName, ...rawValueParts] = rule.split(":");
      const name = rawName?.trim().toLowerCase();
      const propertyValue = rawValueParts.join(":").trim();
      if (!(name && propertyValue && allowedStyles.has(name))) return "";
      if (/url\s*\(|expression\s*\(|javascript:/i.test(propertyValue))
        return "";
      if (
        (name === "color" || name === "background-color") &&
        !/^(#[0-9a-f]{3,8}|rgb[a]?\([\d\s,%.]+\)|[a-z]+)$/i.test(propertyValue)
      ) {
        return "";
      }
      if (
        name === "font-size" &&
        !/^([1-3]?\d(px|rem)|[1-9](\.\d)?em)$/i.test(propertyValue)
      ) {
        return "";
      }
      return `${name}: ${propertyValue}`;
    })
    .filter(Boolean)
    .join("; ");
}

function sanitizeHTML(value: string) {
  if (typeof document === "undefined") return value;
  const template = document.createElement("template");
  template.innerHTML = value;

  const walk = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as HTMLElement;
        if (!allowedTags.has(element.tagName)) {
          element.replaceWith(...Array.from(element.childNodes));
          continue;
        }
        for (const attr of Array.from(element.attributes)) {
          const name = attr.name.toLowerCase();
          const attrValue = attr.value.trim();
          const isURLAttr = name === "href" || name === "src";
          const isSafeURL =
            !isURLAttr ||
            /^(https?:|mailto:|tel:|\/|#)/i.test(attrValue) ||
            (name === "src" && /^data:image\//i.test(attrValue));
          if (name.startsWith("on") || !allowedAttrs.has(name) || !isSafeURL) {
            element.removeAttribute(attr.name);
            continue;
          }
          if (name === "style") {
            const safeStyle = sanitizeStyle(attrValue);
            if (safeStyle) {
              element.setAttribute("style", safeStyle);
            } else {
              element.removeAttribute(attr.name);
            }
          }
        }
        if (element.tagName === "A") {
          element.setAttribute("rel", "noopener noreferrer");
        }
      } else if (
        child.nodeType !== Node.TEXT_NODE &&
        child.nodeType !== Node.DOCUMENT_FRAGMENT_NODE
      ) {
        child.remove();
        continue;
      }
      walk(child);
    }
  };

  walk(template.content);
  return template.innerHTML;
}

function ToolbarButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={onClick}
          onMouseDown={(event) => event.preventDefault()}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function RichTextEditor({
  className,
  labels = {},
  onChange,
  placeholder,
  value = "",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const label = (key: keyof RichTextEditorLabels, fallback: string) =>
    labels[key] || fallback;

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor) return;
    if (editor.innerHTML !== value) editor.innerHTML = value || "";
  }, [value]);

  const emitChange = () => {
    const editor = editorRef.current;
    if (!editor) return;
    onChange?.(sanitizeHTML(editor.innerHTML));
  };

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  };

  const applyInlineStyle = (style: Partial<CSSStyleDeclaration>) => {
    editorRef.current?.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed)
      return;
    const range = selection.getRangeAt(0);
    const span = document.createElement("span");
    Object.assign(span.style, style);
    span.appendChild(range.extractContents());
    range.insertNode(span);
    selection.removeAllRanges();
    const nextRange = document.createRange();
    nextRange.selectNodeContents(span);
    nextRange.collapse(false);
    selection.addRange(nextRange);
    emitChange();
  };

  const insertLink = () => {
    const href = window.prompt(
      label("linkPrompt", "Paste link URL"),
      "https://"
    );
    if (!href) return;
    runCommand("createLink", href);
  };

  const insertImage = () => {
    const src = window.prompt(
      label("imagePrompt", "Paste image URL"),
      "https://"
    );
    if (!src) return;
    runCommand("insertImage", src);
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          "overflow-hidden rounded-md border bg-background",
          className
        )}
      >
        <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-2">
          <Select
            defaultValue="p"
            onValueChange={(block) => runCommand("formatBlock", block)}
          >
            <SelectTrigger className="h-8 w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="p">
                {label("paragraph", "Paragraph")}
              </SelectItem>
              <SelectItem value="h2">{label("heading2", "H2")}</SelectItem>
              <SelectItem value="h3">{label("heading3", "H3")}</SelectItem>
              <SelectItem value="h4">{label("heading4", "H4")}</SelectItem>
              <SelectItem value="blockquote">
                {label("quote", "Quote")}
              </SelectItem>
              <SelectItem value="pre">{label("code", "Code")}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(fontFamily) => applyInlineStyle({ fontFamily })}
          >
            <SelectTrigger className="h-8 w-[104px]">
              <SelectValue placeholder={label("font", "Font")} />
            </SelectTrigger>
            <SelectContent>
              {fontFamilies.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(fontSize) => applyInlineStyle({ fontSize })}>
            <SelectTrigger className="h-8 w-[84px]">
              <SelectValue placeholder={label("size", "Size")} />
            </SelectTrigger>
            <SelectContent>
              {fontSizes.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ToolbarButton
            label={label("bold", "Bold")}
            onClick={() => runCommand("bold")}
          >
            <Bold className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={label("italic", "Italic")}
            onClick={() => runCommand("italic")}
          >
            <Italic className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={label("strike", "Strike")}
            onClick={() => runCommand("strikeThrough")}
          >
            <Strikethrough className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={label("bulletedList", "Bulleted List")}
            onClick={() => runCommand("insertUnorderedList")}
          >
            <List className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={label("numberedList", "Numbered List")}
            onClick={() => runCommand("insertOrderedList")}
          >
            <ListOrdered className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={label("textAlignLeft", "Align Left")}
            onClick={() => runCommand("justifyLeft")}
          >
            <AlignLeft className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={label("textAlignCenter", "Align Center")}
            onClick={() => runCommand("justifyCenter")}
          >
            <AlignCenter className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={label("textAlignRight", "Align Right")}
            onClick={() => runCommand("justifyRight")}
          >
            <AlignRight className="size-4" />
          </ToolbarButton>
          <ToolbarButton label={label("link", "Link")} onClick={insertLink}>
            <LinkIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton label={label("image", "Image")} onClick={insertImage}>
            <ImageIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={label("divider", "Divider")}
            onClick={() => runCommand("insertHorizontalRule")}
          >
            <Minus className="size-4" />
          </ToolbarButton>
          <label className="flex h-8 cursor-pointer items-center rounded-md px-2 hover:bg-accent">
            <Palette className="size-4" />
            <input
              aria-label={label("textColor", "Text color")}
              className="sr-only"
              onChange={(event) =>
                applyInlineStyle({ color: event.target.value })
              }
              type="color"
            />
          </label>
          <label className="flex h-8 cursor-pointer items-center rounded-md px-2 hover:bg-accent">
            <Highlighter className="size-4" />
            <input
              aria-label={label("backgroundColor", "Background color")}
              className="sr-only"
              onChange={(event) =>
                applyInlineStyle({ backgroundColor: event.target.value })
              }
              type="color"
            />
          </label>
          <ToolbarButton
            label={label("undo", "Undo")}
            onClick={() => runCommand("undo")}
          >
            <Undo2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={label("redo", "Redo")}
            onClick={() => runCommand("redo")}
          >
            <Redo2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={label("clear", "Clear")}
            onClick={() => runCommand("removeFormat")}
          >
            <Eraser className="size-4" />
          </ToolbarButton>
        </div>
        <div
          className="prose dark:prose-invert min-h-72 max-w-none overflow-auto px-4 py-3 text-sm outline-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]"
          contentEditable
          data-placeholder={placeholder}
          onBlur={emitChange}
          onInput={emitChange}
          ref={editorRef}
          suppressContentEditableWarning
        />
      </div>
    </TooltipProvider>
  );
}
