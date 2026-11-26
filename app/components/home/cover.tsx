"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { person } from "../../daten";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/*
 * F1 Cover (Konzept Abschnitt 6):
 * - Beim Öffnen sieht man nur die Landschaft, die Ruinen-Cutouts sind verborgen.
 * - Beim Runterscrollen bleibt das Cover stehen (Pinning), beide Cutouts kommen
 *   gleichzeitig aus den Ecken, tauchen dabei aus dem „Nebel“ auf und wandern
 *   auf ihre Cover-Position. Dann leuchtet der Name auf, danach „Portfolio 2026“.
 * - Die Animation hängt am Scrollen, nicht an der Zeit; hochscrollen = rückwärts.
 * - Mobil und bei „Bewegung reduzieren“: alles steht sofort auf Position.
 *
 * Maße nach dem PDF-Cover (Seite 1): Name ≈ 7 % der Bildbreite,
 * Zeilenabstand 0,93, „Portfolio 2026“ ≈ 27 % der Namensgröße.
 * Die Startzustände stehen zusätzlich in globals.css (.cover-…), damit vor
 * dem Start der Animation nichts aufblitzt.
 */
export default function Cover() {
  const bereich = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: bereich.current,
            start: "top 56px", // Unterkante der Navigation
            end: "+=130%",
            scrub: 0.8,
            pin: true,
            anticipatePin: 1,
          },
        });

        const WEG = 0.525; // Dauer der Wanderung (25 % kürzer als zuvor 0,7)

        // Hinweis „Scrollen“ verschwindet zuerst
        tl.fromTo(".cover-hinweis", { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.08 }, 0);

        // Landschaft kommt leicht näher
        tl.fromTo(".cover-bild", { scale: 1.12 }, { scale: 1, duration: WEG + 0.1, ease: "power1.out" }, 0);

        // Beide Cutouts starten gleichzeitig ganz außerhalb der Ecken und
        // tauchen wie aus dem Nebel auf: unsichtbar + unscharf → voll sichtbar + scharf.
        // x/y werden ausdrücklich auf 0 gesetzt, sonst behält GSAP den
        // Startversatz aus dem CSS als feste Pixel bei.
        const ruinen = [
          { ziel: ".cover-ruine-unten", xPercent: -80, yPercent: 90, rotation: -5 },
          { ziel: ".cover-ruine-oben", xPercent: 80, yPercent: -90, rotation: 5 },
        ];
        ruinen.forEach(({ ziel, ...start }) => {
          tl.fromTo(
            ziel,
            { x: 0, y: 0, ...start },
            { x: 0, y: 0, xPercent: 0, yPercent: 0, rotation: 0, duration: WEG, ease: "power2.out" },
            0,
          );
          tl.fromTo(
            ziel,
            { autoAlpha: 0, filter: "blur(10px)" },
            { autoAlpha: 1, filter: "blur(0px)", duration: WEG, ease: "sine.inOut" },
            0,
          );
        });

        // Name leuchtet auf, sobald die Ruinen angekommen sind:
        // 1. Lichtschein blendet auf, der Name erscheint überstrahlt
        // 2. Licht klingt ab, der Name steht klar da
        const leuchten = "0 0 30px rgba(255,255,255,1), 0 0 80px rgba(255,250,235,0.95), 0 0 160px rgba(255,250,235,0.8)";
        const normal = "0 0 0px rgba(255,255,255,0), 0 0 0px rgba(255,250,235,0), 0 1px 18px rgba(0,0,0,0.25)";
        tl.fromTo(".cover-licht", { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.07, ease: "power2.out" }, WEG);
        tl.fromTo(
          ".cover-name",
          { autoAlpha: 0, scale: 1.05, filter: "blur(14px)", textShadow: leuchten },
          { autoAlpha: 1, scale: 1.02, filter: "blur(3px)", textShadow: leuchten, duration: 0.07, ease: "power2.out" },
          WEG,
        );
        tl.to(".cover-name", { scale: 1, filter: "blur(0px)", textShadow: normal, duration: 0.14, ease: "power2.inOut" }, WEG + 0.07);
        tl.to(".cover-licht", { autoAlpha: 0, scale: 1.25, duration: 0.16, ease: "power1.in" }, WEG + 0.07);

        // Weiterscrollen: „Portfolio 2026“ gleitet herein
        tl.fromTo(".cover-unterzeile", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.1 }, WEG + 0.3);

        // kurze Pause am Ende, bevor die Seite weiterscrollt
        tl.to({}, { duration: 0.12 });
      });
    },
    { scope: bereich },
  );

  return (
    <section
      ref={bereich}
      id="home"
      aria-label="Cover"
      className="relative h-[calc(100svh-3.5rem)] min-h-[28rem] overflow-hidden bg-moos [--name:clamp(3.25rem,7vw,11rem)]"
    >
      <Image
        src="/bilder/home/landschaft.jpg"
        alt="Grüne Hügellandschaft unter Wolken"
        fill
        priority
        sizes="100vw"
        className="cover-bild object-cover"
      />

      {/* Ruinen-Cutout rechts oben, angeschnitten (Position nach PDF) */}
      <Image
        src="/bilder/home/ruine-cutout.png"
        alt=""
        width={2777}
        height={1977}
        sizes="(min-width: 768px) 46vw, 62vw"
        className="cover-ruine-oben absolute -right-[18vw] -top-[5vw] w-[62vw] max-w-none md:-right-[13%] md:-top-[10%] md:w-[46%]"
      />

      {/* Ruinen-Cutout links unten, angeschnitten (Position nach PDF) */}
      <Image
        src="/bilder/home/ruine-cutout.png"
        alt=""
        width={2777}
        height={1977}
        sizes="(min-width: 768px) 52vw, 80vw"
        className="cover-ruine-unten absolute -bottom-[3vw] -left-[16vw] w-[80vw] max-w-none md:-left-[14%] md:bottom-auto md:top-[50%] md:w-[52%]"
      />

      {/* Lichtschein hinter dem Namen (nur während des Aufleuchtens sichtbar) */}
      <div
        aria-hidden="true"
        className="cover-licht pointer-events-none invisible absolute inset-0 m-auto h-[60vh] w-[70vw] opacity-0 [background:radial-gradient(closest-side,rgba(255,252,240,0.85),rgba(255,252,240,0.35)_45%,transparent)]"
      />

      {/* Schriftzug */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white [text-shadow:0_1px_18px_rgba(0,0,0,0.25)]">
        <h1 className="cover-name font-display text-[length:var(--name)] leading-[0.93]">
          <span className="block">{person.vorname}</span>
          <span className="block">{person.nachname}</span>
        </h1>
        <p className="cover-unterzeile mt-[calc(var(--name)*0.3)] text-[length:max(1rem,calc(var(--name)*0.273))] leading-none">
          {person.untertitel}
        </p>
      </div>

      {/* Hinweis zum Scrollen (nur Desktop, verschwindet beim ersten Scrollen) */}
      <div
        aria-hidden="true"
        className="cover-hinweis absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-white/90 md:flex"
      >
        Scrollen
        <span className="block h-10 w-px bg-white/80" />
      </div>
    </section>
  );
}
