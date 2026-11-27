"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

/*
 * 3D-Betrachter für den Bestand des Nymphäums (Etappe 6, F4).
 * - Modellbau-Look: helles, mattes Material wie ein 3D-Druck, feine dunkle Kanten
 *   wie in Christians Axonometrien, darunter ein Vermessungsraster.
 * - Mit der Maus (bzw. dem Finger) frei in alle Richtungen drehbar.
 *   Mausrad/Zoom bleibt aus, damit das Scrollen der Seite nicht hängen bleibt.
 * - „wachstum“ (0–1) lässt das Modell von unten nach oben aus dem Boden
 *   wachsen – wie eine Schnittebene, die nach oben wandert (3D-Druck).
 */

export type Modell3DSteuerung = { setWachstum: (p: number) => void };

type Props = { src: string; className?: string; onBereit?: () => void };

const FARBE_MODELL = "#f1ede4";
const FARBE_KANTE = "#121212";
const FARBE_RASTER = "#cfc9bd";

const Modell3D = forwardRef<Modell3DSteuerung, Props>(function Modell3D({ src, className, onBereit }, ref) {
  const halter = useRef<HTMLDivElement>(null);
  const zustand = useRef({
    wachstum: 0,
    hoehe: 1,
    ebene: new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
    gruppe: null as THREE.Group | null,
    raster: null as THREE.Object3D | null,
    neuZeichnen: () => {},
  });

  useImperativeHandle(ref, () => ({
    setWachstum(p: number) {
      const z = zustand.current;
      z.wachstum = Math.min(Math.max(p, 0), 1);
      anwenden();
      z.neuZeichnen();
    },
  }));

  // Wachstum auf Schnittebene, Größe und Raster übertragen
  function anwenden() {
    const z = zustand.current;
    const p = z.wachstum;
    const e = 1 - Math.pow(1 - p, 3); // weich auslaufend
    z.ebene.constant = -0.02 + e * (z.hoehe + 0.05);
    if (z.gruppe) {
      z.gruppe.visible = p > 0.001;
      z.gruppe.scale.setScalar(0.82 + 0.18 * e);
    }
    if (z.raster) {
      z.raster.visible = p > 0.001;
      z.raster.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.Material | undefined;
        if (m) m.opacity = Math.min(1, p * 3) * 0.9;
      });
    }
  }

  useEffect(() => {
    const el = halter.current;
    if (!el) return;
    const z = zustand.current;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.localClippingEnabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.setAttribute("aria-hidden", "true");

    const szene = new THREE.Scene();
    const kamera = new THREE.PerspectiveCamera(28, 1, 0.1, 500);
    kamera.position.set(13, 11, 17);

    szene.add(new THREE.HemisphereLight("#ffffff", "#bdb6a6", 1.9));
    const sonne = new THREE.DirectionalLight("#ffffff", 1.5);
    sonne.position.set(-6, 12, 8);
    szene.add(sonne);

    const steuerung = new OrbitControls(kamera, renderer.domElement);
    steuerung.enableZoom = false;
    steuerung.enablePan = false;
    steuerung.enableDamping = true;
    steuerung.dampingFactor = 0.08;
    steuerung.autoRotate = true;
    steuerung.autoRotateSpeed = 0.7;
    steuerung.rotateSpeed = 0.8;
    // Sobald jemand selbst dreht, hört die automatische Drehung auf
    steuerung.addEventListener("start", () => {
      steuerung.autoRotate = false;
    });

    let sichtbar = false;
    let laeuft = false;
    let abbruch = false;

    const zeichnen = () => {
      renderer.render(szene, kamera);
    };
    const schleife = () => {
      if (!sichtbar || abbruch) {
        laeuft = false;
        return;
      }
      steuerung.update();
      zeichnen();
      requestAnimationFrame(schleife);
    };
    const starten = () => {
      if (!laeuft && sichtbar) {
        laeuft = true;
        requestAnimationFrame(schleife);
      }
    };
    z.neuZeichnen = () => {
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
      // Bei schmalen Formaten weiter weg, damit das Modell ganz zu sehen ist
      const abstand = b / h < 1 ? 1.35 : 1;
      kamera.position.setLength(24 * abstand);
      kamera.updateProjectionMatrix();
      z.neuZeichnen();
    };
    const ro = new ResizeObserver(groesse);
    ro.observe(el);
    groesse();

    // Nur rechnen, wenn der Betrachter im Bild ist
    const io = new IntersectionObserver(([eintrag]) => {
      sichtbar = eintrag.isIntersecting;
      starten();
    });
    io.observe(el);

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(src, (gltf) => {
      if (abbruch) return;
      const gruppe = new THREE.Group();
      const material = new THREE.MeshStandardMaterial({
        color: FARBE_MODELL,
        roughness: 0.92,
        metalness: 0,
        flatShading: true,
        side: THREE.DoubleSide,
        clippingPlanes: [z.ebene],
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      });
      const kantenMaterial = new THREE.LineBasicMaterial({
        color: FARBE_KANTE,
        transparent: true,
        opacity: 0.5,
        clippingPlanes: [z.ebene],
      });
      gltf.scene.updateMatrixWorld(true);
      gltf.scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        // Geometrie in Weltkoordinaten „backen“: erst die komprimierten
        // Ganzzahl-Koordinaten in Kommazahlen umwandeln, sonst werden sie beim
        // Hochrechnen abgeschnitten
        const roh = mesh.geometry.getAttribute("position");
        const werte = new Float32Array(roh.count * 3);
        for (let i = 0; i < roh.count; i++) {
          werte[i * 3] = roh.getX(i);
          werte[i * 3 + 1] = roh.getY(i);
          werte[i * 3 + 2] = roh.getZ(i);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(werte, 3));
        if (mesh.geometry.index) geo.setIndex(mesh.geometry.index.clone());
        geo.applyMatrix4(mesh.matrixWorld);
        const flaeche = new THREE.Mesh(geo, material);
        const kanten = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 28), kantenMaterial);
        gruppe.add(flaeche, kanten);
      });

      const box = new THREE.Box3().setFromObject(gruppe);
      z.hoehe = box.max.y;
      szene.add(gruppe);
      z.gruppe = gruppe;

      // Vermessungsraster unter dem Modell
      const raster = new THREE.GridHelper(18, 18, FARBE_RASTER, FARBE_RASTER);
      const rm = raster.material as THREE.Material;
      rm.transparent = true;
      raster.position.y = -0.01;
      szene.add(raster);
      z.raster = raster;

      steuerung.target.set(0, z.hoehe * 0.35, 0);
      steuerung.update();
      anwenden();
      zeichnen();
      onBereit?.();
    });

    return () => {
      abbruch = true;
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
      renderer.dispose();
      renderer.domElement.remove();
      z.gruppe = null;
      z.raster = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return <div ref={halter} className={className} />;
});

export default Modell3D;
