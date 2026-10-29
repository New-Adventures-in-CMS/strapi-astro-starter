// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  validateForm,
  watchFields,
  isHoneypotFilled,
  type FieldDef,
  type ValidationCode,
} from "../skeleton/form-validation";

function makeForm(html: string): HTMLFormElement {
  const form = document.createElement("form");
  form.innerHTML = html;
  document.body.appendChild(form);
  return form;
}

function makeField(
  overrides: Partial<{
    tag: "input" | "textarea" | "select";
    type: string;
    value: string;
    required: boolean;
    rules: ValidationCode[];
    id: string;
  }> = {},
): { field: FieldDef; el: HTMLElement; errorEl: HTMLElement } {
  const tag = overrides.tag ?? "input";
  const el = document.createElement(tag) as HTMLInputElement;
  if (tag === "input") (el as HTMLInputElement).type = overrides.type ?? "text";
  if (overrides.value !== undefined) el.value = overrides.value;
  if (overrides.required) el.required = true;
  el.id = overrides.id ?? "field-" + Math.random().toString(36).slice(2, 8);

  const errorEl = document.createElement("p");
  errorEl.id = el.id + "-error";

  const field: FieldDef = {
    el: el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    rules: overrides.rules ?? ["required"],
    errorEl,
  };
  return { field, el, errorEl };
}

let form: HTMLFormElement;

beforeEach(() => {
  document.body.innerHTML = "";
  form = makeForm(
    '<input type="text" name="website" aria-hidden="true" /><button type="submit">Submit</button>',
  );
});

describe("isHoneypotFilled", () => {
  it("returns false when honeypot is empty", () => {
    expect(isHoneypotFilled(form)).toBe(false);
  });

  it("returns true when honeypot has value", () => {
    const hp = form.querySelector<HTMLInputElement>('[name="website"]')!;
    hp.value = "spam-bot";
    expect(isHoneypotFilled(form)).toBe(true);
  });

  it("returns false when no honeypot element exists", () => {
    const bareForm = document.createElement("form");
    expect(isHoneypotFilled(bareForm)).toBe(false);
  });
});

