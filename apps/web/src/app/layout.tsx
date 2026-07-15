import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amicale",
  description: "Plateforme de gestion pour amicales de sapeurs-pompiers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
