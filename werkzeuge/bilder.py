"""
Erzeugt die Web-Kopien aller Projektbilder aus portfolio_material/.

- Originale bleiben unverändert (portfolio_material/ ist nicht im Repo).
- PDFs (Pläne) werden gerendert, das Archicad-Wasserzeichen oben rechts
  entfernt und weiße Ränder abgeschnitten.
- Ausgabe: public/bilder/<ordner>/<name>.jpg|png und app/bilder-masse.json
  (Breite/Höhe jeder Datei für next/image).

Benötigt Python mit: pillow, pypdfium2
Aufruf (im Projektordner):  python3 werkzeuge/bilder.py
"""

import json
import os
import sys

import pypdfium2 as pdfium
from PIL import Image, ImageOps

Image.MAX_IMAGE_PIXELS = None

PROJEKT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M = os.path.join(PROJEKT, "portfolio_material")
OUT = os.path.join(PROJEKT, "public", "bilder")

# (Quelle, Ziel, Art, Optionen)
# Art: "foto" -> JPG | "plan" -> PDF/Bild auf Weiß, JPG | "frei" -> PNG mit Transparenz
# Optionen: breite (max. Pixel), crop (x0, y0, x1, y1 als Anteile), seite (PDF-Seite)
LISTE = [
    # ---------- 01 Kunstschule NIFEO ----------
    ("1_Kunstschule_NIFEO/Renderings/Titelbild Kopie.png", "01/titel.jpg", "foto", {"breite": 2800}),
    ("1_Kunstschule_NIFEO/Renderings/R_Nifeo_ganz Kopie.png", "01/blick-auf-die-kunstschule.jpg", "foto", {}),
    ("1_Kunstschule_NIFEO/Fotos_vor_Ort/Chris_Bestand1.jpeg", "01/vor-ort-1.jpg", "foto", {}),
    ("1_Kunstschule_NIFEO/Fotos_vor_Ort/Chris_Bestand2.jpeg", "01/vor-ort-2.jpg", "foto", {"breite": 1600}),
    ("1_Kunstschule_NIFEO/Fotos_vor_Ort/Chris_Bestand3.jpeg", "01/vor-ort-3.jpg", "foto", {"breite": 1600}),
    ("1_Kunstschule_NIFEO/Technische_Darstellungen/Lageplan_2 Kopie.pdf", "01/lageplan.jpg", "plan", {}),
    ("1_Kunstschule_NIFEO/Icons_und_skizzen/italy_map.jpeg", "01/italien.jpg", "plan", {"breite": 1344}),
    ("1_Kunstschule_NIFEO/Technische_Darstellungen/ISO_Bestand Kopie.pdf", "01/iso-bestand.jpg", "plan", {}),
    ("1_Kunstschule_NIFEO/Icons_und_skizzen/Besonderheiten Kopie.png", "01/besonderheiten.png", "frei", {"breite": 1400}),
    ("1_Kunstschule_NIFEO/Icons_und_skizzen/Nifeo_konzept.jpeg", "01/konzept.jpg", "plan", {"breite": 1522}),
    ("1_Kunstschule_NIFEO/Icons_und_skizzen/Z_Arch_idee_color_trans Kopie.png", "01/architektonische-idee.png", "frei", {"breite": 1400}),
    ("1_Kunstschule_NIFEO/Technische_Darstellungen/Ansicht 01 Kopie.png", "01/ansicht-01.jpg", "plan", {"breite": 3200}),
    ("1_Kunstschule_NIFEO/Technische_Darstellungen/GR EG Kopie.png", "01/grundriss-eg.jpg", "plan", {"breite": 3200}),
    ("1_Kunstschule_NIFEO/Technische_Darstellungen/GR OG Kopie.png", "01/grundriss-og.jpg", "plan", {"breite": 3200}),
    ("1_Kunstschule_NIFEO/Technische_Darstellungen/Iso_Explo_Entwurf Kopie.pdf", "01/aufbau-elemente.jpg", "plan", {}),
    ("1_Kunstschule_NIFEO/Renderings/R_Aula Kopie.png", "01/aula-cubus.jpg", "foto", {}),
    ("1_Kunstschule_NIFEO/Renderings/R_Cubus_innen Kopie.png", "01/cubus-og-innen.jpg", "foto", {}),
    ("1_Kunstschule_NIFEO/Technische_Darstellungen/Schnitte_V_Blanko Kopie.pdf", "01/schnitte.jpg", "plan", {}),
    ("1_Kunstschule_NIFEO/Icons_und_skizzen/Z_Verbindung Kopie.png", "01/verbindung.png", "frei", {"breite": 1400}),
    # ---------- 02 Berber Hut ----------
    ("2_Berber_hut/Berber_hut_visualisierung.jpg", "02/titel.jpg", "foto", {}),
    ("2_Berber_hut/Tannanzapfen.JPG", "02/tannenzapfen.jpg", "foto", {"breite": 1600}),
    ("2_Berber_hut/skizze2.pdf", "02/skizze-1.jpg", "plan", {"seite": 0}),
    ("2_Berber_hut/skizze2.pdf", "02/skizze-2.jpg", "plan", {"seite": 1}),
    ("2_Berber_hut/skizze1.pdf", "02/skizze-3.jpg", "plan", {}),
    ("2_Berber_hut/Tech Kopie.pdf", "02/grundriss-ansicht.jpg", "plan", {}),
    ("2_Berber_hut/iso_black.pdf", "02/zustaende.jpg", "plan", {}),
    # die drei Zustände einzeln (für die Darstellung nebeneinander)
    ("2_Berber_hut/iso_black.pdf", "02/zustand-geschlossen.jpg", "plan", {"crop": (0.0, 0.08, 1.0, 0.40), "breite": 1200}),
    ("2_Berber_hut/iso_black.pdf", "02/zustand-offen.jpg", "plan", {"crop": (0.0, 0.40, 1.0, 0.66), "breite": 1200}),
    ("2_Berber_hut/iso_black.pdf", "02/zustand-transparent.jpg", "plan", {"crop": (0.0, 0.66, 1.0, 1.0), "breite": 1200}),
    # ---------- 03 Nature Enjoyer Village ----------
    ("3_Nature_Enjoyer_Village/Hauptbild Kopie.png", "03/titel.jpg", "foto", {}),
    ("3_Nature_Enjoyer_Village/Iso_ex Kopie.pdf", "03/isometrie.jpg", "plan", {}),
    ("3_Nature_Enjoyer_Village/Balkon Kopie.png", "03/balkon.jpg", "foto", {}),
    ("3_Nature_Enjoyer_Village/Terasse Kopie.png", "03/terrasse.jpg", "foto", {}),
    ("3_Nature_Enjoyer_Village/Fahrrad Kopie.png", "03/fahrradpavillon.jpg", "foto", {}),
    ("3_Nature_Enjoyer_Village/Schnitt_C-C Kopie.pdf", "03/schnitt-c-c.jpg", "plan", {"crop": (0.0, 0.0, 1.0, 0.86)}),
    ("3_Nature_Enjoyer_Village/lageplan_grün Kopie.png", "03/lageplan.png", "frei", {"breite": 3000, "leeren": (0.8, 0.0, 1.0, 0.06)}),
    ("3_Nature_Enjoyer_Village/Ansicht_1 Kopie.pdf", "03/ansicht-1.jpg", "plan", {}),
    ("3_Nature_Enjoyer_Village/Ansicht_2 Kopie.pdf", "03/ansicht-2.jpg", "plan", {}),
    ("3_Nature_Enjoyer_Village/Grundriss_A Kopie.pdf", "03/grundriss-a.jpg", "plan", {}),
    ("3_Nature_Enjoyer_Village/Grundriss_C Kopie.pdf", "03/grundriss-c.jpg", "plan", {}),
    ("3_Nature_Enjoyer_Village/Schnitt_A_A Kopie.pdf", "03/schnitt-a-a.jpg", "plan", {}),
    ("3_Nature_Enjoyer_Village/Schnitt_A_B Kopie.pdf", "03/schnitt-a-b.jpg", "plan", {}),
    # ---------- 04 Shapeshifter X3 ----------
    ("4_Shapeshifter_X3/X3_Visualisierung.jpg", "04/titel.jpg", "foto", {}),
    ("4_Shapeshifter_X3/X3_GR.pdf", "04/ansichten-grundriss.jpg", "plan", {}),
    ("4_Shapeshifter_X3/Balenciaga_code.png", "04/balenciaga-qualitaeten.jpg", "plan", {"crop": (0.0, 0.09, 1.0, 0.9)}),
    ("4_Shapeshifter_X3/X3_Verbinder.pdf", "04/verbinder.jpg", "plan", {"crop": (0.68, 0.22, 0.95, 0.73)}),
    ("4_Shapeshifter_X3/Foto_Prototyp.jpg", "04/prototyp.jpg", "foto", {"breite": 1800}),
    ("4_Shapeshifter_X3/X3_Charts Kopie 2.pdf", "04/bauteile.jpg", "plan", {"crop": (0.55, 0.0, 1.0, 1.0)}),
    ("4_Shapeshifter_X3/X3_Variation.pdf", "04/varianten.jpg", "plan", {}),
    ("4_Shapeshifter_X3/ISO_X3_black.pdf", "04/isometrie.jpg", "plan", {}),
    # ---------- 05 Lebende Ruinen ----------
    ("5_Lebende_Ruinen/buddah_cover.jpg", "05/titel.jpg", "foto", {"breite": 1600}),
    ("5_Lebende_Ruinen/Stecklenburg_2.JPG", "05/stecklenburg-mauerreste.jpg", "foto", {}),
    ("5_Lebende_Ruinen/J_H_Sorge_01.JPG", "05/sorge-setzling.jpg", "foto", {}),
    ("5_Lebende_Ruinen/Stecklenburg_1.JPG", "05/stecklenburg.jpg", "foto", {}),
    ("5_Lebende_Ruinen/J_H_Sorge_03.JPG", "05/sorge-begruenung.jpg", "foto", {}),
    ("5_Lebende_Ruinen/J_H_Sorge_02.JPG", "05/sorge-2.jpg", "foto", {}),
    ("5_Lebende_Ruinen/J_H_Sorge_04.JPG", "05/sorge-4.jpg", "foto", {}),
    ("5_Lebende_Ruinen/AQ_Skizze Kopie.png", "05/atmosphaerische-qualitaeten.png", "frei", {"breite": 1400}),
    ("5_Lebende_Ruinen/AeQ_Skizze Kopie.png", "05/aesthetische-qualitaeten.png", "frei", {"breite": 1400}),
    ("5_Lebende_Ruinen/Exp_Skizzen2 Kopie.pdf", "05/skizzen-hauptmodell.jpg", "plan", {}),
    ("5_Lebende_Ruinen/Exp_Modell.png", "05/lapis-infinitum.jpg", "foto", {}),
    # ---------- Vorschaubilder für die Expeditionskarte (16:10) ----------
    ("1_Kunstschule_NIFEO/Renderings/R_Nifeo_ganz Kopie.png", "karte/01.jpg", "foto", {"format": (16, 10), "breite": 480}),
    ("2_Berber_hut/Berber_hut_visualisierung.jpg", "karte/02.jpg", "foto", {"format": (16, 10), "breite": 480}),
    ("3_Nature_Enjoyer_Village/Hauptbild Kopie.png", "karte/03.jpg", "foto", {"format": (16, 10), "breite": 480}),
    ("4_Shapeshifter_X3/X3_Visualisierung.jpg", "karte/04.jpg", "foto", {"format": (16, 10), "breite": 480}),
    ("5_Lebende_Ruinen/buddah_cover.jpg", "karte/05.jpg", "foto", {"format": (16, 10), "breite": 480, "crop": (0.3, 0.42, 0.95, 0.72)}),
    # ---------- Vita ----------
    ("6_Vita/christian_indo_cutout.png", "vita/christian.png", "frei", {"breite": 1600}),
    ("6_Vita/Programm_icons/Archicad.png", "vita/icons/archicad.png", "frei", {"breite": 160}),
    ("6_Vita/Programm_icons/New_Pages_icon.png", "vita/icons/pages.png", "frei", {"breite": 160}),
    ("6_Vita/Programm_icons/Adobe_Photoshop_CC_icon.svg.webp", "vita/icons/photoshop.png", "frei", {"breite": 160}),
    ("6_Vita/Programm_icons/Affinity_(App)_Logo.svg.webp", "vita/icons/affinity.png", "frei", {"breite": 160}),
    ("6_Vita/Programm_icons/Keynote_Icon_iOS_7.png", "vita/icons/keynote.png", "frei", {"breite": 160}),
    ("6_Vita/Programm_icons/Adobe_InDesign_CC_icon.svg.webp", "vita/icons/indesign.png", "frei", {"breite": 160}),
    ("6_Vita/Programm_icons/Adobe_Premiere_Pro_CC_icon.svg.webp", "vita/icons/premiere-pro.png", "frei", {"breite": 160}),
    ("6_Vita/Programm_icons/claude-ai-icon.png.webp", "vita/icons/claude-ai.png", "frei", {"breite": 160}),
    ("6_Vita/Programm_icons/Procreate_logo.png", "vita/icons/procreate.png", "frei", {"breite": 160}),
    ("6_Vita/Programm_icons/twinmotion-iqkx9ipkzq8usuikajcx4.webp", "vita/icons/twinmotion.png", "frei", {"breite": 160}),
]


