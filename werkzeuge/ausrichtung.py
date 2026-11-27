"""
Richtet das 3D-Modell des Bestands exakt auf den Grundriss im Lageplan aus
(Etappe 6, F4: das Modell wächst aus dem Lageplan heraus).

Vorgehen:
1. Im Lageplan die dicken schwarzen Wände des Nymphäums finden (dünne
   Strichlinien werden herausgefiltert).
2. Durch das 3D-Modell einen waagrechten Schnitt in Sockelhöhe legen –
   das entspricht dem Grundriss.
3. Drehung, Maßstab und Lage suchen, bei denen der Schnitt am besten auf den
   Wänden im Plan liegt.
Ergebnis: app/components/nifeo/ausrichtung.json

Aufruf (im Projektordner, Python mit Pillow + numpy):
  python3 werkzeuge/ausrichtung.py
"""

import json
import math
import os
import struct

import numpy as np
from PIL import Image, ImageFilter

PROJEKT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STL = os.path.join(PROJEKT, "portfolio_material/1_Kunstschule_NIFEO/3D/Bestand.stl")
PLAN = os.path.join(PROJEKT, "public/bilder/01/lageplan.jpg")
ZIEL = os.path.join(PROJEKT, "app/components/nifeo/ausrichtung.json")

# Bereich des Nymphäums im Lageplan (Pixel), grob
AUSSCHNITT = (1450, 1950, 2000, 2550)


def modell_dreiecke():
    """STL lesen und genau wie werkzeuge/modell.mjs umrechnen (Y oben, Breite 10)."""
    b = open(STL, "rb").read()
    n = struct.unpack_from("<I", b, 80)[0]
    v = np.frombuffer(b, dtype=np.uint8, count=n * 50, offset=84).reshape(n, 50)
    p = np.frombuffer(v[:, 12:48].tobytes(), dtype="<f4").reshape(n, 3, 3).astype(np.float64)
    web = np.stack([p[..., 0], p[..., 2], -p[..., 1]], axis=-1)  # x, z→y, -y→z
    mn = web.reshape(-1, 3).min(0)
    mx = web.reshape(-1, 3).max(0)
    mitte = np.array([(mn[0] + mx[0]) / 2, mn[1], (mn[2] + mx[2]) / 2])
    faktor = 10 / max(mx[0] - mn[0], mx[2] - mn[2])
    return (web - mitte) * faktor


def schnitt(dreiecke, hoehe, abstand=0.03):
    """Schnittlinien des Modells mit der Ebene y = hoehe, als dichte Punktwolke (x, z)."""
    punkte = []
    for t in dreiecke:
        y = t[:, 1] - hoehe
        if y.min() > 0 or y.max() < 0:
            continue
        s = []
        for i in range(3):
            a, b = t[i], t[(i + 1) % 3]
            ya, yb = y[i], y[(i + 1) % 3]
            if (ya > 0) != (yb > 0):
                k = ya / (ya - yb)
                s.append(a + k * (b - a))
        if len(s) == 2:
            a, b = s
            laenge = math.hypot(b[0] - a[0], b[2] - a[2])
            for k in np.linspace(0, 1, max(2, int(laenge / abstand) + 1)):
                q = a + k * (b - a)
                punkte.append((q[0], q[2]))
    return np.array(punkte)


def wandmaske():
    im = Image.open(PLAN).convert("L").crop(AUSSCHNITT)
    # dünne Linien weg: Dunkles schrumpfen (Max-Filter auf Helligkeit), danach wieder wachsen lassen
    dunkel = im.point(lambda g: 0 if g < 90 else 255)
    dick = dunkel.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
    return np.array(dick) < 128


def abstandskarte(maske, maximal=24):
    """Abstand jedes Pixels zur nächsten Wand (schrittweises Wachsen)."""
    dist = np.full(maske.shape, float(maximal))
    aktuell = maske.copy()
    dist[aktuell] = 0
    for r in range(1, maximal):
        g = aktuell.copy()
        g[1:, :] |= aktuell[:-1, :]
        g[:-1, :] |= aktuell[1:, :]
        g[:, 1:] |= aktuell[:, :-1]
        g[:, :-1] |= aktuell[:, 1:]
        neu = g & ~aktuell
        dist[neu] = r
        aktuell = g
    return dist


