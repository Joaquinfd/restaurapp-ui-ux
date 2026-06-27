import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { MainWrapper } from "@/components/layout/main-wrapper";
import { CompareBar } from "@/components/compare/compare-bar";
import { UserProvider } from "@/hooks/use-user";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "RestaurApp — Descubre restaurantes",
    template: "%s — RestaurApp",
  },
  description: "Encuentra los mejores restaurantes de tu ciudad.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        figtree.variable,
      )}
      suppressHydrationWarning
    >
      <body className="flex min-h-full">
        <ThemeProvider>
          <Toaster />
          <UserProvider>
            <SidebarProvider>
              <Sidebar />
              <MainWrapper>
                {/* `overflow-x-clip` is a safety net: any single element wider than
                    the viewport is clipped here instead of widening the whole page
                    (and zooming it on mobile). It sits on <main>, a sibling of the
                    sticky mobile header, so it never breaks that header's stickiness.
                    Inner horizontal scrollers (e.g. category chips) keep working. */}
                <main className="min-w-0 flex-1 overflow-x-clip">{children}</main>
                <Footer />
              </MainWrapper>
              <BottomTabBar />
              <CompareBar />
            </SidebarProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
