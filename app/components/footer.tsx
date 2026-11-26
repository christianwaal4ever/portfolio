import Link from "next/link";
import { person } from "../daten";

export default function Footer() {
  return (
    <footer className="border-t border-linie">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-8 font-mono text-xs text-grau md:px-8">
        <span>
          © {new Date().getFullYear()} {person.vorname} {person.nachname}
        </span>
        <nav aria-label="Rechtliches" className="flex gap-6">
          <Link href="/impressum" className="hover:text-akzent">
            Impressum
          </Link>
          <Link href="/datenschutz" className="hover:text-akzent">
            Datenschutz
          </Link>
        </nav>
      </div>
    </footer>
  );
}
