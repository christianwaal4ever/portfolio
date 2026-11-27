import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projektPerSlug, projekte, strecken, titelbilder } from "../../../daten";
import Masskette from "../../../components/masskette";
import Strecke from "../../../components/strecke";
import ProjektTitel from "../../../components/projekt-titel";
import NifeoExpedition from "../../../components/nifeo/laden";

/*
 * Vorlage für alle 5 Projektseiten (Konzept Abschnitt 7):
 * 1. Titelbild in voller Breite mit Nummer, Titel, Untertitel
 * 2. Steckbrief: Was · Wann · Mit wem · Prüfer – daneben der Projekttext
 * 3. Gestaltete Bildstrecke (Bausteine in app/daten.ts → strecken)
 * 4. Nächstes Projekt / Zurück zur Karte
 * NIFEO (F4) und Lebende Ruinen (F8) bekommen später ihr Sonder-Feature.
 */

// Alle 5 Seiten werden beim Bauen fertig erzeugt
export function generateStaticParams() {
  return projekte.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = projektPerSlug(slug);
  return p ? { title: `${p.nummer} ${p.titel}` } : {};
}

export default async function Projektseite({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = projektPerSlug(slug);
  if (!p) notFound();

  const titel = titelbilder[p.slug];
  const index = projekte.indexOf(p);
  const naechstes = projekte[index + 1];

  const steckbrief = [
    { label: "Was", wert: [p.was] },
    { label: "Wann", wert: [p.wann] },
    { label: "Mit wem", wert: [p.mitWem] },
    { label: "Prüfer", wert: p.pruefer },
  ];

  return (
    <article>
      {/* 1. Titelbild */}
      <ProjektTitel
        nummer={p.nummer}
        titel={p.titel}
        untertitel={p.untertitel}
        zeile={`${p.was} · ${p.ort}`}
        bild={titel}
      />

      {/* F4: Scroll-Expedition von Italien bis zum 3D-Modell (nur NIFEO) */}
      {p.slug === "01-kunstschule-nifeo" && <NifeoExpedition />}

      {/* 2. Steckbrief und Text als Doppelseite */}
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <Masskette links={`Projekt ${p.nummer}`} rechts={p.wann} />
        <div className="mt-12 grid gap-14 md:grid-cols-12">
          <dl className="space-y-6 md:col-span-4">
            {steckbrief.map((s) => (
              <div key={s.label} className="border-t border-linie pt-3">
                <dt className="font-mono text-xs uppercase tracking-[0.2em] text-grau">{s.label}</dt>
                {s.wert.map((w) => (
                  <dd key={w} className="mt-1.5">
                    {w}
                  </dd>
                ))}
              </div>
            ))}
          </dl>
          <div className="space-y-6 text-xl leading-relaxed md:col-span-7 md:col-start-6 md:text-2xl md:leading-relaxed">
            {p.text.map((absatz) => (
              <p key={absatz.slice(0, 24)}>{absatz}</p>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Bildstrecke */}
      <div className="pb-32 md:pb-48">
        <Strecke bloecke={strecken[p.slug] ?? []} nummer={p.nummer} />
      </div>

      {/* 4. Navigation zwischen den Projekten */}
      <nav aria-label="Projektnavigation" className="border-t border-linie">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-12 md:px-8">
          <Link href="/#karte" className="font-mono text-sm hover:text-akzent md:col-span-4">
            ← Zurück zur Karte
          </Link>
          {naechstes && (
            <Link
              href={`/projekte/${naechstes.slug}`}
              className="group grid grid-cols-[auto_1fr] items-end gap-6 md:col-span-8 md:col-start-5"
            >
              <div className="relative h-28 w-40 overflow-hidden md:h-36 md:w-56">
                <Image
                  src={titelbilder[naechstes.slug].src}
                  alt=""
                  fill
                  sizes="14rem"
                  className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                />
              </div>
              <span>
                <span className="block font-mono text-xs uppercase tracking-[0.2em] text-grau">Nächstes Projekt</span>
                <span className="mt-1 block text-3xl font-medium tracking-tight group-hover:text-akzent md:text-5xl">
                  {naechstes.nummer} {naechstes.titel} →
                </span>
              </span>
            </Link>
          )}
        </div>
      </nav>
    </article>
  );
}
