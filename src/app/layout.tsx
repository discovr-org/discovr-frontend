import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { JsonLd } from "@/shared/seo/components/JsonLd";
import { GSC_VERIFICATION, GTM_ID, SITE_DESCRIPTION, SITE_URL } from "@/shared/seo/utils/site";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: { google: GSC_VERIFICATION },
  openGraph: { siteName: "discovr", type: "website", locale: "en_IN", images: ["/icons/discovr-app-icon.png"] },
  twitter: { card: "summary" },
  title: {
    default: "discovr",
    template: "%s · discovr",
  },
  description: SITE_DESCRIPTION,
  applicationName: "discovr",
  manifest: "/manifest.webmanifest",
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
        {/* Google Tag Manager. Set up GA4 inside the GTM container. */}
        <Script id="gtm" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=document.getElementsByTagName('script')[0],j=document.createElement('script');j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id=${GTM_ID}';f.parentNode.insertBefore(j,f);`}
        </Script>
        <noscript>
          <iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`} height="0" width="0" style={{ display: "none", visibility: "hidden" }} />
        </noscript>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
