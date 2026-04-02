import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEO } from "@/components/SEO";
import { authService } from "@/services/authService";
import { restaurantService } from "@/services/restaurantService";
import { menuService } from "@/services/menuService";
import { storageService } from "@/services/storageService";
import { menuThemes, themeList } from "@/lib/menuThemes";
import type { Database } from "@/integrations/supabase/types";
import { 
  QrCode, 
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Eye,
  EyeOff,
  Upload,
  X,
  Palette
} from "lucide-react";
import Link from "next/link";

type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];
type MenuCategory = Database["public"]["Tables"]["menu_categories"]["Row"];
type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];

export default function MenuManagement() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedTheme, setSelectedTheme] = useState<string>("classic");

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    name_en: "",
    description: "",
    description_en: ""
  });

  const [itemForm, setItemForm] = useState({
    name: "",
    name_en: "",
    description: "",
    description_en: "",
    price: "",
    calories: "",
    image_url: "",
    category_id: "",
    is_available: true
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (restaurant) {
      loadItems();
      setSelectedTheme(restaurant.theme || "classic");
    }
  }, [restaurant, selectedCategory]);

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
      const categoriesData = await menuService.getCategories(restaurantData.id);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async () => {
    if (!restaurant) return;
    const itemsData = await menuService.getMenuItems(restaurant.id, selectedCategory || undefined);
    setItems(itemsData);
  };

  const handleSaveCategory = async () => {
    if (!restaurant) return;

    try {
      if (editingCategory) {
        await menuService.updateCategory(editingCategory.id, categoryForm);
      } else {
        const maxOrder = Math.max(0, ...categories.map(c => c.display_order || 0));
        await menuService.createCategory({
          restaurant_id: restaurant.id,
          ...categoryForm,
          display_order: maxOrder + 1
        });
      }
      
      setShowCategoryDialog(false);
      resetCategoryForm();
      loadData();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleSaveItem = async () => {
    if (!restaurant) return;

    try {
      let imageUrl = itemForm.image_url;

      if (imagePreview && imagePreview.startsWith("data:")) {
        setUploadingImage(true);
        const response = await fetch(imagePreview);
        const blob = await response.blob();
        const file = new File([blob], "menu-item.jpg", { type: "image/jpeg" });
        
        const uploadedUrl = await storageService.uploadMenuItemImage(restaurant.id, file);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
          
          if (editingItem?.image_url) {
            await storageService.deleteMenuItemImage(editingItem.image_url);
          }
        }
        setUploadingImage(false);
      }

      const itemData = {
        ...itemForm,
        restaurant_id: restaurant.id,
        price: parseFloat(itemForm.price),
        calories: itemForm.calories ? parseInt(itemForm.calories) : null,
        category_id: itemForm.category_id || null,
        image_url: imageUrl
      };

      if (editingItem) {
        await menuService.updateMenuItem(editingItem.id, itemData);
      } else {
        const maxOrder = Math.max(0, ...items.map(i => i.display_order || 0));
        await menuService.createMenuItem({
          ...itemData,
          display_order: maxOrder + 1
        });
      }
      
      setShowItemDialog(false);
      resetItemForm();
      loadItems();
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const handleThemeChange = async (themeId: string) => {
    if (!restaurant) return;
    
    try {
      await restaurantService.updateTheme(restaurant.id, themeId);
      setSelectedTheme(themeId);
      setRestaurant({ ...restaurant, theme: themeId });
      setShowThemeDialog(false);
    } catch (error) {
      console.error("Error updating theme:", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الفئة؟ سيتم حذف جميع الأصناف المرتبطة بها.")) return;
    await menuService.deleteCategory(id);
    loadData();
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الصنف؟")) return;
    await menuService.deleteMenuItem(id);
    loadItems();
  };

  const handleToggleAvailability = async (id: string, isAvailable: boolean) => {
    await menuService.toggleMenuItemAvailability(id, !isAvailable);
    loadItems();
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: "", name_en: "", description: "", description_en: "" });
    setEditingCategory(null);
  };

  const resetItemForm = () => {
    setItemForm({
      name: "",
      name_en: "",
      description: "",
      description_en: "",
      price: "",
      calories: "",
      image_url: "",
      category_id: "",
      is_available: true
    });
    setEditingItem(null);
    setImagePreview("");
  };

  const openEditCategory = (category: MenuCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      name_en: category.name_en || "",
      description: category.description || "",
      description_en: category.description_en || ""
    });
    setShowCategoryDialog(true);
  };

  const openEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      name_en: item.name_en || "",
      description: item.description || "",
      description_en: item.description_en || "",
      price: item.price.toString(),
      calories: item.calories ? item.calories.toString() : "",
      image_url: item.image_url || "",
      category_id: item.category_id || "",
      is_available: item.is_available
    });
    setImagePreview(item.image_url || "");
    setShowItemDialog(true);
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

  const currentTheme = menuThemes[selectedTheme] || menuThemes.classic;

  return (
    <ProtectedRoute>
      <SEO title={`إدارة القائمة - ${restaurant?.name || "منيو بلس"}`} />
      
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
                    <span className="text-lg font-bold text-emerald block">إدارة القائمة</span>
                    {restaurant && (
                      <span className="text-xs text-foreground/60">{restaurant.name}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <Dialog open={showThemeDialog} onOpenChange={setShowThemeDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Palette className="w-4 h-4" />
                    تغيير المظهر
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>اختر مظهر القائمة</DialogTitle>
                  </DialogHeader>
                  <div className="grid md:grid-cols-2 gap-4">
                    {themeList.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => handleThemeChange(theme.id)}
                        className={`relative p-6 rounded-xl border-2 transition-all ${
                          selectedTheme === theme.id 
                            ? "border-emerald ring-2 ring-emerald/20" 
                            : "border-border hover:border-emerald/50"
                        }`}
                        style={{ background: theme.colors.background }}
                      >
                        <div className="text-center mb-4">
                          <div className="text-4xl mb-2">{theme.preview}</div>
                          <h3 className="font-bold text-lg" style={{ color: theme.colors.text }}>
                            {theme.nameAr}
                          </h3>
                          <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                            {theme.name}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className={theme.styles.cardStyle} style={{ padding: "0.75rem" }}>
                            <div className="font-semibold mb-1" style={{ color: theme.colors.text }}>عنوان الصنف</div>
                            <div className="text-sm mb-2" style={{ color: theme.colors.textSecondary }}>وصف قصير للصنف</div>
                            <div className={theme.styles.priceStyle}>45 ر.س</div>
                          </div>
                        </div>
                        
                        {selectedTheme === theme.id && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-emerald rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-12 gap-6">
            <div className="md:col-span-3">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-foreground">الفئات</h2>
                  <Dialog open={showCategoryDialog} onOpenChange={(open) => {
                    setShowCategoryDialog(open);
                    if (!open) resetCategoryForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-emerald hover:bg-emerald-dark">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editingCategory ? "تعديل الفئة" : "إضافة فئة جديدة"}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>الاسم بالعربي</Label>
                          <Input
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                            placeholder="المقبلات"
                            className="text-right"
                          />
                        </div>
                        <div>
                          <Label>Name in English</Label>
                          <Input
                            value={categoryForm.name_en}
                            onChange={(e) => setCategoryForm({ ...categoryForm, name_en: e.target.value })}
                            placeholder="Appetizers"
                            dir="ltr"
                          />
                        </div>
                        <div>
                          <Label>الوصف بالعربي</Label>
                          <Textarea
                            value={categoryForm.description}
                            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                            placeholder="وصف الفئة..."
                            className="text-right"
                          />
                        </div>
                        <div>
                          <Label>Description in English</Label>
                          <Textarea
                            value={categoryForm.description_en}
                            onChange={(e) => setCategoryForm({ ...categoryForm, description_en: e.target.value })}
                            placeholder="Category description..."
                            dir="ltr"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSaveCategory} className="flex-1 bg-emerald hover:bg-emerald-dark">
                            حفظ
                          </Button>
                          <Button variant="outline" onClick={() => setShowCategoryDialog(false)} className="flex-1">
                            إلغاء
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-right px-3 py-2 rounded-lg transition-colors ${
                      !selectedCategory 
                        ? "bg-emerald text-white" 
                        : "hover:bg-secondary"
                    }`}
                  >
                    جميع الأصناف
                  </button>
                  {categories.map((category) => (
                    <div key={category.id} className="group relative">
                      <button
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-right px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category.id 
                            ? "bg-emerald text-white" 
                            : "hover:bg-secondary"
                        }`}
                      >
                        {category.name}
                      </button>
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => openEditCategory(category)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-destructive"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="md:col-span-9">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-foreground">
                  {selectedCategory 
                    ? categories.find(c => c.id === selectedCategory)?.name 
                    : "جميع الأصناف"}
                </h1>
                <Dialog open={showItemDialog} onOpenChange={(open) => {
                  setShowItemDialog(open);
                  if (!open) resetItemForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-emerald hover:bg-emerald-dark">
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة صنف جديد
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingItem ? "تعديل الصنف" : "إضافة صنف جديد"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>الاسم بالعربي *</Label>
                          <Input
                            value={itemForm.name}
                            onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                            placeholder="كبسة لحم"
                            className="text-right"
                          />
                        </div>
                        <div>
                          <Label>Name in English</Label>
                          <Input
                            value={itemForm.name_en}
                            onChange={(e) => setItemForm({ ...itemForm, name_en: e.target.value })}
                            placeholder="Meat Kabsa"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>السعر (ريال) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={itemForm.price}
                            onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                            placeholder="45.00"
                            dir="ltr"
                          />
                        </div>
                        <div>
                          <Label>السعرات الحرارية (Calories)</Label>
                          <Input
                            type="number"
                            value={itemForm.calories}
                            onChange={(e) => setItemForm({ ...itemForm, calories: e.target.value })}
                            placeholder="350"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>الفئة</Label>
                        <Select 
                          value={itemForm.category_id} 
                          onValueChange={(value) => setItemForm({ ...itemForm, category_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الفئة" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>الوصف بالعربي</Label>
                        <Textarea
                          value={itemForm.description}
                          onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                          placeholder="وصف تفصيلي للصنف..."
                          className="text-right"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label>Description in English</Label>
                        <Textarea
                          value={itemForm.description_en}
                          onChange={(e) => setItemForm({ ...itemForm, description_en: e.target.value })}
                          placeholder="Detailed item description..."
                          dir="ltr"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label>صورة الصنف</Label>
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
                                  setItemForm({ ...itemForm, image_url: "" });
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center aspect-video bg-secondary rounded-lg border-2 border-dashed border-border hover:border-emerald cursor-pointer transition-colors">
                              <Upload className="w-8 h-8 text-foreground/40 mb-2" />
                              <span className="text-sm text-foreground/60 mb-1">اضغط لاختيار صورة</span>
                              <span className="text-xs text-foreground/40">PNG, JPG (حد أقصى 5 ميجابايت)</span>
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

                      <div className="flex gap-2">
                        <Button 
                          onClick={handleSaveItem} 
                          className="flex-1 bg-emerald hover:bg-emerald-dark"
                          disabled={uploadingImage}
                        >
                          {uploadingImage ? "جاري الرفع..." : "حفظ الصنف"}
                        </Button>
                        <Button variant="outline" onClick={() => setShowItemDialog(false)} className="flex-1">
                          إلغاء
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {items.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="text-foreground/60 mb-4">
                    <p className="text-lg mb-2">لا توجد أصناف بعد</p>
                    <p className="text-sm">ابدأ بإضافة أول صنف في قائمتك</p>
                  </div>
                  <Button onClick={() => setShowItemDialog(true)} className="bg-emerald hover:bg-emerald-dark">
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة صنف جديد
                  </Button>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <Card key={item.id} className={`overflow-hidden ${!item.is_available ? "opacity-60" : ""}`}>
                      {item.image_url && (
                        <div className="aspect-video bg-secondary relative">
                          <img 
                            src={item.image_url} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground">{item.name}</h3>
                            {item.name_en && (
                              <p className="text-sm text-foreground/60" dir="ltr">{item.name_en}</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => handleToggleAvailability(item.id, item.is_available)}
                            >
                              {item.is_available ? (
                                <Eye className="w-4 h-4 text-emerald" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-foreground/40" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => openEditItem(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-destructive"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {item.description && (
                          <p className="text-sm text-foreground/70 mb-3 line-clamp-2">{item.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-emerald">{item.price} ر.س</span>
                          {!item.is_available && (
                            <span className="text-xs text-destructive">غير متوفر</span>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}