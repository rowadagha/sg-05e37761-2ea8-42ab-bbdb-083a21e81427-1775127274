<![CDATA[import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type MenuCategory = Database["public"]["Tables"]["menu_categories"]["Row"];
type MenuCategoryInsert = Database["public"]["Tables"]["menu_categories"]["Insert"];
type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];
type MenuItemInsert = Database["public"]["Tables"]["menu_items"]["Insert"];
type MenuItemUpdate = Database["public"]["Tables"]["menu_items"]["Update"];

export const menuService = {
  // Categories
  async getCategories(restaurantId: string): Promise<MenuCategory[]> {
    const { data, error } = await supabase
      .from("menu_categories")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    return data || [];
  },

  async createCategory(category: MenuCategoryInsert): Promise<MenuCategory | null> {
    const { data, error } = await supabase
      .from("menu_categories")
      .insert(category)
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      throw error;
    }

    return data;
  },

  async updateCategory(id: string, updates: Partial<MenuCategoryInsert>): Promise<MenuCategory | null> {
    const { data, error } = await supabase
      .from("menu_categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating category:", error);
      throw error;
    }

    return data;
  },

  async deleteCategory(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("menu_categories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting category:", error);
      return false;
    }

    return true;
  },

  // Menu Items
  async getMenuItems(restaurantId: string, categoryId?: string): Promise<MenuItem[]> {
    let query = supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("display_order", { ascending: true });

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching menu items:", error);
      return [];
    }

    return data || [];
  },

  async createMenuItem(item: MenuItemInsert): Promise<MenuItem | null> {
    const { data, error } = await supabase
      .from("menu_items")
      .insert(item)
      .select()
      .single();

    if (error) {
      console.error("Error creating menu item:", error);
      throw error;
    }

    return data;
  },

  async updateMenuItem(id: string, updates: MenuItemUpdate): Promise<MenuItem | null> {
    const { data, error } = await supabase
      .from("menu_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating menu item:", error);
      throw error;
    }

    return data;
  },

  async deleteMenuItem(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting menu item:", error);
      return false;
    }

    return true;
  },

  async toggleMenuItemAvailability(id: string, isAvailable: boolean): Promise<MenuItem | null> {
    return this.updateMenuItem(id, { is_available: isAvailable });
  }
};
</![CDATA[>
