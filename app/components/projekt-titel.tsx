"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Props = {
  nummer: string;
  titel: string;
  untertitel: string;
  zeile: string; // z. B. „Bachelorthesis · Genazzano“
  bild: { src: string; alt: string; hell?: boolean };
};

/*
 * Titelbild einer Projektseite (gleich für alle 5 Projekte):
 * 1. Beim Öffnen sieht man nur das Hauptrendering in voller Größe – ohne Schrift.
 * 2. Beim Scrollen bleibt das Bild stehen (Pinning), ein Verlauf legt sich darüber,
 *    Nummer und Titel gleiten von unten aus einer Kante herein, dann der Untertitel.
 * 3. Kurze Pause, danach geht es weiter zum Projekt.
 * Mobil und bei „Bewegung reduzieren“: Bild zuerst, Titel darunter bzw. sofort sichtbar.
 * Startzustände stehen zusätzlich in globals.css (.titel-…), damit nichts aufblitzt.
 */
export default function ProjektTitel({ nummer, titel, untertitel, zeile, bild }: Props) {
  const bereich = useRef<HTMLElement>(null);
  const hell = bild.hell;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: bereich.current,
            start: "top 56px", // Unterkante der Navigation
            end: "+=170%",
            scrub: 0.8,
            pin: true,
            anticipatePin: 1,
          },
        });

        // Hinweis „Scrollen“ verschwindet zuerst
        tl.fromTo(".titel-hinweis", { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.08 }, 0);
        // Das Bild rückt minimal näher, der Verlauf für die Lesbarkeit legt sich darüber
        tl.fromTo(".titel-bild", { scale: 1 }, { scale: 1.04, duration: 0.8 }, 0);
        tl.fromTo(".titel-verlauf", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power1.out" }, 0.05);
        // Nummer und Titel gleiten aus einer unsichtbaren Kante nach oben
        // (y ausdrücklich 0, sonst übernimmt GSAP den CSS-Startversatz als Pixel)
        tl.fromTo(".titel-nummer", { y: 0, yPercent: 105 }, { y: 0, yPercent: 0, duration: 0.3, ease: "power3.out" }, 0.15);
        tl.fromTo(".titel-zeile", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.2, ease: "power2.out" }, 0.22);
        tl.fromTo(".titel-name", { y: 0, yPercent: 105 }, { y: 0, yPercent: 0, duration: 0.3, ease: "power3.out" }, 0.25);
        tl.fromTo(".titel-unter", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.2, ease: "power2.out" }, 0.42);
        // Pause: der Titel steht, bevor es zum Projekt weitergeht
        tl.to({}, { duration: 0.5 });
      });
    },
    { scope: bereich },
  );

  return (
    <header
      ref={bereich}
      className={`relative md:h-[calc(100svh-3.5rem)] md:min-h-[32rem] md:overflow-hidden ${
        hell ? "bg-white text-tinte" : "bg-tinte text-white"
      }`}
    >
      {/* Hauptrendering in voller Größe */}
      <div className="relative h-[calc(100svh-3.5rem)] overflow-hidden md:absolute md:inset-0 md:h-auto">
        <Image
          src={bild.src}
          alt={bild.alt}
          fill
          priority
          sizes="100vw"
          className={`titel-bild ${hell ? "object-contain object-right" : "object-cover"}`}
        />
      </div>

      {/* Verlauf, damit die Schrift lesbar ist – erscheint erst mit dem Titel */}
      <div
        aria-hidden="true"
        className={`titel-verlauf absolute inset-0 max-md:hidden ${
          hell
            ? "bg-gradient-to-r from-white via-white/80 to-transparent"
            : "bg-gradient-to-t from-black/80 via-black/25 to-transparent"
        }`}
      />

      {/* Titel */}
      <div className="relative mx-auto grid w-full max-w-7xl items-end gap-4 px-4 pb-14 pt-10 md:absolute md:inset-x-0 md:bottom-0 md:grid-cols-12 md:gap-6 md:px-8 md:pt-32">
        <p aria-hidden="true" className="overflow-hidden md:col-span-3">
          <span
            className={`titel-nummer block text-[7rem] font-medium leading-[0.8] tracking-tighter md:text-[11rem] ${
              hell ? "text-tinte/15" : "text-white/35"
            }`}
          >
            {nummer}
          </span>
        </p>
        <div className="md:col-span-9">
          <p className={`titel-zeile font-mono text-xs uppercase tracking-[0.2em] ${hell ? "text-akzent" : "text-white/80"}`}>
            {zeile}
          </p>
          <h1 className="mt-3 overflow-hidden pb-[0.08em]">
            <span className="titel-name block text-5xl font-medium leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
              {titel}
            </span>
          </h1>
          <p className={`titel-unter mt-4 text-xl md:text-2xl ${hell ? "text-grau" : "text-white/85"}`}>{untertitel}</p>
        </div>
      </div>

      {/* Hinweis zum Scrollen (nur Desktop) */}
      <div
        aria-hidden="true"
        className={`titel-hinweis absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] md:flex ${
          hell ? "text-tinte/70" : "text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]"
        }`}
      >
        Scrollen
        <span className={`block h-10 w-px ${hell ? "bg-tinte/50" : "bg-white/80"}`} />
      </div>
    </header>
  );
}
