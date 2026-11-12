import { NextResponse } from "next/server";
import { COOKIE_NAME, gleich, tokenFuerPasswort } from "../../../lib/auth";

// Prüft das Passwort auf dem Server. Das richtige Passwort steht nur in der
// Umgebungsvariable SITE_PASSWORD und gelangt nie ins Frontend.
export async function POST(request: Request) {
  const formular = await request.formData();
  const eingabe = String(formular.get("passwort") ?? "");
  const richtig = process.env.SITE_PASSWORD;

  const ok =
    !!richtig &&
    gleich(await tokenFuerPasswort(eingabe), await tokenFuerPasswort(richtig));

  if (!ok) {
    return NextResponse.redirect(new URL("/login?fehler=1", request.url), 303);
  }

  const antwort = NextResponse.redirect(new URL("/", request.url), 303);
  antwort.cookies.set(COOKIE_NAME, await tokenFuerPasswort(richtig), {
    httpOnly: true, // per JavaScript im Browser nicht auslesbar
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 Tage
  });
  return antwort;
}
