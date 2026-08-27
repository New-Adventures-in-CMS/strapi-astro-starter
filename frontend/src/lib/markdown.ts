import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

export function renderMarkdown(md: string | null | undefined): string {
  if (!md) return "";
  return marked.parse(md, { async: false }) as string;
}
