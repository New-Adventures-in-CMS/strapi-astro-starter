# STATUS — Guscio sticky, Tappa B1: hero sticky + header

Spec: `docs/SPEC-sticky-shell-B1-hero.md`
Branch: `feat/sticky-hero`
Data: 2026-10-21

---

## Obiettivo B1

Hero sticky coperto dal contenuto che scorre sopra, con header
transparent→solid ritarato correttamente sul punto di copertura dell'hero.

---

## Meccanismo header

La vecchia sentinella in fondo all'hero non usciva piu' dal viewport con l'hero
fermo (sticky) → nuova sentinella inserita dallo script nel punto di giunzione
hero/primo blocco successivo, che scorre col contenuto e segna quando l'hero
viene coperto. Auto-hide header intatto; overlay trasparente resta legato a
immersive.

---

## Layer conflict risolto

Root cause (vedi `docs/DIAG-sticky-hero.md`): la classe `relative` sull'hero
Section stava in `@layer utilities` (Tailwind v4); la regola `position: sticky`
in `@layer components`. Utilities vince su components → sticky mai applicato.

Fix: rimosso `relative` dalla class-list di BlockHero. Le due modalita' sono ora
alternative nette in CSS, nello stesso layer (`@layer components`), senza
conflitto:
- `[data-block="hero"] { position: relative; }` — fallback (specificita' 0-1-0)
- `[data-sticky-hero] > :first-child { position: sticky; ... }` — override
  quando attivo (specificita' 0-2-0, vince)

---

## Andirivieni sullo scope

Cronologia importante per chi rilegge:

1. **Partenza**: sticky legato al solo immersive (hero fullscreen + header
   trasparente).
2. **Allargamento**: in corso d'opera esteso a ogni pagina con hero (immersive
   o no). Introdotta prop `stickyHero` separata da `headerOverlay`, variabile
   `hasHero` nelle page templates, `--sticky-top: var(--header-h)` per l'hero
   sotto header solido.
3. **Ristretto di nuovo al solo immersive**: su hero NON immersive l'header
   solido, nascondendosi allo scroll (auto-hide), lasciava una striscia vuota
   sopra l'hero sticky che non risaliva a riempirla. Il difetto e' strutturale:
   l'effetto sticky ha senso solo con hero a tutta altezza e header trasparente
   sopra, dove non c'e' spazio scoperto.

Conclusione: **sticky e immersive vanno insieme per costruzione.** Rimossa
prop `stickyHero`, rimossa variabile `hasHero`, `data-sticky-hero` torna a
essere guidato da `headerOverlay` (= immersive) come segnale unico.

---

## Mobile

Sticky escluso sotto 768px via `@media (min-width: 768px)` sulle regole CSS.
Best practice: su mobile le barre del browser cambiano l'altezza viewport e
rendono lo sticky instabile. L'attributo `data-sticky-hero` resta su `<main>`
(il segnale non cambia), e' solo la resa CSS che si spegne sotto soglia.

---

## Scope finale

Hero sticky **SOLO** su pagine con hero immersive **E** viewport >= 768px.

---

## File toccati (scope chiuso — 4 file)

| File | Modifica |
| ---- | -------- |
| `frontend/src/components/blocks/BlockHero.astro` | Rimosso `relative` da class-list; aggiunto `data-block="hero"` |
| `frontend/src/styles/starwind.css` | `[data-block="hero"]` position:relative; sticky rules wrapped in `@media (min-width: 768px)`; fratelli relative z-1 |
| `frontend/src/layouts/Layout.astro` | Rimossa prop `stickyHero`; `data-sticky-hero` guidato da `headerOverlay` (unico segnale); rimosso `--sticky-top` condizionale |
| `frontend/src/components/Header.astro` | Sentinel dinamica nel punto di giunzione hero/contenuto |

`index.astro` e `[slug].astro`: tornate allo stato HEAD (rimossi `hasHero` e
`stickyHero`; `headerOverlay` era gia' la condizione corretta).

---

## Predisposizione interruttore CMS

Attivazione concentrata su `data-sticky-hero` (un punto solo in Layout.astro).
Pronta per essere messa dietro un toggle sticky nel giro impostazioni CMS.

---

## Gate

| Gate | Stato |
| ---- | ----- |
| G1 `astro check` = 0 | OK |
| G2 build verde | OK |
| G3 prettier conforme | OK |
| G4 scope file chiuso (4 file) | OK |
| G6 audit visivo Andrea (desktop + mobile) | OK |

---

## Aperto collegato

- **Tappa B2**: footer sticky (su tutte le pagine) + pagine corte + altezza
  footer variabile (probabile serve JS). NON incluso in B1.
