import type { Metadata, Viewport } from "next";
import "@fontsource-variable/sora";
import { RiderProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rider",
  description: "One taste profile for every app you eat with.",
  applicationName: "Rider",
  appleWebApp: { capable: true, title: "Rider", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#f6f5fb",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RiderProvider>
          <div className="app">{children}</div>
        </RiderProvider>
      </body>
    </html>
  );
}
