import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { MainWrapper } from "@/components/layout/main-wrapper";
import { CompareBar } from "@/components/compare/compare-bar";
import { UserProvider } from "@/hooks/use-user";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RestaurApp — Descubre restaurantes",
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
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", figtree.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex">
        <ThemeProvider>
          <Toaster />
          <UserProvider>
          <SidebarProvider>
            <Sidebar />
            <MainWrapper>
              <main className="flex-1">{children}</main>
              <Footer />
            </MainWrapper>
            <CompareBar />
          </SidebarProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
