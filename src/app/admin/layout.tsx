"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase/config";
import { LogOut, Gamepad2, Users, LayoutDashboard, CalendarCheck, Settings, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
    { name: "Consoles & Seats", href: "/admin/consoles", icon: Gamepad2 },
    { name: "Games", href: "/admin/games", icon: Gamepad2 },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center justify-between border-b border-border/50 md:border-b-0">
        <div className="flex items-center gap-2">
          <div className="bg-destructive/10 p-2 rounded-lg">
            <Gamepad2 className="w-6 h-6 text-destructive" />
          </div>
          <span className="text-xl font-bold tracking-tight">Admin<span className="text-destructive">Bay</span></span>
        </div>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <X className="w-6 h-6" />
        </Button>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start ${isActive ? "bg-secondary font-semibold" : "text-muted-foreground"}`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border/50 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-destructive/20 flex items-center justify-center text-destructive font-bold text-sm flex-shrink-0">
            {profile?.fullName?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{profile?.fullName}</p>
            <p className="text-xs text-muted-foreground">Admin Account</p>
          </div>
        </div>
        <Button
          variant="default"
          className="w-full justify-start bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border border-destructive/30 transition-all"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-background flex flex-col md:flex-row relative">
        {/* Mobile Header Bar */}
        <header className="flex md:hidden items-center justify-between p-4 border-b border-border/50 bg-card fixed top-0 w-full z-40">
          <div className="flex items-center gap-2">
            <div className="bg-destructive/10 p-1.5 rounded">
              <Gamepad2 className="w-5 h-5 text-destructive" />
            </div>
            <span className="text-lg font-bold tracking-tight">Admin<span className="text-destructive">Bay</span></span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
        </header>

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 bg-card border-r border-border/50 flex-col flex-shrink-0">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar Overlay Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-background/85 backdrop-blur-sm animate-in fade-in duration-200">
            <aside className="w-72 max-w-[80vw] bg-card border-r border-border/50 h-full flex flex-col animate-in slide-in-from-left duration-300">
              <SidebarContent />
            </aside>
            {/* Click outside to close */}
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-muted/20 pt-20 md:pt-8 min-w-0 flex flex-col">
          <div className="flex-1">{children}</div>
          <div className="-mx-6 -mb-6 md:-mx-8 md:-mb-8 mt-12">
            <Footer />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
