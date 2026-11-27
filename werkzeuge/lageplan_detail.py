"""
Hochaufgelöster Ausschnitt des Lageplans rund um das Nymphäum (Etappe 6, F4).

Beim nahen Zoom und in der 3D-Szene reicht die normale Web-Kopie
(public/bilder/01/lageplan.jpg, 2400 px breit) nicht – sie würde pixelig.
Dieses Skript rendert das Original-PDF dreimal so groß, schneidet genau wie
werkzeuge/bilder.py zu und speichert nur den Bereich um das Nymphäum.
Die Lage des Ausschnitts (in Pixeln der normalen Web-Kopie) wird in
app/components/nifeo/ausrichtung.json unter „detail“ eingetragen.

Aufruf (im Projektordner, nach werkzeuge/ausrichtung.py):
  python3 werkzeuge/lageplan_detail.py
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bilder import lade, ohne_wasserzeichen, zuschneiden, verkleinern, M  # noqa: E402

PROJEKT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUELLE = os.path.join(M, "1_Kunstschule_NIFEO/Technische_Darstellungen/Lageplan_2 Kopie.pdf")
AUSRICHTUNG = os.path.join(PROJEKT, "app/components/nifeo/ausrichtung.json")
ZIEL = os.path.join(PROJEKT, "public/bilder/01/lageplan-detail.jpg")

FAKTOR = 3  # dreimal so fein wie die Web-Kopie
HALB = 625  # halbe Kantenlänge des Ausschnitts in Pixeln der Web-Kopie (≈ ±24 Modelleinheiten)
AUSGABE = 3072  # Kantenlänge der gespeicherten Datei


def main():
    a = json.load(open(AUSRICHTUNG))
    ux, uy = a["ursprungPx"]
    breite_web = a["planPx"][0]

    im = lade(QUELLE, 0, breite_web * FAKTOR)
    im = zuschneiden(ohne_wasserzeichen(im))
    im = verkleinern(im, breite_web * FAKTOR)
    f = im.width / breite_web  # tatsächlicher Faktor
    print("hochaufgelöst:", im.size, "Faktor", round(f, 4))

    x0, y0 = round(ux - HALB), round(uy - HALB)
    box = (round(x0 * f), round(y0 * f), round((x0 + 2 * HALB) * f), round((y0 + 2 * HALB) * f))
    detail = im.crop(box).convert("RGB")
    detail = detail.resize((AUSGABE, AUSGABE), resample=1)  # LANCZOS
    detail.save(ZIEL, quality=86, optimize=True, progressive=True)
    print("→", ZIEL, detail.size, os.path.getsize(ZIEL) // 1024, "KB")

    a["detail"] = {"x0": x0, "y0": y0, "groesse": 2 * HALB}
    json.dump(a, open(AUSRICHTUNG, "w"), indent=2)
    print("Ausschnitt (Web-Pixel):", a["detail"])


if __name__ == "__main__":
    main()
