import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { qrCodeService } from "@/services/qrCodeService";
import { menuService } from "@/services/menuService";
import { bannerService } from "@/services/bannerService";
import { menuThemes } from "@/lib/menuThemes";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import type { Database } from "@/integrations/supabase/types";
import { Search, Globe } from "lucide-react";

type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];
type MenuCategory = Database["public"]["Tables"]["menu_categories"]["Row"];
type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];
type Banner = Database["public"]["Tables"]["promotional_banners"]["Row"];

export default function PublicMenu() {
  const router = useRouter();
  const { code } = router.query;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const theme = restaurant?.theme ? menuThemes[restaurant.theme] || menuThemes.classic : menuThemes.classic;

  useEffect(() => {
    if (code) {
      loadMenu(code as string);
    }
  }, [code]);

  const loadMenu = async (qrCode: string) => {
    try {
      const { data: qrData } = await supabase
        .from("qr_codes")
        .select("restaurant_id")
        .eq("code", qrCode)
        .eq("is_active", true)
        .single();

      if (!qrData) { setLoading(false); return; }

      await qrCodeService.trackView(qrCode, qrData.restaurant_id);

      const { data: restaurantData } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", qrData.restaurant_id)
        .eq("is_active", true)
        .single();

      if (restaurantData) {
        setRestaurant(restaurantData);
        
        const categoriesData = await menuService.getCategories(restaurantData.id);
        const itemsData = await menuService.getMenuItems(restaurantData.id);
        const bannersData = await bannerService.getActiveBanners(restaurantData.id);
        
        setCategories(categoriesData);
        setItems(itemsData.filter(item => item.is_available));
        setBanners(bannersData);
      }
    } catch (error) {
      console.error("Error loading menu:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = language === "ar" 
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || "").toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: theme.colors.background }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: theme.colors.primary, borderTopColor: 'transparent' }}></div>
          <p style={{ color: theme.colors.textSecondary }}>جاري تحميل القائمة...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: theme.colors.background }}>
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2" style={{ color: theme.colors.primary }}>القائمة غير موجودة</h1>
          <p style={{ color: theme.colors.textSecondary }}>تأكد من صحة رمز QR أو تواصل مع المطعم</p>
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
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=${theme.fonts.heading.replace(/ /g, '+')}:wght@400;600;700&family=${theme.fonts.body.replace(/ /g, '+')}:wght@400;500;600&display=swap');
        
        .menu-heading {
          font-family: '${theme.fonts.heading}', serif;
        }
        
        .menu-body {
          font-family: '${theme.fonts.body}', sans-serif;
        }
      `}</style>

      <div className="min-h-screen menu-body" style={{ background: theme.colors.background }} dir={language === "ar" ? "rtl" : "ltr"}>
        <header className={`sticky top-0 z-50 ${theme.styles.headerStyle}`}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                {restaurant.logo_url ? (
                  <img src={restaurant.logo_url} alt={restaurant.name} className="h-12" />
                ) : (
                  <h1 className="text-2xl font-bold menu-heading" style={{ color: theme.colors.primary }}>{restaurant.name}</h1>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
                className={theme.styles.buttonStyle}
              >
                <Globe className="w-4 h-4 ml-2" />
                {language === "ar" ? "English" : "العربية"}
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: theme.colors.textSecondary }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === "ar" ? "ابحث في القائمة..." : "Search menu..."}
                className={`w-full pr-10 pl-4 py-2 ${theme.styles.searchStyle}`}
                style={{ color: theme.colors.text }}
              />
            </div>
          </div>
        </header>

        {categories.length > 0 && (
          <div className={`sticky top-[120px] z-40 ${theme.styles.headerStyle}`}>
            <div className="container mx-auto px-4 py-3">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${theme.styles.buttonStyle}`}
                  style={!selectedCategory ? {} : { background: theme.colors.cardBg, color: theme.colors.text, border: `1px solid ${theme.colors.border}` }}
                >
                  {language === "ar" ? "الكل" : "All"}
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${theme.styles.buttonStyle}`}
                    style={selectedCategory === category.id ? {} : { background: theme.colors.cardBg, color: theme.colors.text, border: `1px solid ${theme.colors.border}` }}
                  >
                    {language === "ar" ? category.name : category.name_en || category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <main className="container mx-auto px-4 py-6">
          {banners.length > 0 && (
            <div className="mb-8">
              <Carousel
                opts={{ align: "start", loop: true }}
                plugins={[
                  // @ts-expect-error - Embla carousel types mismatch
                  Autoplay({ delay: 5000 }),
                ]}
                className="w-full"
              >
                <CarouselContent>
                  {banners.map((banner) => (
                    <CarouselItem key={banner.id}>
                      <div className="relative rounded-lg overflow-hidden shadow-lg">
                        {banner.link_url ? (
                          <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={banner.image_url || ""}
                              alt={language === "ar" ? banner.title : banner.title_en || banner.title}
                              className="w-full aspect-[3/1] object-cover"
                            />
                            {(banner.title || banner.description) && (
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                                <h3 className="text-2xl font-bold text-white mb-2 menu-heading">
                                  {language === "ar" ? banner.title : banner.title_en || banner.title}
                                </h3>
                                {(language === "ar" ? banner.description : banner.description_en) && (
                                  <p className="text-white/90">
                                    {language === "ar" ? banner.description : banner.description_en}
                                  </p>
                                )}
                              </div>
                            )}
                          </a>
                        ) : (
                          <>
                            <img
                              src={banner.image_url || ""}
                              alt={language === "ar" ? banner.title : banner.title_en || banner.title}
                              className="w-full aspect-[3/1] object-cover"
                            />
                            {(banner.title || banner.description) && (
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                                <h3 className="text-2xl font-bold text-white mb-2 menu-heading">
                                  {language === "ar" ? banner.title : banner.title_en || banner.title}
                                </h3>
                                {(language === "ar" ? banner.description : banner.description_en) && (
                                  <p className="text-white/90">
                                    {language === "ar" ? banner.description : banner.description_en}
                                  </p>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {banners.length > 1 && (
                  <>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </>
                )}
              </Carousel>
            </div>
          )}

          {filteredItems.length === 0 ? (
            <Card className="p-12 text-center" style={{ background: theme.colors.cardBg }}>
              <p style={{ color: theme.colors.textSecondary }}>
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
                    <h2 className="text-2xl font-bold mb-4 menu-heading" style={{ color: theme.colors.text }}>
                      {language === "ar" ? category.name : category.name_en || category.name}
                    </h2>
                    {(language === "ar" ? category.description : category.description_en) && (
                      <p className="mb-4" style={{ color: theme.colors.textSecondary }}>
                        {language === "ar" ? category.description : category.description_en}
                      </p>
                    )}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryItems.map((item) => (
                        <div key={item.id} className={theme.styles.cardStyle}>
                          {item.image_url && (
                            <div className="aspect-video relative overflow-hidden">
                              <img 
                                src={item.image_url} 
                                alt={language === "ar" ? item.name : item.name_en || item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <h3 className="text-lg font-bold mb-1 menu-heading" style={{ color: theme.colors.text }}>
                              {language === "ar" ? item.name : item.name_en || item.name}
                            </h3>
                            {(language === "ar" ? item.description : item.description_en) && (
                              <p className="text-sm mb-2" style={{ color: theme.colors.textSecondary }}>
                                {language === "ar" ? item.description : item.description_en}
                              </p>
                            )}
                            {item.calories && (
                              <p className="text-xs mb-3 flex items-center gap-1" style={{ color: theme.colors.textSecondary }}>
                                <span>🔥</span>
                                <span>{item.calories} {language === "ar" ? "سعرة حرارية" : "calories"}</span>
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className={theme.styles.priceStyle}>
                                {item.price} {language === "ar" ? "ر.س" : "SAR"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {(() => {
                const uncategorizedItems = filteredItems.filter(item => !item.category_id);
                if (uncategorizedItems.length === 0) return null;

                return (
                  <div>
                    <h2 className="text-2xl font-bold mb-4 menu-heading" style={{ color: theme.colors.text }}>
                      {language === "ar" ? "أصناف أخرى" : "Other Items"}
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {uncategorizedItems.map((item) => (
                        <div key={item.id} className={theme.styles.cardStyle}>
                          {item.image_url && (
                            <div className="aspect-video relative overflow-hidden">
                              <img 
                                src={item.image_url} 
                                alt={language === "ar" ? item.name : item.name_en || item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <h3 className="text-lg font-bold mb-1 menu-heading" style={{ color: theme.colors.text }}>
                              {language === "ar" ? item.name : item.name_en || item.name}
                            </h3>
                            {(language === "ar" ? item.description : item.description_en) && (
                              <p className="text-sm mb-2" style={{ color: theme.colors.textSecondary }}>
                                {language === "ar" ? item.description : item.description_en}
                              </p>
                            )}
                            {item.calories && (
                              <p className="text-xs mb-3 flex items-center gap-1" style={{ color: theme.colors.textSecondary }}>
                                <span>🔥</span>
                                <span>{item.calories} {language === "ar" ? "سعرة حرارية" : "calories"}</span>
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className={theme.styles.priceStyle}>
                                {item.price} {language === "ar" ? "ر.س" : "SAR"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </main>

        <footer className="border-t mt-12 py-6" style={{ borderColor: theme.colors.border, background: theme.colors.cardBg }}>
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
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