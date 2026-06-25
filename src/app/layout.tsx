import type { Metadata } from "next";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Navbar } from "./Navbar";
import { getSession } from "@/lib/session";
import { site } from "@/lib/site";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: `${site.brand.name} - Live Lectures`,
  description: "Live JEE & NEET physics lectures with India's clearest explanations.",
  openGraph: {
    title: `${site.brand.name} - Live Lectures`,
    description: "Live JEE & NEET physics lectures with India's clearest explanations.",
    siteName: site.brand.name,
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
        <footer className="mx-auto mt-10 max-w-5xl space-y-3 border-t border-line px-6 py-10 text-xs text-ink/50">
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/terms" className="hover:text-ink/80">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-ink/80">
              Privacy Policy
            </Link>
          </nav>
          <p>
            &copy; {new Date().getFullYear()} {site.brand.name}
            {site.contact.supportEmail ? (
              <>
                {" / "}
                <a href={`mailto:${site.contact.supportEmail}`} className="hover:text-ink/80">
                  {site.contact.supportEmail}
                </a>
              </>
            ) : null}
          </p>
          {site.business.legalName || site.business.cin ? (
            <p>
              {site.business.legalName}
              {site.business.legalName && site.business.cin ? " / " : ""}
              {site.business.cin ? `CIN: ${site.business.cin}` : ""}
            </p>
          ) : null}
        </footer>
      </body>
    </html>
  );
}
