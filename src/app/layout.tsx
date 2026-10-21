import JsonLd from "@/seo/JsonLd";
import type { Metadata } from "next";
import { site } from "@/config/site";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import "@/style/globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: "%s" },
  description:
    "Explore Over the Hill guides, maps and confirmed game information.",
  robots: { index: site.indexable, follow: true },
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google tag (gtag.js) */}
        {/* eslint-disable-next-line @next/next/next-script-for-ga -- Use the requested plain script snippet in the document head. */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-0PGJG1RD64"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-0PGJG1RD64');`,
          }}
        />
      </head>
      <body>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": site.url + "/#organization",
                name: site.name,
                url: site.url,
                email: site.email,
                logo: {
                  "@type": "ImageObject",
                  url: site.url + "/images/logo.svg",
                },
              },
              {
                "@type": "WebSite",
                "@id": site.url + "/#website",
                name: site.name,
                url: site.url,
                inLanguage: "en",
                publisher: { "@id": site.url + "/#organization" },
              },
            ],
          }}
        />
        <AppHeader />
        <main id="main-content">{children}</main>
        <AppFooter />
      </body>
    </html>
  );
}
