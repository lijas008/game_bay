"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "customer")[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in
        router.push("/login");
      } else if (profile) {
        if (profile.status === "disabled") {
          // Account disabled
          router.push("/login");
        } else if (allowedRoles && !allowedRoles.includes(profile.role)) {
          // Logged in, but role not allowed
          if (profile.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        }
      }
    }
  }, [user, profile, loading, router, allowedRoles]);

  if (loading || !user || !profile || (allowedRoles && !allowedRoles.includes(profile.role))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
