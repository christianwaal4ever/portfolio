"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import ausrichtung from "./ausrichtung.json";
import { ABSTAND, DETAIL, FOV, pxProEinheit } from "./kamera";

/*
 * 3D-Betrachter für den Bestand des Nymphäums (Etappe 6, F4).
 *
 * - Das Modell steht exakt auf seinem Grundriss im Lageplan: Der Lageplan liegt
 *   als Blatt in der 3D-Szene, Drehung/Maßstab/Lage stammen aus
 *   werkzeuge/ausrichtung.py (Schnitt durchs Modell ↔ Wände im Plan).
 * - Kamera: von oben (Draufsicht, deckungsgleich mit dem Lageplan) bis zur
 *   Schrägansicht. Danach frei drehbar; „Draufsicht“ führt zurück.
 * - Modellbau-Look: mattes, helles Material, weich schattiert; nur die
 *   wichtigen, längeren Kanten fein nachgezogen (keine Zacken der Bruchkanten).
 * - Wachsen wie im 3D-Druck: Eine Schnittebene wandert nach oben; die
 *   Schnittflächen erscheinen gefüllt (Rückseiten in Schnittfarbe), das
 *   Modell wirkt massiv statt hohl.
 */

export type Pose = { neigung: number }; // 0 = Draufsicht, 1 = Schrägansicht
export type Modell3DSteuerung = {
  setWachstum: (p: number) => void;
  setNeigung: (t: number) => void; // vom Scrollen gesteuert
  setFrei: (frei: boolean) => void; // Drehen mit der Maus erlaubt?
  fahreZu: (ziel: "draufsicht" | "schraeg") => void;
  pxProEinheit: (hoeheBuehne: number) => number; // Bildschirm-Pixel pro Einheit in der Draufsicht
};

type Props = {
  src: string;
  planSrc: string;
  className?: string;
  onBereit?: () => void;
  onAnsicht?: (draufsicht: boolean) => void;
};

const FARBE_MODELL = "#efeadf";
// Schnittfläche beim Wachsen: ein Ton dunkler als das Modell, wie massives Material
const FARBE_SCHNITT = "#d3c9b6";
// Konturen: warmes Grau statt Schwarz, nur an markanten Kanten
const FARBE_KANTE = "#6f685b";
const FARBE_PAPIER = "#f6f4ef";

const DRAUF = { polar: 0.0001, azimut: 0 };
// Schrägansicht von der Vorderseite der Ruine
const SCHRAEG = { polar: THREE.MathUtils.degToRad(56), azimut: THREE.MathUtils.degToRad(148) };
// Licht kommt von vorne (leicht seitlich), der Schatten fällt nach hinten
const SONNE = new THREE.Vector3().setFromSphericalCoords(16, THREE.MathUtils.degToRad(42), THREE.MathUtils.degToRad(175));

