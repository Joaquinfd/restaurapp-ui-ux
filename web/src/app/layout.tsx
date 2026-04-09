import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { MainWrapper } from "@/components/layout/main-wrapper";
import { CompareProvider } from "@/hooks/use-compare";
import { CompareBar } from "@/components/compare/compare-bar";

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex">
        <ThemeProvider>
          <CompareProvider>
            <SidebarProvider>
              <Sidebar />
              <MainWrapper>
                <main className="flex-1">{children}</main>
                <Footer />
              </MainWrapper>
              <CompareBar />
            </SidebarProvider>
          </CompareProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
