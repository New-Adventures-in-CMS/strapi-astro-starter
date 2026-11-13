import AdminLogo from "./extensions/admin-logo.svg";

export default {
  config: {
    locales: ["it"],
    head: {
      favicon: "/favicon.ico",
    },
    auth: {
      logo: AdminLogo,
    },
    menu: {
      logo: AdminLogo,
    },
    translations: {
      it: {
        "Auth.form.welcome.title": "Benvenuto!",
        "Auth.form.welcome.subtitle": "Accedi al tuo account",
      },
      en: {
        "Auth.form.welcome.title": "Welcome!",
        "Auth.form.welcome.subtitle": "Log in to your account",
      },
    },
  },
  bootstrap() {},
};