const Modell3D = forwardRef<Modell3DSteuerung, Props>(function Modell3D(
  { src, planSrc, className, onBereit, onAnsicht },
  ref,
) {
  const halter = useRef<HTMLDivElement>(null);
  const z = useRef({
    wachstum: 0,
    neigung: 0,
    frei: false,
    hoehe: 1,
    ebene: new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
    modell: null as THREE.Group | null,
    blatt: null as { value: number } | null, // wie stark der Plan zum Papier hin verblasst
    kamera: null as THREE.PerspectiveCamera | null,
    steuerung: null as OrbitControls | null,
    fahrt: null as gsap.core.Tween | null,
    neuZeichnen: () => {},
  });

  // Kamera auf eine Pose zwischen Draufsicht (0) und Schrägansicht (1) setzen
  function poseSetzen(t: number) {
    const s = z.current;
    if (!s.kamera || !s.steuerung) return;
    const e = t * t * (3 - 2 * t);
    const polar = DRAUF.polar + (SCHRAEG.polar - DRAUF.polar) * e;
    const azimut = DRAUF.azimut + (SCHRAEG.azimut - DRAUF.azimut) * e;
    const ziel = new THREE.Vector3(0, s.hoehe * 0.25 * e, 0);
    const pos = new THREE.Vector3().setFromSphericalCoords(ABSTAND, polar, azimut).add(ziel);
    s.kamera.position.copy(pos);
    s.kamera.up.set(0, 1, 0);
    s.steuerung.target.copy(ziel);
    s.kamera.lookAt(ziel);
    s.steuerung.update();
    // In der Schrägansicht tritt der Plan etwas zurück (sonst wirken die schwarzen
    // Wände unter dem Modell wie harte Schatten)
    if (s.blatt) s.blatt.value = 0.5 * e;
  }

  function wachstumAnwenden() {
    const s = z.current;
    const e = 1 - Math.pow(1 - s.wachstum, 2);
    s.ebene.constant = -0.01 + e * (s.hoehe + 0.05);
    if (s.modell) {
      s.modell.visible = s.wachstum > 0.001;
      // Schnittflächen nur während des Wachsens; danach bleibt die Außenhaut allein
      s.modell.children.forEach((o) => {
        if (o.userData.innen) o.visible = s.wachstum < 0.999;
      });
    }
  }

  useImperativeHandle(ref, () => ({
    setWachstum(p) {
      z.current.wachstum = Math.min(Math.max(p, 0), 1);
      wachstumAnwenden();
      z.current.neuZeichnen();
    },
    setNeigung(t) {
      const s = z.current;
      s.neigung = Math.min(Math.max(t, 0), 1);
      if (!s.frei) {
        s.fahrt?.kill();
        poseSetzen(s.neigung);
        s.neuZeichnen();
      }
    },
    setFrei(frei) {
      const s = z.current;
      if (s.frei === frei) return;
      s.frei = frei;
      if (s.steuerung) s.steuerung.enabled = frei;
      // Zurück in die Scroll-Steuerung: Kamera wieder auf die Scroll-Pose
      if (!frei) {
        s.fahrt?.kill();
        poseSetzen(s.neigung);
        onAnsicht?.(false);
        s.neuZeichnen();
      }
    },
    fahreZu(ziel) {
      const s = z.current;
      if (!s.kamera || !s.steuerung) return;
      const k = s.kamera;
      const st = s.steuerung;
      // aktuelle Lage als Kugelkoordinaten um das Ziel
      const v = new THREE.Vector3().subVectors(k.position, st.target);
      const sph = new THREE.Spherical().setFromVector3(v);
      const nach = ziel === "draufsicht" ? DRAUF : SCHRAEG;
      // kürzester Weg um die Hochachse
      let dAz = nach.azimut - sph.theta;
      dAz = Math.atan2(Math.sin(dAz), Math.cos(dAz));
      const start = { polar: sph.phi, azimut: sph.theta, ty: st.target.y };
      const zielY = ziel === "draufsicht" ? 0 : s.hoehe * 0.25;
      const w = { t: 0 };
      s.fahrt?.kill();
      s.fahrt = gsap.to(w, {
        t: 1,
        duration: 1.1,
        ease: "power2.inOut",
        onUpdate: () => {
          const polar = start.polar + (nach.polar - start.polar) * w.t;
          const azimut = start.azimut + dAz * w.t;
          st.target.set(0, start.ty + (zielY - start.ty) * w.t, 0);
          k.position.setFromSphericalCoords(ABSTAND, Math.max(polar, 0.0001), azimut).add(st.target);
          k.lookAt(st.target);
          st.update();
          s.neuZeichnen();
        },
      });
      onAnsicht?.(ziel === "draufsicht");
    },
    pxProEinheit,
  }));

  useEffect(() => {
    const el = halter.current;
    if (!el) return;
    const s = z.current;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.localClippingEnabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.setAttribute("aria-hidden", "true");

    const szene = new THREE.Scene();
    const kamera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 600);
    s.kamera = kamera;

    szene.add(new THREE.HemisphereLight("#ffffff", "#c9c1b0", 1.7));
    const sonne = new THREE.DirectionalLight("#ffffff", 1.6);
    sonne.position.copy(SONNE);
    sonne.castShadow = true;
    sonne.shadow.mapSize.set(2048, 2048);
    const sc = sonne.shadow.camera;
    sc.left = -9;
    sc.right = 9;
    sc.top = 9;
    sc.bottom = -9;
    sc.near = 1;
    sc.far = 40;
    sonne.shadow.bias = -0.0005;
    sonne.shadow.radius = 4;
    szene.add(sonne);

    const steuerung = new OrbitControls(kamera, renderer.domElement);
    steuerung.enableZoom = false;
    steuerung.enablePan = false;
    steuerung.enableDamping = true;
    steuerung.dampingFactor = 0.08;
    steuerung.rotateSpeed = 0.8;
    steuerung.minPolarAngle = 0;
    steuerung.maxPolarAngle = Math.PI;
    steuerung.enabled = s.frei;
    s.steuerung = steuerung;
    steuerung.addEventListener("start", () => {
      s.fahrt?.kill();
      onAnsicht?.(false);
    });

    // ---- Lageplan als Blatt unter dem Modell ----
    // Hochaufgelöster Ausschnitt; (ux, uy) = Modell-Ursprung in Pixeln der Web-Kopie
    const [ux, uy] = ausrichtung.ursprungPx;
    const k = ausrichtung.pxProEinheit;
    const seite = DETAIL.groesse / k;
    // Das Blatt ist undurchsichtig: der weiche Rand zum Papierton wird direkt ins
    // Bild gemalt. (Halbtransparent hing die Sichtbarkeit vom Blickwinkel ab.)
    const leinwand = document.createElement("canvas");
    leinwand.width = leinwand.height = 2048;
    const g = leinwand.getContext("2d")!;
    g.fillStyle = FARBE_PAPIER;
    g.fillRect(0, 0, 2048, 2048);
    const planTextur = new THREE.CanvasTexture(leinwand);
    planTextur.colorSpace = THREE.SRGBColorSpace;
    planTextur.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const bild = new Image();
    bild.onload = () => {
      if (abbruch) return;
      const mx = ((ux - DETAIL.x0) / DETAIL.groesse) * 2048;
      const my = ((uy - DETAIL.y0) / DETAIL.groesse) * 2048;
      // 1. Plan in eine Ebene malen und mit einem runden Verlauf freistellen
      const ebene = document.createElement("canvas");
      ebene.width = ebene.height = 2048;
      const e2 = ebene.getContext("2d")!;
      e2.drawImage(bild, 0, 0, 2048, 2048);
      e2.globalCompositeOperation = "destination-in";
      const verlauf = e2.createRadialGradient(mx, my, 2048 * 0.27, mx, my, 2048 * 0.49);
      verlauf.addColorStop(0, "rgba(0,0,0,1)");
      verlauf.addColorStop(1, "rgba(0,0,0,0)");
      e2.fillStyle = verlauf;
      e2.fillRect(0, 0, 2048, 2048);
      // 2. auf Papierton setzen
      g.drawImage(ebene, 0, 0);
      planTextur.needsUpdate = true;
      s.neuZeichnen();
    };
    bild.src = planSrc;

    const blass = { value: 0 };
    s.blatt = blass;
    const blattMaterial = new THREE.MeshBasicMaterial({ map: planTextur, toneMapped: false });
    // In der Schrägansicht tritt der Plan etwas zum Papierton zurück
    blattMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uBlass = blass;
      shader.uniforms.uPapier = { value: new THREE.Color(FARBE_PAPIER) };
      shader.fragmentShader = shader.fragmentShader
        .replace("void main() {", "uniform float uBlass;\nuniform vec3 uPapier;\nvoid main() {")
        .replace("#include <map_fragment>", "#include <map_fragment>\n  diffuseColor.rgb = mix(diffuseColor.rgb, uPapier, uBlass);");
    };
    // zusätzlich: weit draußen läuft alles in Papier aus (größer als der Ausschnitt)
    const blatt = new THREE.Mesh(new THREE.PlaneGeometry(seite, seite), blattMaterial);
    blatt.rotation.x = -Math.PI / 2;
    // Bild-unten = +z (Norden oben, wie im Plan)
    blatt.position.set((DETAIL.x0 + DETAIL.groesse / 2 - ux) / k, -0.002, (DETAIL.y0 + DETAIL.groesse / 2 - uy) / k);
    szene.add(blatt);
    // Schatten auf dem Blatt (nur der Schatten, ohne eigene Fläche)
    // (schreibt keine Tiefe und wird nach dem Blatt gezeichnet – sonst verdeckt sie den Plan)
    const schattenFlaeche = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.ShadowMaterial({ opacity: 0.16, depthWrite: false }),
    );
    schattenFlaeche.rotation.x = -Math.PI / 2;
    schattenFlaeche.position.y = 0.001;
    schattenFlaeche.renderOrder = 2;
    schattenFlaeche.receiveShadow = true;
    szene.add(schattenFlaeche);

    let sichtbar = false;
    let laeuft = false;
    let abbruch = false;
    const zeichnen = () => renderer.render(szene, kamera);
    const schleife = () => {
      if (!sichtbar || abbruch) {
        laeuft = false;
        return;
      }
      if (s.frei) steuerung.update();
      zeichnen();
      requestAnimationFrame(schleife);
    };
    const starten = () => {
      if (!laeuft && sichtbar) {
        laeuft = true;
        requestAnimationFrame(schleife);
      }
    };
    s.neuZeichnen = () => {
      if (!laeuft) zeichnen();
    };

    const groesse = () => {
      const b = el.clientWidth;
      const h = el.clientHeight;
      if (!b || !h) return;
      renderer.setSize(b, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      kamera.aspect = b / h;
      // Hochformat (Handy): etwas weiter hinein schauen, damit das Modell nicht zu klein wird
      kamera.fov = b / h < 1 ? FOV * 1.25 : FOV;
      kamera.updateProjectionMatrix();
      s.neuZeichnen();
    };
    const ro = new ResizeObserver(groesse);
    ro.observe(el);
    groesse();
    poseSetzen(s.neigung);

    const io = new IntersectionObserver(([eintrag]) => {
      sichtbar = eintrag.isIntersecting;
      starten();
    });
    io.observe(el);

    // ---- Modell ----
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(src, (gltf) => {
      if (abbruch) return;
      const modell = new THREE.Group();
      modell.rotation.y = ausrichtung.drehungY;

      const aussen = new THREE.MeshStandardMaterial({
        color: FARBE_MODELL,
        roughness: 0.95,
        metalness: 0,
        side: THREE.FrontSide,
        clippingPlanes: [s.ebene],
      });
      // Rückseiten = Innenleben: zeigen sich nur dort, wo die Schnittebene
      // das Modell aufschneidet → wirkt wie eine massive Schnittfläche
      const innen = new THREE.MeshBasicMaterial({
        color: FARBE_SCHNITT,
        side: THREE.BackSide,
        clippingPlanes: [s.ebene],
        toneMapped: false,
        // etwas nach hinten versetzt, damit sie nicht durch Fugen der Außenhaut schimmern
        polygonOffset: true,
        polygonOffsetFactor: 2,
        polygonOffsetUnits: 4,
      });
      const kantenMaterial = new THREE.LineBasicMaterial({
        color: FARBE_KANTE,
        transparent: true,
        opacity: 0.2,
        clippingPlanes: [s.ebene],
      });

      gltf.scene.updateMatrixWorld(true);
      gltf.scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        // Komprimierte Ganzzahl-Koordinaten in Kommazahlen umwandeln, dann
        // in Weltkoordinaten „backen“ (sonst würden sie abgeschnitten)
        const roh = mesh.geometry.getAttribute("position");
        const werte = new Float32Array(roh.count * 3);
        for (let i = 0; i < roh.count; i++) {
          werte[i * 3] = roh.getX(i);
          werte[i * 3 + 1] = roh.getY(i);
          werte[i * 3 + 2] = roh.getZ(i);
        }
        const roh3 = new THREE.BufferGeometry();
        roh3.setAttribute("position", new THREE.BufferAttribute(werte, 3));
        if (mesh.geometry.index) roh3.setIndex(mesh.geometry.index.clone());
        roh3.applyMatrix4(mesh.matrixWorld);

        // Ruhige Flächen + nur echte Kanten (siehe aufbereiten() unten)
        const { geo, kanten } = aufbereiten(roh3);
        roh3.dispose();

        const flaeche = new THREE.Mesh(geo, aussen);
        flaeche.castShadow = true;
        const rueck = new THREE.Mesh(geo, innen);
        rueck.userData.innen = true;

        const kantenGeo = new THREE.BufferGeometry();
        kantenGeo.setAttribute("position", new THREE.BufferAttribute(kanten, 3));
        modell.add(rueck, flaeche, new THREE.LineSegments(kantenGeo, kantenMaterial));
      });

      const box = new THREE.Box3().setFromObject(modell);
      s.hoehe = box.max.y;
      szene.add(modell);
      s.modell = modell;
      wachstumAnwenden();
      poseSetzen(s.neigung);
      zeichnen();
      onBereit?.();
    });

    return () => {
      abbruch = true;
      s.fahrt?.kill();
      io.disconnect();
      ro.disconnect();
      steuerung.dispose();
      szene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });
      planTextur.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      s.modell = null;
      s.kamera = null;
      s.steuerung = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, planSrc]);

  return <div ref={halter} className={className} />;
});

