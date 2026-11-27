"""
Erzeugt die Kartengeometrie für die NIFEO-Scroll-Expedition (app/italien-daten.ts):
Italien im Ganzen und eine fein aufgelöste Nahkarte rund um Genazzano.

Grundlage: Natural Earth 1:10m (gemeinfrei / public domain,
https://www.naturalearthdata.com). Benötigte Dateien im Ordner <ne10-ordner>:
  ne_10m_land, ne_10m_lakes, ne_10m_rivers_lake_centerlines,
  ne_10m_admin_0_boundary_lines_land, ne_10m_admin_1_states_provinces_lines (.geojson)

Projektion wie die Expeditionskarte (Lambert-Schnittkegel 35°/55° N, 10° O),
damit beide Karten dieselbe Handschrift haben.
Aufruf (im Projektordner):  python3 werkzeuge/italien.py <ne10-ordner>
"""

import json
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from karte import roh, vereinfachen, pfad, grad_text  # noqa: E402

PROJEKT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

LON_MIN, LON_MAX = -3.0, 29.0  # breiter als Italien, damit die Karte im Querformat den Bildschirm füllt
LAT_MIN, LAT_MAX = 36.0, 47.6
BREITE = 1000.0

# Nahbereich um Genazzano (fein aufgelöst, wird beim Heranzoomen eingeblendet)
NAH = (11.2, 14.8, 40.8, 42.9)  # lon_min, lon_max, lat_min, lat_max

GENAZZANO = (41.831, 12.972)

# Beschriftung (deutsche Namen). Ebene „fern“ = ganz Italien, „nah“ = Latium
ORTE = [
    ("Rom", 41.898, 12.481, "beide"),
    ("Mailand", 45.472, 9.203, "fern"),
    ("Venedig", 45.439, 12.335, "fern"),
    ("Florenz", 43.780, 11.250, "fern"),
    ("Neapel", 40.842, 14.243, "fern"),
    ("Palermo", 38.127, 13.348, "fern"),
    ("Tivoli", 41.963, 12.798, "nah"),
    ("Palestrina", 41.839, 12.891, "nah"),
    ("Subiaco", 41.925, 13.095, "nah"),
    ("Frosinone", 41.640, 13.340, "nah"),
]

rand = []
for i in range(101):
    t = i / 100
    lon = LON_MIN + (LON_MAX - LON_MIN) * t
    lat = LAT_MIN + (LAT_MAX - LAT_MIN) * t
    rand += [roh(lon, LAT_MIN), roh(lon, LAT_MAX), roh(LON_MIN, lat), roh(LON_MAX, lat)]
X0 = min(p[0] for p in rand)
X1 = max(p[0] for p in rand)
Y0 = min(p[1] for p in rand)
Y1 = max(p[1] for p in rand)
SKALA = BREITE / (X1 - X0)
HOEHE = (Y1 - Y0) * SKALA
KM_PRO_EINHEIT = 6371.0 / SKALA


def proj(lon, lat):
    x, y = roh(lon, lat)
    return ((x - X0) * SKALA, (y - Y0) * SKALA)


def box(lon0, lon1, lat0, lat1):
    pk = [proj(lon, lat) for lon in (lon0, lon1) for lat in (lat0, lat1)]
    return min(p[0] for p in pk), min(p[1] for p in pk), max(p[0] for p in pk), max(p[1] for p in pk)


def clip(punkte, xmin, ymin, xmax, ymax):
    """Sutherland–Hodgman auf ein Rechteck."""

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


def pfad2(ringe, geschlossen=True, stellen=2):
    teile = []
    for r in ringe:
        if len(r) < (3 if geschlossen else 2):
            continue
        s = "M" + " L".join(f"{x:.{stellen}f} {y:.{stellen}f}" for x, y in r)
        teile.append(s + ("Z" if geschlossen else ""))
    return "".join(teile)


def geo_in(coords, lon0, lon1, lat0, lat1, puffer=1.0):
    return any(lon0 - puffer <= x <= lon1 + puffer and lat0 - puffer <= y <= lat1 + puffer for x, y in coords)


