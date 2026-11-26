"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/*
 * Seitenweite, ruhige Scroll-Effekte (keine Dauer-Animationen):
 * - [data-erscheinen]: Element gleitet beim ersten Erscheinen sanft ein
 * - [data-parallax]:   Vollbild bewegt sich etwas langsamer als die Seite
 * Bei „Bewegung reduzieren“ passiert nichts, alles ist sofort sichtbar.
 */
export default function Animationen() {
  const pfad = usePathname();

  useEffect(() => {
    const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const elemente = Array.from(document.querySelectorAll<HTMLElement>("[data-erscheinen]"));

    if (ruhig) {
      elemente.forEach((el) => el.setAttribute("data-erscheinen", "ja"));
      return;
    }

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        eintraege.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute("data-erscheinen", "ja");
            beobachter.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    elemente.forEach((el) => beobachter.observe(el));

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((bild) => {
        gsap.fromTo(
          bild,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: { trigger: bild.parentElement, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    });

    return () => {
      beobachter.disconnect();
      ctx.revert();
    };
  }, [pfad]);

  return null;
}
