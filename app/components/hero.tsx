import { person } from "../daten";

// Startbereich: Name, Beruf, Tagline, Intro und zwei Call-to-Actions
export default function Hero() {
  return (
    <section
      id="start"
      className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col justify-center px-4 py-20 md:px-8"
    >
      <p className="text-sm uppercase tracking-[0.3em] text-accent">{person.beruf}</p>
      <h1 className="mt-4 text-5xl font-light leading-tight md:text-8xl">
        {person.tagline}
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted">{person.intro}</p>

      <div className="mt-10 flex flex-wrap gap-4">
        <a
          href="#projekte"
          className="rounded-full bg-fg px-6 py-3 text-sm text-bg transition hover:bg-accent"
        >
          Projekte ansehen
        </a>
        <a
          href="#kontakt"
          className="rounded-full border border-fg px-6 py-3 text-sm transition hover:border-accent hover:text-accent"
        >
          Kontakt aufnehmen
        </a>
      </div>
    </section>
  );
}
