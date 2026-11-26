import Image from "next/image";
import Link from "next/link";
import { projekte, titelbilder } from "../../daten";
import Masskette from "../masskette";

/*
 * F2 Expeditionskarte – bis Etappe 5: die 5 Stationen als Liste.
 * Die Karte mit roter Route kommt in Etappe 5. Die Liste bleibt danach
 * als kompakte Mobil-Ansicht unter der Karte bestehen.
 */
export default function Karte() {
  return (
    <section id="karte" className="mx-auto max-w-7xl px-4 py-24 md:px-8">
      <Masskette links="Projekte" rechts="01 — 05" />
      <h2 className="mt-8 text-4xl font-medium md:text-6xl">Projekte</h2>
      <p className="mt-2 text-lg text-grau">Von Bachelor bis Master</p>

      <ol className="mt-14 grid gap-px border border-linie bg-linie sm:grid-cols-2 lg:grid-cols-5">
        {projekte.map((p) => (
          <li key={p.slug} className="bg-papier">
            <Link
              href={`/projekte/${p.slug}`}
              className="group flex h-full flex-col transition-colors hover:bg-sand focus-visible:bg-sand"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-sand">
                <Image
                  src={titelbilder[p.slug].src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <span className="text-5xl font-semibold leading-none group-hover:text-akzent">{p.nummer}</span>
                <span className="mt-5 text-lg font-medium">{p.titel}</span>
                <span className="text-sm text-grau">{p.untertitel}</span>
                <span className="mt-auto pt-6 font-mono text-xs text-grau">
                  <span className="text-akzent">●</span> {p.ort}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