def bewerten(pkte, dist, phi, s, tx, ty):
    """Mittlerer Abstand der Schnittpunkte zur nächsten Wand (kleiner = besser).
    Drehung wie three.js rotation.y: (x, z) → (x cos + z sin, −x sin + z cos)."""
    c, si = math.cos(phi), math.sin(phi)
    x = pkte[:, 0] * c + pkte[:, 1] * si
    z = -pkte[:, 0] * si + pkte[:, 1] * c
    u = np.round(tx + s * x).astype(int)
    v = np.round(ty + s * z).astype(int)
    h, b = dist.shape
    innen = (u >= 0) & (u < b) & (v >= 0) & (v < h)
    werte = np.full(len(u), dist.max())
    werte[innen] = dist[v[innen], u[innen]]
    return werte.mean()


def main():
    dreiecke = modell_dreiecke()
    hoehe_modell = dreiecke[..., 1].max()
    pkte = schnitt(dreiecke, 0.12 * hoehe_modell)
    print("Schnittpunkte:", len(pkte), "| Modellhöhe", round(hoehe_modell, 3))

    maske = wandmaske()
    dist = abstandskarte(maske)
    wy, wx = np.nonzero(maske)
    cx, cy = wx.mean(), wy.mean()
    print("Wandpixel:", len(wx), "| Schwerpunkt", round(cx), round(cy))

    # Grobsuche: Mittelpunkte übereinander, Drehung und Maßstab variieren
    mitte = pkte.mean(0)
    beste = (1e9, None)
    for spiegel in (False, True):
        q = pkte * ([-1, 1] if spiegel else [1, 1])
        m = q.mean(0)
        for grad in range(0, 360, 2):
            phi = math.radians(grad)
            c, si = math.cos(phi), math.sin(phi)
            mxr = m[0] * c + m[1] * si
            mzr = -m[0] * si + m[1] * c
            for s in np.arange(18, 40, 1.0):
                tx, ty = cx - s * mxr, cy - s * mzr
                w = bewerten(q, dist, phi, s, tx, ty)
                if w < beste[0]:
                    beste = (w, (spiegel, phi, s, tx, ty))
    print("Grob:", round(beste[0], 2), "Spiegel", beste[1][0], "Winkel", round(math.degrees(beste[1][1]), 1), "Maßstab", beste[1][2])

    # Feinsuche um das beste Ergebnis
    spiegel, phi, s, tx, ty = beste[1]
    q = pkte * ([-1, 1] if spiegel else [1, 1])
    for schritt in [(1.0, 0.5, 4), (0.4, 0.2, 2), (0.15, 0.08, 1), (0.05, 0.03, 0.5)]:
        dgrad, ds, dt = schritt
        verbessert = True
        while verbessert:
            verbessert = False
            for a, b, c_, d in [(dgrad, 0, 0, 0), (-dgrad, 0, 0, 0), (0, ds, 0, 0), (0, -ds, 0, 0),
                                (0, 0, dt, 0), (0, 0, -dt, 0), (0, 0, 0, dt), (0, 0, 0, -dt)]:
                kand = (phi + math.radians(a), s + b, tx + c_, ty + d)
                w = bewerten(q, dist, *kand)
                if w < beste[0] - 1e-6:
                    beste = (w, (spiegel, *kand))
                    phi, s, tx, ty = kand
                    verbessert = True
    print("Fein:", round(beste[0], 2), "Winkel", round(math.degrees(phi), 2), "Maßstab", round(s, 2), "Ursprung", round(tx, 1), round(ty, 1))
    if spiegel:
        print("WARNUNG: beste Lösung ist gespiegelt – Achsen prüfen!")

    # Ursprung des Modells in Pixeln des ganzen Lageplans
    ergebnis = {
        "drehungY": round(phi, 5),  # Radiant, für three.js rotation.y
        "pxProEinheit": round(s, 4),  # Lageplan-Pixel pro Modelleinheit
        "ursprungPx": [round(tx + AUSSCHNITT[0], 2), round(ty + AUSSCHNITT[1], 2)],
        "planPx": list(Image.open(PLAN).size),
        "abweichungPx": round(beste[0], 2),
        "gespiegelt": bool(spiegel),
    }
    json.dump(ergebnis, open(ZIEL, "w"), indent=2)
    print("→", ZIEL, ergebnis)

    # Kontrollbild: Schnitt rot über dem Plan
    bild = Image.open(PLAN).convert("RGB").crop(AUSSCHNITT)
    px = bild.load()
    c, si = math.cos(phi), math.sin(phi)
    for x0, z0 in q:
        x = x0 * c + z0 * si
        z = -x0 * si + z0 * c
        u, v = int(round(tx + s * x)), int(round(ty + s * z))
        if 0 <= u < bild.width and 0 <= v < bild.height:
            px[u, v] = (220, 30, 40)
    bild.save(os.environ.get("KONTROLLE", "/tmp/ausrichtung-kontrolle.png"))


if __name__ == "__main__":
    main()
