import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { authService } from "@/services/authService";
import { restaurantService } from "@/services/restaurantService";
import { qrCodeService } from "@/services/qrCodeService";
import type { Database } from "@/integrations/supabase/types";
import { 
  QrCode, 
  LayoutDashboard, 
  Menu,
  Settings,
  LogOut,
  Download,
  RefreshCw,
  Eye,
  BarChart,
  Image as ImageIcon
} from "lucide-react";

type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];
type QRCodeData = Database["public"]["Tables"]["qr_codes"]["Row"];

export default function Dashboard() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [qrCode, setQRCode] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const session = await authService.getCurrentSession();
      if (!session?.user) {
        router.replace("/auth/login");
        return;
      }

      const restaurantData = await restaurantService.getRestaurantByOwnerId(session.user.id);
      
      if (!restaurantData) {
        router.replace("/auth/register");
        return;
      }

      setRestaurant(restaurantData);

      const qrData = await qrCodeService.getOrCreateQRCode(restaurantData.id);
      setQRCode(qrData);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    router.replace("/");
  };

  const handleRegenerateQR = async () => {
    if (!restaurant) return;
    
    const newQR = await qrCodeService.regenerateQRCode(restaurant.id);
    setQRCode(newQR);
  };

  const menuUrl = qrCode ? `${window.location.origin}/menu/${qrCode.code}` : "";

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

  return (
    <ProtectedRoute>
      <SEO title={`لوحة التحكم - ${restaurant?.name || "منيو بلس"}`} />
      
      <div className="min-h-screen bg-gradient-to-b from-cream to-white">
        {/* Header */}
        <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald to-emerald-dark rounded-lg flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold text-emerald block">منيو بلس</span>
                  {restaurant && (
                    <span className="text-xs text-foreground/60">{restaurant.name}</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 ml-2" />
                  تسجيل الخروج
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              مرحباً بعودتك! 👋
            </h1>
            <p className="text-foreground/70">
              إدارة قائمة {restaurant?.name}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* QR Code Card */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald/10 rounded-lg flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-emerald" />
                </div>
                <h2 className="text-lg font-bold text-foreground">رمز QR الخاص بك</h2>
              </div>
              
              {qrCode && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-emerald/20 flex items-center justify-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(menuUrl)}`}
                      alt="QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => window.open(menuUrl, "_blank")}
                    >
                      <Eye className="w-4 h-4 ml-2" />
                      معاينة القائمة
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(menuUrl)}`;
                        link.download = `qr-code-${restaurant?.slug}.png`;
                        link.click();
                      }}
                    >
                      <Download className="w-4 h-4 ml-2" />
                      تحميل الرمز
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={handleRegenerateQR}
                    >
                      <RefreshCw className="w-4 h-4 ml-2" />
                      إنشاء رمز جديد
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Stats Cards */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
                  <BarChart className="w-5 h-5 text-gold" />
                </div>
                <h2 className="text-lg font-bold text-foreground">إحصائيات اليوم</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-foreground/60">المشاهدات</p>
                  <p className="text-2xl font-bold text-foreground">0</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60">الأصناف النشطة</p>
                  <p className="text-2xl font-bold text-foreground">0</p>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">إجراءات سريعة</h2>
              
              <div className="space-y-2">
                <Button 
                  className="w-full justify-start bg-emerald hover:bg-emerald-dark"
                  onClick={() => router.push("/dashboard/menu")}
                >
                  <Menu className="w-4 h-4 ml-2" />
                  إدارة القائمة
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push("/dashboard/banners")}
                >
                  <ImageIcon className="w-4 h-4 ml-2" />
                  البانرات الترويجية
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push("/dashboard/settings")}
                >
                  <Settings className="w-4 h-4 ml-2" />
                  الإعدادات
                </Button>
              </div>
            </Card>
          </div>

          {/* Getting Started Section */}
          <Card className="p-6 bg-gradient-to-br from-emerald/5 to-gold/5 border-emerald/20">
            <h2 className="text-xl font-bold text-foreground mb-4">البدء السريع</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-emerald/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-emerald font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">أضف أصنافك</h3>
                  <p className="text-sm text-foreground/70">ابدأ بإضافة فئات وأصناف قائمتك</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-emerald/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-emerald font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">اطبع رمز QR</h3>
                  <p className="text-sm text-foreground/70">ضع الرمز على طاولاتك أو عند المدخل</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-emerald/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-emerald font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">استقبل العملاء</h3>
                  <p className="text-sm text-foreground/70">سيصل عملاؤك لقائمتك فوراً</p>
                </div>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}