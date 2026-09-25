// frontend/src/config/site.ts

export type HeroTransition = "slide" | "fade";
export type HeroEffect = "none" | "parallax" | "focus" | "dim" | "ken-burns";

export type MegamenuLayout = "band" | "dropdown";

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
  /**
   * Megamenu layout. Only `band` is wired; `dropdown` is reserved as a config
   * seam and not implemented — the Header throws when it encounters it.
   */
  megamenuLayout: MegamenuLayout;
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
  motion: MotionConfig;
  nav: NavConfig;
  footer: {
    columns: { title: string; items: NavItem[] }[];
    legal: string;
  };
}

export const site: SiteConfig = {
  name: "Strapi + Astro Starter",
  heroTransition: "fade",
  heroEffect: "none",
  motion: {
    smooth: "medium",
  },
  description:
    "Boilerplate Strapi 5 + Astro 7 con layout, SEO e fetch CMS già cablati.",
  url: "https://example.com",
  locale: "it-IT",
  nav: {
    megamenuLayout: "band",
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
