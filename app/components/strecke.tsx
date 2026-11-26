import Image from "next/image";
import type { Bild, Block } from "../daten";
import masse from "../bilder-masse.json";
import Masskette from "./masskette";

const groessen: Record<string, number[]> = masse;

/*
 * Setzt die Bausteine einer Projektseite (siehe Block in app/daten.ts)
 * auf ein 12-Spalten-Raster. Bilder werden fortlaufend als „Abb. 01, 02 …“
 * nummeriert. Elemente mit data-erscheinen blenden beim Scrollen ein,
 * data-parallax bewegt Vollbilder leicht (siehe components/animationen.tsx).
 */
export default function Strecke({ bloecke, nummer }: { bloecke: Block[]; nummer: string }) {
  let abb = 0;
  let kapitel = 0;
  const naechste = () => ++abb;

  return (
    <div className="space-y-28 md:space-y-40">
      {bloecke.map((b, i) => {
        switch (b.typ) {
          case "kapitel":
            kapitel++;
            return <Kapitel key={i} titel={b.titel} zeile={b.zeile} nr={`${nummer}.${kapitel}`} />;
          case "vollbild":
            return <Vollbild key={i} bild={b.bild} nr={naechste()} />;
          case "bild":
            return (
              <Raster key={i}>
                <Abbildung
                  bild={b.bild}
                  nr={naechste()}
                  className={BILD_SPALTEN[`${b.lage}-${b.groesse}`]}
                  sizes={b.groesse === "gross" ? "(min-width: 768px) 80vw, 100vw" : "(min-width: 768px) 60vw, 100vw"}
                />
              </Raster>
            );
          case "paar": {
            const [sa, sb] = PAAR_SPALTEN[b.aufteilung];
            const na = naechste();
            const nb = naechste();
            return (
              <Raster key={i} className="items-start">
                <Abbildung bild={b.a} nr={na} className={sa} sizes="(min-width: 768px) 60vw, 100vw" />
                <Abbildung
                  bild={b.b}
                  nr={nb}
                  className={`${sb} ${b.versatz ? "md:mt-40" : ""}`}
                  sizes="(min-width: 768px) 45vw, 100vw"
                />
              </Raster>
            );
          }
          case "trio":
            return (
              <Raster key={i} className="items-end">
                {b.bilder.map((bild) => (
                  <Abbildung key={bild.src} bild={bild} nr={naechste()} className="md:col-span-4" sizes="(min-width: 768px) 33vw, 100vw" ohneRahmen />
                ))}
              </Raster>
            );
          case "collage": {
            const n1 = naechste();
            const n2 = naechste();
            const n3 = naechste();
            return (
              <Raster key={i} className="items-start">
                <Abbildung bild={b.gross} nr={n1} className="md:col-span-6" sizes="(min-width: 768px) 50vw, 100vw" />
                <Abbildung bild={b.oben} nr={n2} className="md:col-span-3" sizes="(min-width: 768px) 25vw, 100vw" />
                <Abbildung bild={b.unten} nr={n3} className="md:col-span-3 md:mt-28" sizes="(min-width: 768px) 25vw, 100vw" />
                {b.text && (
                  <p data-erscheinen className="text-2xl leading-snug md:col-span-5 md:col-start-2 md:text-3xl">
                    {b.text}
                  </p>
                )}
              </Raster>
            );
          }
          case "worte":
            return (
              <div key={i} data-erscheinen className="mx-auto max-w-7xl px-4 md:px-8">
                {/* Trennpunkt hängt am Wort davor, damit er nie am Zeilenanfang steht */}
                <p className="flex flex-wrap items-baseline justify-center gap-x-5 gap-y-1 text-center text-4xl font-light tracking-tight sm:text-5xl md:gap-x-10 md:text-6xl lg:text-7xl">
                  {b.worte.map((w, k) => (
                    <span key={w} className="whitespace-nowrap">
                      {w}
                      {k < b.worte.length - 1 && (
                        <span className="ml-5 text-akzent md:ml-10" aria-hidden="true">
                          ·
                        </span>
                      )}
                    </span>
                  ))}
                </p>
                {b.quelle && (
                  <p className="mt-6 text-center font-mono text-xs uppercase tracking-[0.2em] text-grau">{b.quelle}</p>
                )}
              </div>
            );
          case "kontrast":
            return (
              <div key={i} data-erscheinen className="mx-auto grid max-w-4xl grid-cols-2 px-4 md:px-8">
                {[b.links, b.rechts].map((seite, k) => (
                  <div key={seite.titel} className={k === 0 ? "border-r border-tinte pr-6 text-right md:pr-12" : "pl-6 md:pl-12"}>
                    <p className={`font-mono text-xs uppercase tracking-[0.2em] ${k === 0 ? "text-grau" : "text-akzent"}`}>
                      {seite.titel}
                    </p>
                    <ul className="mt-4 space-y-1 text-3xl font-light md:text-5xl">
                      {seite.worte.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            );
          case "zitat":
            return (
              <figure key={i} data-erscheinen className="mx-auto max-w-5xl px-4 md:px-8">
                <blockquote className="text-3xl font-light leading-tight tracking-tight md:text-5xl">
                  <span className="text-akzent">„</span>
                  {b.text}
                  <span className="text-akzent">“</span>
                </blockquote>
                <figcaption className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-grau">{b.quelle}</figcaption>
              </figure>
            );
        }
      })}
    </div>
  );
}

// ---------- Raster-Klassen (fest ausgeschrieben, damit Tailwind sie erkennt) ----------
const BILD_SPALTEN: Record<string, string> = {
  "links-gross": "md:col-span-10 md:col-start-1",
  "mitte-gross": "md:col-span-10 md:col-start-2",
  "rechts-gross": "md:col-span-10 md:col-start-3",
  "links-mittel": "md:col-span-8 md:col-start-1",
  "mitte-mittel": "md:col-span-8 md:col-start-3",
  "rechts-mittel": "md:col-span-8 md:col-start-5",
  "links-klein": "md:col-span-6 md:col-start-1",
  "mitte-klein": "md:col-span-6 md:col-start-4",
  "rechts-klein": "md:col-span-6 md:col-start-7",
};

const PAAR_SPALTEN: Record<string, [string, string]> = {
  "7-5": ["md:col-span-7", "md:col-span-5"],
  "5-7": ["md:col-span-5", "md:col-span-7"],
  "8-4": ["md:col-span-8", "md:col-span-4"],
  "4-8": ["md:col-span-4", "md:col-span-8"],
  "6-6": ["md:col-span-6", "md:col-span-6"],
};

function Raster({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mx-auto grid max-w-7xl gap-x-6 gap-y-16 px-4 md:grid-cols-12 md:gap-x-8 md:px-8 ${className}`}>
      {children}
    </div>
  );
}

function Kapitel({ titel, zeile, nr }: { titel: string; zeile?: string; nr: string }) {
  return (
    <div data-erscheinen className="mx-auto max-w-7xl px-4 md:px-8">
      <Masskette links={nr} />
      <h2 className="mt-8 text-4xl font-medium tracking-tight md:text-6xl">{titel}</h2>
      {zeile && <p className="mt-3 font-mono text-sm text-grau">{zeile}</p>}
    </div>
  );
}

function Bildunterschrift({ bild, nr }: { bild: Bild; nr: number }) {
  return (
    <figcaption className="mt-3 flex gap-3 font-mono text-xs leading-relaxed text-grau">
      <span className="shrink-0 text-akzent">Abb. {String(nr).padStart(2, "0")}</span>
      {bild.text && <span>{bild.text}</span>}
    </figcaption>
  );
}

function Abbildung({
  bild,
  nr,
  className = "",
  sizes,
  ohneRahmen = false,
}: {
  bild: Bild;
  nr: number;
  className?: string;
  sizes: string;
  ohneRahmen?: boolean;
}) {
  const [w, h] = groessen[bild.src] ?? [1600, 1000];
  // Pläne liegen auf einem weißen Blatt mit Passermarken an den Ecken
  const blatt = bild.art === "plan" && !ohneRahmen;
  return (
    <figure data-erscheinen className={className}>
      <div className={blatt ? "blatt relative border border-linie bg-white p-5 md:p-10" : ""}>
        <Image
          src={bild.src}
          alt={bild.alt}
          width={w}
          height={h}
          sizes={sizes}
          className={`mx-auto h-auto w-full ${bild.art !== "foto" ? "max-h-[80svh] object-contain" : ""}`}
        />
      </div>
      <Bildunterschrift bild={bild} nr={nr} />
    </figure>
  );
}

function Vollbild({ bild, nr }: { bild: Bild; nr: number }) {
  return (
    <figure>
      <div className="relative h-[60svh] overflow-hidden md:h-[88svh]">
        <Image
          data-parallax
          src={bild.src}
          alt={bild.alt}
          fill
          sizes="100vw"
          className="scale-110 object-cover"
        />
      </div>
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <Bildunterschrift bild={bild} nr={nr} />
      </div>
    </figure>
  );
}
