/**
 * ============================================================
 *  ALLE PERSÖNLICHEN INHALTE DER SEITE
 *  Hier eintragen – die Komponenten lesen nur aus dieser Datei.
 * ============================================================
 */

// ---------- Allgemein / Hero ----------
export const person = {
  name: "Christian Waal",
  beruf: "Innenarchitekt",
  tagline: "Räume, die man fühlt.",
  intro:
    "Ich gestalte Wohn- und Arbeitsräume, die Funktion und Atmosphäre verbinden. " +
    "Hier ersetzt du diesen Platzhalter durch 1–2 Sätze über dich.",
};

// ---------- Projekte ----------
// bild: Pfad zu einem eigenen Bild in /public (z. B. "/projekte/loft.jpg")
//       oder leer lassen ("") für ein Platzhalterbild.
export const projekte = [
  {
    titel: "Loft Berlin",
    beschreibung: "Umbau einer Fabriketage zu einem offenen Wohnraum mit Atelier.",
    tools: ["AutoCAD", "SketchUp", "V-Ray"],
    link: "https://example.com",
    bild: "",
  },
  {
    titel: "Café Linde",
    beschreibung: "Gastronomiekonzept mit Fokus auf Akustik und natürlichen Materialien.",
    tools: ["Revit", "Photoshop"],
    link: "https://example.com",
    bild: "",
  },
  {
    titel: "Penthouse Hamburg",
    beschreibung: "Lichtplanung und Möbeldesign für ein Penthouse am Hafen.",
    tools: ["Rhino", "Enscape", "DIALux"],
    link: "https://example.com",
    bild: "",
  },
  {
    titel: "Atelier Nord",
    beschreibung: "Flexible Arbeitsplätze für ein Kreativstudio mit 20 Personen.",
    tools: ["ArchiCAD", "InDesign"],
    link: "https://example.com",
    bild: "",
  },
  {
    titel: "Villa am See",
    beschreibung: "Komplette Innenausstattung eines Einfamilienhauses.",
    tools: ["SketchUp", "Lumion"],
    link: "https://example.com",
    bild: "",
  },
  {
    titel: "Hotel Alpenblick",
    beschreibung: "Neugestaltung von Lobby und 12 Zimmern im alpinen Stil.",
    tools: ["Revit", "3ds Max"],
    link: "https://example.com",
    bild: "",
  },
];

// ---------- Lebenslauf ----------
// Neueste Einträge zuerst eintragen.
export const werdegang = [
  {
    zeitraum: "2023 – heute",
    titel: "Innenarchitekt",
    ort: "Studio Beispiel, Berlin",
    punkte: [
      "Entwurf und Ausführungsplanung für Wohn- und Gewerbeprojekte",
      "Kundenberatung und Materialauswahl",
      "Koordination von Handwerkern auf der Baustelle",
    ],
  },
  {
    zeitraum: "2021 – 2023",
    titel: "Junior Designer",
    ort: "Büro Muster GmbH, Hamburg",
    punkte: [
      "Erstellung von 3D-Visualisierungen",
      "Mitarbeit an Hotel- und Gastroprojekten",
    ],
  },
];

export const ausbildung = [
  {
    zeitraum: "2017 – 2021",
    titel: "B.A. Innenarchitektur",
    ort: "Hochschule Beispielstadt",
    punkte: [
      "Schwerpunkt: Licht und Raumwirkung",
      "Bachelorarbeit: Akustik in offenen Wohnräumen",
    ],
  },
  {
    zeitraum: "2008 – 2017",
    titel: "Abitur",
    ort: "Gymnasium Musterstadt",
    punkte: ["Leistungskurse Kunst und Mathematik"],
  },
];

// Optional: leeres Array [] blendet die Skills aus.
export const skills = [
  "AutoCAD",
  "Revit",
  "SketchUp",
  "Rhino",
  "V-Ray",
  "Adobe CC",
  "Lichtplanung",
  "Materialkunde",
];

// ---------- Kontakt ----------
// telefon: leer lassen ("") um die Zeile auszublenden.
export const kontakt = {
  email: "hallo@example.com",
  telefon: "+49 123 456789",
  profile: [
    { name: "LinkedIn", url: "https://www.linkedin.com/in/dein-profil" },
    { name: "GitHub", url: "https://github.com/dein-name" },
    { name: "Instagram", url: "https://instagram.com/dein-name" },
  ],
};
