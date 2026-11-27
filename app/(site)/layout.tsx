import Header from "../components/header";
import Footer from "../components/footer";
import Animationen from "../components/animationen";
import ScrollStart from "../components/scroll-start";

// Rahmen für alle öffentlichen Seiten (nicht für die Login-Seite)
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#inhalt"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-papier focus:px-4 focus:py-2"
      >
        Zum Inhalt springen
      </a>
      <Header />
      <main id="inhalt">{children}</main>
      <Footer />
      <Animationen />
      <ScrollStart />
    </>
  );
}
