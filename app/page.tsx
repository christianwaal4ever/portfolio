import Header from "./components/header";
import Hero from "./components/hero";
import Projekte from "./components/projekte";
import Lebenslauf from "./components/lebenslauf";
import Kontakt from "./components/kontakt";
import { person } from "./daten";

// Single-Page-Aufbau: Reihenfolge der Sections hier festlegen
export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Projekte />
        <Lebenslauf />
        <Kontakt />
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted md:px-8">
          © {new Date().getFullYear()} {person.name}
        </div>
      </footer>
    </>
  );
}
