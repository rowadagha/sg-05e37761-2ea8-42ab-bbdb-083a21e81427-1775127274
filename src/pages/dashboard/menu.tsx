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
import type { Database } from "@/integrations/supabase/types";
import { 
  QrCode, 
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  GripVertical,
  Eye,
  EyeOff
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
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [categoryForm, setCategoryForm] = useState({
    name_ar: "",
    name_en: "",
    description_ar: "",
    description_en: ""
  });

  const [itemForm, setItemForm] = useState({
    name_ar: "",
    name_en: "",
    description_ar: "",
    description_en: "",
    price: "",
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
    }
  }, [restaurant, selectedCategory]);

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
      const itemData = {
        ...itemForm,
        restaurant_id: restaurant.id,
        price: parseFloat(itemForm.price),
        category_id: itemForm.category_id || null
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
    setCategoryForm({ name_ar: "", name_en: "", description_ar: "", description_en: "" });
    setEditingCategory(null);
  };

  const resetItemForm = () => {
    setItemForm({
      name_ar: "",
      name_en: "",
      description_ar: "",
      description_en: "",
      price: "",
      image_url: "",
      category_id: "",
      is_available: true
    });
    setEditingItem(null);
  };

  const openEditCategory = (category: MenuCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name_ar: category.name_ar,
      name_en: category.name_en || "",
      description_ar: category.description_ar || "",
      description_en: category.description_en || ""
    });
    setShowCategoryDialog(true);
  };

  const openEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      name_ar: item.name_ar,
      name_en: item.name_en || "",
      description_ar: item.description_ar || "",
      description_en: item.description_en || "",
      price: item.price.toString(),
      image_url: item.image_url || "",
      category_id: item.category_id || "",
      is_available: item.is_available
    });
    setShowItemDialog(true);
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
      <SEO title={`إدارة القائمة - ${restaurant?.name || "منيو بلس"}`} />
      
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
                    <span className="text-lg font-bold text-emerald block">إدارة القائمة</span>
                    {restaurant && (
                      <span className="text-xs text-foreground/60">{restaurant.name}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-12 gap-6">
            {/* Categories Sidebar */}
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
                            value={categoryForm.name_ar}
                            onChange={(e) => setCategoryForm({ ...categoryForm, name_ar: e.target.value })}
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
                            value={categoryForm.description_ar}
                            onChange={(e) => setCategoryForm({ ...categoryForm, description_ar: e.target.value })}
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
                        {category.name_ar}
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

            {/* Menu Items */}
            <div className="md:col-span-9">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-foreground">
                  {selectedCategory 
                    ? categories.find(c => c.id === selectedCategory)?.name_ar 
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
                            value={itemForm.name_ar}
                            onChange={(e) => setItemForm({ ...itemForm, name_ar: e.target.value })}
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
                                  {category.name_ar}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>الوصف بالعربي</Label>
                        <Textarea
                          value={itemForm.description_ar}
                          onChange={(e) => setItemForm({ ...itemForm, description_ar: e.target.value })}
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
                        <Label>رابط الصورة (اختياري)</Label>
                        <Input
                          value={itemForm.image_url}
                          onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })}
                          placeholder="https://example.com/image.jpg"
                          dir="ltr"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleSaveItem} className="flex-1 bg-emerald hover:bg-emerald-dark">
                          حفظ الصنف
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
                            alt={item.name_ar}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground">{item.name_ar}</h3>
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
                        {item.description_ar && (
                          <p className="text-sm text-foreground/70 mb-3 line-clamp-2">{item.description_ar}</p>
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