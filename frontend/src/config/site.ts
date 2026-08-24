// frontend/src/config/site.ts

export interface NavItem {
  label: string;
  href: string;
  /** opens in new tab if true */
  external?: boolean;
}

export interface SiteConfig {
  name: string;
  description: string;
  /** Production URL — used for canonical, OG, sitemap */
  url: string;
  locale: string;
  nav: NavItem[];
  footer: {
    columns: { title: string; links: NavItem[] }[];
    legal: string;
  };
}

export const site: SiteConfig = {
  name: "Strapi + Astro Starter",
  description:
    "Boilerplate Strapi 5 + Astro 5 con layout, SEO e fetch CMS già cablati.",
  url: "https://example.com",
  locale: "it-IT",
  nav: [
    { label: "Home", href: "/" },
    { label: "Pagine", href: "/pagine" },
    { label: "Contatti", href: "/contatti" },
  ],
  footer: {
    columns: [
      {
        title: "Navigazione",
        links: [
          { label: "Home", href: "/" },
          { label: "Pagine", href: "/pagine" },
        ],
      },
      {
        title: "Risorse",
        links: [
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