describe("validateForm — required rule", () => {
  it("returns error for empty required field", () => {
    const { field } = makeField({ value: "", rules: ["required"] });
    const errors = validateForm([field]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("required");
    expect(errors[0].field).toBe(field);
  });

  it("returns error for whitespace-only required field", () => {
    const { field } = makeField({ value: "   ", rules: ["required"] });
    const errors = validateForm([field]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("required");
  });

  it("passes for non-empty required field", () => {
    const { field } = makeField({ value: "hello", rules: ["required"] });
    expect(validateForm([field])).toHaveLength(0);
  });

  it("handles required checkbox — unchecked", () => {
    const el = document.createElement("input") as HTMLInputElement;
    el.type = "checkbox";
    el.id = "cb1";
    const errorEl = document.createElement("p");
    errorEl.id = "cb1-error";
    const field: FieldDef = { el, rules: ["required"], errorEl };
    const errors = validateForm([field]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("required");
  });

  it("handles required checkbox — checked", () => {
    const el = document.createElement("input") as HTMLInputElement;
    el.type = "checkbox";
    el.checked = true;
    el.id = "cb2";
    const errorEl = document.createElement("p");
    errorEl.id = "cb2-error";
    const field: FieldDef = { el, rules: ["required"], errorEl };
    expect(validateForm([field])).toHaveLength(0);
  });
});

describe("validateForm — email rule", () => {
  it("returns error for malformed email", () => {
    const { field } = makeField({ type: "email", value: "bad", rules: ["email"] });
    const errors = validateForm([field]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("email");
  });

  it("passes for valid email", () => {
    const { field } = makeField({
      type: "email",
      value: "user@example.com",
      rules: ["email"],
    });
    expect(validateForm([field])).toHaveLength(0);
  });

  it("passes for empty non-required email field", () => {
    const { field } = makeField({ type: "email", value: "", rules: ["email"] });
    expect(validateForm([field])).toHaveLength(0);
  });

  it("required + email: empty → required error (not email)", () => {
    const { field } = makeField({
      type: "email",
      value: "",
      rules: ["required", "email"],
    });
    const errors = validateForm([field]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("required");
  });

  it("required + email: malformed → email error", () => {
    const { field } = makeField({
      type: "email",
      value: "nope",
      rules: ["required", "email"],
    });
    const errors = validateForm([field]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("email");
  });
});

describe("validateForm — aria attributes", () => {
  it("sets aria-invalid and aria-describedby on invalid field", () => {
    const { field, el, errorEl } = makeField({ value: "", rules: ["required"] });
    validateForm([field]);
    expect(el.getAttribute("aria-invalid")).toBe("true");
    expect(el.getAttribute("aria-describedby")).toBe(errorEl.id);
  });

  it("clears aria attributes on valid field", () => {
    const { field, el } = makeField({ value: "", rules: ["required"] });
    validateForm([field]);
    expect(el.getAttribute("aria-invalid")).toBe("true");
    (el as HTMLInputElement).value = "filled";
    validateForm([field]);
    expect(el.getAttribute("aria-invalid")).toBeNull();
    expect(el.getAttribute("aria-describedby")).toBeNull();
  });
});

describe("validateForm — focus", () => {
  it("focuses first invalid field", () => {
    const f1 = makeField({ value: "", rules: ["required"], id: "f1" });
    const f2 = makeField({ value: "", rules: ["required"], id: "f2" });
    const spy = vi.spyOn(f1.field.el, "focus");
    validateForm([f1.field, f2.field]);
    expect(spy).toHaveBeenCalled();
  });

  it("does not focus when all valid", () => {
    const f1 = makeField({ value: "ok", rules: ["required"], id: "f1" });
    const spy = vi.spyOn(f1.field.el, "focus");
    validateForm([f1.field]);
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("watchFields", () => {
  it("calls onError when field stays invalid on input", () => {
    const { field } = makeField({ value: "", rules: ["required"] });
    const onError = vi.fn();
    const onClear = vi.fn();
    const cleanup = watchFields([field], onError, onClear);
    field.el.dispatchEvent(new Event("input"));
    expect(onError).toHaveBeenCalledWith(field, "required");
    expect(onClear).not.toHaveBeenCalled();
    cleanup();
  });

  it("calls onClear when field becomes valid on input", () => {
    const { field } = makeField({ value: "", rules: ["required"] });
    const onError = vi.fn();
    const onClear = vi.fn();
    const cleanup = watchFields([field], onError, onClear);
    (field.el as HTMLInputElement).value = "now valid";
    field.el.dispatchEvent(new Event("input"));
    expect(onClear).toHaveBeenCalledWith(field);
    expect(onError).not.toHaveBeenCalled();
    cleanup();
  });

  it("uses change event for select elements", () => {
    const sel = document.createElement("select");
    sel.innerHTML = '<option value="">-</option><option value="a">A</option>';
    sel.id = "sel1";
    sel.required = true;
    const errorEl = document.createElement("p");
    errorEl.id = "sel1-error";
    const field: FieldDef = { el: sel, rules: ["required"], errorEl };
    const onError = vi.fn();
    const onClear = vi.fn();
    const cleanup = watchFields([field], onError, onClear);
    sel.value = "a";
    sel.dispatchEvent(new Event("change"));
    expect(onClear).toHaveBeenCalledWith(field);
    cleanup();
  });

  it("cleanup removes listeners", () => {
    const { field } = makeField({ value: "", rules: ["required"] });
    const onError = vi.fn();
    const onClear = vi.fn();
    const cleanup = watchFields([field], onError, onClear);
    cleanup();
    field.el.dispatchEvent(new Event("input"));
    expect(onError).not.toHaveBeenCalled();
  });
});
