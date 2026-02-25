import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const user = await stackServerApp.getUser({ or: "redirect" });
  const role = (user.serverMetadata as any)?.role;

  if (!role) redirect("/onboarding");
  if (role !== "doctor") redirect("/patient");

  return (
    <div className="min-h-dvh bg-surface">
      <Header />
      {children}
      <MobileNav role="doctor" />
    </div>
  );
}
