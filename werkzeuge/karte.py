"""
Erzeugt die Kartengeometrie für die Expeditionskarte (app/karte-daten.ts).

Grundlage: Natural Earth 1:50m (gemeinfrei / public domain,
https://www.naturalearthdata.com). Benötigte Dateien im Ordner <ne-ordner>:
  ne_50m_land.geojson, ne_50m_admin_0_boundary_lines_land.geojson, ne_50m_lakes.geojson
(z. B. von https://github.com/nvkelso/natural-earth-vector/tree/master/geojson)

Projektion: Lambert-Schnittkegel (Standardparallelen 35° und 55° N, Mittelmeridian 10° O).
Aufruf (im Projektordner):  python3 werkzeuge/karte.py <ne-ordner>
"""

import json
import math
import os
import sys

PROJEKT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Kartenausschnitt (Grad): Europa inklusive Nordafrika (Marokko muss sichtbar sein)
LON_MIN, LON_MAX = -14.0, 34.0
LAT_MIN, LAT_MAX = 26.5, 60.5
BREITE = 1000.0  # Breite der viewBox in Einheiten

# Stationen der Route (Reihenfolge 01–05 wie im PDF)
STATIONEN = [
    ("01-kunstschule-nifeo", "01", "Genazzano", 41.831, 12.972),
    ("02-berber-hut", "02", "Erg Chebbi, Merzouga", 31.145, -3.975),
    ("03-nature-enjoyer-village", "03", "Bremerhaven", 53.551, 8.580),
    ("04-shapeshifter-x3", "04", "Hannover", 52.375, 9.732),
    ("05-lebende-ruinen", "05", "Sorge, Harz", 51.693, 10.708),
]

# ---------- Projektion ----------
P1, P2, L0, B0 = map(math.radians, (35.0, 55.0, 10.0, 44.0))
N = math.log(math.cos(P1) / math.cos(P2)) / math.log(
    math.tan(math.pi / 4 + P2 / 2) / math.tan(math.pi / 4 + P1 / 2)
)
F = math.cos(P1) * math.tan(math.pi / 4 + P1 / 2) ** N / N
RHO0 = F / math.tan(math.pi / 4 + B0 / 2) ** N


def roh(lon, lat):
    lam, phi = math.radians(lon), math.radians(max(min(lat, 89.0), -89.0))
    rho = F / math.tan(math.pi / 4 + phi / 2) ** N
    th = N * (lam - L0)
    return rho * math.sin(th), -(RHO0 - rho * math.cos(th))  # y nach unten


# Ausdehnung: Rand des Ausschnitts abtasten
rand = []
for i in range(101):
    t = i / 100
    lon = LON_MIN + (LON_MAX - LON_MIN) * t
    lat = LAT_MIN + (LAT_MAX - LAT_MIN) * t
    rand += [roh(lon, LAT_MIN), roh(lon, LAT_MAX), roh(LON_MIN, lat), roh(LON_MAX, lat)]
# Rechteck um den ganzen Ausschnitt (die Ecken außerhalb werden mit Meer gefüllt)
X0 = min(p[0] for p in rand)
X1 = max(p[0] for p in rand)
Y0 = min(p[1] for p in rand)
Y1 = max(p[1] for p in rand)
SKALA = BREITE / (X1 - X0)
HOEHE = (Y1 - Y0) * SKALA
KM_PRO_EINHEIT = 6371.0 / SKALA  # entlang der Standardparallelen


def proj(lon, lat):
    x, y = roh(lon, lat)
    return ((x - X0) * SKALA, (y - Y0) * SKALA)


