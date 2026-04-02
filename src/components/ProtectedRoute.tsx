import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { authService } from "@/services/authService";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authService.getSession();
      
      if (!session) {
        router.replace("/auth/login");
        return;
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground/60">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}