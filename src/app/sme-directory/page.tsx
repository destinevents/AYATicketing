import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PlaceholderSection } from "@/components/PlaceholderSection";

export default function SMEDirectoryPage() {
  return (
    <>
      <Navbar />
      <PlaceholderSection
        eyebrow="SME Directory"
        title={<>Baguio&apos;s <em className="italic text-terra">Local Businesses</em></>}
        description="The SME Directory (Founding Partners + open slots) lives on the main AYA landing page. This section will be merged into the Events Hub as the platforms are unified — with Supabase-backed listings."
      />
      <Footer />
    </>
  );
}
