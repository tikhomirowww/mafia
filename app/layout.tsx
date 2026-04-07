import type { Metadata } from "next";
import "./globals.css";
import {
  SITE_TITLE,
  SITE_DESCRIPTION,
  SITE_URL,
  SITE_KEYWORDS,
} from "@/lib/site-config";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Mafia VIP",
    locale: "ru_KG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      name: "Mafia VIP",
      description:
        "Единственная в Кыргызстане VIP-студия для игры в Мафию с падающими стульями",
      url: SITE_URL,
      telephone: "+996709899998",
      address: [
        {
          "@type": "PostalAddress",
          streetAddress: "ул. Юнусалиева 129",
          addressLocality: "Бишкек",
          addressCountry: "KG",
        },
        {
          "@type": "PostalAddress",
          streetAddress: "пр. Шабдан Баатыра 4а",
          addressLocality: "Бишкек",
          addressCountry: "KG",
        },
      ],
      openingHours: "Mo-Su 00:00-24:00",
      priceRange: "400 KGS/hour",
      image: `${SITE_URL}/opengraph-image`,
      sameAs: [
        "https://www.instagram.com/mafia_vip_kg",
        "https://wa.me/996709899998",
      ],
    },
    {
      "@type": "WebSite",
      name: "Mafia VIP",
      url: SITE_URL,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-bg-primary text-white font-inter">
        {children}
      </body>
    </html>
  );
}
