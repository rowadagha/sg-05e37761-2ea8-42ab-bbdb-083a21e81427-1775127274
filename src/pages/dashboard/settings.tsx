import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEO } from "@/components/SEO";
import { authService } from "@/services/authService";
import { restaurantService } from "@/services/restaurantService";
import type { Database } from "@/integrations/supabase/types";
import { QrCode, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];

export default function Settings() {
  const router = useRouter();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    logo_url: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const session = await authService.getSession();
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
      setFormData({
        name: restaurantData.name,
        slug: restaurantData.slug,
        logo_url: restaurantData.logo_url || ""
      });
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!restaurant) return;
    setSaving(true);

    try {
      await restaurantService.updateRestaurant(restaurant.id, {
        name: formData.name,
        slug: formData.slug,
        logo_url: formData.logo_url
      });
      
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث إعدادات المطعم",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الحفظ. تأكد من أن الرابط المختصر غير مستخدم.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

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
      <SEO title={`الإعدادات - ${restaurant?.name || "منيو بلس"}`} />
      
      <div className="min-h-screen bg-gradient-to-b from-cream to-white">
        {/* Header */}
        <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald to-emerald-dark rounded-lg flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-emerald block">الإعدادات</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">إعدادات المطعم</h2>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="name">اسم المطعم</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2 text-right"
                />
              </div>

              <div>
                <Label htmlFor="slug">الرابط المختصر (Slug)</Label>
                <div className="flex mt-2">
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="rounded-r-none border-r-0 text-left"
                    dir="ltr"
                  />
                  <div className="bg-secondary px-4 py-2 border border-border border-l-0 rounded-r-md text-foreground/60 text-sm flex items-center" dir="ltr">
                    menuplus.com/menu/
                  </div>
                </div>
                <p className="text-xs text-foreground/60 mt-1">يستخدم في رابط القائمة المباشر</p>
              </div>

              <div>
                <Label htmlFor="logo">رابط الشعار (Logo URL)</Label>
                <Input
                  id="logo"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="mt-2 text-left"
                  dir="ltr"
                />
                {formData.logo_url && (
                  <div className="mt-4 p-4 border border-border rounded-lg bg-secondary/50 inline-block">
                    <img src={formData.logo_url} alt="Logo Preview" className="h-16 object-contain" />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border">
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="bg-emerald hover:bg-emerald-dark"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}