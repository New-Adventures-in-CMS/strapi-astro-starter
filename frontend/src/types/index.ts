// Tipi base Strapi — ogni contenuto ha sempre id e documentId
export interface StrapiBase {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// Immagine Strapi (populate: { immagine: true })
export interface StrapiMedia {
  id: number;
  url: string;
  name: string;
  alternativeText?: string | null;
  width?: number;
  height?: number;
  mime: string;
  size: number;
  formats?: Record<string, { url: string; width: number; height: number }>;
}

// Blocchi del page builder (Dynamic Zone su `page.blocks`)
export interface BlockHero {
  __component: "blocks.hero";
  heading: string;
  subheading?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
  image?: StrapiMedia | null;
}

export interface BlockRichText {
  __component: "blocks.rich-text";
  body: string;
}

export interface BlockImageText {
  __component: "blocks.image-text";
  heading?: string | null;
  body: string;
  image?: StrapiMedia | null;
  image_position: "left" | "right";
}

export interface SharedCard {
  title: string;
  description?: string | null;
  image?: StrapiMedia | null;
  link_url?: string | null;
  link_text?: string | null;
}

export interface BlockCardGrid {
  __component: "blocks.card-grid";
  heading?: string | null;
  cards: SharedCard[];
}

export type PageBlock =
  BlockHero | BlockRichText | BlockImageText | BlockCardGrid;

// Content-type "page" di Strapi — vedi SETUP.md → "Content-type Page"
export interface Page {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  body?: string | null;
  seo_desc?: string | null;
  blocks?: PageBlock[];
}
