import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PlaceholderSection } from "@/components/PlaceholderSection";

export default function CommunityPage() {
  return (
    <>
      <Navbar />
      <PlaceholderSection
        eyebrow="Community"
        title={<>Baguio&apos;s <em className="italic text-terra">Creative Voices</em></>}
        description="The Creator Directory and full community profiles live on the main AYA landing page. This section will be merged into the Events Hub as the platforms are unified."
      />
      <Footer />
    </>
  );
}
