import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  // Esempio: blocca accesso a /admin dal frontend
  // if (context.url.pathname.startsWith("/admin")) {
  //   return context.redirect("/");
  // }

  // Esempio: inietta variabile globale nelle pagine
  // context.locals.utente = await getSessionUser(context.cookies);

  return next();
});
