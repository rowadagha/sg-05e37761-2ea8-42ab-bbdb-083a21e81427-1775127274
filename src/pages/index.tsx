import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { 
  QrCode, 
  LayoutDashboard, 
  Smartphone, 
  Sparkles, 
  TrendingUp,
  Shield,
  Zap,
  Globe,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <SEO
        title="منيو بلس - حلول القوائم الرقمية للمطاعم في السعودية"
        description="أنشئ قائمة رقمية احترافية لمطعمك في دقائق. حلول سحابية متكاملة مع كود QR، تحديثات فورية، وتجربة مستخدم سلسة"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-cream to-white">
        {/* Header */}
        <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald to-emerald-dark rounded-lg flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-emerald">منيو بلس</span>
              </div>
              
              <nav className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                  المميزات
                </a>
                <a href="#pricing" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                  الأسعار
                </a>
                <a href="#demo" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                  تجربة مجانية
                </a>
              </nav>
              
              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-emerald hover:bg-emerald-dark">
                    ابدأ مجاناً
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald/10 border border-emerald/20 mb-6">
                <Sparkles className="w-4 h-4 text-emerald" />
                <span className="text-sm font-medium text-emerald">حلول ذكية للمطاعم السعودية</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                قائمة رقمية احترافية
                <br />
                <span className="text-emerald">في دقائق معدودة</span>
              </h1>
              
              <p className="text-lg md:text-xl text-foreground/70 mb-8 max-w-2xl mx-auto">
                حوّل مطعمك إلى تجربة رقمية متكاملة. أنشئ قوائمك، أضف الصور والأسعار، واحصل على رمز QR جاهز للاستخدام فوراً
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Link href="/auth/register">
                  <Button size="lg" className="bg-emerald hover:bg-emerald-dark text-white px-8 h-12">
                    ابدأ تجربتك المجانية
                    <ArrowLeft className="w-5 h-5 mr-2" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="px-8 h-12">
                  شاهد العرض التوضيحي
                </Button>
              </div>
              
              <div className="flex items-center justify-center gap-8 text-sm text-foreground/60">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald" />
                  <span>آمن ومضمون</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald" />
                  <span>إعداد سريع</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald" />
                  <span>دعم فني 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                كل ما يحتاجه مطعمك
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                منصة متكاملة تجمع كل الأدوات التي تحتاجها لإدارة قائمتك الرقمية بكفاءة
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-emerald/10 rounded-lg flex items-center justify-center mb-4">
                  <QrCode className="w-6 h-6 text-emerald" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">رمز QR مخصص</h3>
                <p className="text-foreground/70">
                  احصل على رمز QR فريد لمطعمك، قابل للطباعة والتخصيص حسب هويتك البصرية
                </p>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4">
                  <LayoutDashboard className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">لوحة تحكم شاملة</h3>
                <p className="text-foreground/70">
                  إدارة كاملة للقوائم، الفئات، الأصناف، والأسعار من مكان واحد بسيط وسهل
                </p>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-emerald/10 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-emerald" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">تجربة سلسة للعملاء</h3>
                <p className="text-foreground/70">
                  قائمة سريعة التحميل، سهلة التصفح، وتعمل على جميع الهواتف والأجهزة
                </p>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">تحديثات فورية</h3>
                <p className="text-foreground/70">
                  عدّل أسعارك وأصنافك في أي وقت، وسيرى عملاؤك التغييرات فوراً
                </p>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-emerald/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-emerald" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">تقارير وإحصائيات</h3>
                <p className="text-foreground/70">
                  تتبع الأصناف الأكثر مشاهدة وفهم تفضيلات عملائك بشكل أفضل
                </p>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">دعم متعدد اللغات</h3>
                <p className="text-foreground/70">
                  قوائم بالعربية والإنجليزية لخدمة جميع عملائك المحليين والدوليين
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-emerald to-emerald-dark text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                جاهز لتحويل مطعمك رقمياً؟
              </h2>
              <p className="text-lg text-white/90 mb-8">
                انضم إلى مئات المطاعم السعودية التي اختارت منيو بلس لتحسين تجربة عملائها
              </p>
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-emerald hover:bg-white/90 px-8 h-12">
                  ابدأ تجربتك المجانية لمدة 14 يوم
                  <ArrowLeft className="w-5 h-5 mr-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald to-emerald-dark rounded-lg flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-emerald">منيو بلس</span>
                </div>
                <p className="text-sm text-foreground/60">
                  حلول القوائم الرقمية للمطاعم السعودية
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-3">المنتج</h3>
                <ul className="space-y-2 text-sm text-foreground/60">
                  <li><a href="#" className="hover:text-foreground transition-colors">المميزات</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">الأسعار</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">التجربة المجانية</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-3">الشركة</h3>
                <ul className="space-y-2 text-sm text-foreground/60">
                  <li><a href="#" className="hover:text-foreground transition-colors">من نحن</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">تواصل معنا</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">المدونة</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-3">الدعم</h3>
                <ul className="space-y-2 text-sm text-foreground/60">
                  <li><a href="#" className="hover:text-foreground transition-colors">مركز المساعدة</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">الأسئلة الشائعة</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">الشروط والأحكام</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-border mt-8 pt-8 text-center text-sm text-foreground/60">
              <p>© 2026 منيو بلس. جميع الحقوق محفوظة.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}