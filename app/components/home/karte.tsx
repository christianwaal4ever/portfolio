"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { projekte } from "../../daten";
import { GRADNETZ, GRADNETZ_TEXT, GRENZEN, KARTE, LAND, SEEN, STATIONEN } from "../../karte-daten";
import Masskette from "../masskette";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/*
 * F2 Expeditionskarte (Konzept Abschnitt 6):
 * - Europa mit Nordafrika, Grundlage Natural Earth (gemeinfrei), erzeugt mit werkzeuge/karte.py
 * - Beim Scrollen bleibt die Karte stehen und eine rot gestrichelte Route (wie in alten Abenteuerfilmen) zeichnet sich
 *   von Station zu Station (01 → 05, chronologisch wie im PDF).
 * - Jede Station: Marker mit Nummer + kleines Vorschaubild. Hover hebt hervor,
 *   Klick öffnet die Projektseite.
 * - Mobil und bei „Bewegung reduzieren“: Route ist fertig gezeichnet, darunter eine Liste.
 */

const W = KARTE.breite;
const H = KARTE.hoehe;

// Lage der Vorschaukarten relativ zum Marker (in Karteneinheiten).
// Die drei norddeutschen Stationen liegen dicht beieinander, darum fächern
// ihre Karten nach oben links, links und rechts auf.
const KARTE_B = 150;
const KARTE_H = 132;
const VERSATZ: Record<string, [number, number]> = {
  "01": [42, 18],
  "02": [-185, -60],
  "03": [-190, -170],
  "04": [-60, 75],
  "05": [85, -70],
};

// Mobil: Ausschnitt auf die fünf Stationen und Lage der Nummern neben den Markern
const MOBIL_VIEWBOX = "150 140 500 600";
const MOBIL_NUMMER: Record<string, [number, number]> = {
  "01": [14, -10],
  "02": [14, -10],
  "03": [-40, -6],
  "04": [14, -2],
  "05": [14, 22],
};

// Krümmung jedes Routenabschnitts (Anteil der Länge, Vorzeichen = Seite)
const KRUEMMUNG = [-0.2, -0.28, 0.45, -0.45];

function abschnitt(a: { x: number; y: number }, b: { x: number; y: number }, k: number) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const laenge = Math.hypot(dx, dy);
  const cx = (a.x + b.x) / 2 + (-dy / laenge) * k * laenge;
  const cy = (a.y + b.y) / 2 + (dx / laenge) * k * laenge;
  return `M${a.x} ${a.y} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x} ${b.y}`;
}

const ROUTE = STATIONEN.slice(1).map((s, i) => abschnitt(STATIONEN[i], s, KRUEMMUNG[i]));

// Maßstab: 500 km in Karteneinheiten
const KM500 = 500 / KARTE.kmProEinheit;

