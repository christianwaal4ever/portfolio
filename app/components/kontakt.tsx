"use client";

import { FormEvent } from "react";
import { kontakt } from "../daten";

export default function Kontakt() {
  /*
   * Das Formular öffnet aktuell das E-Mail-Programm des Besuchers (mailto),
   * weil die Seite kein eigenes Backend hat. Für echten Versand ohne
   * Mail-Programm z. B. Formspree oder Web3Forms einbinden (siehe README-Hinweis).
   */
  const absenden = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const betreff = encodeURIComponent(`Anfrage von ${d.get("name")}`);
    const text = encodeURIComponent(`${d.get("nachricht")}\n\n— ${d.get("name")} (${d.get("email")})`);
    window.location.href = `mailto:${kontakt.email}?subject=${betreff}&body=${text}`;
  };

  const feld =
    "w-full rounded-md border border-line bg-bg px-4 py-3 outline-none transition focus:border-accent";

  return (
    <section id="kontakt" className="mx-auto max-w-6xl px-4 py-24 md:px-8">
      <h2 className="text-3xl font-light md:text-5xl">Kontakt</h2>

      <div className="mt-12 grid gap-16 md:grid-cols-[2fr_1fr]">
        {/* Formular */}
        <form onSubmit={absenden} className="space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm">Name</label>
            <input id="name" name="name" required className={feld} />
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm">E-Mail</label>
            <input id="email" name="email" type="email" required className={feld} />
          </div>
          <div>
            <label htmlFor="nachricht" className="mb-2 block text-sm">Nachricht</label>
            <textarea id="nachricht" name="nachricht" rows={6} required className={feld} />
          </div>
          <button
            type="submit"
            className="rounded-full bg-fg px-8 py-3 text-sm text-bg transition hover:bg-accent"
          >
            Absenden
          </button>
        </form>

        {/* Direkte Kontaktdaten und Profile */}
        <div className="space-y-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-accent">E-Mail</p>
            <a href={`mailto:${kontakt.email}`} className="mt-2 block hover:text-accent">
              {kontakt.email}
            </a>
          </div>

          {kontakt.telefon && (
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-accent">Telefon</p>
              <a
                href={`tel:${kontakt.telefon.replace(/\s/g, "")}`}
                className="mt-2 block hover:text-accent"
              >
                {kontakt.telefon}
              </a>
            </div>
          )}

          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-accent">Profile</p>
            <ul className="mt-2 space-y-1">
              {kontakt.profile.map((p) => (
                <li key={p.name}>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                    {p.name} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
