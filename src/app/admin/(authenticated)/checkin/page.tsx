import { Suspense } from "react";
import { CheckInDashboard } from "./CheckInDashboard";

export default function CheckInPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-pine">Event Check-In</h1>
        <p className="mt-1 text-sm text-muted">Scan QR tickets to verify attendees and mark attendance.</p>
      </div>
      <Suspense>
        <CheckInDashboard />
      </Suspense>
    </div>
  );
}
