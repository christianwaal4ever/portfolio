"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/*
 * Sorgt dafür, dass man immer am richtigen Anfang landet:
 * - Neue Seite (z. B. ein Projekt) oder Neuladen → ganz oben, also beim
 *   Vollbild ohne Schrift. Der Browser merkt sich die alte Position nicht mehr.
 * - Links mit Anker (Home, Projekte, Vita, Kontakt) → genau an den Start des
 *   Bereichs. „Home“ = ganz oben, die Landschaft ohne Namen.
 * Hintergrund: Die stehenbleibenden (gepinnten) Bereiche verlängern die Seite.
 * Ohne diese Hilfe landete man teils mitten in einer Animation.
 */

const NAV = 56; // Höhe der Navigation

// Scrollposition für einen Anker: Start der Animation bzw. Oberkante des Bereichs
function zielFuer(hash: string): number | null {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  if (!id || id === "home") return 0;
  const el = document.getElementById(id);
  if (!el) return null;
  const pin = ScrollTrigger.getAll().find((st) => st.trigger === el);
  if (pin) return pin.start;
  return el.getBoundingClientRect().top + window.scrollY - NAV - 8;
}

function springen(top: number, weich = false) {
  window.scrollTo({ top, behavior: weich ? "smooth" : "instant" });
}

export default function ScrollStart() {
  const pfad = usePathname();

  // Browser soll die Position beim Neuladen nicht wiederherstellen
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  }, []);

  // Nach jedem Seitenwechsel: nach oben bzw. zum Anker
  useEffect(() => {
    const anfahren = () => {
      const hash = window.location.hash;
      const ziel = hash ? zielFuer(hash) : 0;
      if (ziel !== null) springen(ziel);
    };
    anfahren();
    // Die Animationen messen die Seite erst kurz nach dem Laden aus –
    // danach noch einmal genau positionieren.
    const r = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      anfahren();
    });
    const t = window.setTimeout(() => {
      ScrollTrigger.refresh();
      anfahren();
    }, 250);
    return () => {
      cancelAnimationFrame(r);
      window.clearTimeout(t);
    };
  }, [pfad]);

  // Klick auf einen Anker der aktuellen Seite (z. B. „Home“ auf der Startseite)
  useEffect(() => {
    const klick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
      const ziel = url.hash ? zielFuer(url.hash) : 0;
      if (ziel === null) return;
      // Next-Link sieht „defaultPrevented“ und navigiert dann nicht selbst;
      // eigene onClick-Handler (z. B. Menü schließen) laufen trotzdem.
      e.preventDefault();
      history.pushState(history.state, "", url.pathname + url.hash);
      springen(ziel, true);
    };
    // Erfassungsphase: läuft vor dem Next-Link
    document.addEventListener("click", klick, true);
    return () => document.removeEventListener("click", klick, true);
  }, []);

  return null;
}
