// frontend/src/config/site.ts

export type HeroTransition = "parallax" | "fade" | "slide";

export interface NavItem {
  label: string;
  href?: string;
  external?: boolean;
  children?: NavItem[];
  order?: number;
}

export interface SiteConfig {
  name: string;
  description: string;
  /** Production URL — used for canonical, OG, sitemap */
  url: string;
  locale: string;
  heroTransition: HeroTransition;
  nav: NavItem[];
  footer: {
    columns: { title: string; items: NavItem[] }[];
    legal: string;
  };
}

export const site: SiteConfig = {
  name: "Strapi + Astro Starter",
  heroTransition: "slide",
  description:
    "Boilerplate Strapi 5 + Astro 7 con layout, SEO e fetch CMS già cablati.",
  url: "https://example.com",
  locale: "it-IT",
  nav: [
    { label: "Home", href: "/" },
    {
      label: "Prodotto",
      children: [
        { label: "Panoramica", href: "/prodotto/panoramica" },
        { label: "Funzionalità", href: "/prodotto/funzionalita" },
      ],
    },
    { label: "Pagine", href: "/pagine" },
    { label: "Contatti", href: "/contatti" },
  ],
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
