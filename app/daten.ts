/**
 * ============================================================
 *  ALLE INHALTE DER WEBSITE
 *  Texte, Projekte, Vita und Kontakt stehen nur hier.
 *  Quelle: PDF-Portfolio, Konzept vom 26.11.2026 und Christians
 *  Korrekturen. Nichts dazuerfinden.
 * ============================================================
 */

// ---------- Person ----------
export const person = {
  vorname: "Christian",
  nachname: "Waal",
  untertitel: "Portfolio 2026",
};

// ---------- Projekte (Reihenfolge 01–05 wie im PDF, nicht umsortieren) ----------
export type Projekt = {
  slug: string; // Teil der Adresse: /projekte/<slug>
  nummer: string;
  titel: string;
  untertitel: string;
  ort: string; // Station auf der Expeditionskarte
  was: string;
  wann: string;
  mitWem: string;
  pruefer: string[];
  text: string[]; // ein Eintrag = ein Absatz
};

export const projekte: Projekt[] = [
  {
    slug: "01-kunstschule-nifeo",
    nummer: "01",
    titel: "Kunstschule NIFEO",
    untertitel: "Revitalisierung einer Ruine",
    ort: "Genazzano, Italien",
    was: "Bachelorarbeit",
    wann: "2025 (8. Semester)",
    mitWem: "Einzelarbeit",
    pruefer: ["Prof. André Nakonz"],
    text: [
      "Zwischen jahrhundertealten Mauern und wucherndem Grün der italienischen Kleinstadt Genazzano erwacht das vergessene Nymphaeum des Bramante zu neuem Leben. Für die Recherchephase dieses Projekts bin ich persönlich zum Objekt gereist, um den Bestand vor Ort zu erforschen, zu dokumentieren und zu vermessen.",
      "Die Kunstschule Nifeo versteht sich als sommerlich geöffnete Freilichtschule für kreative Entfaltung – offen für die Bewohner Genazzanos und der umliegenden Gemeinden. Der Entwurf revitalisiert die Ruinen mit Respekt und Zurückhaltung und schafft einen Ort der Gemeinschaft, der das kulturelle Selbstverständnis der Stadt stärkt. Aus den Ruinen wird ein neuer Möglichkeitsraum: Der Kreativort macht Genazzano zur Kreativstadt.",
    ],
  },
  {
    slug: "02-berber-hut",
    nummer: "02",
    titel: "Berber Hut",
    untertitel: "Raststätte der Wüste",
    ort: "Erg Chebbi bei Merzouga, Marokko",
    was: "Kurzzeitentwurf",
    wann: "2024 (7. Semester)",
    mitWem: "Einzelarbeit",
    pruefer: ["Prof. Dipl.-Ing. Bernd Rokahr"],
    text: [
      "Innerhalb von drei Tagen entstand dieser Entwurf eines Pavillons für Reisende und Einheimische der marokkanischen Wüste. Die Raststätte wurde sowohl in ihrer Form als auch in ihrer Funktion von einem Tannenzapfen inspiriert, wie er im Norden Marokkos zu finden ist.",
    ],
  },
  {
    slug: "03-nature-enjoyer-village",
    nummer: "03",
    titel: "Nature Enjoyer Village",
    untertitel: "Bestandssanierung in Bremerhaven",
    ort: "Bremerhaven",
    was: "Entwurfsprojekt",
    wann: "2023 (4. Semester)",
    mitWem: "Einzelarbeit",
    pruefer: ["Prof.in Tatjana Sabljo"],
    text: [
      "In diesem Projekt wurden vier Wohngebäude aus den 1960er Jahren saniert – mit Fokus auf eine ergänzende und nachhaltig prägende Fassadengestaltung.",
    ],
  },
  {
    slug: "04-shapeshifter-x3",
    nummer: "04",
    titel: "Shapeshifter X3",
    untertitel: "Verkaufsmöbel für Balenciaga",
    ort: "Hannover",
    was: "Entwurfsprojekt",
    wann: "2024 (6. Semester)",
    mitWem: "Simonne Joffroy (Kommilitonin)",
    pruefer: ["Prof. André Nakonz"],
    text: [
      "Das Möbelstück ist so konzipiert, dass es zu 100 % aus lösbaren Verbindungen besteht. Kern dieses Konzepts ist ein einzigartiges Verbindungselement, das vielfältig einsetzbar ist und somit Variationen des Möbels ermöglicht, die über einen Entwurf hinausgehen.",
      "Ein weiterer Teil dieses Entwurfs bestand darin, einen Prototypen unseres Möbels im Maßstab 1:1 nachzubauen.",
    ],
  },
  {
    slug: "05-lebende-ruinen",
    nummer: "05",
    titel: "Lebende Ruinen",
    untertitel: "Ästhetik des Verfalls",
    ort: "Sorge, Harz",
    was: "Masterarbeit",
    wann: "2026 (2. Semester)",
    mitWem: "Einzelarbeit",
    pruefer: [
      "Erstprüfer: Prof. Dr. Friedrich Weltzien",
      "Zweitprüferin: Prof.in Dipl.-Ing.in Anke Bertram",
    ],
    text: [
      "In meiner Masterarbeit Lebende Ruinen habe ich gefragt: Welche ästhetischen und atmosphärischen Qualitäten entstehen aus dem Spannungsfeld zwischen menschlicher Architektur und natürlichen Prozessen? Die Antworten habe ich auf zwei Wegen gesucht, einmal über Literatur und wissenschaftliche Theorie, einmal über praktische Feldforschung an der Stecklenburg und der ehemaligen Lungenheilanstalt in Sorge.",
      "Im Praxisteil habe ich versucht, diese Qualitäten in ein experimentelles architektonisches Modell zu übersetzen. Mir ging es darum zu zeigen, dass moderne Architektur diese Faszination in sich tragen kann, ohne dafür wie eine Ruine aussehen zu müssen. Das Modell ist kein fertiger Entwurf, sondern ein Impuls, in welche Richtung sich das Projekt weiterführen lässt.",
    ],
  },
];

