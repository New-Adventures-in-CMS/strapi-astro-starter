import type { SectionTone } from "@/components/layout/variants";

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
  caption?: string | null;
  width?: number;
  height?: number;
  mime: string;
  ext?: string;
  size: number;
  formats?: Record<string, { url: string; width: number; height: number }>;
}

export type HeroAlign =
  | "center"
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type HeroStyle =
  "fade" | "slide" | "drift" | "focus" | "dim" | "parallax" | "tilt" | "ken-burns";

// Blocchi del page builder (Dynamic Zone su `page.blocks`)
export interface HeroSlide {
  id?: number;
  heading: string;
  eyebrow?: string | null;
  subheading?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
  image?: StrapiMedia | null;
  align?: HeroAlign | null;
}

export interface BlockHero {
  __component: "blocks.hero";
  heading: string;
  eyebrow?: string | null;
  subheading?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
  image?: StrapiMedia | null;
  immersive?: boolean | null;
  slides?: HeroSlide[] | null;
  align?: HeroAlign | null;
  heroStyle?: HeroStyle | null;
}

export interface BlockRichText {
  __component: "blocks.rich-text";
  body: string;
  align?: "left" | "center" | "right" | null;
  section?: SharedSection;
}

export interface BlockImageText {
  __component: "blocks.image-text";
  heading?: string | null;
  eyebrow?: string | null;
  body: string;
  image?: StrapiMedia | null;
  image_position: "left" | "right";
  image_fit?: ImageFit;
  aspect_ratio?: AspectRatio;
  section?: SharedSection;
  container?: SharedContainer;
}

export interface SharedCard {
  title: string;
  eyebrow?: string | null;
  description?: string | null;
  image?: StrapiMedia | null;
  link_url?: string | null;
  link_text?: string | null;
}

export interface BlockCardGrid {
  __component: "blocks.card-grid";
  heading?: string | null;
  eyebrow?: string | null;
  lead?: string | null;
  cards: SharedCard[];
  section?: SharedSection;
  container?: SharedContainer;
}

export interface BlockCarousel {
  __component: "blocks.carousel";
  heading?: string | null;
  eyebrow?: string | null;
  lead?: string | null;
  cards: SharedCard[];
  loop?: boolean | null;
  autoplay?: boolean | null;
  section?: SharedSection;
  container?: SharedContainer;
}

export type ImageFit = "cover" | "contain";
export type AspectRatio = "4:3" | "1:1";
export type BlockWidth = "full" | "contained" | "bleed";
export type SectionSpacing = "none" | "sm" | "md" | "lg" | "xl";

export interface SharedSection {
  tone?: SectionTone;
  spacing?: SectionSpacing;
}

export interface SharedContainer {
  width?: BlockWidth;
}

export interface BlockForm {
  __component: "blocks.form";
  form?: { slug: string } | null;
  section?: SharedSection;
}

export interface BlockGallery {
  __component: "blocks.gallery";
  heading?: string | null;
  eyebrow?: string | null;
  lead?: string | null;
  images: StrapiMedia[];
  section?: SharedSection;
  container?: SharedContainer;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface BlockFaq {
  __component: "blocks.faq";
  eyebrow?: string | null;
  heading?: string | null;
  items: FaqItem[];
  spacing?: SectionSpacing;
}

export type PageBlock =
  | BlockHero
  | BlockRichText
  | BlockImageText
  | BlockCardGrid
  | BlockCarousel
  | BlockForm
  | BlockGallery
  | BlockFaq;

// Single-type "site-setting" — layout globali di header, submenu e footer

export type SubmenuLayout = "full-bleed" | "dropdown";
export type HeaderWidth = "full" | "contained";
export type FooterWidth = HeaderWidth;
/** Sottoinsieme esposto per il footer: `default` non è disponibile (= nessuno stacco). */
export type FooterTone = Extract<SectionTone, "muted" | "dark">;

export interface SiteSettings {
  submenuLayout: SubmenuLayout;
  headerWidth: HeaderWidth;
  footerWidth: FooterWidth;
  footerTone: FooterTone;
  stickyShell: boolean;
  imageMaskReveal: boolean;
  companyName: string;
  vatNumber: string;
  address: string;
  socialLinks: SocialLink[];
}

export type LinkMode = "internal" | "external";

export type SocialPlatform = "facebook" | "instagram" | "x" | "youtube" | "linkedin" | "tiktok";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

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
