export const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function textValue(formData: FormData, key: string, max: number) {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

export function requireId(id: string) {
  if (!uuidPattern.test(id)) throw new Error("Invalid record identifier.");
}

export function checkboxValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

export function optionalUrl(value: string) {
  if (!value) return null;
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("URLs must use HTTPS.");
  return url.toString();
}
