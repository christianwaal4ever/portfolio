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
            // inkl. Pause am Ende; 234 % hält das Tempo der Animation gleich
            // (1,825 Einheiten × ca. 1,28 Bildschirmhöhen pro Einheit)
            end: "+=234%",
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
        // 1. Runder Lichtschein breitet sich von der Mitte aus, eine unscharfe
        //    leuchtende Kopie des Namens blüht auf – der Name erscheint überstrahlt.
        // 2. Licht und Glanz klingen ab, der Name steht klar da.
        // (Bewusst ohne animierten Textschatten: der wurde an der Kante des
        //  Namens rechteckig abgeschnitten.)
        // a) Die Buchstaben selbst glühen zuerst auf (eng, hell)
        tl.fromTo(".cover-glanz-nah", { autoAlpha: 0, scale: 0.98 }, { autoAlpha: 1, scale: 1.01, duration: 0.06, ease: "power2.out" }, WEG);
        // b) Aus den Buchstaben strahlt ein weicher Schein nach außen (gleiche Form, breiter)
        tl.fromTo(".cover-glanz-fern", { autoAlpha: 0, scale: 1 }, { autoAlpha: 1, scale: 1.08, duration: 0.09, ease: "power2.out" }, WEG + 0.02);
        // c) Zarter, liegender ovaler Hof dahinter
        tl.fromTo(".cover-licht", { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.1, ease: "power2.out" }, WEG + 0.03);
        // Der Name selbst erscheint im Licht
        tl.fromTo(".cover-name", { autoAlpha: 0, scale: 1.03 }, { autoAlpha: 1, scale: 1.01, duration: 0.07, ease: "power2.out" }, WEG + 0.03);
        // Alles klingt ab, der Name steht klar da
        tl.to(".cover-name", { scale: 1, duration: 0.14, ease: "power2.inOut" }, WEG + 0.1);
        tl.to(".cover-glanz-nah", { autoAlpha: 0, duration: 0.12, ease: "power1.in" }, WEG + 0.09);
        tl.to(".cover-glanz-fern", { autoAlpha: 0, scale: 1.16, duration: 0.16, ease: "power1.in" }, WEG + 0.1);
        tl.to(".cover-licht", { autoAlpha: 0, scale: 1.2, duration: 0.17, ease: "power1.in" }, WEG + 0.1);

        // Weiterscrollen: „Portfolio 2026“ gleitet herein
        tl.fromTo(".cover-unterzeile", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.1 }, WEG + 0.3);

        // Pause am Ende: das fertige Cover bleibt noch ein, zwei Scrollbewegungen
        // stehen, bevor es zur Expeditionskarte weitergeht
        // (ab Erscheinen von „Portfolio 2026“ bis zum Ende: 0,1 + 0,9 = 1,0 Einheiten)
        tl.to({}, { duration: 0.9 });
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

      {/* Zarter Hof hinter dem Namen: liegendes Oval, etwa so breit wie der Name,
          weich auslaufend (nur während des Aufleuchtens sichtbar) */}
      <div
        aria-hidden="true"
        className="cover-licht pointer-events-none invisible absolute inset-0 m-auto h-[calc(var(--name)*3.4)] w-[calc(var(--name)*6.8)] rounded-[50%] opacity-0 mix-blend-screen [background:radial-gradient(ellipse_closest-side,rgba(255,252,238,0.55),rgba(255,250,232,0.25)_40%,rgba(255,248,228,0)_100%)]"
      />

      {/* Schriftzug */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white [text-shadow:0_1px_18px_rgba(0,0,0,0.25)]">
        <div className="relative">
          {/* Glanz in Buchstabenform: unscharfe, leuchtende Kopien des Namens.
              „fern“ = breiter Schein nach außen, „nah“ = helles Glühen der Buchstaben */}
          <p
            aria-hidden="true"
            className="cover-glanz-fern pointer-events-none invisible absolute inset-0 font-display text-[length:var(--name)] leading-[0.93] text-[#fff8e6] opacity-0 blur-2xl [text-shadow:none]"
          >
            <span className="block">{person.vorname}</span>
            <span className="block">{person.nachname}</span>
          </p>
          <p
            aria-hidden="true"
            className="cover-glanz-nah pointer-events-none invisible absolute inset-0 font-display text-[length:var(--name)] leading-[0.93] text-white opacity-0 blur-[6px] [text-shadow:none]"
          >
            <span className="block">{person.vorname}</span>
            <span className="block">{person.nachname}</span>
          </p>
          <h1 className="cover-name relative font-display text-[length:var(--name)] leading-[0.93]">
            <span className="block">{person.vorname}</span>
            <span className="block">{person.nachname}</span>
          </h1>
        </div>
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
