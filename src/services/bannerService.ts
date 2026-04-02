import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Banner = Database["public"]["Tables"]["promotional_banners"]["Row"];
type BannerInsert = Database["public"]["Tables"]["promotional_banners"]["Insert"];
type BannerUpdate = Database["public"]["Tables"]["promotional_banners"]["Update"];

export const bannerService = {
  async getBannersByRestaurant(restaurantId: string): Promise<Banner[]> {
    const { data, error } = await supabase
      .from("promotional_banners")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching banners:", error);
      return [];
    }

    return data || [];
  },

  async getActiveBanners(restaurantId: string): Promise<Banner[]> {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from("promotional_banners")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching active banners:", error);
      return [];
    }

    return data || [];
  },

  async createBanner(banner: BannerInsert): Promise<Banner | null> {
    const { data, error } = await supabase
      .from("promotional_banners")
      .insert(banner)
      .select()
      .single();

    if (error) {
      console.error("Error creating banner:", error);
      return null;
    }

    return data;
  },

  async updateBanner(id: string, updates: BannerUpdate): Promise<Banner | null> {
    const { data, error } = await supabase
      .from("promotional_banners")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating banner:", error);
      return null;
    }

    return data;
  },

  async deleteBanner(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("promotional_banners")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting banner:", error);
      return false;
    }

    return true;
  },

  async updateBannerOrder(id: string, newOrder: number): Promise<boolean> {
    return !!(await this.updateBanner(id, { display_order: newOrder }));
  },

  async toggleBannerActive(id: string, isActive: boolean): Promise<boolean> {
    return !!(await this.updateBanner(id, { is_active: isActive }));
  }
};