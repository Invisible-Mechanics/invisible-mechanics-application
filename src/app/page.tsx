import { isMasterclassModeEnabled } from "@/lib/masterclass-server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (isMasterclassModeEnabled()) {
    const { MasterclassLandingGate } = await import("./MasterclassLandingGate");
    return <MasterclassLandingGate />;
  }

  const { LandingPage } = await import("./LandingPage");
  return <LandingPage />;
}
