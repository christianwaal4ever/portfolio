"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Modell3DSteuerung } from "./modell-3d";
import { DETAIL, PLAN_PX, PLAN_PX_PRO_EINHEIT, PLAN_URSPRUNG, pxProEinheit } from "./kamera";
import {
  ITALIEN,
  FAHRT,
  GENAZZANO,
  ORTE,
  land,
  seen,
  grenzen,
  landNah,
  seenNah,
  regionenNah,
  fluesseNah,
  gradnetz,
} from "../../italien-daten";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// three.js wird erst geladen, wenn die Expedition auf der Seite ist
const Modell3D = dynamic(() => import("./modell-3d"), { ssr: false });

/*
 * F4 · NIFEO-Scroll-Expedition (Etappe 6)
 * Der Abschnitt bleibt stehen (Pinning), Scrollen steuert die Kamerafahrt:
 *   1. Italien  →  2. Zoom auf Genazzano (Latium)  →  3. Lageplan mit dem Nymphäum
 *   →  4. Der Lageplan zoomt auf den Maßstab der 3D-Szene und geht nahtlos in sie über:
 *      Das Modell wächst exakt aus seinem Grundriss, die Kamera kippt in die
 *      Schrägansicht, danach ist es frei drehbar („Draufsicht“ führt zurück).
 * Hochscrollen spielt alles rückwärts.
 * (Schritte 5/6 – die neuen Elemente setzen sich ein – folgen, sobald Christian
 *  die Einzeldateien liefert; Platz dafür ist in der Zeitachse vorgesehen.)
 * Mobil und bei „Bewegung reduzieren“: dieselben Stationen als ruhige Bildfolge.
 */

type ViewBox = [number, number, number, number];

// nx/ny = Lage des Modell-Ursprungs (Mitte des Nymphäums) im Plan, aus werkzeuge/ausrichtung.py
const LAGEPLAN = { src: "/bilder/01/lageplan.jpg", b: PLAN_PX[0], h: PLAN_PX[1], nx: PLAN_URSPRUNG.x, ny: PLAN_URSPRUNG.y };
const PLAN_HOEHE = 2.3; // Lageplan im Kreis: 230 % der Bühnenhöhe
const MODELL = "/modelle/nifeo-bestand.glb";

// Abschnitte der Zeitachse (0–1)
// Ohne Haltepunkte: die Abschnitte gehen fließend ineinander über, jede
// Scrollbewegung bewegt das Bild.
const ENDE = 0.76; // Anteil der Scrollstrecke für die Fahrt, der Rest = Pause am fertigen Modell

const P = {
  zoom: [0, 0.46], // durchgehender Zoom: Italien → Latium → genau auf Genazzano
  plan: [0.4, 0.55], // Lageplan taucht weich aus dem Punkt Genazzano auf
  planZoom: [0.4, 0.64], // … und zoomt schon währenddessen weiter (ein Fluss bis zum Modell)
  wechsel: [0.645, 0.66], // Übergang Bild → 3D (erst nach dem Zoom: deckungsgleich, unsichtbar)
  wachsen: [0.66, 0.84], // Modell wächst aus dem Grundriss
  neigen: [0.7, 0.97], // Kamera kippt von oben in die Schrägansicht (Vorderseite)
  frei: 0.97, // ab hier mit der Maus drehbar
} as const;

const TEXTE = [
  { von: -1, bis: 0.08, kicker: "Expedition 01", titel: "Italien", text: "" },
  {
    von: 0.1,
    bis: 0.28,
    kicker: GENAZZANO.koordinaten,
    titel: "Genazzano, Latium",
    text: "Rund 58 km östlich von Rom. Für die Recherche bin ich persönlich zum Objekt gereist, um den Bestand vor Ort zu erforschen, zu dokumentieren und zu vermessen.",
  },
  { von: 0.44, bis: 0.66, kicker: "Lageplan", titel: "Das Nymphäum des Bramante", text: "Anfang 16. Jahrhundert – heute eine Ruine." },
  { von: 0.88, bis: 2, kicker: "Bestand · 3D-Modell", titel: "Die Ruine heute", text: "" },
];

