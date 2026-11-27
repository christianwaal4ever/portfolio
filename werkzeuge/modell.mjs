/*
 * STL → GLB für die Website (Etappe 6, NIFEO-Scroll-Expedition).
 *
 * Aufruf (im Projektordner):  node werkzeuge/modell.mjs
 *
 * - liest die Original-STL aus portfolio_material (bleibt unverändert)
 * - verschweißt doppelte Eckpunkte, dreht Rhino-„Z oben“ auf Web-„Y oben“
 * - setzt die Mitte der Grundfläche auf den Nullpunkt und skaliert auf
 *   10 Einheiten Breite (gleicher Faktor für alle Teile → passen später zusammen)
 * - komprimiert mit Meshopt und schreibt public/modelle/<name>.glb
 */
import fs from "node:fs";
import path from "node:path";
import { Document, NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { weld, dedup, prune, reorder, quantize, meshopt } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";

const QUELLE = "portfolio_material/1_Kunstschule_NIFEO/3D";
const ZIEL = "public/modelle";

// Bezugsrahmen = Bestand. Neue Elemente werden später mit demselben
// Versatz und Faktor umgerechnet, damit sie exakt im Bestand landen.
const TEILE = [{ datei: "Bestand.stl", name: "nifeo-bestand" }];

function stlLesen(datei) {
  const b = fs.readFileSync(datei);
  const n = b.readUInt32LE(80);
  if (84 + n * 50 !== b.length) throw new Error(`${datei}: keine binäre STL`);
  const pos = new Float32Array(n * 9);
  for (let i = 0; i < n; i++) {
    const o = 84 + i * 50 + 12;
    for (let v = 0; v < 3; v++) {
      const x = b.readFloatLE(o + v * 12);
      const y = b.readFloatLE(o + v * 12 + 4);
      const z = b.readFloatLE(o + v * 12 + 8);
      // Rhino Z-oben → Web Y-oben (x bleibt, y = z, z = -y)
      pos.set([x, z, -y], i * 9 + v * 3);
    }
  }
  return pos;
}

function grenzen(pos) {
  const mn = [Infinity, Infinity, Infinity];
  const mx = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos.length; i += 3)
    for (let k = 0; k < 3; k++) {
      mn[k] = Math.min(mn[k], pos[i + k]);
      mx[k] = Math.max(mx[k], pos[i + k]);
    }
  return { mn, mx };
}

await MeshoptEncoder.ready;
fs.mkdirSync(ZIEL, { recursive: true });

// Bezug aus dem Bestand bestimmen
const bestand = stlLesen(path.join(QUELLE, "Bestand.stl"));
const { mn, mx } = grenzen(bestand);
const mitte = [(mn[0] + mx[0]) / 2, mn[1], (mn[2] + mx[2]) / 2];
const faktor = 10 / Math.max(mx[0] - mn[0], mx[2] - mn[2]);
console.log("Bezug:", { mitte: mitte.map((v) => +v.toFixed(4)), faktor: +faktor.toFixed(3) });

for (const teil of TEILE) {
  const pos = stlLesen(path.join(QUELLE, teil.datei));
  for (let i = 0; i < pos.length; i += 3)
    for (let k = 0; k < 3; k++) pos[i + k] = (pos[i + k] - mitte[k]) * faktor;

  const doc = new Document();
  const puffer = doc.createBuffer();
  const attr = doc.createAccessor().setType("VEC3").setArray(pos).setBuffer(puffer);
  const prim = doc.createPrimitive().setAttribute("POSITION", attr);
  const mesh = doc.createMesh(teil.name).addPrimitive(prim);
  const knoten = doc.createNode(teil.name).setMesh(mesh);
  doc.createScene().addChild(knoten);

  await doc.transform(
    weld(),
    dedup(),
    prune(),
    reorder({ encoder: MeshoptEncoder }),
    quantize(),
    meshopt({ encoder: MeshoptEncoder, level: "high" }),
  );

  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder });
  const ziel = path.join(ZIEL, `${teil.name}.glb`);
  await io.write(ziel, doc);
  const dreiecke = pos.length / 9;
  console.log(`${teil.datei} → ${ziel}  (${dreiecke} Dreiecke, ${(fs.statSync(ziel).size / 1024).toFixed(0)} KB)`);
}
