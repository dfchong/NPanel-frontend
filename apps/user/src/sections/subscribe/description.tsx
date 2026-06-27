"use client";

import { Icon } from "@workspace/ui/composed/icon";
import { Markdown } from "@workspace/ui/composed/markdown";
import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode } from "react";

type SubscribeFeature = {
  icon?: string;
  label?: ReactNode;
  type?: "default" | "success" | "destructive" | string;
};

type ParsedSubscribeDescription = {
  shortDescription: string;
  features: SubscribeFeature[];
  detailFormat: "markdown" | "html" | "text";
  detailContent: string;
};

function parseJSON(value?: unknown) {
  if (typeof value !== "string" || value.trim() === "") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeFeatures(value?: unknown): SubscribeFeature[] {
  const parsed = typeof value === "string" ? parseJSON(value) : value;
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const feature = item as Record<string, unknown>;
      const label = feature.label ?? feature.feature ?? feature.text;
      if (label === undefined || label === null || label === "") return null;
      const support = feature.support;
      const type =
        typeof feature.type === "string"
          ? feature.type
          : support === false
            ? "destructive"
            : support === true
              ? "success"
              : "default";
      return {
        icon: typeof feature.icon === "string" ? feature.icon : "",
        label: String(label),
        type,
      };
    })
    .filter(Boolean) as SubscribeFeature[];
}

function normalizeDetailFormat(value?: unknown): "markdown" | "html" | "text" {
  const format = String(value || "").toLowerCase();
  if (format === "html") return "html";
  if (format === "text" || format === "plain") return "text";
  return "markdown";
}

function isFeatureImageIcon(value?: string) {
  const icon = value?.trim();
  if (!icon) return false;
  return /^(https?:\/\/|\/(?!\/)|\.\/|data:image\/)/i.test(icon);
}

export function parseSubscribeDescription(
  subscribe?: Partial<API.Subscribe> | null
): ParsedSubscribeDescription {
  const legacy = parseJSON(subscribe?.description);
  const legacyObject =
    legacy && !Array.isArray(legacy) && typeof legacy === "object"
      ? (legacy as Record<string, unknown>)
      : null;

  const shortDescription =
    String(
      (subscribe as any)?.short_description ??
        (subscribe as any)?.shortDescription ??
        legacyObject?.description ??
        ""
    ).trim() ||
    (legacy === null && typeof subscribe?.description === "string"
      ? subscribe.description.trim()
      : "");

  const features = normalizeFeatures(
    (subscribe as any)?.features ?? legacyObject?.features ?? legacy
  );

  const detailFormat = normalizeDetailFormat(
    (subscribe as any)?.detail_format ?? (subscribe as any)?.detailFormat
  );
  const detailContent = String(
    (subscribe as any)?.detail_content ??
      (subscribe as any)?.detailContent ??
      legacyObject?.detail_content ??
      ""
  ).trim();

  return {
    shortDescription,
    features,
    detailFormat,
    detailContent,
  };
}

function sanitizeHTML(value: string) {
  if (typeof window === "undefined") return "";
  const template = document.createElement("template");
  template.innerHTML = value;

  const allowedTags = new Set([
    "A",
    "B",
    "BLOCKQUOTE",
    "BR",
    "CODE",
    "DIV",
    "EM",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
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

  const sanitizeStyle = (value: string) =>
    value
      .split(";")
      .map((rule) => rule.trim())
      .filter(Boolean)
      .map((rule) => {
        const [rawName, ...rawValueParts] = rule.split(":");
        const name = rawName?.trim().toLowerCase();
        const propertyValue = rawValueParts.join(":").trim();
        if (!(name && propertyValue && allowedStyles.has(name))) return "";
        if (/url\s*\(|expression\s*\(|javascript:/i.test(propertyValue)) {
          return "";
        }
        if (
          (name === "color" || name === "background-color") &&
          !/^(#[0-9a-f]{3,8}|rgb[a]?\([\d\s,%.]+\)|[a-z]+)$/i.test(
            propertyValue
          )
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
          const value = attr.value.trim();
          const isURLAttr = name === "href" || name === "src";
          const isSafeURL =
            !isURLAttr ||
            /^(https?:|mailto:|tel:|\/|#)/i.test(value) ||
            (name === "src" && /^data:image\//i.test(value));
          if (name.startsWith("on") || !allowedAttrs.has(name) || !isSafeURL) {
            element.removeAttribute(attr.name);
            continue;
          }
          if (name === "style") {
            const safeStyle = sanitizeStyle(value);
            if (safeStyle) {
              element.setAttribute(attr.name, safeStyle);
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

export function SubscribeFeatureList({
  className,
  subscribe,
}: {
  className?: string;
  subscribe?: Partial<API.Subscribe> | null;
}) {
  const { features, shortDescription } = parseSubscribeDescription(subscribe);

  if (!(shortDescription || features.length)) return null;

  return (
    <ul className={cn("flex flex-grow flex-col gap-3", className)}>
      {shortDescription && (
        <li className="text-muted-foreground">{shortDescription}</li>
      )}
      {features.map((feature, index) => (
        <li
          className={cn("flex items-center gap-1", {
            "text-muted-foreground line-through":
              feature.type === "destructive",
          })}
          key={`${feature.label}-${index}`}
        >
          {feature.icon && isFeatureImageIcon(feature.icon) ? (
            <img
              alt=""
              className={cn("size-5 shrink-0 object-contain", {
                "opacity-60": feature.type === "destructive",
              })}
              height={20}
              src={feature.icon}
              width={20}
            />
          ) : feature.icon ? (
            <Icon
              className={cn("size-5 text-primary", {
                "text-green-500": feature.type === "success",
                "text-destructive": feature.type === "destructive",
              })}
              icon={feature.icon}
            />
          ) : null}
          {feature.label}
        </li>
      ))}
    </ul>
  );
}

export function SubscribeDetailContent({
  className,
  subscribe,
}: {
  className?: string;
  subscribe?: Partial<API.Subscribe> | null;
}) {
  const { detailContent, detailFormat } = parseSubscribeDescription(subscribe);

  if (!detailContent) return null;

  if (detailFormat === "html") {
    return (
      <div
        className={cn("prose dark:prose-invert max-w-none text-sm", className)}
        dangerouslySetInnerHTML={{ __html: sanitizeHTML(detailContent) }}
      />
    );
  }

  if (detailFormat === "text") {
    return (
      <p className={cn("whitespace-pre-wrap text-muted-foreground", className)}>
        {detailContent}
      </p>
    );
  }

  return (
    <div className={cn("text-sm", className)}>
      <Markdown allowHtml={false}>{detailContent}</Markdown>
    </div>
  );
}
