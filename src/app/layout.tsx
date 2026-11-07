import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { JsonLd } from "@/shared/seo/components/JsonLd";
import { SITE_DESCRIPTION, SITE_URL } from "@/shared/seo/utils/site";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { Providers } from "@/shared/components/Providers";
import { color } from "@/shared/styles/tokens";
import "@/shared/styles/globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  weight: ["700", "800"],
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Paste the token from Search Console > Settings > Ownership > HTML tag.
  verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION },
  openGraph: { siteName: "discovr", type: "website", locale: "en_IN", images: ["/icons/discovr-app-icon.png"] },
  twitter: { card: "summary" },
  title: {
    default: "discovr",
    template: "%s · discovr",
  },
  description: SITE_DESCRIPTION,
  applicationName: "discovr",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "discovr",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/discovr-app-icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

// Organization + WebSite: tells search and AI engines who we are.
const SITE_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${SITE_URL}/#org`, name: "discovr", url: SITE_URL, logo: `${SITE_URL}/icons/discovr-app-icon.png`, description: SITE_DESCRIPTION },
    { "@type": "WebSite", "@id": `${SITE_URL}/#site`, name: "discovr", url: SITE_URL, publisher: { "@id": `${SITE_URL}/#org` }, inLanguage: "en-IN" },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: color.surfaceCanvas,
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${instrument.variable}`}
    >
      <body>
        <JsonLd data={SITE_SCHEMA} />
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
