import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::form-submission.form-submission",
  ({ strapi }) => ({
    async submit(ctx) {
      const { formSlug, data } = ctx.request.body as {
        formSlug: string;
        data: Record<string, unknown>;
      };

      if (!formSlug || !data) {
        return ctx.badRequest("formSlug e data sono obbligatori");
      }

      const forms = await strapi.entityService.findMany("api::form.form", {
        filters: { slug: formSlug },
        populate: { campi: true },
        limit: 1,
      });

      const form = forms[0] as unknown as
        | (Record<string, unknown> & {
            campi: Array<{
              __component: string;
              nome: string;
              required?: boolean;
            }>;
          })
        | undefined;

      if (!form) {
        return ctx.notFound(`Form '${formSlug}' non trovato`);
      }

      const errori: string[] = [];
      for (const campo of form.campi ?? []) {
        if (campo.required && !data[campo.nome]) {
          errori.push(`Campo '${campo.nome}' obbligatorio`);
        }
      }
      if (errori.length > 0) {
        return ctx.badRequest(errori.join(", "));
      }

      await strapi.entityService.create(
        "api::form-submission.form-submission",
        {
          data: {
            form: form.id as number,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dati: data as any,
            letto: false,
          },
        },
      );

      const emailTo = form.emailDestinatario as string | undefined;
      if (emailTo) {
        const righe = Object.entries(data)
          .map(([k, v]) => `<p><strong>${k}:</strong> ${v}</p>`)
          .join("");
        try {
          await strapi.plugins.email.services.email.send({
            to: emailTo,
            subject: `Nuova submission — ${form.nome}`,
            html: `<h2>${form.nome}</h2>${righe}`,
          });
        } catch {
          // email failure non blocca la risposta
        }
      }

      ctx.body = {
        success: true,
        message: (form.messaggioSuccesso as string) ?? "Grazie!",
      };
    },
  }),
);
