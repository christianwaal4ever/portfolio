"use client";

import dynamic from "next/dynamic";

// Die Expedition (Karte + 3D) wird nur auf der NIFEO-Seite geladen,
// die anderen Projektseiten bleiben dadurch leicht.
const Expedition = dynamic(() => import("./expedition"), {
  ssr: false,
  loading: () => <div className="h-[calc(100svh-3.5rem)] bg-papier" aria-hidden="true" />,
});

export default function NifeoExpedition() {
  return <Expedition />;
}