# ---------- Geometrie-Helfer ----------
def clip_polygon(punkte, rand=8.0):
    """Sutherland–Hodgman: Polygon auf die viewBox (plus Rand) zuschneiden."""
    xmin, ymin, xmax, ymax = -rand, -rand, BREITE + rand, HOEHE + rand

    def schneiden(pkte, innen, schnitt):
        aus = []
        for i in range(len(pkte)):
            a, b = pkte[i - 1], pkte[i]
            if innen(b):
                if not innen(a):
                    aus.append(schnitt(a, b))
                aus.append(b)
            elif innen(a):
                aus.append(schnitt(a, b))
        return aus

    def sx(a, b, x):
        t = (x - a[0]) / (b[0] - a[0])
        return (x, a[1] + t * (b[1] - a[1]))

    def sy(a, b, y):
        t = (y - a[1]) / (b[1] - a[1])
        return (a[0] + t * (b[0] - a[0]), y)

    p = punkte
    for innen, schnitt in [
        (lambda q: q[0] >= xmin, lambda a, b: sx(a, b, xmin)),
        (lambda q: q[0] <= xmax, lambda a, b: sx(a, b, xmax)),
        (lambda q: q[1] >= ymin, lambda a, b: sy(a, b, ymin)),
        (lambda q: q[1] <= ymax, lambda a, b: sy(a, b, ymax)),
    ]:
        if not p:
            break
        p = schneiden(p, innen, schnitt)
    return p


def vereinfachen(pkte, toleranz):
    """Douglas-Peucker (iterativ)."""
    if len(pkte) < 3:
        return pkte
    behalten = [False] * len(pkte)
    behalten[0] = behalten[-1] = True
    stapel = [(0, len(pkte) - 1)]
    while stapel:
        a, b = stapel.pop()
        ax, ay = pkte[a]
        bx, by = pkte[b]
        dx, dy = bx - ax, by - ay
        laenge = math.hypot(dx, dy) or 1e-9
        max_d, idx = 0.0, -1
        for i in range(a + 1, b):
            px, py = pkte[i]
            d = abs(dy * px - dx * py + bx * ay - by * ax) / laenge
            if d > max_d:
                max_d, idx = d, i
        if max_d > toleranz and idx > 0:
            behalten[idx] = True
            stapel += [(a, idx), (idx, b)]
    return [p for p, k in zip(pkte, behalten) if k]


def pfad(ringe, geschlossen=True):
    teile = []
    for r in ringe:
        if len(r) < (3 if geschlossen else 2):
            continue
        s = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in r)
        teile.append(s + ("Z" if geschlossen else ""))
    return "".join(teile)


def im_ausschnitt(coords, puffer=4.0):
    for lon, lat in coords:
        if LON_MIN - puffer <= lon <= LON_MAX + puffer and LAT_MIN - puffer <= lat <= LAT_MAX + puffer:
            return True
    return False


