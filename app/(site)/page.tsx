import Cover from "../components/home/cover";
import Karte from "../components/home/karte";
import Vita from "../components/home/vita";
import Kontakt from "../components/home/kontakt";

// Startseite: Cover → Expeditionskarte → Vita → Kontakt
export default function Startseite() {
  return (
    <>
      <Cover />
      <Karte />
      <Vita />
      <Kontakt />
    </>
  );
}
