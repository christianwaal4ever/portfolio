import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Christian Waal — Innenarchitektur",
  description: "Portfolio für Innenarchitektur",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  );
}
