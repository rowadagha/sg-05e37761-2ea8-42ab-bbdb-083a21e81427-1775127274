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
import { storageService } from "@/services/storageService";
import type { Database } from "@/integrations/supabase/types";
import { QrCode, ArrowLeft, Save, Upload, X } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];

export default function Settings() {
  const router = useRouter();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>("");

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
      setFormData({
        name: restaurantData.name,
        slug: restaurantData.slug,
        logo_url: restaurantData.logo_url || ""
      });
      setLogoPreview(restaurantData.logo_url || "");
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !restaurant) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار صورة",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "خطأ",
        description: "حجم الصورة يجب أن يكون أقل من 5 ميجابايت",
        variant: "destructive"
      });
      return;
    }

    setUploadingLogo(true);

    try {
      const uploadedUrl = await storageService.uploadLogo(restaurant.id, file);
      
      if (uploadedUrl) {
        if (formData.logo_url) {
          await storageService.deleteLogo(formData.logo_url);
        }
        
        setFormData({ ...formData, logo_url: uploadedUrl });
        setLogoPreview(uploadedUrl);
        
        toast({
          title: "تم الرفع بنجاح",
          description: "تم رفع الشعار. لا تنسى حفظ التغييرات.",
        });
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء رفع الشعار",
        variant: "destructive"
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview("");
    setFormData({ ...formData, logo_url: "" });
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
                <Label>شعار المطعم (Logo)</Label>
                <div className="space-y-3 mt-2">
                  {logoPreview ? (
                    <div className="relative p-4 border border-border rounded-lg bg-secondary/50 inline-block">
                      <img src={logoPreview} alt="Logo Preview" className="h-24 object-contain" />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2"
                        onClick={handleRemoveLogo}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-8 bg-secondary rounded-lg border-2 border-dashed border-border hover:border-emerald cursor-pointer transition-colors">
                      <Upload className="w-8 h-8 text-foreground/40 mb-2" />
                      <span className="text-sm text-foreground/60 mb-1">اضغط لاختيار الشعار</span>
                      <span className="text-xs text-foreground/40">PNG, JPG, SVG (حد أقصى 5 ميجابايت)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoSelect}
                        className="hidden"
                        disabled={uploadingLogo}
                      />
                    </label>
                  )}
                  {uploadingLogo && (
                    <p className="text-sm text-emerald">جاري رفع الشعار...</p>
                  )}
                </div>
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