export function projektPerSlug(slug: string) {
  return projekte.find((p) => p.slug === slug);
}

// ---------- Bilder und Layout der Projektseiten ----------
// Die Bilddateien erzeugt werkzeuge/bilder.py aus portfolio_material/.
// portfolio_material/ ist eine Bibliothek: hier steht nur die bewusste Auswahl.
// Bildunterschriften (text) stammen aus dem PDF-Portfolio, der Doku oder der Thesis.
//
// art:  "foto" = Rendering/Foto (randlos)
//       "plan" = Zeichnung auf weißem Blatt
//       "frei" = freigestellte Skizze/Grafik ohne Hintergrund
export type Bild = {
  src: string;
  alt: string;
  text?: string;
  art: "foto" | "plan" | "frei";
};

/*
 * Bausteine einer Projektseite („Strecke“), von oben nach unten:
 *  kapitel  – Zwischenüberschrift mit Nummer, optional kurze Zeile darunter
 *  vollbild – Bild über die ganze Bildschirmbreite (leichter Parallax-Effekt)
 *  bild     – einzelnes Bild; lage: links | mitte | rechts, groesse: klein | mittel | gross
 *  paar     – zwei Bilder nebeneinander; aufteilung z. B. "7-5"; versatz = rechtes Bild tiefer
 *  trio     – drei Bilder in einer Reihe (gleich groß)
 *  collage  – ein großes Bild links, zwei kleinere rechts gestaffelt
 *  worte    – große Begriffe als typografischer Moment
 *  kontrast – zwei Spalten mit Gegensatzpaaren (z. B. Alt / Neu)
 *  zitat    – großes Zitat mit Quelle
 */
export type Block =
  | { typ: "kapitel"; titel: string; zeile?: string }
  | { typ: "vollbild"; bild: Bild }
  | { typ: "bild"; bild: Bild; lage: "links" | "mitte" | "rechts"; groesse: "klein" | "mittel" | "gross" }
  | { typ: "paar"; a: Bild; b: Bild; aufteilung: "7-5" | "5-7" | "8-4" | "4-8" | "6-6"; versatz?: boolean }
  | { typ: "trio"; bilder: [Bild, Bild, Bild] }
  | { typ: "collage"; gross: Bild; oben: Bild; unten: Bild; text?: string }
  | { typ: "worte"; worte: string[]; quelle?: string }
  | { typ: "kontrast"; links: { titel: string; worte: string[] }; rechts: { titel: string; worte: string[] } }
  | { typ: "zitat"; text: string; quelle: string };

