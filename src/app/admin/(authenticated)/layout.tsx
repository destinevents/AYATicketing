import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-fog-warm dark:bg-[#1D2219]">
      <AdminSidebar />
      <div className="admin-main flex-1 overflow-x-hidden pt-14 md:pt-0">{children}</div>
    </div>
  );
}
