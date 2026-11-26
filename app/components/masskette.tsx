// Maßkette im Stil einer technischen Zeichnung: feine Linie mit Endstrichen
// und einer Beschriftung (z. B. Abschnittsnummer). Dient als Trenn-/Rahmenelement.
export default function Masskette({
  links,
  rechts,
  className = "",
}: {
  links?: string;
  rechts?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.15em] text-grau ${className}`}
      aria-hidden="true"
    >
      {links && <span>{links}</span>}
      <span className="relative h-px flex-1 bg-tinte/40">
        {/* Endstriche wie bei einer Bemaßung */}
        <span className="absolute -top-1.5 left-0 h-3 w-px bg-tinte/60" />
        <span className="absolute -top-1.5 right-0 h-3 w-px bg-tinte/60" />
      </span>
      {/* rechte Beschriftung erst ab Tablet, damit die Linie mobil Platz hat */}
      {rechts && <span className="hidden sm:inline">{rechts}</span>}
    </div>
  );
}