// Titelbild jeder Projektseite (wie auf den Titelseiten im PDF).
// hell: true = helles Bild, Schrift wird dunkel gesetzt.
export const titelbilder: Record<string, { src: string; alt: string; hell?: boolean }> = {
  "01-kunstschule-nifeo": { src: "/bilder/01/blick-auf-die-kunstschule.jpg", alt: "Rendering der Kunstschule Nifeo in der Ruine des Nymphäums" },
  "02-berber-hut": { src: "/bilder/02/titel.jpg", alt: "Visualisierung der Berber Hut in der Wüste" },
  "03-nature-enjoyer-village": { src: "/bilder/03/titel.jpg", alt: "Visualisierung der sanierten Wohngebäude mit Holzfassade" },
  "04-shapeshifter-x3": { src: "/bilder/04/titel.jpg", alt: "Visualisierung des Möbels Shapeshifter X3 in einem Verkaufsraum" },
  "05-lebende-ruinen": { src: "/bilder/05/titel.jpg", alt: "Buddha-Kopf, umwachsen von Baumwurzeln", hell: true },
};

export const strecken: Record<string, Block[]> = {
  // ===================== 01 Kunstschule NIFEO =====================
  "01-kunstschule-nifeo": [
    { typ: "kapitel", titel: "Recherche vor Ort", zeile: "Genazzano, Latium · rund 58 km östlich von Rom" },
    {
      typ: "collage",
      gross: { src: "/bilder/01/vor-ort-1.jpg", alt: "Christian vermisst die Innenwand des Nymphäums mit einem Maßband", art: "foto" },
      oben: { src: "/bilder/01/vor-ort-2.jpg", alt: "Christian vermisst einen Pfeiler der Ruine", art: "foto" },
      unten: { src: "/bilder/01/vor-ort-3.jpg", alt: "Christian misst mit einem Laser-Entfernungsmesser an der bemoosten Mauer", art: "foto" },
      text: "Den Bestand vor Ort erforschen, dokumentieren und vermessen.",
    },
    {
      typ: "paar",
      a: { src: "/bilder/01/lageplan.jpg", alt: "Lageplan von Genazzano mit dem Nymphäum am Fluss", text: "Lage & Ort", art: "plan" },
      b: { src: "/bilder/01/italien.jpg", alt: "Karte von Italien mit Rom und Genazzano", art: "plan" },
      aufteilung: "7-5",
      versatz: true,
    },
    {
      typ: "paar",
      a: { src: "/bilder/01/iso-bestand.jpg", alt: "Isometrie des Bestands, des Nymphäums von Bramante", text: "Bestand – das Nymphäum des Bramante, Anfang 16. Jahrhundert", art: "plan" },
      b: { src: "/bilder/01/besonderheiten.png", alt: "Skizzen von Serliana, Okuli und Säule", text: "Serliana · Okuli · Toskanisch-Dorische Säulen", art: "frei" },
      aufteilung: "8-4",
    },
    { typ: "vollbild", bild: { src: "/bilder/01/titel.jpg", alt: "Moosbewachsener Durchgang in der Ruine", art: "foto" } },
    { typ: "kapitel", titel: "Entwurf", zeile: "Ruine im grünen Tal" },
    { typ: "worte", worte: ["ruhig", "geheimnisvoll", "poetisch"], quelle: "Atmosphäre" },
    {
      typ: "kontrast",
      links: { titel: "Alt", worte: ["schwer", "opak", "rund"] },
      rechts: { titel: "Neu", worte: ["leicht", "transparent", "eckig"] },
    },
    {
      typ: "paar",
      a: { src: "/bilder/01/architektonische-idee.png", alt: "Skizzen zur architektonischen Idee: Staffelei und Leinwand", text: "Architektonische Idee", art: "frei" },
      b: { src: "/bilder/01/aufbau-elemente.jpg", alt: "Explosionsisometrie: Cubus, Sonnenschutz, Podeste und Möbel", text: "Aufbau & Elemente: Cubus · Podeste und Möbel · Sonnenschutz", art: "plan" },
      aufteilung: "5-7",
      versatz: true,
    },
    { typ: "vollbild", bild: { src: "/bilder/01/aula-cubus.jpg", alt: "Rendering: Blick aus der Aula auf den Cubus", text: "Blick aus der Aula auf den Cubus (Lager)", art: "foto" } },
    { typ: "bild", bild: { src: "/bilder/01/grundriss-eg.jpg", alt: "Grundriss Erdgeschoss mit Atrium, Aula, Galerie, Rotonda und Cubus", text: "Grundriss EG", art: "plan" }, lage: "mitte", groesse: "gross" },
    { typ: "bild", bild: { src: "/bilder/01/ansicht-01.jpg", alt: "Ansicht der Kunstschule", text: "Ansicht 01", art: "plan" }, lage: "rechts", groesse: "gross" },
    { typ: "kapitel", titel: "Vertiefung", zeile: "Konstruktion des Cubus" },
    {
      typ: "paar",
      a: { src: "/bilder/01/cubus-og-innen.jpg", alt: "Rendering des Obergeschosses im Cubus", text: "Cubus OG Innen", art: "foto" },
      b: { src: "/bilder/01/verbindung.png", alt: "Skizze der Holzverbindung", text: "Massivholz Kastanie, 20 × 20 cm", art: "frei" },
      aufteilung: "8-4",
      versatz: true,
    },
    { typ: "bild", bild: { src: "/bilder/01/schnitte.jpg", alt: "Schnitte durch den Cubus", text: "Schnitte 1:50", art: "plan" }, lage: "links", groesse: "gross" },
  ],

  // ===================== 02 Berber Hut =====================
  "02-berber-hut": [
    { typ: "kapitel", titel: "Inspiration", zeile: "Ein Tannenzapfen aus dem Norden Marokkos" },
    {
      typ: "paar",
      a: { src: "/bilder/02/tannenzapfen.jpg", alt: "Tannenzapfen in einer Hand vor Berglandschaft", art: "foto" },
      b: { src: "/bilder/02/skizze-1.jpg", alt: "Farbige Handskizzen zur Berber Hut", text: "Brainstorming und erste Skizzen", art: "plan" },
      aufteilung: "4-8",
      versatz: true,
    },
    { typ: "kapitel", titel: "Drei Zustände" },
    {
      typ: "trio",
      bilder: [
        { src: "/bilder/02/zustand-geschlossen.jpg", alt: "Isometrie: Berber Hut geschlossen", text: "geschlossen", art: "plan" },
        { src: "/bilder/02/zustand-offen.jpg", alt: "Isometrie: Berber Hut offen", text: "offen", art: "plan" },
        { src: "/bilder/02/zustand-transparent.jpg", alt: "Isometrie: Berber Hut transparent", text: "transparent", art: "plan" },
      ],
    },
    { typ: "bild", bild: { src: "/bilder/02/grundriss-ansicht.jpg", alt: "Grundriss und Ansicht der Berber Hut", text: "Grundriss und Ansicht · 6,30 × 3,90 m", art: "plan" }, lage: "mitte", groesse: "mittel" },
  ],

  // ===================== 03 Nature Enjoyer Village =====================
  "03-nature-enjoyer-village": [
    { typ: "bild", bild: { src: "/bilder/03/isometrie.jpg", alt: "Explosionsisometrie: Bestandsgebäude und neue Fassade", art: "plan" }, lage: "mitte", groesse: "gross" },
    { typ: "vollbild", bild: { src: "/bilder/03/balkon.jpg", alt: "Rendering eines Balkons", text: "Balkon", art: "foto" } },
    {
      typ: "paar",
      a: { src: "/bilder/03/terrasse.jpg", alt: "Rendering einer Terrasse", text: "Terrasse", art: "foto" },
      b: { src: "/bilder/03/fahrradpavillon.jpg", alt: "Rendering des Fahrradpavillons", text: "Fahrradpavillon", art: "foto" },
      aufteilung: "5-7",
      versatz: true,
    },
    { typ: "kapitel", titel: "Pläne" },
    {
      typ: "paar",
      a: { src: "/bilder/03/lageplan.png", alt: "Lageplan der vier Wohngebäude", text: "Lageplan", art: "frei" },
      b: { src: "/bilder/03/schnitt-c-c.jpg", alt: "Fassadenschnitt mit Details", text: "Schnitt C-C", art: "plan" },
      aufteilung: "5-7",
    },
    { typ: "bild", bild: { src: "/bilder/03/grundriss-a.jpg", alt: "Grundriss Erdgeschoss", text: "Grundriss EG", art: "plan" }, lage: "mitte", groesse: "gross" },
    { typ: "bild", bild: { src: "/bilder/03/ansicht-1.jpg", alt: "Ansicht der Längsseite", text: "Ansicht A-01", art: "plan" }, lage: "links", groesse: "gross" },
  ],

  // ===================== 04 Shapeshifter X3 =====================
  "04-shapeshifter-x3": [
    { typ: "worte", worte: ["eXpressiv", "eXklusiv", "eXtravagant"], quelle: "Die drei Qualitäten der Marke Balenciaga" },
    {
      typ: "paar",
      a: { src: "/bilder/04/ansichten-grundriss.jpg", alt: "Ansichten und Grundriss mit Maßen: 2,00 m breit, 2,21 m hoch", art: "plan" },
      b: { src: "/bilder/04/verbinder.jpg", alt: "Isometrien des Verbindungsstücks", text: "Das speziell für dieses Möbel entworfene Verbindungsstück bildet den Kern des rückbaubaren Stecksystems.", art: "plan" },
      aufteilung: "8-4",
      versatz: true,
    },
    { typ: "kapitel", titel: "Prototyp", zeile: "Maßstab 1:1" },
    {
      typ: "paar",
      a: { src: "/bilder/04/prototyp.jpg", alt: "Foto des 1:1-Prototyps mit Balenciaga-Banner", text: "Prototyp im Maßstab 1:1", art: "foto" },
      b: { src: "/bilder/04/bauteile.jpg", alt: "Explosionszeichnung der Bauteile mit Beschriftung", text: "100 % lösbare Verbindungen", art: "plan" },
      aufteilung: "6-6",
      versatz: true,
    },
    { typ: "bild", bild: { src: "/bilder/04/varianten.jpg", alt: "Vier Varianten des Möbelsystems", text: "Varianten des Möbelsystems: Kleiderstange, Tische, Doppelregal, Umkleide", art: "plan" }, lage: "rechts", groesse: "mittel" },
  ],

  // ===================== 05 Lebende Ruinen =====================
  "05-lebende-ruinen": [
    { typ: "zitat", text: "Lebende Ruinen zeigen nicht das Ende eines Gebäudes, sondern seine Transformation.", quelle: "Masterthesis, Ergebnis" },
    { typ: "kapitel", titel: "Feldforschung", zeile: "Stecklenburg · Johanniter Heilanstalt Sorge" },
    { typ: "vollbild", bild: { src: "/bilder/05/sorge-4.jpg", alt: "Langer verfallener Flur", text: "Johanniter Heilanstalt", art: "foto" } },
    {
      typ: "paar",
      a: { src: "/bilder/05/stecklenburg-mauerreste.jpg", alt: "Efeubewachsener Mauerrest der Stecklenburg", text: "Im Boden versinkende Mauerreste", art: "foto" },
      b: { src: "/bilder/05/sorge-setzling.jpg", alt: "Junge Tanne wächst auf einer Fensterbank", text: "Setzling auf der Fensterbank", art: "foto" },
      aufteilung: "7-5",
      versatz: true,
    },
    { typ: "bild", bild: { src: "/bilder/05/sorge-begruenung.jpg", alt: "Verfallener Raum mit Pflanzen am Boden", text: "Begrünung im 4. Obergeschoss", art: "foto" }, lage: "rechts", groesse: "mittel" },
    { typ: "kapitel", titel: "Qualitäten" },
    {
      typ: "paar",
      a: { src: "/bilder/05/atmosphaerische-qualitaeten.png", alt: "Handgezeichnetes Diagramm der atmosphärischen Qualitäten", text: "Atmosphärische Qualitäten", art: "frei" },
      b: { src: "/bilder/05/aesthetische-qualitaeten.png", alt: "Handgezeichnete Icons der ästhetischen Qualitäten", text: "Ästhetische Qualitäten", art: "frei" },
      aufteilung: "6-6",
      versatz: true,
    },
    { typ: "kapitel", titel: "Experiment", zeile: "Kein fertiger Entwurf, sondern ein Impuls" },
    {
      typ: "paar",
      a: { src: "/bilder/05/skizzen-hauptmodell.jpg", alt: "Bleistiftskizzen zum Modell", text: "Skizzen für das Hauptmodell", art: "plan" },
      b: { src: "/bilder/05/lapis-infinitum.jpg", alt: "Experimentelles Modell in den Wolken", text: "Experimentelles Modell: „Lapis Infinitum“", art: "foto" },
      aufteilung: "4-8",
      versatz: true,
    },
  ],
};

