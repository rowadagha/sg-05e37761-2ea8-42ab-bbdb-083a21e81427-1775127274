<![CDATA[import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type QRCode = Database["public"]["Tables"]["qr_codes"]["Row"];

export const qrCodeService = {
  async getOrCreateQRCode(restaurantId: string): Promise<QRCode | null> {
    const { data: existing } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true)
      .maybeSingle();

    if (existing) return existing;

    const code = this.generateCode();
    const { data, error } = await supabase
      .from("qr_codes")
      .insert({
        restaurant_id: restaurantId,
        code,
        qr_data: `${window.location.origin}/menu/${code}`
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating QR code:", error);
      return null;
    }

    return data;
  },

  async regenerateQRCode(restaurantId: string): Promise<QRCode | null> {
    await supabase
      .from("qr_codes")
      .update({ is_active: false })
      .eq("restaurant_id", restaurantId);

    const code = this.generateCode();
    const { data, error } = await supabase
      .from("qr_codes")
      .insert({
        restaurant_id: restaurantId,
        code,
        qr_data: `${window.location.origin}/menu/${code}`
      })
      .select()
      .single();

    if (error) {
      console.error("Error regenerating QR code:", error);
      return null;
    }

    return data;
  },

  async trackView(code: string): Promise<void> {
    await supabase
      .from("menu_views")
      .insert({
        qr_code: code,
        viewed_at: new Date().toISOString()
      });

    await supabase.rpc("increment_qr_scan_count", { qr_code_id: code });
  },

  generateCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
};
</![CDATA[>
