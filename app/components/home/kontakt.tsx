import { kontakt } from "../../daten";
import Masskette from "../masskette";

// Kontakt: E-Mail, Telefon, Adresse, LinkedIn (Link folgt)
export default function Kontakt() {
  const label = "font-mono text-xs uppercase tracking-[0.2em] text-grau";

  return (
    <section id="kontakt" className="mx-auto max-w-7xl px-4 py-24 md:px-8">
      <Masskette links="Kontakt" />
      <h2 className="mt-8 text-4xl font-medium md:text-6xl">Kontakt</h2>

      <dl className="mt-12 grid gap-10 text-lg sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className={label}>E-Mail</dt>
          <dd className="mt-2">
            <a href={`mailto:${kontakt.email}`} className="underline-offset-4 hover:text-akzent hover:underline">
              {kontakt.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className={label}>Telefon</dt>
          <dd className="mt-2">
            <a href={`tel:${kontakt.telefonLink}`} className="underline-offset-4 hover:text-akzent hover:underline">
              {kontakt.telefon}
            </a>
          </dd>
        </div>
        <div>
          <dt className={label}>Adresse</dt>
          <dd className="mt-2">
            {kontakt.adresse.map((zeile) => (
              <span key={zeile} className="block">
                {zeile}
              </span>
            ))}
          </dd>
        </div>
        <div>
          <dt className={label}>LinkedIn</dt>
          <dd className="mt-2">
            {kontakt.linkedin ? (
              <a
                href={kontakt.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:text-akzent hover:underline"
              >
                Profil ansehen ↗
              </a>
            ) : (
              <span className="text-grau">folgt</span>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}