def flaechen(datei, toleranz=0.7):
    gj = json.load(open(datei))
    ringe = []
    for f in gj["features"]:
        g = f["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        for poly in polys:
            for ring in poly:
                if not im_ausschnitt(ring):
                    continue
                if ring[0] == ring[-1]:  # GeoJSON-Ringe wiederholen den Startpunkt am Ende
                    ring = ring[:-1]
                pk = clip_polygon([proj(lon, lat) for lon, lat in ring])
                # offen vereinfachen (geschlossene Ringe haben gleiche Endpunkte)
                pk = vereinfachen(pk, toleranz) if pk else []
                if len(pk) >= 3:
                    ringe.append(pk)
    return pfad(ringe)


def linien(datei, toleranz=0.7):
    gj = json.load(open(datei))
    stuecke = []
    for f in gj["features"]:
        g = f["geometry"]
        teile = g["coordinates"] if g["type"] == "MultiLineString" else [g["coordinates"]]
        for t in teile:
            if not im_ausschnitt(t, 0):
                continue
            pk = [proj(lon, lat) for lon, lat in t]
            pk = [p for p in pk if -5 <= p[0] <= BREITE + 5 and -5 <= p[1] <= HOEHE + 5]
            pk = vereinfachen(pk, toleranz)
            if len(pk) >= 2:
                stuecke.append(pk)
    return pfad(stuecke, geschlossen=False)


def gradnetz(schritt=5):
    stuecke, beschriftung = [], []
    for lat in range(int(math.ceil(LAT_MIN / schritt) * schritt), int(LAT_MAX) + 1, schritt):
        pk = [proj(LON_MIN - 10 + i * 0.5, lat) for i in range(int((LON_MAX - LON_MIN + 20) / 0.5) + 1)]
        pk = [p for p in pk if -2 <= p[0] <= BREITE + 2]
        if pk and 0 <= pk[0][1] <= HOEHE:
            stuecke.append(pk)
            beschriftung.append({"text": f"{lat}° N", "x": 6, "y": round(pk[0][1] - 4, 1), "achse": "breite"})
    for lon in range(int(math.ceil(LON_MIN / schritt) * schritt), int(LON_MAX) + 1, schritt):
        pk = [proj(lon, LAT_MIN - 10 + i * 0.5) for i in range(int((LAT_MAX - LAT_MIN + 20) / 0.5) + 1)]
        pk = [p for p in pk if -2 <= p[1] <= HOEHE + 2]
        if pk:
            stuecke.append(pk)
            unten = max(pk, key=lambda p: p[1])
            if 10 <= unten[0] <= BREITE - 30:
                txt = f"{abs(lon)}° {'O' if lon >= 0 else 'W'}" if lon != 0 else "0°"
                beschriftung.append({"text": txt, "x": round(unten[0] + 4, 1), "y": round(HOEHE - 8, 1), "achse": "laenge"})
    return pfad([vereinfachen(s, 0.3) for s in stuecke], geschlossen=False), beschriftung


def grad_text(lat, lon):
    def dms(v):
        g = int(abs(v))
        m = (abs(v) - g) * 60
        return f"{g}°{m:04.1f}′"

    return f"{dms(lat)} {'N' if lat >= 0 else 'S'} · {dms(lon)} {'O' if lon >= 0 else 'W'}"


def main():
    ne = sys.argv[1]
    land = flaechen(os.path.join(ne, "ne_50m_land.geojson"))
    seen = flaechen(os.path.join(ne, "ne_50m_lakes.geojson"))
    grenzen = linien(os.path.join(ne, "ne_50m_admin_0_boundary_lines_land.geojson"))
    netz, netz_text = gradnetz()
    stationen = []
    for slug, nr, ort, lat, lon in STATIONEN:
        x, y = proj(lon, lat)
        stationen.append(
            {"slug": slug, "nummer": nr, "ort": ort, "x": round(x, 1), "y": round(y, 1), "koordinaten": grad_text(lat, lon)}
        )
    ziel = os.path.join(PROJEKT, "app", "karte-daten.ts")
    with open(ziel, "w") as f:
        f.write("// Automatisch erzeugt von werkzeuge/karte.py – nicht von Hand bearbeiten.\n")
        f.write("// Kartengrundlage: Natural Earth 1:50m, gemeinfrei (naturalearthdata.com).\n\n")
        f.write(f"export const KARTE = {{ breite: {BREITE:.0f}, hoehe: {HOEHE:.1f}, kmProEinheit: {KM_PRO_EINHEIT:.3f} }};\n\n")
        f.write(f"export const LAND = {json.dumps(land)};\n\n")
        f.write(f"export const SEEN = {json.dumps(seen)};\n\n")
        f.write(f"export const GRENZEN = {json.dumps(grenzen)};\n\n")
        f.write(f"export const GRADNETZ = {json.dumps(netz)};\n\n")
        f.write(f"export const GRADNETZ_TEXT = {json.dumps(netz_text, ensure_ascii=False)};\n\n")
        f.write(f"export const STATIONEN = {json.dumps(stationen, ensure_ascii=False, indent=1)};\n")
    print("viewBox", BREITE, round(HOEHE, 1), "| Größe", os.path.getsize(ziel) // 1024, "KB")
    for s in stationen:
        print(s["nummer"], s["ort"], s["x"], s["y"], s["koordinaten"])


if __name__ == "__main__":
    main()
