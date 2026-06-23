import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Navbar } from "./Navbar";
import { getSession } from "@/lib/session";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Invisible Mechanics — Live Lectures",
  description: "Live JEE & NEET physics lectures with India's clearest explanations.",
  openGraph: {
    title: "Invisible Mechanics — Live Lectures",
    description: "Live JEE & NEET physics lectures with India's clearest explanations.",
    siteName: "Invisible Mechanics",
    type: "website",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const navUser = session ? { email: session.email, role: session.role } : null;

  return (
    <html lang="en" className={sans.variable}>
      <body>
        <Navbar user={navUser} />
        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
        <footer className="mx-auto mt-10 max-w-5xl border-t border-line px-6 py-10 text-xs text-ink/50">
          © {new Date().getFullYear()} Invisible Mechanics
        </footer>
      </body>
    </html>
  );
}
