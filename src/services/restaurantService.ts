<![CDATA[import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];
type RestaurantInsert = Database["public"]["Tables"]["restaurants"]["Insert"];
type RestaurantUpdate = Database["public"]["Tables"]["restaurants"]["Update"];

export const restaurantService = {
  async createRestaurant(data: RestaurantInsert): Promise<Restaurant | null> {
    const { data: restaurant, error } = await supabase
      .from("restaurants")
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error("Error creating restaurant:", error);
      throw error;
    }

    return restaurant;
  },

  async getRestaurantByOwnerId(ownerId: string): Promise<Restaurant | null> {
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("owner_id", ownerId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching restaurant:", error);
      return null;
    }

    return data;
  },

  async getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("Error fetching restaurant by slug:", error);
      return null;
    }

    return data;
  },

  async updateRestaurant(id: string, updates: RestaurantUpdate): Promise<Restaurant | null> {
    const { data, error } = await supabase
      .from("restaurants")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating restaurant:", error);
      throw error;
    }

    return data;
  },

  async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^\u0600-\u06FFa-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const { data } = await supabase
        .from("restaurants")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (!data) break;

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
};
</![CDATA[>
