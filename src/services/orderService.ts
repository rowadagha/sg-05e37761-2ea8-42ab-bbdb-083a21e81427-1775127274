import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
type OrderItemInsert = Database["public"]["Tables"]["order_items"]["Insert"];

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export interface OrderStats {
  todayOrders: number;
  todayRevenue: number;
  activeOrders: number;
  completedToday: number;
}

class OrderService {
  async createOrder(restaurantId: string, items: Omit<OrderItemInsert, "order_id">[], customerNote?: string): Promise<Order> {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        restaurant_id: restaurantId,
        customer_note: customerNote,
        status: "pending"
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Error creating order:", orderError);
      throw new Error("فشل إنشاء الطلب");
    }

    const orderItems = items.map(item => ({
      ...item,
      order_id: order.id
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      await supabase.from("orders").delete().eq("id", order.id);
      throw new Error("فشل إضافة أصناف الطلب");
    }

    return order;
  }

  async getOrdersByRestaurant(restaurantId: string, status?: string): Promise<OrderWithItems[]> {
    let query = supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching orders:", error);
      return [];
    }

    return (data || []) as OrderWithItems[];
  }

  async getActiveOrders(restaurantId: string): Promise<OrderWithItems[]> {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .eq("restaurant_id", restaurantId)
      .in("status", ["pending", "preparing"])
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching active orders:", error);
      return [];
    }

    return (data || []) as OrderWithItems[];
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      console.error("Error updating order status:", error);
      throw new Error("فشل تحديث حالة الطلب");
    }
  }

  async getOrderStats(restaurantId: string): Promise<OrderStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .gte("created_at", todayISO);

    if (error) {
      console.error("Error fetching order stats:", error);
      return {
        todayOrders: 0,
        todayRevenue: 0,
        activeOrders: 0,
        completedToday: 0
      };
    }

    const todayOrders = orders?.length || 0;
    const todayRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    const activeOrders = orders?.filter(o => ["pending", "preparing"].includes(o.status)).length || 0;
    const completedToday = orders?.filter(o => o.status === "completed").length || 0;

    return {
      todayOrders,
      todayRevenue,
      activeOrders,
      completedToday
    };
  }

  async getRecentOrders(restaurantId: string, limit = 5): Promise<OrderWithItems[]> {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent orders:", error);
      return [];
    }

    return (data || []) as OrderWithItems[];
  }

  getOrderStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: "قيد الانتظار",
      preparing: "قيد التحضير",
      ready: "جاهز",
      completed: "مكتمل",
      cancelled: "ملغي"
    };
    return labels[status] || status;
  }

  getOrderStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: "text-gold",
      preparing: "text-blue-600",
      ready: "text-emerald",
      completed: "text-gray-600",
      cancelled: "text-red-600"
    };
    return colors[status] || "text-gray-600";
  }
}

export const orderService = new OrderService();