import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { qrCodeService } from "@/services/qrCodeService";
import { menuService } from "@/services/menuService";
import type { Database } from "@/integrations/supabase/types";
import { Search, Globe } from "lucide-react";

type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];
type MenuCategory = Database["public"]["Tables"]["menu_categories"]["Row"];
type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];

export default function PublicMenu() {
  const router = useRouter();
  const { code } = router.query;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (code) {
      loadMenu(code as string);
    }
  }, [code]);

  const loadMenu = async (qrCode: string) => {
    try {
      // Track view
      await qrCodeService.trackView(qrCode);

      // Get restaurant from QR code
      const { data: qrData } = await supabase
        .from("qr_codes")
        .select("restaurant_id")
        .eq("code", qrCode)
        .eq("is_active", true)
        .single();

      if (!qrData) {
        setLoading(false);
        return;
      }

      // Get restaurant details
      const { data: restaurantData } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", qrData.restaurant_id)
        .eq("is_active", true)
        .single();

      if (restaurantData) {
        setRestaurant(restaurantData);
        
        // Load menu
        const categoriesData = await menuService.getCategories(restaurantData.id);
        const itemsData = await menuService.getMenuItems(restaurantData.id);
        
        setCategories(categoriesData);
        setItems(itemsData.filter(item => item.is_available));
      }
    } catch (error) {
      console.error("Error loading menu:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = language === "ar" 
      ? item.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description_ar || "").toLowerCase().includes(searchQuery.toLowerCase())
      : (item.name_en || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description_en || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || item.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const groupedItems = selectedCategory
    ? { [selectedCategory]: filteredItems }
    : categories.reduce((acc, category) => {
        acc[category.id] = filteredItems.filter(item => item.category_id === category.id);
        return acc;
      }, {} as Record<string, MenuItem[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cream to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground/60">جاري تحميل القائمة...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cream to-white p-4">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-2">القائمة غير موجودة</h1>
          <p className="text-foreground/70">تأكد من صحة رمز QR أو تواصل مع المطعم</p>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={language === "ar" ? restaurant.name : restaurant.name}
        description={language === "ar" ? `قائمة ${restaurant.name} الرقمية` : `${restaurant.name} Digital Menu`}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-cream to-white" dir={language === "ar" ? "rtl" : "ltr"}>
        {/* Header */}
        <header className="bg-white border-b border-border/50 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                {restaurant.logo_url ? (
                  <img src={restaurant.logo_url} alt={restaurant.name} className="h-12" />
                ) : (
                  <h1 className="text-2xl font-bold text-emerald">{restaurant.name}</h1>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
              >
                <Globe className="w-4 h-4 ml-2" />
                {language === "ar" ? "English" : "العربية"}
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === "ar" ? "ابحث في القائمة..." : "Search menu..."}
                className="w-full pr-10 pl-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald"
              />
            </div>
          </div>
        </header>

        {/* Categories Filter */}
        {categories.length > 0 && (
          <div className="bg-white border-b border-border/50 sticky top-[120px] z-40">
            <div className="container mx-auto px-4 py-3">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                <Button
                  size="sm"
                  variant={!selectedCategory ? "default" : "outline"}
                  onClick={() => setSelectedCategory(null)}
                  className={!selectedCategory ? "bg-emerald hover:bg-emerald-dark" : ""}
                >
                  {language === "ar" ? "الكل" : "All"}
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    size="sm"
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    className={selectedCategory === category.id ? "bg-emerald hover:bg-emerald-dark" : ""}
                  >
                    {language === "ar" ? category.name_ar : category.name_en || category.name_ar}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Menu Content */}
        <main className="container mx-auto px-4 py-6">
          {filteredItems.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-foreground/60">
                {language === "ar" 
                  ? "لا توجد أصناف مطابقة للبحث" 
                  : "No items match your search"}
              </p>
            </Card>
          ) : (
            <div className="space-y-8">
              {categories.map((category) => {
                const categoryItems = groupedItems[category.id] || [];
                if (categoryItems.length === 0) return null;

                return (
                  <div key={category.id}>
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                      {language === "ar" ? category.name_ar : category.name_en || category.name_ar}
                    </h2>
                    {(language === "ar" ? category.description_ar : category.description_en) && (
                      <p className="text-foreground/70 mb-4">
                        {language === "ar" ? category.description_ar : category.description_en}
                      </p>
                    )}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          {item.image_url && (
                            <div className="aspect-video bg-secondary relative">
                              <img 
                                src={item.image_url} 
                                alt={language === "ar" ? item.name_ar : item.name_en || item.name_ar}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <h3 className="text-lg font-bold text-foreground mb-1">
                              {language === "ar" ? item.name_ar : item.name_en || item.name_ar}
                            </h3>
                            {(language === "ar" ? item.description_ar : item.description_en) && (
                              <p className="text-sm text-foreground/70 mb-3">
                                {language === "ar" ? item.description_ar : item.description_en}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-emerald">
                                {item.price} {language === "ar" ? "ر.س" : "SAR"}
                              </span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Uncategorized items */}
              {(() => {
                const uncategorizedItems = filteredItems.filter(item => !item.category_id);
                if (uncategorizedItems.length === 0) return null;

                return (
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                      {language === "ar" ? "أصناف أخرى" : "Other Items"}
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {uncategorizedItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          {item.image_url && (
                            <div className="aspect-video bg-secondary relative">
                              <img 
                                src={item.image_url} 
                                alt={language === "ar" ? item.name_ar : item.name_en || item.name_ar}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <h3 className="text-lg font-bold text-foreground mb-1">
                              {language === "ar" ? item.name_ar : item.name_en || item.name_ar}
                            </h3>
                            {(language === "ar" ? item.description_ar : item.description_en) && (
                              <p className="text-sm text-foreground/70 mb-3">
                                {language === "ar" ? item.description_ar : item.description_en}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-emerald">
                                {item.price} {language === "ar" ? "ر.س" : "SAR"}
                              </span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border mt-12 py-6 bg-white">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-foreground/60">
              {language === "ar" 
                ? "مدعوم بواسطة منيو بلس - حلول القوائم الرقمية" 
                : "Powered by MenuPlus - Digital Menu Solutions"}
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}