// ---------- Vita ----------
// Intro-Text aus dem PDF-Portfolio, Seite 2
export const intro = [
  "Hi, ich bin Christian – Designer, Forscher und Abenteurer. Auf meinen Reisen lasse ich mich von fremden Kulturen inspirieren, um ihre gestalterische Essenz in neue Kontexte zu übersetzen.",
  "Ich denke in Geschichten, Stimmungen und Visionen. Oft habe ich schon eine ganze Welt vor Augen, wenn ein Projekt gerade erst beginnt. Immer neugierig auf das Unbekannte und mit einem Gespür für das Besondere, das man vielleicht erst auf den zweiten Blick entdeckt …",
];

// Zeitstrahl, chronologisch (älteste zuerst, wie im PDF)
export const lebenslauf = [
  { titel: "Grundschule", ort: "Feldbuschwende, Hannover", zeit: "2008–2012" },
  { titel: "Kunstschule Lotus", ort: "Hannover", zeit: "2009–2020" },
  { titel: "Abitur", ort: "KWR-Gymnasium Hannover", zeit: "Mai 2021" },
  { titel: "Praktikum", ort: "KINZO Architekten, Berlin", zeit: "Sep. 2023 – Feb. 2024" },
  { titel: "Bachelor Innenarchitektur", ort: "Hochschule Hannover", zeit: "Juli 2025" },
  { titel: "Haussanierung (privat)", ort: "Adelheidsdorf", zeit: "Feb. 2026 – heute" },
  { titel: "Master Design & Medien", ort: "Hochschule Hannover", zeit: "Juli 2026" },
];

