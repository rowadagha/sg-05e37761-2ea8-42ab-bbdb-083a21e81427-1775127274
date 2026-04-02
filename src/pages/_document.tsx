import { Html, Head, Main, NextScript } from "next/document";
import { SEOElements } from "@/components/SEO";

export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head>
        <SEOElements
          title="منيو بلس - حلول القوائم الرقمية للمطاعم"
          description="منصة سعودية لإنشاء وإدارة قوائم المطاعم الرقمية. امنح عملائك تجربة طلب سهلة وحديثة من خلال رمز QR"
          image="/og-image.png"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}