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
 * - Beim Öffnen stehen die Ruinen-Cutouts außerhalb der Ecken.
 * - Beim Runterscrollen bleibt das Cover stehen (Pinning), die Cutouts wandern
 *   auf ihre Cover-Position. Erst danach erscheint „Christian Waal – Portfolio 2026“.
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

        // Hinweis „Scrollen“ verschwindet zuerst
        tl.fromTo(".cover-hinweis", { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.1 }, 0);

        // Landschaft kommt leicht näher
        tl.fromTo(".cover-bild", { scale: 1.12 }, { scale: 1, duration: 0.75, ease: "power1.out" }, 0);

        // Cutouts wandern aus den Ecken auf ihre Position.
        // x/y werden ausdrücklich auf 0 gesetzt, sonst behält GSAP den
        // Startversatz aus dem CSS als feste Pixel bei.
        tl.fromTo(
          ".cover-ruine-unten",
          { x: 0, y: 0, xPercent: -48, yPercent: 38, rotation: -4 },
          { x: 0, y: 0, xPercent: 0, yPercent: 0, rotation: 0, duration: 0.7, ease: "power2.out" },
          0,
        );
        tl.fromTo(
          ".cover-ruine-oben",
          { x: 0, y: 0, xPercent: 50, yPercent: -48, rotation: 4 },
          { x: 0, y: 0, xPercent: 0, yPercent: 0, rotation: 0, duration: 0.7, ease: "power2.out" },
          0.04,
        );

        // Erst danach: Name Zeile für Zeile, dann „Portfolio 2026“
        tl.fromTo(
          ".cover-zeile",
          // großzügige Maske, damit die hohen Chomsky-Oberlängen nicht abgeschnitten werden
          { clipPath: "inset(-40% -10% 100% -10%)", yPercent: 30 },
          { clipPath: "inset(-40% -10% -40% -10%)", yPercent: 0, duration: 0.14, stagger: 0.07, ease: "power2.out" },
          0.72,
        );
        tl.fromTo(".cover-unterzeile", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.9);

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
        className="cover-ruine-oben absolute -right-[18vw] -top-[5vw] w-[62vw] max-w-none opacity-90 md:-right-[13%] md:-top-[10%] md:w-[46%]"
      />

      {/* Ruinen-Cutout links unten, angeschnitten (Position nach PDF) */}
      <Image
        src="/bilder/home/ruine-cutout.png"
        alt=""
        width={2777}
        height={1977}
        sizes="(min-width: 768px) 52vw, 80vw"
        className="cover-ruine-unten absolute -bottom-[3vw] -left-[16vw] w-[80vw] max-w-none opacity-90 md:-left-[14%] md:bottom-auto md:top-[50%] md:w-[52%]"
      />

      {/* Schriftzug */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white [text-shadow:0_1px_18px_rgba(0,0,0,0.25)]">
        <h1 className="font-display text-[length:var(--name)] leading-[0.93]">
          <span className="cover-zeile block">{person.vorname}</span>
          <span className="cover-zeile block">{person.nachname}</span>
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
