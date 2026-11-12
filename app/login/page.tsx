// Login-Seite: ein normales HTML-Formular, das an den Server (/api/login) geschickt wird.
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ fehler?: string }>;
}) {
  const { fehler } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        action="/api/login"
        method="post"
        className="w-full max-w-sm space-y-5"
      >
        <h1 className="text-3xl font-light">Passwort</h1>
        <input
          type="password"
          name="passwort"
          required
          autoFocus
          aria-label="Passwort"
          className="w-full rounded-md border border-line bg-bg px-4 py-3 outline-none transition focus:border-accent"
        />
        {fehler && <p className="text-sm text-accent">Falsches Passwort.</p>}
        <button
          type="submit"
          className="rounded-full bg-fg px-8 py-3 text-sm text-bg transition hover:bg-accent"
        >
          Öffnen
        </button>
      </form>
    </main>
  );
}