const glatt = (t: number) => {
  const x = Math.min(Math.max(t, 0), 1);
  return x * x * (3 - 2 * x);
};
const anteil = (p: number, [a, b]: readonly [number, number]) => glatt((p - a) / (b - a));

// Zoom zwischen zwei Ausschnitten: Breite logarithmisch (gleichmäßiges Tempo),
// Mitte so, dass das Ziel ruhig ins Zentrum wandert
function zwischen(v0: ViewBox, v1: ViewBox, t: number): ViewBox {
  const w = v0[2] * Math.pow(v1[2] / v0[2], t);
  const h = v0[3] * Math.pow(v1[3] / v0[3], t);
  const k = v0[2] === v1[2] ? t : (w - v1[2]) / (v0[2] - v1[2]);
  const c0 = [v0[0] + v0[2] / 2, v0[1] + v0[3] / 2];
  const c1 = [v1[0] + v1[2] / 2, v1[1] + v1[3] / 2];
  const cx = c1[0] + (c0[0] - c1[0]) * k;
  const cy = c1[1] + (c0[1] - c1[1]) * k;
  return [cx - w / 2, cy - h / 2, w, h];
}

// Ein durchgehender Zoom von ganz Italien bis genau auf den Punkt Genazzano
// (Bildmitte = Genazzano), gleichmäßig – der Lageplan übernimmt das Tempo.
function kameraBei(p: number): ViewBox {
  const t = Math.min(Math.max((p - P.zoom[0]) / (P.zoom[1] - P.zoom[0]), 0), 1);
  const e = 1 - Math.pow(1 - t, 1.15);
  return zwischen(FAHRT.italien as ViewBox, FAHRT.genazzano as ViewBox, e);
}

function schoeneZahl(km: number) {
  const e = Math.pow(10, Math.floor(Math.log10(km)));
  const m = km / e;
  return (m >= 5 ? 5 : m >= 2 ? 2 : 1) * e;
}

// Diese Orte liegen links neben Genazzano – Beschriftung nach links, damit nichts überlappt
const LINKS = new Set(["Rom", "Palestrina"]);

/* ---------- Karte ---------- */
function Karte({ svgRef, statisch }: { svgRef: React.Ref<SVGSVGElement>; statisch?: ViewBox }) {
  const vb = statisch ?? (FAHRT.italien as ViewBox);
  return (
    <svg
      ref={svgRef}
      viewBox={vb.join(" ")}
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label="Karte von Italien mit Genazzano in Latium"
    >
      <rect x="-500" y="-500" width={ITALIEN.breite + 1000} height={ITALIEN.hoehe + 1000} className="fill-papier" />
      <path d={gradnetz} fill="none" className="stroke-linie" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
      <g className="ex-fern">
        <path d={land} className="fill-sand stroke-tinte" strokeWidth="0.8" vectorEffect="non-scaling-stroke" strokeLinejoin="round" fillRule="evenodd" />
        <path d={seen} className="fill-papier stroke-tinte" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
      </g>
      <g className="ex-nah" opacity={statisch ? 1 : 0}>
        <path d={landNah} className="fill-sand stroke-tinte" strokeWidth="0.9" vectorEffect="non-scaling-stroke" strokeLinejoin="round" fillRule="evenodd" />
        <path d={seenNah} className="fill-papier stroke-tinte" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
        <path d={regionenNah} fill="none" className="stroke-stein" strokeWidth="0.6" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
        <path d={fluesseNah} fill="none" stroke="#5b7fa8" strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
      </g>
      <path d={grenzen} fill="none" className="stroke-stein" strokeWidth="0.6" strokeDasharray="2 2.5" vectorEffect="non-scaling-stroke" />

      {/* Orte: werden beim Zoomen gegenskaliert, damit die Schrift gleich groß bleibt */}
      {ORTE.map((o) => (
        <g key={o.name} className={`ex-ort ex-ort-${o.ebene}`} data-x={o.x} data-y={o.y} transform={`translate(${o.x} ${o.y})`}>
          <circle r="2.6" className="fill-tinte" />
          <text
            x={LINKS.has(o.name) ? -6 : 6}
            y="4"
            textAnchor={LINKS.has(o.name) ? "end" : "start"}
            fontSize="11"
            className="fill-tinte font-mono"
          >
            {o.name}
          </text>
        </g>
      ))}

      {/* Genazzano */}
      <g className="ex-ziel" data-x={GENAZZANO.x} data-y={GENAZZANO.y} transform={`translate(${GENAZZANO.x} ${GENAZZANO.y})`}>
        <circle r="10" className="fill-papier stroke-route" strokeWidth="1.4" />
        <circle r="5" className="fill-route" />
        <text x="16" y="-2" fontSize="14" fontWeight="500" className="fill-tinte font-sans">
          Genazzano
        </text>
        <text x="16" y="13" fontSize="10" className="fill-grau font-mono">
          {GENAZZANO.koordinaten}
        </text>
      </g>
    </svg>
  );
}

