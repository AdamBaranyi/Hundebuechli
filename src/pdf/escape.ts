/*
 * Alles, was jemand eingetippt hat, landet als Text im PDF – nie als HTML.
 * Ein Hundename wie «<img src=x onerror=…>» erscheint genau so, wie er
 * geschrieben wurde.
 */

const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function esc(text: string | null | undefined): string {
  return (text ?? '').replace(/[&<>"']/g, (sign) => ENTITIES[sign] ?? sign);
}

/** Mehrzeiliger Text: jede Zeile maskiert, Umbrüche als <br>. */
export function escLines(text: string | null | undefined): string {
  return esc(text).replace(/\r?\n/g, '<br>');
}

/** Nur Bilder, die die App selbst als JPEG eingebettet hat; alles andere fällt weg. */
export function imageSource(base64: string | null | undefined): string | null {
  if (!base64 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) return null;
  return `data:image/jpeg;base64,${base64}`;
}
