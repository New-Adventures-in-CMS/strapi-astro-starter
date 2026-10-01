// frontend/src/config/site.ts

export type HeroTransition = "slide" | "fade";
export type HeroEffect = "none" | "drift" | "parallax" | "tilt" | "focus" | "dim" | "ken-burns";

export type HeroStyle =
  "fade" | "slide" | "drift" | "focus" | "dim" | "parallax" | "tilt" | "ken-burns";

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

/** Layout globali di header e footer pilotati dal CMS (single-type `site-setting`). */
export type SubmenuLayout = "full-bleed" | "dropdown";
export type HeaderWidth = "full" | "contained";
export type FooterWidth = HeaderWidth;
/** Tono del footer: sottoinsieme di `SectionTone` senza `default` (= nessuno stacco). */
export type FooterTone = "muted" | "dark";

export interface HeaderConfig {
  /** Wrapper header width. `full` = viewport width col solo inset page-margin; `contained` = riusa il token container. */
  width: HeaderWidth;
  /** Pannello submenu. `full-bleed` = banda edge-to-edge; `dropdown` = ancorato al trigger, auto-width. */
  submenuLayout: SubmenuLayout;
}

export interface FooterConfig {
  /** Wrapper footer width. `full` = viewport width col solo inset page-margin; `contained` = riusa il token container. */
  width: FooterWidth;
  /** Tono del footer: `muted` (chiaro ma distinto) | `dark` (contrasto forte). */
  tone: FooterTone;
}

export type MotionSmoothPreset = "off" | "light" | "medium" | "marked";

export interface MotionConfig {
  /** Smooth scroll globale (Lenis). "off" => scroll nativo. */
  smooth: MotionSmoothPreset;
}

export interface NavItem {
  label: string;
  href?: string;
  external?: boolean;
  children?: NavItem[];
  order?: number;
  /** Optional secondary line rendered in the megamenu band. */
  description?: string;
}

export interface NavConfig {
  /** Fallback header items when the CMS is unreachable. */
  items: NavItem[];
}

export interface SiteConfig {
  name: string;
  description: string;
  /** Production URL — used for canonical, OG, sitemap */
  url: string;
  locale: string;
  heroTransition: HeroTransition;
  heroEffect: HeroEffect;
  heroAlign: HeroAlign;
  heroStyle: HeroStyle;
  motion: MotionConfig;
  nav: NavConfig;
  header: HeaderConfig;
  footer: FooterConfig & {
    columns: { title: string; items: NavItem[] }[];
    legal: string;
  };
}

export const site: SiteConfig = {
  name: "Strapi + Astro Starter",
  heroTransition: "fade",
  heroEffect: "none",
  heroAlign: "center",
  heroStyle: "fade",
  motion: {
    smooth: "medium",
  },
  header: {
    width: "full",
    submenuLayout: "full-bleed",
  },
  description: "Boilerplate Strapi 5 + Astro 7 con layout, SEO e fetch CMS già cablati.",
  url: "https://example.com",
  locale: "it-IT",
  nav: {
    items: [
      { label: "Home", href: "/" },
      {
        label: "Prodotto",
        children: [
          {
            label: "Panoramica",
            href: "/prodotto/panoramica",
            description: "Cosa è, a chi serve, come è fatto.",
          },
          {
            label: "Funzionalità",
            href: "/prodotto/funzionalita",
            description: "Le capacità principali in una schermata.",
          },
        ],
      },
      { label: "Pagine", href: "/pagine" },
      { label: "Contatti", href: "/contatti" },
    ],
  },
  footer: {
    width: "full",
    tone: "dark",
    columns: [
      {
        title: "Navigazione",
        items: [
          { label: "Home", href: "/" },
          { label: "Pagine", href: "/pagine" },
        ],
      },
      {
        title: "Risorse",
        items: [
          {
            label: "Documentazione",
            href: "https://docs.astro.build",
            external: true,
          },
          { label: "Strapi", href: "https://strapi.io", external: true },
        ],
      },
    ],
    legal: `© ${new Date().getFullYear()} Strapi + Astro Starter. Tutti i diritti riservati.`,
  },
};
