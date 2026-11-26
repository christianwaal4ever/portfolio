import Image from "next/image";
import { intro, lebenslauf, programme, softSkills, sprachen } from "../../daten";
import Masskette from "../masskette";

// F7 Vita: Intro-Text, Zeitstrahl, Skills & Tools
export default function Vita() {
  return (
    <section id="vita" className="border-y border-linie bg-sand/60">
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <Masskette links="Vita" rechts="Designer · Forscher · Abenteurer" />
        <h2 className="mt-8 text-4xl font-medium md:text-6xl">Vita</h2>

        {/* Intro-Text mit Foto (wie im PDF, Seite 2) */}
        <div className="mt-10 grid items-end gap-10 md:grid-cols-[1fr_minmax(0,22rem)] lg:grid-cols-[1fr_minmax(0,28rem)]">
          <div className="max-w-2xl space-y-4 self-center text-lg leading-relaxed">
            {intro.map((absatz) => (
              <p key={absatz.slice(0, 20)}>{absatz}</p>
            ))}
          </div>
          <Image
            src="/bilder/vita/christian.png"
            alt="Christian Waal sitzt auf den Stufen eines Tempels"
            width={1600}
            height={1780}
            sizes="(min-width: 1024px) 28rem, (min-width: 768px) 22rem, 90vw"
            className="mx-auto h-auto w-full max-w-sm md:max-w-none"
          />
        </div>

        {/* Zeitstrahl: mobil senkrecht, ab Desktop waagerecht mit Pfeil */}
        <h3 className="mt-20 font-mono text-xs uppercase tracking-[0.2em] text-grau">
          Lebenslauf
        </h3>
        <ol className="relative mt-8 border-l border-tinte pl-6 lg:grid lg:grid-cols-7 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-0">
          {/* Pfeilspitze am Ende der Zeitachse (Desktop) */}
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-[5px] hidden h-2.5 w-2.5 rotate-45 border-r border-t border-tinte lg:block"
          />
          {/* Startpunkt */}
          <span
            aria-hidden="true"
            className="absolute -left-[5px] -top-[5px] hidden h-2.5 w-2.5 rounded-full bg-tinte lg:block"
          />
          {lebenslauf.map((e, i) => (
            <li key={e.titel} className="relative pb-8 lg:pb-0 lg:pr-4">
              {/* Markierung: mobil Punkt links, Desktop Lotstrich nach unten
                  (abwechselnd kurz/lang wie im PDF) */}
              <span
                aria-hidden="true"
                className="absolute -left-[29px] top-1.5 h-2 w-2 rounded-full bg-tinte lg:hidden"
              />
              <span
                aria-hidden="true"
                className={`absolute left-0 top-0 hidden w-px bg-tinte lg:block ${i % 2 ? "h-20" : "h-8"}`}
              />
              <div className={`lg:pl-3 ${i % 2 ? "lg:pt-22" : "lg:pt-10"}`}>
                <p className="font-medium leading-snug">{e.titel}</p>
                <p className="text-sm text-grau">{e.ort}</p>
                <p className="mt-1 font-mono text-xs">{e.zeit}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Skills & Tools */}
        <h3 className="mt-24 font-mono text-xs uppercase tracking-[0.2em] text-grau">
          Skills &amp; Tools
        </h3>
        <div className="mt-8 grid gap-12 md:grid-cols-2">
          <Liste titel="Soft Skills" eintraege={softSkills} />
          <Liste titel="Sprachen" eintraege={sprachen} />
        </div>

        {/* Programmkenntnisse: Icon, Name, Balken für das Können */}
        <h4 className="mt-16 font-medium">Programmkenntnisse</h4>
        <ul className="mt-6 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {programme.map((p) => (
            <li key={p.name} className="flex flex-col items-center text-center">
              <Image src={p.icon} alt="" width={48} height={48} className="h-12 w-12 object-contain" />
              <span
                role="meter"
                aria-label={`Können in ${p.name}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(p.koennen * 100)}
                className="mt-4 block h-2 w-24 border border-tinte bg-papier"
              >
                <span className="block h-full bg-tinte" style={{ width: `${p.koennen * 100}%` }} />
              </span>
              <span className="mt-2 text-sm">{p.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Liste({ titel, eintraege }: { titel: string; eintraege: string[] }) {
  return (
    <div>
      <h4 className="font-medium">{titel}</h4>
      <ul className="mt-4 space-y-1.5">
        {eintraege.map((e) => (
          <li key={e} className="flex gap-3">
            <span className="text-akzent" aria-hidden="true">
              —
            </span>
            {e}
          </li>
        ))}
      </ul>
    </div>
  );
}
