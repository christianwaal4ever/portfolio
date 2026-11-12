// Gemeinsame Hilfsfunktionen für den Passwortschutz (läuft nur auf dem Server).

export const COOKIE_NAME = "portfolio_auth";

// Aus dem Passwort wird ein Token berechnet. Im Cookie landet nur dieser Hash,
// nie das Passwort selbst.
export async function tokenFuerPasswort(passwort: string): Promise<string> {
  const daten = new TextEncoder().encode(`portfolio-v1:${passwort}`);
  const hash = await crypto.subtle.digest("SHA-256", daten);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Vergleich in konstanter Zeit (gegen Timing-Angriffe)
export function gleich(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
