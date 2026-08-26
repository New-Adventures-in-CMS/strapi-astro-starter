# strapi-astro-starter

Starter kit pronto all'uso per [Strapi 5](https://strapi.io) + [Astro 7](https://astro.build). Clone → setup → sito online in quattro comandi.

## Quick start

```bash
git clone https://github.com/New-Adventures-in-CMS/strapi-astro-starter.git nome-progetto
cd nome-progetto
npm run install:all
npm run setup
npm run dev
```

CMS su `http://localhost:1337/admin` · Sito su `http://localhost:4321`

**Un passaggio manuale** dopo il primo avvio: crea l'account admin in Strapi, genera un API Token (Full access, Unlimited) e incollalo su `STRAPI_API_TOKEN=` in `frontend/.env`. Dettagli in [GUIDA.md](GUIDA.md) (passo per passo) o [SETUP.md](SETUP.md) (sintetico).

## Cos'è

Un headless CMS già cablato: Strapi gestisce i contenuti, Astro genera il sito. Include form dinamici gestiti da Strapi, plugin di navigazione, email SMTP, campi SEO, server MCP per gli AI agent e utility API pronte (`strapiFind` / `strapiFindOne`).

Stack: Strapi 5 · Astro 7 · Tailwind CSS v4 · Starwind UI · TypeScript · SQLite (dev) / PostgreSQL (prod) · Node.js ≥ 22.12. Tabella versioni completa in [SETUP.md](SETUP.md#stack).

## Documentazione

- **[GUIDA.md](GUIDA.md)** — guida passo-passo in italiano, per chi parte da zero: concetti, installazione spiegata, workflow, glossario.
- **[SETUP.md](SETUP.md)** — riferimento tecnico: comandi, stack, pattern, gotcha, env vars, MCP.

## Requisiti

Node.js ≥ 22.12

## Licenza

MIT