def lade(pfad, seite=0, breite=2400):
    if pfad.lower().endswith(".pdf"):
        pg = pdfium.PdfDocument(pfad)[seite]
        # in hoher Auflösung rendern, später auf Zielbreite verkleinern
        scale = max(breite * 1.4, 3000) / pg.get_width()
        return pg.render(scale=scale).to_pil()
    return ImageOps.exif_transpose(Image.open(pfad))


def ohne_wasserzeichen(im):
    """Archicad-Bildungsversion-Schriftzug (dunkelblau) oben rechts entfernen."""
    rgb = im.convert("RGB")
    w, h = rgb.size
    px = rgb.load()
    # 1. Kräftig blaue Pixel im Bereich oben rechts suchen
    xs, ys = [], []
    for y in range(0, int(h * 0.12)):
        for x in range(int(w * 0.45), w):
            r, g, b = px[x, y]
            if b > r + 25 and b > 60 and r < 140:
                xs.append(x)
                ys.append(y)
    if not xs:
        return rgb
    # 2. Den ganzen Schriftzug als Block (mit Rand) weiß übermalen
    pad = int(w * 0.012)
    box = (max(0, min(xs) - pad), max(0, min(ys) - pad), min(w, max(xs) + pad), min(h, max(ys) + pad))
    from PIL import ImageDraw
    ImageDraw.Draw(rgb).rectangle(box, fill=(255, 255, 255))
    return rgb


