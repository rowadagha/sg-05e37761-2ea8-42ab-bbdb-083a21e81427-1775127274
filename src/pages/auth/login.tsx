import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { authService } from "@/services/authService";
import { QrCode, ArrowRight } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.signIn(formData.email, formData.password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "بيانات الدخول غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="تسجيل الدخول - منيو بلس"
        description="قم بتسجيل الدخول إلى لوحة تحكم مطعمك"
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
            تسجيل الدخول
          </h1>
          <p className="text-center text-foreground/70 mb-6">
            مرحباً بعودتك إلى لوحة التحكم
          </p>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                dir="ltr"
                className="text-left"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald hover:bg-emerald-dark"
              disabled={loading}
            >
              {loading ? "جاري الدخول..." : "تسجيل الدخول"}
              <ArrowRight className="w-4 h-4 mr-2" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-foreground/60">
            ليس لديك حساب؟{" "}
            <Link href="/auth/register" className="text-emerald hover:underline font-medium">
              إنشاء حساب جديد
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}