def flaechen(datei, rahmen, geo, toleranz, stellen):
    gj = json.load(open(datei))
    ringe = []
    for f in gj["features"]:
        g = f["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        for poly in polys:
            for ring in poly:
                if not geo_in(ring, *geo):
                    continue
                if ring[0] == ring[-1]:
                    ring = ring[:-1]
                pk = clip([proj(x, y) for x, y in ring], *rahmen)
                pk = vereinfachen(pk, toleranz) if pk else []
                if len(pk) >= 3:
                    ringe.append(pk)
    return pfad2(ringe, True, stellen)


def linien(datei, rahmen, geo, toleranz, stellen, filter_=None):
    gj = json.load(open(datei))
    xmin, ymin, xmax, ymax = rahmen
    stuecke = []
    for f in gj["features"]:
        if filter_ and not filter_(f["properties"]):
            continue
        g = f["geometry"]
        teile = g["coordinates"] if g["type"] == "MultiLineString" else [g["coordinates"]]
        for t in teile:
            if not geo_in(t, *geo, puffer=0):
                continue
            aktuell = []
            for x, y in t:
                p = proj(x, y)
                if xmin <= p[0] <= xmax and ymin <= p[1] <= ymax:
                    aktuell.append(p)
                elif aktuell:
                    stuecke.append(aktuell)
                    aktuell = []
            if aktuell:
                stuecke.append(aktuell)
    stuecke = [vereinfachen(s, toleranz) for s in stuecke]
    return pfad2([s for s in stuecke if len(s) >= 2], False, stellen)


def gradnetz(schritt, rahmen):
    xmin, ymin, xmax, ymax = rahmen
    stuecke = []
    for lat in range(int(LAT_MIN) - 1, int(LAT_MAX) + 2, schritt):
        stuecke.append([proj(LON_MIN - 3 + i * 0.25, lat) for i in range(int((LON_MAX - LON_MIN + 6) / 0.25) + 1)])
    for lon in range(int(LON_MIN) - 1, int(LON_MAX) + 2, schritt):
        stuecke.append([proj(lon, LAT_MIN - 3 + i * 0.25) for i in range(int((LAT_MAX - LAT_MIN + 6) / 0.25) + 1)])
    aus = []
    for s in stuecke:
        s = [p for p in s if xmin - 5 <= p[0] <= xmax + 5 and ymin - 5 <= p[1] <= ymax + 5]
        if len(s) >= 2:
            aus.append(vereinfachen(s, 0.05))
    return pfad2(aus, False, 1)


def main():
    ne = sys.argv[1]
    ganz = (-6.0, -6.0, BREITE + 6, HOEHE + 6)
    geo_ganz = (LON_MIN, LON_MAX, LAT_MIN, LAT_MAX)
    x0, y0, x1, y1 = box(*NAH)
    nah = (x0, y0, x1, y1)

    fern_tol = 0.6 / KM_PRO_EINHEIT  # Vereinfachung ≈ 600 m (ganz Italien)
    nah_tol = 0.055 / KM_PRO_EINHEIT  # ≈ 55 m (Nahkarte)
    daten = {
        "land": flaechen(os.path.join(ne, "ne_10m_land.geojson"), ganz, geo_ganz, fern_tol, 1),
        "seen": flaechen(os.path.join(ne, "ne_10m_lakes.geojson"), ganz, geo_ganz, fern_tol, 1),
        "grenzen": linien(os.path.join(ne, "ne_10m_admin_0_boundary_lines_land.geojson"), ganz, geo_ganz, fern_tol, 1),
        "landNah": flaechen(os.path.join(ne, "ne_10m_land.geojson"), nah, NAH, nah_tol, 2),
        "seenNah": flaechen(os.path.join(ne, "ne_10m_lakes.geojson"), nah, NAH, nah_tol, 2),
        "regionenNah": linien(
            os.path.join(ne, "ne_10m_admin_1_states_provinces_lines.geojson"), nah, NAH, nah_tol, 2,
            lambda p: p.get("ADM0_A3") == "ITA",
        ),
        "fluesseNah": linien(os.path.join(ne, "ne_10m_rivers_lake_centerlines.geojson"), nah, NAH, nah_tol, 2),
        "gradnetz": gradnetz(1, ganz),
    }
    gx, gy = proj(GENAZZANO[1], GENAZZANO[0])
    orte = [
        {"name": n, "x": round(proj(lon, lat)[0], 2), "y": round(proj(lon, lat)[1], 2), "ebene": e}
        for n, lat, lon, e in ORTE
    ]

    # Kamerafahrt: drei Ausschnitte (viewBox) – Italien, Latium, Genazzano
    def italien_ausschnitt(verhaeltnis=1.75):
        oben = min(proj(lon, 47.4)[1] for lon in range(6, 20))
        unten = max(proj(lon, 36.4)[1] for lon in range(6, 20))
        h = unten - oben
        b = h * verhaeltnis
        mx = proj(12.6, 42.0)[0]
        return [round(mx - b / 2, 2), round(oben, 2), round(b, 2), round(h, 2)]

    def ausschnitt(mx, my, breite, verhaeltnis=1.5):
        h = breite / verhaeltnis
        return [round(mx - breite / 2, 2), round(my - h / 2, 2), round(breite, 2), round(h, 2)]

    fahrt = {
        # ganz Italien von den Alpen bis Sizilien, im Querformat
        "italien": italien_ausschnitt(),
        # rund 200 km bzw. 12 km breit
        "latium": ausschnitt(gx - 10.7 / KM_PRO_EINHEIT, gy + 5.4 / KM_PRO_EINHEIT, 200 / KM_PRO_EINHEIT),
        "genazzano": ausschnitt(gx, gy, 12 / KM_PRO_EINHEIT),
    }

    ziel = os.path.join(PROJEKT, "app", "italien-daten.ts")
    with open(ziel, "w") as f:
        f.write("// Automatisch erzeugt von werkzeuge/italien.py – nicht von Hand bearbeiten.\n")
        f.write("// Kartengrundlage: Natural Earth 1:10m, gemeinfrei (naturalearthdata.com).\n\n")
        f.write(f"export const ITALIEN = {{ breite: {BREITE:.0f}, hoehe: {HOEHE:.1f}, kmProEinheit: {KM_PRO_EINHEIT:.4f} }};\n\n")
        f.write(f"export const NAHBEREICH = {json.dumps([round(v, 2) for v in nah])};\n\n")
        for k, v in daten.items():
            f.write(f"export const {k} = {json.dumps(v)};\n\n")
        f.write(f"export const ORTE = {json.dumps(orte, ensure_ascii=False)};\n\n")
        f.write(
            f"export const GENAZZANO = {{ x: {gx:.2f}, y: {gy:.2f}, koordinaten: {json.dumps(grad_text(*GENAZZANO), ensure_ascii=False)} }};\n\n"
        )
        f.write(f"export const FAHRT = {json.dumps(fahrt)};\n")
    print("viewBox", BREITE, round(HOEHE, 1), "| Nahbereich", [round(v, 1) for v in nah])
    print("Genazzano", round(gx, 2), round(gy, 2), "| km/Einheit", round(KM_PRO_EINHEIT, 3))
    print({k: len(v) // 1024 for k, v in daten.items()}, "KB | Datei", os.path.getsize(ziel) // 1024, "KB")


if __name__ == "__main__":
    main()
