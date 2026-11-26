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
        <h1 className="font-display text-5xl">Christian Waal</h1>
        <input
          type="password"
          name="passwort"
          required
          autoFocus
          aria-label="Passwort"
          className="w-full rounded-md border border-tinte/30 bg-papier px-4 py-3 outline-none transition focus:border-akzent"
        />
        {fehler && <p className="text-sm text-akzent">Falsches Passwort.</p>}
        <button
          type="submit"
          className="rounded-full bg-tinte px-8 py-3 text-sm text-papier transition hover:bg-akzent"
        >
          Öffnen
        </button>
      </form>
    </main>
  );
}
