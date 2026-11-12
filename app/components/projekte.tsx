import { projekte } from "../daten";

// Kartenraster: 1 Spalte mobil, 2 auf Tablet, 3 auf Desktop
export default function Projekte() {
  return (
    <section id="projekte" className="mx-auto max-w-6xl px-4 py-24 md:px-8">
      <h2 className="text-3xl font-light md:text-5xl">Projekte</h2>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {projekte.map((p) => (
          <article
            key={p.titel}
            className="group flex flex-col overflow-hidden rounded-lg border border-line bg-bg"
          >
            {/* Projektbild – ohne eigenes Bild wird ein Platzhalter geladen */}
            <div className="aspect-[4/3] overflow-hidden bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.bild || `https://picsum.photos/seed/${encodeURIComponent(p.titel)}/800/600`}
                alt={p.titel}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>

            <div className="flex flex-1 flex-col p-6">
              <h3 className="text-xl">{p.titel}</h3>
              <p className="mt-2 flex-1 text-muted">{p.beschreibung}</p>

              {/* Eingesetzte Tools */}
              <ul className="mt-4 flex flex-wrap gap-2">
                {p.tools.map((t) => (
                  <li key={t} className="rounded-full bg-surface px-3 py-1 text-xs">
                    {t}
                  </li>
                ))}
              </ul>

              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 text-sm text-accent hover:underline"
              >
                Zum Projekt →
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
