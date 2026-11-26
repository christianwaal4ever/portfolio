import type { Metadata } from "next";
import localFont from "next/font/local";
import { IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import "./globals.css";

// Signatur-Schrift (SIL Open Font License, liegt in app/fonts)
const chomsky = localFont({
  src: "./fonts/Chomsky.otf",
  variable: "--font-chomsky",
  display: "swap",
});

// Text- und Technikschrift: next/font lädt sie beim Bauen herunter und liefert
// sie von der eigenen Domain aus – Besucher laden nichts von Google.
const text = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-text",
  display: "swap",
});

const technik = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-technik",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Christian Waal – Portfolio 2026",
    template: "%s – Christian Waal",
  },
  description:
    "Portfolio von Christian Waal: Innenarchitektur, Bestand, Umnutzung und Ruinenforschung.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="de"
      // Die Klasse „js“ wird vor React gesetzt (siehe Skript unten) – gewollter Unterschied
      suppressHydrationWarning
      className={`${chomsky.variable} ${text.variable} ${technik.variable}`}
    >
      <head>
        {/* Markiert, dass JavaScript läuft – erst dann werden Elemente zum Einblenden versteckt */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
