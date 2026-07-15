export type ValidationResult = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function checkHoneypot(website: string | null): ValidationResult {
  if (website) return { ok: false, error: "Bot detected" };
  return { ok: true };
}

export function validateEmail(email: string | undefined): ValidationResult {
  const v = email?.trim();
  if (!v) return { ok: false, error: "Email obbligatoria" };
  if (!EMAIL_RE.test(v)) return { ok: false, error: "Email non valida" };
  return { ok: true };
}

export function validateRequired(
  value: string | undefined,
  fieldName: string,
): ValidationResult {
  if (!value?.trim()) return { ok: false, error: `${fieldName} obbligatorio` };
  return { ok: true };
}