// Skills & Tools aus dem PDF-Portfolio, Seite 3
export const softSkills = [
  "Starke Handzeichnungen",
  "Sanierungserfahrung",
  "Möbelherstellung",
  "Multimediale Kenntnisse",
  "Bildstarkes Denken",
];

export const sprachen = [
  "Deutsch (Muttersprache)",
  "Russisch (Muttersprache)",
  "Spanisch (Grundkenntnisse)",
  "Latein (Latinum)",
  "Englisch (hohes Niveau)",
];

// koennen: Länge des Balkens wie im PDF (0 bis 1, abgelesen und auf 5 % gerundet)
export const programme = [
  { name: "Archicad", icon: "/bilder/vita/icons/archicad.png", koennen: 0.95 },
  { name: "Pages", icon: "/bilder/vita/icons/pages.png", koennen: 0.75 },
  { name: "Photoshop", icon: "/bilder/vita/icons/photoshop.png", koennen: 0.8 },
  { name: "Affinity", icon: "/bilder/vita/icons/affinity.png", koennen: 0.75 },
  { name: "Keynote", icon: "/bilder/vita/icons/keynote.png", koennen: 0.85 },
  { name: "InDesign", icon: "/bilder/vita/icons/indesign.png", koennen: 0.9 },
  { name: "Premiere Pro", icon: "/bilder/vita/icons/premiere-pro.png", koennen: 0.6 },
  { name: "Claude AI", icon: "/bilder/vita/icons/claude-ai.png", koennen: 0.65 },
  { name: "Procreate", icon: "/bilder/vita/icons/procreate.png", koennen: 0.8 },
  { name: "Twinmotion", icon: "/bilder/vita/icons/twinmotion.png", koennen: 0.85 },
];

// ---------- Kontakt (darf laut Christian vollständig öffentlich stehen) ----------
export const kontakt = {
  email: "c.waal@icloud.com",
  telefon: "0175 344 1503",
  telefonLink: "+491753441503",
  adresse: ["Göhrshof 7", "30539 Hannover"],
  linkedin: "", // folgt – erst eintragen, wenn Christian den Link liefert
};
