// Gemeinsame Kamerawerte für den 3D-Betrachter und die Zoomfahrt.
// Ohne three.js, damit die Fahrt sie kennt, bevor das 3D-Paket geladen ist.
import ausrichtung from "./ausrichtung.json";

export const FOV = 28; // Blickwinkel (Grad, senkrecht)
export const ABSTAND = 25; // Abstand der Kamera zum Modell

// Bildschirm-Pixel pro Modelleinheit in der Draufsicht (auf Bodenhöhe)
export const pxProEinheit = (hoeheBuehne: number) => hoeheBuehne / (2 * ABSTAND * Math.tan(((FOV / 2) * Math.PI) / 180));

// Lage des Modell-Ursprungs im Lageplan (Anteile von Breite/Höhe)
export const PLAN_URSPRUNG = {
  x: ausrichtung.ursprungPx[0] / ausrichtung.planPx[0],
  y: ausrichtung.ursprungPx[1] / ausrichtung.planPx[1],
};
export const PLAN_PX = ausrichtung.planPx as [number, number];
export const PLAN_PX_PRO_EINHEIT = ausrichtung.pxProEinheit;

// Hochaufgelöster Ausschnitt rund um das Nymphäum (werkzeuge/lageplan_detail.py), in Pixeln der Web-Kopie
export const DETAIL = { src: "/bilder/01/lageplan-detail.jpg", ...ausrichtung.detail };
