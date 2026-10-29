import { tv } from "tailwind-variants";

/**
 * Submenu panel skin — two composition modes, backend-driven per site.
 *
 * - `full-bleed`: banda 100vw ancorata a `header.bottom` — composita in
 *   `NavigationMenuBand.astro` con `band-variants.ts` (Positioner absolute
 *   + Portal disabled + Popup w-full).
 * - `dropdown`: pannello ancorato al trigger, auto-width con min-w — usa la
 *   composizione starwind di default (`NavigationMenu` + `NavigationMenuPositioner`)
 *   con la lista contenuto `submenuDropdownList` per il min-width storico.
 *
 * L'apertura/chiusura/keyboard/focus è delegata al Root primitive: nessuna
 * modifica al meccanismo di apertura tra le due modalità (invariante di plan).
 */

export const submenuDropdownList = tv({
  base: "w-fit min-w-[180px] py-1",
});
