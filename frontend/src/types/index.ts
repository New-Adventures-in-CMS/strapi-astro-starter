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

// Voce di menu dal plugin Navigation
export interface NavItem {
  id: number;
  title: string;
  path: string;
  type: "INTERNAL" | "EXTERNAL" | "WRAPPER";
  uiRouterKey: string;
  menuAttached: boolean;
  order: number;
  collapsed: boolean;
  items?: NavItem[];
}

// Aggiungere qui i tipi specifici del progetto.
// Esempio:
//
// export interface Articolo extends StrapiBase {
//   titolo: string;
//   slug: string;
//   corpo: string;
//   copertina?: StrapiMedia;
// }
//
// export interface Homepage extends StrapiBase {
//   titolo: string;
//   sottotitolo?: string;
// }
