import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PlaceholderSection } from "@/components/PlaceholderSection";

export default function EMagazinePage() {
  return (
    <>
      <Navbar />
      <PlaceholderSection
        eyebrow="AYA eMagazine"
        title={<>Stories from the <em className="italic text-terra">City of Pines</em></>}
        description="The Heyzine eMagazine flipbook embed and past issues archive live on the main AYA landing page. This section will be merged into the Events Hub as the platforms are unified."
      />
      <Footer />
    </>
  );
}
