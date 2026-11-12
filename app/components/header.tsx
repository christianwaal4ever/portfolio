"use client";

import { useState } from "react";
import { person } from "../daten";

// Anker-Links der Navigation – müssen zu den section-IDs passen
const links = [
  { href: "#projekte", label: "Projekte" },
  { href: "#lebenslauf", label: "Lebenslauf" },
  { href: "#kontakt", label: "Kontakt" },
];

export default function Header() {
  // Mobiles Menü auf/zu
  const [offen, setOffen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        <a href="#start" className="text-sm uppercase tracking-[0.3em]">
          {person.name}
        </a>

        {/* Desktop-Navigation */}
        <nav className="hidden gap-8 text-sm md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition hover:text-accent">
              {l.label}
            </a>
          ))}
        </nav>

        {/* Burger-Button (nur mobil) */}
        <button
          onClick={() => setOffen(!offen)}
          aria-label="Menü"
          aria-expanded={offen}
          className="text-2xl md:hidden"
        >
          {offen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobiles Menü */}
      {offen && (
        <nav className="flex flex-col border-t border-line px-4 py-2 md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOffen(false)}
              className="py-3"
            >
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
