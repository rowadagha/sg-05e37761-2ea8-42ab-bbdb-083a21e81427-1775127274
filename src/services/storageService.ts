import { supabase } from "@/integrations/supabase/client";

export const storageService = {
  async uploadLogo(
    restaurantId: string,
    file: File
  ): Promise<string | null> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${restaurantId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("restaurant-logos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("restaurant-logos")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      return null;
    }
  },

  async deleteLogo(imageUrl: string): Promise<boolean> {
    try {
      const path = imageUrl.split("/restaurant-logos/").pop();
      if (!path) return false;

      const { error } = await supabase.storage
        .from("restaurant-logos")
        .remove([path]);

      if (error) {
        console.error("Delete error:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting logo:", error);
      return false;
    }
  },

  async uploadMenuItemImage(
    restaurantId: string,
    file: File
  ): Promise<string | null> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${restaurantId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("menu-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("menu-images")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  },

  async deleteMenuItemImage(imageUrl: string): Promise<boolean> {
    try {
      const path = imageUrl.split("/menu-images/").pop();
      if (!path) return false;

      const { error } = await supabase.storage
        .from("menu-images")
        .remove([path]);

      if (error) {
        console.error("Delete error:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting image:", error);
      return false;
    }
  },

  getImageUrl(path: string): string {
    const { data: { publicUrl } } = supabase.storage
      .from("menu-images")
      .getPublicUrl(path);
    
    return publicUrl;
  },

  async uploadBannerImage(
    restaurantId: string,
    file: File
  ): Promise<string | null> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${restaurantId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("menu-banners")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("menu-banners")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading banner image:", error);
      return null;
    }
  },

  async deleteBannerImage(imageUrl: string): Promise<boolean> {
    try {
      const path = imageUrl.split("/menu-banners/").pop();
      if (!path) return false;

      const { error } = await supabase.storage
        .from("menu-banners")
        .remove([path]);

      if (error) {
        console.error("Delete error:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting banner image:", error);
      return false;
    }
  }
};