/* ---------- Hauptkomponente ---------- */
export default function Expedition() {
  const [modus, setModus] = useState<"laden" | "scroll" | "statisch">("laden");

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
    const pruefen = () => setModus(mq.matches ? "scroll" : "statisch");
    pruefen();
    mq.addEventListener("change", pruefen);
    return () => mq.removeEventListener("change", pruefen);
  }, []);

  if (modus === "laden") return <div className="h-[calc(100svh-3.5rem)]" aria-hidden="true" />;
  return modus === "scroll" ? <ScrollFahrt /> : <Bildfolge />;
}

/* ---------- Desktop: Scroll-Fahrt ---------- */
function ScrollFahrt() {
  const bereich = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const modell = useRef<Modell3DSteuerung>(null);
  const plan = useRef<HTMLDivElement>(null);
  const planBild = useRef<HTMLDivElement>(null);
  const leinwand = useRef<HTMLDivElement>(null);
  const massstab = useRef<HTMLDivElement>(null);
  const massBalken = useRef<HTMLSpanElement>(null);
  const massText = useRef<HTMLSpanElement>(null);
  const texte = useRef<(HTMLDivElement | null)[]>([]);
  const hinweis = useRef<HTMLDivElement>(null);
  const stand = useRef(0);
  const [draufsicht, setDraufsicht] = useState(false);
  const [frei, setFrei] = useState(false);

  // Alles aus einem Wert p (0–1) ableiten. Die Fahrt endet bei ENDE der
  // Scrollstrecke; danach steht das fertige Modell noch eine Weile zum Drehen.
  const zeigen = (roh: number) => {
    stand.current = roh;
    const p = Math.min(roh / ENDE, 1);
    const s = svg.current;
    if (!s) return;
    const [x, y, w, h] = kameraBei(p);
    s.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);

    // Pixel pro Karteneinheit (bei „meet“ zählt die knappere Richtung)
    const B = s.clientWidth || 1;
    const H = s.clientHeight || 1;
    const eProPx = Math.max(w / B, h / H);

    // Fein aufgelöste Nahkarte überblenden
    // (Schwellen in km Bildbreite: ab ~560 km beginnt die Nahkarte, ab ~230 km ganz)
    const km = w * ITALIEN.kmProEinheit;
    const nah = 1 - glatt((km - 230) / (560 - 230));
    s.querySelector<SVGGElement>(".ex-nah")?.setAttribute("opacity", nah.toFixed(3));
    s.querySelector<SVGGElement>(".ex-fern")?.setAttribute("opacity", (1 - nah).toFixed(3));

    // Beschriftungen gegenskalieren und je nach Zoomstufe ein-/ausblenden;
    // sobald sich der Lageplan öffnet, treten alle Ortsnamen zurück
    const auf = anteil(p, P.plan);
    const fern = 1 - glatt((560 - km) / 220);
    s.querySelectorAll<SVGGElement>(".ex-ort, .ex-ziel").forEach((g) => {
      g.setAttribute("transform", `translate(${g.dataset.x} ${g.dataset.y}) scale(${eProPx})`);
      let o = 1 - auf;
      if (g.classList.contains("ex-ort-fern")) o *= fern;
      if (g.classList.contains("ex-ort-nah")) o *= 1 - fern;
      g.setAttribute("opacity", o.toFixed(3));
    });

    // Maßstabsleiste
    const kmPro100 = 100 * eProPx * ITALIEN.kmProEinheit;
    const strecke = schoeneZahl(kmPro100);
    if (massBalken.current) massBalken.current.style.width = `${(strecke / kmPro100) * 100}px`;
    if (massText.current) massText.current.textContent = strecke >= 1 ? `${strecke} km` : `${Math.round(strecke * 1000)} m`;

    // Lageplan: öffnet sich kreisförmig aus dem Punkt Genazzano …
    if (plan.current) {
      // weicher, runder Übergang statt harter Kreiskante – wie Eintauchen durch Dunst
      const r1 = auf * 135;
      const r0 = Math.max(0, r1 - 38);
      const maske = `radial-gradient(circle at 50% 50%, #000 ${r0.toFixed(2)}%, transparent ${r1.toFixed(2)}%)`;
      plan.current.style.maskImage = maske;
      plan.current.style.webkitMaskImage = maske;
      plan.current.style.filter = auf < 1 ? `blur(${((1 - auf) * 9).toFixed(2)}px)` : "none";
      plan.current.style.transform = `scale(${(1.07 - 0.07 * auf).toFixed(4)})`;
      plan.current.style.visibility = auf > 0.001 && p < P.wechsel[1] ? "visible" : "hidden";
    }
    // … und zoomt dann genau auf den Maßstab der 3D-Draufsicht. Dort liegt der
    // Plan in der 3D-Szene deckungsgleich – der Wechsel ist unsichtbar.
    const zielSkala = pxProEinheit(H) / PLAN_PX_PRO_EINHEIT / ((PLAN_HOEHE * H) / LAGEPLAN.h);
    const tz = Math.min(Math.max((p - P.planZoom[0]) / (P.planZoom[1] - P.planZoom[0]), 0), 1);
    const zoom = Math.pow(zielSkala, 1 - Math.pow(1 - tz, 1.6));
    if (planBild.current)
      planBild.current.style.transform = `translate(-${LAGEPLAN.nx * 100}%, -${LAGEPLAN.ny * 100}%) scale(${zoom.toFixed(4)})`;
    if (massstab.current) massstab.current.style.opacity = (1 - auf).toFixed(3);
    s.style.visibility = p < P.wechsel[1] ? "visible" : "hidden";

    // 3D: erscheint deckungsgleich, Modell wächst aus dem Grundriss, Kamera kippt
    const wechsel = anteil(p, P.wechsel);
    const m3 = modell.current;
    m3?.setWachstum(anteil(p, P.wachsen));
    m3?.setNeigung(anteil(p, P.neigen));
    const istFrei = p >= P.frei;
    m3?.setFrei(istFrei);
    setFrei(istFrei);
    if (leinwand.current) {
      leinwand.current.style.visibility = wechsel > 0.001 ? "visible" : "hidden";
      leinwand.current.style.opacity = wechsel.toFixed(3);
      leinwand.current.style.pointerEvents = istFrei ? "auto" : "none";
    }
    if (hinweis.current) hinweis.current.style.opacity = glatt((p - P.frei + 0.02) / 0.05).toFixed(3);

    // Bildunterschriften
    TEXTE.forEach((t, i) => {
      const el = texte.current[i];
      if (!el) return;
      const ein = glatt((p - t.von) / 0.04) * (1 - glatt((p - t.bis) / 0.04));
      el.style.opacity = ein.toFixed(3);
      el.style.transform = `translateY(${((1 - ein) * 14).toFixed(1)}px)`;
      el.style.visibility = ein > 0.01 ? "visible" : "hidden";
    });
  };

  useGSAP(
    () => {
      const wert = { p: 0 };
      zeigen(0);
      gsap.to(wert, {
        p: 1,
        ease: "none",
        onUpdate: () => zeigen(wert.p),
        scrollTrigger: {
          trigger: bereich.current,
          start: "top 56px",
          end: "+=560%",
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          onRefresh: () => zeigen(wert.p),
        },
      });
    },
    { scope: bereich },
  );

  return (
    <section
      ref={bereich}
      aria-label="Expedition nach Genazzano: von der Italienkarte bis zum 3D-Modell der Ruine"
      className="relative h-[calc(100svh-3.5rem)] overflow-hidden bg-papier"
    >
      <Karte svgRef={svg} />

      {/* Lageplan, Nymphäum in der Bildmitte */}
      <div ref={plan} className="invisible absolute inset-0 bg-white" style={{ maskImage: "radial-gradient(circle, #000 0%, transparent 0%)" }}>
        <div
          ref={planBild}
          className="absolute left-1/2 top-1/2 h-[230%]"
          style={{
            aspectRatio: `${LAGEPLAN.b} / ${LAGEPLAN.h}`,
            transformOrigin: `${LAGEPLAN.nx * 100}% ${LAGEPLAN.ny * 100}%`,
            transform: `translate(-${LAGEPLAN.nx * 100}%, -${LAGEPLAN.ny * 100}%)`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LAGEPLAN.src}
            alt="Lageplan von Genazzano mit dem Nymphäum am Fluss"
            className="absolute inset-0 h-full w-full"
            loading="lazy"
            decoding="async"
          />
          {/* Rund um das Nymphäum: hochaufgelöster Ausschnitt, damit der Zoom scharf bleibt */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={DETAIL.src}
            alt=""
            className="absolute"
            style={{
              left: `${(DETAIL.x0 / LAGEPLAN.b) * 100}%`,
              top: `${(DETAIL.y0 / LAGEPLAN.h) * 100}%`,
              width: `${(DETAIL.groesse / LAGEPLAN.b) * 100}%`,
              height: `${(DETAIL.groesse / LAGEPLAN.h) * 100}%`,
            }}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      {/* 3D-Modell */}
      <div ref={leinwand} className="invisible absolute inset-0 cursor-grab active:cursor-grabbing">
        <Modell3D
          ref={modell}
          src={MODELL}
          planSrc={DETAIL.src}
          className="h-full w-full"
          onBereit={() => zeigen(stand.current)}
          onAnsicht={setDraufsicht}
        />
      </div>

      {/* Rahmen: Titelzeile oben links, Maßstab unten rechts */}
      <div className="pointer-events-none absolute left-8 top-8 font-mono text-[11px] uppercase tracking-[0.2em] text-grau">
        Expedition · Genazzano
      </div>
      <div ref={massstab} className="pointer-events-none absolute bottom-8 right-8 flex flex-col items-end gap-1.5 font-mono text-[10px] text-grau">
        <span ref={massText}>100 km</span>
        <span ref={massBalken} className="block h-1 border border-tinte bg-[linear-gradient(90deg,var(--color-tinte)_50%,transparent_50%)]" />
      </div>

      {/* Bildunterschriften */}
      <div className="pointer-events-none absolute bottom-8 left-8 max-w-md">
        {TEXTE.map((t, i) => (
          <div
            key={t.titel}
            ref={(el) => {
              texte.current[i] = el;
            }}
            // Kein Kasten: Schrift steht frei, ein weicher Papier-Schein hält sie lesbar
            className="invisible absolute bottom-0 left-0 w-[min(28rem,80vw)] [text-shadow:0_0_6px_var(--color-papier),0_0_14px_var(--color-papier),0_0_24px_var(--color-papier)]"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-akzent">{t.kicker}</p>
            <p className="mt-2 text-3xl font-medium tracking-tight">{t.titel}</p>
            {t.text && <p className="mt-3 leading-relaxed text-tinte/80">{t.text}</p>}
          </div>
        ))}
      </div>

      {/* Hinweis zum Drehen + Rückweg auf den Grundriss */}
      <div ref={hinweis} className="absolute bottom-8 right-8 flex items-center gap-5 opacity-0">
        <span className="pointer-events-none flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-grau">
          <svg width="22" height="14" viewBox="0 0 22 14" fill="none" aria-hidden="true" className="stroke-current">
            <path d="M3 7c0-2.5 3.6-4.5 8-4.5s8 2 8 4.5-3.6 4.5-8 4.5" strokeWidth="1.2" />
            <path d="M8.5 9.5 11 11.5 8.5 13.5" strokeWidth="1.2" />
          </svg>
          Ziehen zum Drehen
        </span>
        <button
          type="button"
          disabled={!frei}
          onClick={() => modell.current?.fahreZu(draufsicht ? "schraeg" : "draufsicht")}
          className="border border-tinte/70 bg-papier/80 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors hover:border-akzent hover:text-akzent disabled:pointer-events-none"
        >
          {draufsicht ? "3D-Ansicht" : "Draufsicht"}
        </button>
      </div>
    </section>
  );
}

/* ---------- Mobil / Bewegung reduzieren: ruhige Bildfolge ---------- */
function Bildfolge() {
  const svg = useRef<SVGSVGElement>(null);
  const modell = useRef<Modell3DSteuerung>(null);
  const vb = FAHRT.latium as ViewBox;

  // Schrift der Orte auf Bildschirmgröße bringen (wie bei der Fahrt)
  useEffect(() => {
    const s = svg.current;
    if (!s) return;
    const anpassen = () => {
      const e = Math.max(vb[2] / (s.clientWidth || 1), vb[3] / (s.clientHeight || 1));
      s.querySelectorAll<SVGGElement>(".ex-ort, .ex-ziel").forEach((g) => {
        g.setAttribute("transform", `translate(${g.dataset.x} ${g.dataset.y}) scale(${e})`);
        if (g.classList.contains("ex-ort-fern")) g.setAttribute("opacity", "0");
      });
      s.querySelector(".ex-fern")?.setAttribute("opacity", "0");
    };
    anpassen();
    window.addEventListener("resize", anpassen);
    return () => window.removeEventListener("resize", anpassen);
  }, [vb]);

  const Unterschrift = ({ i }: { i: number }) => (
    <figcaption className="mt-4 px-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-akzent">{TEXTE[i].kicker}</p>
      <p className="mt-1 text-2xl font-medium tracking-tight">{TEXTE[i].titel}</p>
      {TEXTE[i].text && <p className="mt-2 leading-relaxed text-tinte/80">{TEXTE[i].text}</p>}
    </figcaption>
  );

  return (
    <section aria-label="Expedition nach Genazzano" className="space-y-16 py-16">
      <figure>
        <div className="relative aspect-[4/3] overflow-hidden border-y border-linie">
          <Karte svgRef={svg} statisch={vb} />
        </div>
        <Unterschrift i={1} />
      </figure>
      <figure>
        <div className="relative aspect-[4/3] overflow-hidden bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LAGEPLAN.src}
            alt="Lageplan von Genazzano mit dem Nymphäum am Fluss"
            className="absolute left-1/2 top-1/2 h-[200%] w-auto max-w-none"
            style={{ transform: `translate(-${LAGEPLAN.nx * 100}%, -${LAGEPLAN.ny * 100}%)` }}
            loading="lazy"
          />
        </div>
        <Unterschrift i={2} />
      </figure>
      <figure>
        <div className="relative aspect-[4/5] bg-papier">
          <Modell3D
            ref={modell}
            src={MODELL}
            planSrc={DETAIL.src}
            className="absolute inset-0"
            onBereit={() => {
              const m3 = modell.current;
              m3?.setWachstum(1);
              m3?.setNeigung(1);
              m3?.setFrei(true);
            }}
          />
        </div>
        <figcaption className="mt-4 px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-akzent">{TEXTE[3].kicker}</p>
          <p className="mt-1 text-2xl font-medium tracking-tight">{TEXTE[3].titel}</p>
          <p className="mt-2 text-grau">Mit dem Finger drehen.</p>
        </figcaption>
      </figure>
    </section>
  );
}
