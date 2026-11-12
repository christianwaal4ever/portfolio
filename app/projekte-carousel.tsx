"use client";

import { useRef } from "react";

const projekte = [
  { titel: "Loft Berlin", seed: "loft" },
  { titel: "Villa am See", seed: "villa" },
  { titel: "Café Linde", seed: "cafe" },
  { titel: "Penthouse Hamburg", seed: "penthouse" },
  { titel: "Atelier Nord", seed: "atelier" },
  { titel: "Hotel Alpenblick", seed: "hotel" },
];

export default function ProjekteCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (richtung: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: richtung * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="py-16">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="text-3xl font-light md:text-5xl">Projekte</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll(-1)}
            aria-label="Zurück"
            className="h-10 w-10 rounded-full border border-current transition hover:bg-[var(--foreground)] hover:text-[var(--background)]"
          >
            ←
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Weiter"
            className="h-10 w-10 rounded-full border border-current transition hover:bg-[var(--foreground)] hover:text-[var(--background)]"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="-mx-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-8 pb-4 md:-mx-16 md:px-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {projekte.map((p) => (
          <figure
            key={p.seed}
            className="w-[80%] shrink-0 snap-start md:w-[40%] lg:w-[30%]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://picsum.photos/seed/${p.seed}/800/1000`}
              alt={p.titel}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
            <figcaption className="mt-3 text-sm uppercase tracking-[0.2em]">
              {p.titel}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
