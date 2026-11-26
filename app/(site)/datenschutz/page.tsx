import type { Metadata } from "next";

export const metadata: Metadata = { title: "Datenschutz" };

// Platzhalter – die vollständige Datenschutzerklärung kommt in Etappe 3.
export default function Datenschutz() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 md:px-8">
      <h1 className="text-4xl font-medium md:text-5xl">Datenschutzerklärung</h1>
      <p className="mt-8 text-lg text-grau">Die Datenschutzerklärung folgt.</p>
    </div>
  );
}