export default Modell3D;

/*
 * Aufbereitung des Ruinen-Modells für einen ruhigen Modellbau-Look.
 * Das Modell enthält (wie oft beim Polygon-Modellieren) viele hauchdünne
 * „Splitter“-Dreiecke mit leicht schiefen Flächen. Ohne Aufbereitung zeichnen
 * sie Streifen und Zickzack-Linien auf eigentlich glatte Flächen.
 * - Schattierung: Jede Ecke übernimmt den flächengewichteten Mittelwert der
 *   angrenzenden Flächen mit ähnlicher Richtung. Splitter orientieren sich an
 *   ihrer größten Nachbarfläche und verschwinden so optisch.
 * - Kanten: nur dort, wo zwei richtige Flächen (keine Splitter) deutlich
 *   abknicken und die Kante lang genug ist.
 */
function aufbereiten(quelle: THREE.BufferGeometry) {
  const nicht = quelle.index ? quelle.toNonIndexed() : quelle;
  const pos = nicht.getAttribute("position").array as Float32Array;
  const anzahl = pos.length / 9;

  const SPLITTER = 0.03; // Mindesthöhe eines Dreiecks (Modelleinheiten), darunter = Splitter
  const GLATT = Math.cos(THREE.MathUtils.degToRad(38)); // bis zu diesem Knick weich schattieren
  const KANTE = Math.cos(THREE.MathUtils.degToRad(65)); // ab diesem Knick eine Linie zeichnen
  const MIN_LAENGE = 0.4;

  // Flächenrichtung, Fläche, Splitter?
  const fn = new Float32Array(anzahl * 3);
  const fl = new Float32Array(anzahl);
  const splitter = new Uint8Array(anzahl);
  const a = new THREE.Vector3(),
    b = new THREE.Vector3(),
    c = new THREE.Vector3(),
    ab = new THREE.Vector3(),
    ac = new THREE.Vector3(),
    n = new THREE.Vector3();
  for (let t = 0; t < anzahl; t++) {
    a.fromArray(pos, t * 9);
    b.fromArray(pos, t * 9 + 3);
    c.fromArray(pos, t * 9 + 6);
    ab.subVectors(b, a);
    ac.subVectors(c, a);
    n.crossVectors(ab, ac);
    const doppelt = n.length();
    fl[t] = doppelt / 2;
    if (doppelt > 0) n.divideScalar(doppelt);
    n.toArray(fn, t * 3);
    const laengste = Math.max(ab.length(), ac.length(), b.distanceTo(c)) || 1;
    splitter[t] = doppelt / laengste < SPLITTER ? 1 : 0; // Höhe = 2·Fläche / längste Seite
  }

  // Gleiche Eckpunkte finden
  const schluessel = (i: number) =>
    `${Math.round(pos[i] * 1e4)},${Math.round(pos[i + 1] * 1e4)},${Math.round(pos[i + 2] * 1e4)}`;
  const punktId = new Map<string, number>();
  const ecke = new Int32Array(anzahl * 3);
  const anPunkt: number[][] = [];
  for (let i = 0; i < anzahl * 3; i++) {
    const k = schluessel(i * 3);
    let id = punktId.get(k);
    if (id === undefined) {
      id = anPunkt.length;
      punktId.set(k, id);
      anPunkt.push([]);
    }
    ecke[i] = id;
    anPunkt[id].push(Math.floor(i / 3));
  }

  const dot = (t: number, u: number) => fn[t * 3] * fn[u * 3] + fn[t * 3 + 1] * fn[u * 3 + 1] + fn[t * 3 + 2] * fn[u * 3 + 2];

  // Eckennormalen
  const normalen = new Float32Array(anzahl * 9);
  for (let i = 0; i < anzahl * 3; i++) {
    const t = Math.floor(i / 3);
    const nachbarn = anPunkt[ecke[i]];
    // Bezugsfläche: eigene – oder bei Splittern die größte ähnlich gerichtete Nachbarfläche
    let bezug = t;
    if (splitter[t]) {
      let beste = -1;
      for (const u of nachbarn) if (!splitter[u] && dot(t, u) > 0 && (beste < 0 || fl[u] > fl[beste])) beste = u;
      if (beste >= 0) bezug = beste;
    }
    let x = 0,
      y = 0,
      z = 0;
    for (const u of nachbarn) {
      if (dot(bezug, u) < GLATT) continue;
      const w = splitter[u] && u !== bezug ? 0 : fl[u];
      x += fn[u * 3] * w;
      y += fn[u * 3 + 1] * w;
      z += fn[u * 3 + 2] * w;
    }
    const l = Math.hypot(x, y, z);
    if (l > 0) {
      normalen[i * 3] = x / l;
      normalen[i * 3 + 1] = y / l;
      normalen[i * 3 + 2] = z / l;
    } else {
      normalen[i * 3] = fn[bezug * 3];
      normalen[i * 3 + 1] = fn[bezug * 3 + 1];
      normalen[i * 3 + 2] = fn[bezug * 3 + 2];
    }
  }

  // Kanten: zwei richtige Flächen, deutlicher Knick, ausreichend lang
  const kantenMap = new Map<string, number[]>();
  for (let t = 0; t < anzahl; t++) {
    for (let j = 0; j < 3; j++) {
      const p = ecke[t * 3 + j];
      const q = ecke[t * 3 + ((j + 1) % 3)];
      const k = p < q ? `${p}_${q}` : `${q}_${p}`;
      const liste = kantenMap.get(k);
      if (liste) liste.push(t, j);
      else kantenMap.set(k, [t, j]);
    }
  }
  const linien: number[] = [];
  kantenMap.forEach((liste) => {
    if (liste.length !== 4) return; // nur Kanten zwischen genau zwei Flächen
    const [t, j, u] = liste;
    if (splitter[t] || splitter[u]) return;
    if (dot(t, u) > KANTE) return;
    const i0 = t * 9 + j * 3;
    const i1 = t * 9 + ((j + 1) % 3) * 3;
    const dx = pos[i1] - pos[i0],
      dy = pos[i1 + 1] - pos[i0 + 1],
      dz = pos[i1 + 2] - pos[i0 + 2];
    if (dx * dx + dy * dy + dz * dz < MIN_LAENGE * MIN_LAENGE) return;
    linien.push(pos[i0], pos[i0 + 1], pos[i0 + 2], pos[i1], pos[i1 + 1], pos[i1 + 2]);
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(normalen, 3));
  if (nicht !== quelle) nicht.dispose();
  return { geo, kanten: new Float32Array(linien) };
}
