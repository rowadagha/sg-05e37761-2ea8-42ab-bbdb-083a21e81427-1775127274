<![CDATA[import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { authService } from "@/services/authService";
import { restaurantService } from "@/services/restaurantService";
import { QrCode, ArrowRight } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    restaurantName: "",
    ownerName: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user } = await authService.signUp(
        formData.email,
        formData.password
      );

      if (!user) {
        throw new Error("فشل إنشاء الحساب");
      }

      const slug = await restaurantService.generateUniqueSlug(formData.restaurantName);

      await restaurantService.createRestaurant({
        name: formData.restaurantName,
        slug,
        owner_id: user.id,
        settings: {
          primary_language: "ar",
          currency: "SAR"
        }
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء التسجيل");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="إنشاء حساب - منيو بلس"
        description="أنشئ حساب مطعمك الآن وابدأ في إدارة قائمتك الرقمية"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-cream to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald to-emerald-dark rounded-lg flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-emerald">منيو بلس</span>
          </div>

          <h1 className="text-2xl font-bold text-center text-foreground mb-2">
            إنشاء حساب جديد
          </h1>
          <p className="text-center text-foreground/70 mb-6">
            ابدأ رحلتك الرقمية مع مطعمك
          </p>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="ownerName">اسمك الكامل</Label>
              <Input
                id="ownerName"
                type="text"
                required
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                placeholder="أحمد محمد"
                className="text-right"
              />
            </div>

            <div>
              <Label htmlFor="restaurantName">اسم المطعم</Label>
              <Input
                id="restaurantName"
                type="text"
                required
                value={formData.restaurantName}
                onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                placeholder="مطعم الذوق الأصيل"
                className="text-right"
              />
            </div>

            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="restaurant@example.com"
                dir="ltr"
                className="text-left"
              />
            </div>

            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                dir="ltr"
                className="text-left"
              />
              <p className="text-xs text-foreground/60 mt-1">
                يجب أن تكون 6 أحرف على الأقل
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald hover:bg-emerald-dark"
              disabled={loading}
            >
              {loading ? "جاري الإنشاء..." : "إنشاء حساب"}
              <ArrowRight className="w-4 h-4 mr-2" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-foreground/60">
            لديك حساب بالفعل؟{" "}
            <Link href="/auth/login" className="text-emerald hover:underline font-medium">
              تسجيل الدخول
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}
</![CDATA[>
