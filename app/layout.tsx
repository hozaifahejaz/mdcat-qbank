import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Track from "@/components/Track";
import { site } from "@/lib/site";
import "./globals.css";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `MDCAT MCQs with full explanations · ${site.name}`,
  description: "Practise PMDC MDCAT MCQs by chapter, with a full explanation on every question, full-length timed mocks and past papers. One season pass, Rs. 2,999.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `MDCAT MCQs with full explanations · ${site.name}`,
    description: "Chapter-wise MDCAT practice, timed 180-question mocks and an explanation on every question.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f4f4f1",
};

/* Set the theme before first paint: a saved choice wins, otherwise follow the device. */
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t)}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        <Track />
      </body>
    </html>
  );
}
