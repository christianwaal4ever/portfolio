export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-between p-8 md:p-16">
      <header className="text-sm uppercase tracking-[0.3em]">
        Christian Waal
      </header>

      <section>
        <h1 className="text-5xl font-light leading-tight md:text-8xl">
          Innen&shy;architektur
        </h1>
        <p className="mt-6 max-w-md text-lg opacity-70">
          Räume, die man fühlt. Das Portfolio entsteht gerade.
        </p>
      </section>

      <footer className="text-sm opacity-50">
        © {new Date().getFullYear()} — in Arbeit
      </footer>
    </main>
  );
}
