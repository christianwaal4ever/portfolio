import { ausbildung, skills, werdegang } from "../daten";

type Eintrag = { zeitraum: string; titel: string; ort: string; punkte: string[] };

// Eine Zeitleiste (wird für Werdegang und Ausbildung wiederverwendet)
function Zeitleiste({ titel, eintraege }: { titel: string; eintraege: Eintrag[] }) {
  return (
    <div>
      <h3 className="mb-8 text-sm uppercase tracking-[0.3em] text-accent">{titel}</h3>
      <ol className="space-y-10 border-l border-line pl-6">
        {eintraege.map((e) => (
          <li key={e.zeitraum + e.titel} className="relative">
            {/* Punkt auf der Linie */}
            <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
            <p className="text-sm text-muted">{e.zeitraum}</p>
            <h4 className="mt-1 text-lg">{e.titel}</h4>
            <p className="text-muted">{e.ort}</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {e.punkte.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Lebenslauf() {
  return (
    <section id="lebenslauf" className="border-y border-line bg-surface/50">
      <div className="mx-auto max-w-6xl px-4 py-24 md:px-8">
        <h2 className="text-3xl font-light md:text-5xl">Lebenslauf</h2>

        {/* Zwei Spalten ab Desktop, untereinander auf Mobil */}
        <div className="mt-12 grid gap-16 md:grid-cols-2">
          <Zeitleiste titel="Beruflicher Werdegang" eintraege={werdegang} />
          <Zeitleiste titel="Ausbildung" eintraege={ausbildung} />
        </div>

        {/* Optionale Skills */}
        {skills.length > 0 && (
          <div className="mt-16">
            <h3 className="mb-6 text-sm uppercase tracking-[0.3em] text-accent">Skills</h3>
            <ul className="flex flex-wrap gap-3">
              {skills.map((s) => (
                <li key={s} className="rounded-full border border-line bg-bg px-4 py-2 text-sm">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
