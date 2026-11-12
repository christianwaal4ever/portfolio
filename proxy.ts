import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, gleich, tokenFuerPasswort } from "./lib/auth";

// Läuft auf dem Server vor jeder Seite: ohne gültiges Cookie geht es zur Login-Seite.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login-Seite und Login-Endpunkt müssen ohne Anmeldung erreichbar sein
  if (pathname === "/login" || pathname === "/api/login") {
    return NextResponse.next();
  }

  const passwort = process.env.SITE_PASSWORD;
  const cookie = request.cookies.get(COOKIE_NAME)?.value ?? "";

  // Ist kein Passwort gesetzt, bleibt die Seite gesperrt (lieber zu als offen)
  if (passwort && gleich(cookie, await tokenFuerPasswort(passwort))) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

// Alles schützen außer interne Next.js-Dateien und das Favicon
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
