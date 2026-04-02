import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authService } from "@/services/authService";
import { restaurantService } from "@/services/restaurantService";
import { bannerService } from "@/services/bannerService";
import { storageService } from "@/services/storageService";
import {
  LogOut,
  Menu,
  Settings,
  QrCode,
  Upload,
  X,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  Image as ImageIcon
} from "lucide-react";

type Restaurant = Awaited<ReturnType<typeof restaurantService.getRestaurantByOwner>>;
type Banner = Awaited<ReturnType<typeof bannerService.getBannersByRestaurant>>[0];

export default function BannerManagement() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBannerDialog, setShowBannerDialog] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [bannerForm, setBannerForm] = useState({
    title: "",
    title_en: "",
    description: "",
    description_en: "",
    image_url: "",
    link_url: "",
    start_date: "",
    end_date: "",
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const session = await authService.getSession();
      if (!session?.user) {
        router.push("/auth/login");
        return;
      }

      const restaurantData = await restaurantService.getRestaurantByOwner(session.user.id);
      if (restaurantData) {
        setRestaurant(restaurantData);
        loadBanners(restaurantData.id);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadBanners = async (restaurantId: string) => {
    const bannersData = await bannerService.getBannersByRestaurant(restaurantId);
    setBanners(bannersData);
  };

  const handleSaveBanner = async () => {
    if (!restaurant) return;

    try {
      let imageUrl = bannerForm.image_url;

      if (imagePreview && imagePreview.startsWith("data:")) {
        setUploadingImage(true);
        const response = await fetch(imagePreview);
        const blob = await response.blob();
        const file = new File([blob], "banner.jpg", { type: "image/jpeg" });
        
        const uploadedUrl = await storageService.uploadBannerImage(restaurant.id, file);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
          
          if (editingBanner?.image_url) {
            await storageService.deleteBannerImage(editingBanner.image_url);
          }
        }
        setUploadingImage(false);
      }

      const bannerData = {
        ...bannerForm,
        restaurant_id: restaurant.id,
        image_url: imageUrl,
        start_date: bannerForm.start_date || null,
        end_date: bannerForm.end_date || null
      };

      if (editingBanner) {
        await bannerService.updateBanner(editingBanner.id, bannerData);
      } else {
        const maxOrder = Math.max(0, ...banners.map(b => b.display_order || 0));
        await bannerService.createBanner({
          ...bannerData,
          display_order: maxOrder + 1
        });
      }
      
      setShowBannerDialog(false);
      resetBannerForm();
      loadBanners(restaurant.id);
    } catch (error) {
      console.error("Error saving banner:", error);
    }
  };

  const resetBannerForm = () => {
    setBannerForm({
      title: "",
      title_en: "",
      description: "",
      description_en: "",
      image_url: "",
      link_url: "",
      start_date: "",
      end_date: "",
      is_active: true
    });
    setEditingBanner(null);
    setImagePreview("");
  };

  const openEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setBannerForm({
      title: banner.title,
      title_en: banner.title_en || "",
      description: banner.description || "",
      description_en: banner.description_en || "",
      image_url: banner.image_url || "",
      link_url: banner.link_url || "",
      start_date: banner.start_date ? banner.start_date.split("T")[0] : "",
      end_date: banner.end_date ? banner.end_date.split("T")[0] : "",
      is_active: banner.is_active
    });
    setImagePreview(banner.image_url || "");
    setShowBannerDialog(true);
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("هل تريد حذف هذا البانر؟")) return;
    
    const banner = banners.find(b => b.id === id);
    if (banner?.image_url) {
      await storageService.deleteBannerImage(banner.image_url);
    }
    
    await bannerService.deleteBanner(id);
    if (restaurant) loadBanners(restaurant.id);
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await bannerService.toggleBannerActive(id, !isActive);
    if (restaurant) loadBanners(restaurant.id);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("يرجى اختيار صورة");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSignOut = async () => {
    await authService.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-foreground/60">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background" dir="rtl">
        <header className="bg-card border-b border-border sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-foreground">
                {restaurant?.name || "لوحة التحكم"}
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-foreground/60"
              >
                <LogOut className="w-4 h-4 ml-2" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="flex gap-2 mb-6">
            <Link href="/dashboard">
              <Button variant="ghost">لوحة التحكم</Button>
            </Link>
            <Link href="/dashboard/menu">
              <Button variant="ghost">
                <Menu className="w-4 h-4 ml-2" />
                إدارة القائمة
              </Button>
            </Link>
            <Button variant="default">
              <ImageIcon className="w-4 h-4 ml-2" />
              البانرات الترويجية
            </Button>
            <Link href="/dashboard/settings">
              <Button variant="ghost">
                <Settings className="w-4 h-4 ml-2" />
                الإعدادات
              </Button>
            </Link>
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">البانرات الترويجية</h2>
              <Button
                onClick={() => {
                  resetBannerForm();
                  setShowBannerDialog(true);
                }}
                className="bg-emerald hover:bg-emerald-dark"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة بانر
              </Button>
            </div>

            {banners.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
                <p className="text-foreground/60">لا توجد بانرات حالياً</p>
                <p className="text-sm text-foreground/40 mb-4">
                  أضف بانرات ترويجية لعرض العروض الخاصة
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {banners.map((banner) => (
                  <Card key={banner.id} className={`overflow-hidden ${!banner.is_active ? "opacity-60" : ""}`}>
                    <div className="flex flex-col md:flex-row gap-4 p-4">
                      {banner.image_url && (
                        <div className="w-full md:w-48 aspect-video bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={banner.image_url} 
                            alt={banner.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-foreground">{banner.title}</h3>
                            {banner.title_en && (
                              <p className="text-sm text-foreground/60" dir="ltr">{banner.title_en}</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => handleToggleActive(banner.id, banner.is_active)}
                            >
                              {banner.is_active ? (
                                <Eye className="w-4 h-4 text-emerald" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-foreground/40" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => openEditBanner(banner)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-destructive"
                              onClick={() => handleDeleteBanner(banner.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {banner.description && (
                          <p className="text-sm text-foreground/70">{banner.description}</p>
                        )}
                        {banner.link_url && (
                          <p className="text-xs text-emerald" dir="ltr">{banner.link_url}</p>
                        )}
                        <div className="flex gap-4 text-xs text-foreground/60">
                          {banner.start_date && (
                            <span>من: {new Date(banner.start_date).toLocaleDateString("ar")}</span>
                          )}
                          {banner.end_date && (
                            <span>إلى: {new Date(banner.end_date).toLocaleDateString("ar")}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </main>

        <Dialog open={showBannerDialog} onOpenChange={setShowBannerDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? "تعديل البانر" : "إضافة بانر جديد"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>صورة البانر *</Label>
                <div className="space-y-3">
                  {imagePreview ? (
                    <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden border-2 border-border">
                      <img 
                        src={imagePreview} 
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImagePreview("");
                          setBannerForm({ ...bannerForm, image_url: "" });
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center aspect-video bg-secondary rounded-lg border-2 border-dashed border-border hover:border-emerald cursor-pointer transition-colors">
                      <Upload className="w-8 h-8 text-foreground/40 mb-2" />
                      <span className="text-sm text-foreground/60 mb-1">اضغط لاختيار صورة</span>
                      <span className="text-xs text-foreground/40">PNG, JPG (1200x400 موصى به)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>العنوان بالعربية *</Label>
                  <Input
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    placeholder="عرض خاص"
                  />
                </div>
                <div>
                  <Label>Title (English)</Label>
                  <Input
                    value={bannerForm.title_en}
                    onChange={(e) => setBannerForm({ ...bannerForm, title_en: e.target.value })}
                    placeholder="Special Offer"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>الوصف بالعربية</Label>
                  <Textarea
                    value={bannerForm.description}
                    onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })}
                    placeholder="وصف العرض..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Description (English)</Label>
                  <Textarea
                    value={bannerForm.description_en}
                    onChange={(e) => setBannerForm({ ...bannerForm, description_en: e.target.value })}
                    placeholder="Offer description..."
                    rows={3}
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <Label>رابط (اختياري)</Label>
                <Input
                  value={bannerForm.link_url}
                  onChange={(e) => setBannerForm({ ...bannerForm, link_url: e.target.value })}
                  placeholder="https://example.com/offer"
                  dir="ltr"
                  type="url"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>تاريخ البداية (اختياري)</Label>
                  <Input
                    type="date"
                    value={bannerForm.start_date}
                    onChange={(e) => setBannerForm({ ...bannerForm, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>تاريخ الانتهاء (اختياري)</Label>
                  <Input
                    type="date"
                    value={bannerForm.end_date}
                    onChange={(e) => setBannerForm({ ...bannerForm, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>نشط</Label>
                <Switch
                  checked={bannerForm.is_active}
                  onCheckedChange={(checked) => setBannerForm({ ...bannerForm, is_active: checked })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleSaveBanner} 
                  className="flex-1 bg-emerald hover:bg-emerald-dark"
                  disabled={uploadingImage || !bannerForm.title || !imagePreview}
                >
                  {uploadingImage ? "جاري الرفع..." : "حفظ البانر"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowBannerDialog(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}