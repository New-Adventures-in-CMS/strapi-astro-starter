# strapi-astro-starter

Starter kit pronto all'uso per [Strapi 5](https://strapi.io) + [Astro 5](https://astro.build). Clone → setup → sito online in quattro comandi.

## Quick start

```bash
git clone https://github.com/New-Adventures-in-CMS/strapi-astro-starter.git nome-progetto
cd nome-progetto
npm run install:all
npm run setup
npm run dev
```

CMS su `http://localhost:1337/admin` · Sito su `http://localhost:4321`

**Un passaggio manuale** dopo il primo avvio: crea l'account admin in Strapi, genera un API Token (Full access, Unlimited) e incollalo su `STRAPI_API_TOKEN=` in `frontend/.env`.

## Stack

| Componente   | Versione                         |
| ------------ | -------------------------------- |
| Strapi 5     | 5.50.1                           |
| Astro 5      | 5.18.2                           |
| Tailwind CSS | v4                               |
| TypeScript   | ✓                                |
| Database     | SQLite (dev) / PostgreSQL (prod) |
| Node.js      | ≥ 20                             |

## Incluso

- Form dinamici — crea form da Strapi, rendili con `<DynamicForm slug="…" />`
- Plugin navigazione — menu gestito da Strapi Admin
- Email SMTP — notifica ad ogni submission
- `strapiFind` / `strapiFindOne` — utility API pronte

## Documentazione

- **[GUIDA.md](GUIDA.md)** — guida passo-passo in italiano, per chi parte da zero
- **[SETUP.md](SETUP.md)** — riferimento tecnico: comandi, architettura, gotcha

## Requisiti

- Node.js ≥ 20

## Licenza

MIT