def zuschneiden(im, rand=0.025):
    """Weiße Ränder entfernen, schmalen Rand stehen lassen."""
    grau = im.convert("L").point(lambda v: 255 if v < 240 else 0)
    box = grau.getbbox()
    if not box:
        return im
    pad = int(max(im.size) * rand)
    x0, y0, x1, y1 = box
    return im.crop((max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad)))


def verkleinern(im, breite):
    if im.width > breite:
        im = im.resize((breite, round(im.height * breite / im.width)), Image.LANCZOS)
    return im


def main():
    masse = {}
    for quelle, ziel, art, opt in LISTE:
        src = os.path.join(M, quelle)
        breite = opt.get("breite", 2400)
        im = lade(src, opt.get("seite", 0), breite)
        if "crop" in opt:
            x0, y0, x1, y1 = opt["crop"]
            im = im.crop((int(im.width * x0), int(im.height * y0), int(im.width * x1), int(im.height * y1)))
        if art == "plan":
            if im.mode in ("RGBA", "LA", "P"):
                im = im.convert("RGBA")
                weiss = Image.new("RGBA", im.size, (255, 255, 255, 255))
                weiss.alpha_composite(im)
                im = weiss
            im = zuschneiden(ohne_wasserzeichen(im))
        elif art == "frei":
            im = im.convert("RGBA")
            if "leeren" in opt:  # Bereich durchsichtig machen (z. B. Wasserzeichen-Kasten)
                x0, y0, x1, y1 = opt["leeren"]
                leer = Image.new("RGBA", (int(im.width * (x1 - x0)), int(im.height * (y1 - y0))), (0, 0, 0, 0))
                im.paste(leer, (int(im.width * x0), int(im.height * y0)))
            box = im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
            if box:
                im = im.crop(box)
        else:
            im = im.convert("RGB")
        if "format" in opt:  # mittig auf ein Seitenverhältnis zuschneiden
            fw, fh = opt["format"]
            if im.width / im.height > fw / fh:
                neu = int(im.height * fw / fh)
                im = im.crop(((im.width - neu) // 2, 0, (im.width - neu) // 2 + neu, im.height))
            else:
                neu = int(im.width * fh / fw)
                im = im.crop((0, (im.height - neu) // 2, im.width, (im.height - neu) // 2 + neu))
        im = verkleinern(im, breite)
        pfad = os.path.join(OUT, ziel)
        os.makedirs(os.path.dirname(pfad), exist_ok=True)
        if ziel.endswith(".png"):
            im.save(pfad, optimize=True)
        else:
            im.convert("RGB").save(pfad, quality=85, optimize=True, progressive=True)
        masse["/bilder/" + ziel] = [im.width, im.height]
        print(f"{ziel:45s} {im.width}x{im.height}")
    # bestehende Einträge (z. B. Cover) behalten
    json_pfad = os.path.join(PROJEKT, "app", "bilder-masse.json")
    alt = {}
    if os.path.exists(json_pfad):
        alt = json.load(open(json_pfad))
    alt.update(masse)
    with open(json_pfad, "w") as f:
        json.dump(dict(sorted(alt.items())), f, indent=1)


if __name__ == "__main__":
    sys.exit(main())
