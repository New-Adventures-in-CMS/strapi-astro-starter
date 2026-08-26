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
  alternativeText?: string;
  width?: number;
  height?: number;
  mime: string;
  size: number;
}

// Content-type "page" di Strapi — vedi SETUP.md → "Content-type Page"
export interface Page {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  body?: string | null;
  seo_desc?: string | null;
}