export default function Karte() {
  const bereich = useRef<HTMLElement>(null);
  const karte = useRef<SVGSVGElement>(null);
  const router = useRouter();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Mobil: auf die Stationen zoomen, damit Marker und Nummern lesbar sind
      mm.add("(max-width: 767px)", () => {
        const svg = karte.current;
        if (!svg) return;
        svg.setAttribute("viewBox", MOBIL_VIEWBOX);
        return () => svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      });

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        // Maskenpfade vorbereiten: komplett „ungezeichnet“
        const masken = gsap.utils.toArray<SVGPathElement>(".routen-maske");
        const laengen = masken.map((p) => p.getTotalLength());
        // Puffer: die runden Linienenden ragen 5 Einheiten über den Strich hinaus –
        // ohne Puffer blitzt am Anfang jedes Abschnitts ein roter Punkt auf.
        const PUFFER = 20;
        masken.forEach((p, i) =>
          gsap.set(p, { strokeDasharray: `${laengen[i]} ${laengen[i] + PUFFER * 2}`, strokeDashoffset: laengen[i] + PUFFER }),
        );

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: bereich.current,
            start: "top 56px",
            end: "+=260%",
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
          },
        });

        const station = (i: number) => {
          tl.fromTo(`.marker-${i}`, { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.05, ease: "back.out(2.5)" });
          tl.fromTo(`.vorschau-${i}`, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.07, ease: "power2.out" }, "<");
          tl.fromTo(`.listen-${i}`, { opacity: 0.3 }, { opacity: 1, duration: 0.05 }, "<");
        };

        // Länge der Abschnitte bestimmt die Dauer (lange Strecken dauern länger)
        const summe = laengen.reduce((a, b) => a + Math.sqrt(b), 0);
        station(0);
        masken.forEach((p, i) => {
          tl.to(p, { strokeDashoffset: 0, duration: (0.75 * Math.sqrt(laengen[i])) / summe, ease: "power1.inOut" });
          station(i + 1);
        });
        tl.to({}, { duration: 0.12 });
      });
    },
    { scope: bereich },
  );

  const oeffnen = (slug: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/projekte/${slug}`);
  };

  return (
    <section ref={bereich} id="karte" className="relative bg-papier md:h-[calc(100svh-3.5rem)] md:overflow-hidden">
      <div className="mx-auto grid h-full max-w-[96rem] gap-8 px-4 py-16 md:grid-cols-12 md:grid-rows-[minmax(0,1fr)] md:px-8 md:py-10">
        {/* ---------- Linke Spalte: Titel und Stationen ---------- */}
        <div className="flex flex-col md:col-span-4 lg:col-span-3">
          <Masskette links="Expedition" rechts="01 — 05" />
          <h2 className="mt-8 text-4xl font-medium tracking-tight md:text-5xl">Projekte</h2>
          <p className="mt-2 text-lg text-grau">Von Bachelor bis Master</p>

          <ol className="mt-10 hidden space-y-5 md:block">
            {projekte.map((p, i) => (
              <li key={p.slug} className={`listen-${i}`}>
                <Link href={`/projekte/${p.slug}`} className="group grid grid-cols-[2.5rem_1fr] gap-x-2">
                  <span className="font-mono text-sm text-akzent">{p.nummer}</span>
                  <span className="font-medium group-hover:text-akzent">{p.titel}</span>
                  <span className="col-start-2 font-mono text-[11px] leading-relaxed text-grau">
                    {STATIONEN[i].ort}
                    <br />
                    {STATIONEN[i].koordinaten}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>

        {/* ---------- Karte ---------- */}
        <div className="relative md:col-span-8 md:min-h-0 lg:col-span-9">
          <svg
            ref={karte}
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid meet"
            className="h-full w-full"
            role="group"
            aria-label="Expeditionskarte Europa und Nordafrika mit fünf Projektstationen"
          >
            <defs>
              {ROUTE.map((d, i) => (
                <mask key={i} id={`routen-maske-${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
                  <path className="routen-maske" d={d} fill="none" stroke="white" strokeWidth="10" strokeLinecap="round" />
                </mask>
              ))}
              <clipPath id="bildrahmen">
                <rect width={KARTE_B} height={94} />
              </clipPath>
            </defs>

            {/* Meer, Gradnetz, Land, Seen, Grenzen */}
            <rect width={W} height={H} className="fill-papier" />
            <path d={GRADNETZ} fill="none" className="stroke-linie" strokeWidth="0.6" />
            <path d={LAND} className="fill-sand stroke-tinte" strokeWidth="0.7" fillRule="evenodd" strokeLinejoin="round" />
            <path d={SEEN} className="fill-papier stroke-tinte" strokeWidth="0.5" />
            <path d={GRENZEN} fill="none" className="stroke-stein" strokeWidth="0.5" strokeDasharray="2 2.5" />
            {GRADNETZ_TEXT.map((t) => (
              <text key={t.text} x={t.x} y={t.y} className="fill-grau font-mono" fontSize="9">
                {t.text}
              </text>
            ))}

            {/* Nordpfeil */}
            <g transform="translate(40 70)" className="fill-tinte">
              <path d="M0 -26 L7 6 L0 0 L-7 6 Z" />
              <text y="22" textAnchor="middle" className="font-mono" fontSize="11">
                N
              </text>
            </g>

            {/* Maßstab */}
            <g transform={`translate(${W - 40 - KM500} ${H - 30})`} className="font-mono">
              <rect width={KM500 / 2} height="4" className="fill-tinte" />
              <rect x={KM500 / 2} width={KM500 / 2} height="4" className="fill-papier stroke-tinte" strokeWidth="0.8" />
              {[0, 250, 500].map((km, k) => (
                <text key={km} x={(KM500 / 2) * k} y="-6" textAnchor="middle" fontSize="9" className="fill-grau">
                  {km === 500 ? "500 km" : km}
                </text>
              ))}
            </g>

            {/* Route: gestrichelt, wird über die Masken gezeichnet */}
            {ROUTE.map((d, i) => (
              <path
                key={i}
                d={d}
                mask={`url(#routen-maske-${i})`}
                fill="none"
                className="stroke-route"
                strokeWidth="2.6"
                strokeDasharray="7 6"
                strokeLinecap="round"
              />
            ))}

            {/* Stationen */}
            {STATIONEN.map((s, i) => {
              const [vx, vy] = VERSATZ[s.nummer];
              const kx = s.x + vx;
              const ky = s.y + vy;
              // Führungslinie zum nächstgelegenen Punkt der Vorschaukarte
              const lx = Math.min(Math.max(s.x, kx), kx + KARTE_B);
              const ly = Math.min(Math.max(s.y, ky), ky + KARTE_H);
              const p = projekte[i];
              return (
                <a
                  key={s.slug}
                  href={`/projekte/${s.slug}`}
                  onClick={oeffnen(s.slug)}
                  aria-label={`${p.nummer} ${p.titel}, ${s.ort}`}
                  className="group cursor-pointer outline-none"
                >
                  {/* Vorschaukarte (nur Desktop) */}
                  <g className={`vorschau-${i} max-md:hidden`}>
                    <line x1={s.x} y1={s.y} x2={lx} y2={ly} className="stroke-tinte" strokeWidth="0.7" />
                    <g transform={`translate(${kx} ${ky})`}>
                      <rect
                        x="-4"
                        y="-4"
                        width={KARTE_B + 8}
                        height={KARTE_H + 8}
                        className="fill-papier stroke-tinte transition-colors group-hover:stroke-akzent group-focus-visible:stroke-akzent"
                        strokeWidth="0.8"
                      />
                      <image
                        href={`/bilder/karte/${s.nummer}.jpg`}
                        width={KARTE_B}
                        height={94}
                        preserveAspectRatio="xMidYMid slice"
                        clipPath="url(#bildrahmen)"
                      />
                      <text y="110" className="fill-akzent font-mono" fontSize="10">
                        {p.nummer}
                      </text>
                      <text x="20" y="110" className="fill-tinte font-sans" fontSize="11.5" fontWeight="500">
                        {p.titel}
                      </text>
                      <text y="125" className="fill-grau font-mono" fontSize="8.5">
                        {s.ort}
                      </text>
                    </g>
                  </g>

                  {/* Marker mit Nummer */}
                  <g className={`marker-${i}`}>
                    <circle cx={s.x} cy={s.y} r="18" fill="transparent" />
                    <circle cx={s.x} cy={s.y} r="9" className="fill-papier stroke-route" strokeWidth="1.2" />
                    <circle
                      cx={s.x}
                      cy={s.y}
                      r="4.5"
                      className="fill-route transition-[r] group-hover:[r:6.5] group-focus-visible:[r:6.5]"
                    />
                    <text
                      x={s.x + MOBIL_NUMMER[s.nummer][0]}
                      y={s.y + MOBIL_NUMMER[s.nummer][1]}
                      className="fill-tinte font-mono md:hidden"
                      fontSize="20"
                    >
                      {s.nummer}
                    </text>
                  </g>
                </a>
              );
            })}
          </svg>
        </div>

        {/* ---------- Mobil: kompakte Liste unter der Karte ---------- */}
        <ol className="divide-y divide-linie border-y border-linie md:hidden">
          {projekte.map((p, i) => (
            <li key={p.slug}>
              <Link href={`/projekte/${p.slug}`} className="grid grid-cols-[2.5rem_1fr] gap-x-2 py-4">
                <span className="font-mono text-sm text-akzent">{p.nummer}</span>
                <span className="font-medium">{p.titel}</span>
                <span className="col-start-2 font-mono text-[11px] text-grau">{STATIONEN[i].ort}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
