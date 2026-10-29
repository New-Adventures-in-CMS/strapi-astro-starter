export type ValidationCode = "required" | "email";

export type FieldDef = {
  el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  rules: ValidationCode[];
  errorEl: HTMLElement;
};

export type FieldError = {
  field: FieldDef;
  code: ValidationCode;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getFieldValue(el: FieldDef["el"]): string {
  if (el instanceof HTMLInputElement && el.type === "checkbox") {
    return el.checked ? "on" : "";
  }
  return el.value.trim();
}

function checkField(field: FieldDef): ValidationCode | null {
  const value = getFieldValue(field.el);
  for (const rule of field.rules) {
    if (rule === "required" && !value) return "required";
    if (rule === "email" && value && !EMAIL_RE.test(value)) return "email";
  }
  return null;
}

function setInvalid(field: FieldDef): void {
  field.el.setAttribute("aria-invalid", "true");
  if (field.errorEl.id) {
    field.el.setAttribute("aria-describedby", field.errorEl.id);
  }
}

function clearInvalid(field: FieldDef): void {
  field.el.removeAttribute("aria-invalid");
  field.el.removeAttribute("aria-describedby");
}

export function isHoneypotFilled(form: HTMLFormElement): boolean {
  const hp = form.querySelector<HTMLInputElement>('input[name="website"][aria-hidden="true"]');
  return !!hp?.value;
}

export function validateForm(fields: FieldDef[]): FieldError[] {
  const errors: FieldError[] = [];
  for (const field of fields) {
    const code = checkField(field);
    if (code) {
      errors.push({ field, code });
      setInvalid(field);
    } else {
      clearInvalid(field);
    }
  }
  if (errors.length > 0) {
    errors[0].field.el.focus();
  }
  return errors;
}

export function watchFields(
  fields: FieldDef[],
  onError: (field: FieldDef, code: ValidationCode) => void,
  onClear: (field: FieldDef) => void,
): () => void {
  const cleanups: (() => void)[] = [];
  for (const field of fields) {
    const eventType = field.el instanceof HTMLSelectElement ? "change" : "input";
    const handler = () => {
      const code = checkField(field);
      if (code) {
        setInvalid(field);
        onError(field, code);
      } else {
        clearInvalid(field);
        onClear(field);
      }
    };
    field.el.addEventListener(eventType, handler);
    cleanups.push(() => field.el.removeEventListener(eventType, handler));
  }
  return () => cleanups.forEach((fn) => fn());
}
