import type { Metadata } from "next";
import { kontakt, person } from "../../daten";

export const metadata: Metadata = { title: "Impressum" };

// Vorläufige Fassung – vor dem Launch von Christian prüfen lassen.
export default function Impressum() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 md:px-8">
      <h1 className="text-4xl font-medium md:text-5xl">Impressum</h1>
      <h2 className="mt-12 font-mono text-xs uppercase tracking-[0.2em] text-grau">
        Angaben gemäß § 5 DDG
      </h2>
      <p className="mt-3 text-lg leading-relaxed">
        {person.vorname} {person.nachname}
        <br />
        {kontakt.adresse.join(", ")}
      </p>
      <h2 className="mt-10 font-mono text-xs uppercase tracking-[0.2em] text-grau">Kontakt</h2>
      <p className="mt-3 text-lg leading-relaxed">
        Telefon: {kontakt.telefon}
        <br />
        E-Mail: {kontakt.email}
      </p>
    </div>
  );
}
