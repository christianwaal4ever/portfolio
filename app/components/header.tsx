"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { person, projekte, titelbilder } from "../daten";

/*
 * Navigation (Konzept Abschnitt 5):
 * - Links „Christian Waal“ in der Chomsky → Home
 * - Rechts Home · Projekte · Vita · Kontakt
 * - „Projekte“: Maus drüber (oder per Tastatur hineintabben) öffnet die Liste
 *   der 5 Projekte; Klick auf „Projekte“ selbst führt zur Expeditionskarte.
 * - Mobil: Menü per Tippen, Projekte direkt als Liste plus „Zur Karte“.
 */
export default function Header() {
  const [mobilOffen, setMobilOffen] = useState(false);
  const schliessen = () => setMobilOffen(false);

  const linkStil = "transition-colors hover:text-akzent focus-visible:text-akzent";

  return (
    <header className="sticky top-0 z-50 border-b border-linie bg-papier/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link href="/" onClick={schliessen} className="font-display text-2xl leading-none">
          {person.vorname} {person.nachname}
        </Link>

        {/* ---------- Desktop ---------- */}
        <nav aria-label="Hauptnavigation" className="hidden items-center gap-8 text-sm md:flex">
          <Link href="/#home" className={linkStil}>
            Home
          </Link>

          {/* Projekte mit Dropdown: öffnet bei Hover und bei Tastaturfokus */}
          <div className="group relative">
            <Link href="/#karte" className={`${linkStil} py-4`} aria-haspopup="true">
              Projekte
            </Link>
            <div className="invisible absolute right-0 top-full w-96 pt-2 opacity-0 transition-opacity duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <ul className="border border-tinte bg-papier py-2 shadow-[4px_4px_0_0_rgba(18,18,18,0.12)]">
                {projekte.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/projekte/${p.slug}`}
                      className="flex items-center gap-4 px-4 py-2 hover:bg-sand focus-visible:bg-sand"
                    >
                      <span className="font-mono text-xs text-akzent">{p.nummer}</span>
                      <Image
                        src={titelbilder[p.slug].src}
                        alt=""
                        width={64}
                        height={40}
                        className="h-10 w-16 shrink-0 object-cover"
                      />
                      <span>{p.titel}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Link href="/#vita" className={linkStil}>
            Vita
          </Link>
          <Link href="/#kontakt" className={linkStil}>
            Kontakt
          </Link>
        </nav>

        {/* ---------- Mobil: Menü-Knopf ---------- */}
        <button
          type="button"
          onClick={() => setMobilOffen(!mobilOffen)}
          aria-label={mobilOffen ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={mobilOffen}
          aria-controls="mobilmenue"
          className="font-mono text-xs uppercase tracking-[0.2em] md:hidden"
        >
          {mobilOffen ? "Schließen" : "Menü"}
        </button>
      </div>

      {/* ---------- Mobil: Menü ---------- */}
      {mobilOffen && (
        <nav
          id="mobilmenue"
          aria-label="Hauptnavigation"
          className="max-h-[calc(100svh-3.5rem)] overflow-y-auto border-t border-linie px-4 pb-6 md:hidden"
        >
          <Link href="/#home" onClick={schliessen} className="block py-3 text-lg">
            Home
          </Link>
          <p className="pt-3 text-lg">Projekte</p>
          <ul className="ml-1 border-l border-linie pl-4">
            {projekte.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/projekte/${p.slug}`}
                  onClick={schliessen}
                  className="flex items-baseline gap-3 py-2"
                >
                  <span className="font-mono text-xs text-akzent">{p.nummer}</span>
                  {p.titel}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/#karte" onClick={schliessen} className="block py-2 text-grau">
                Zur Karte →
              </Link>
            </li>
          </ul>
          <Link href="/#vita" onClick={schliessen} className="block py-3 text-lg">
            Vita
          </Link>
          <Link href="/#kontakt" onClick={schliessen} className="block py-3 text-lg">
            Kontakt
          </Link>
        </nav>
      )}
    </header>
  );
}
