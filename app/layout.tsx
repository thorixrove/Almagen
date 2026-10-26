import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "Almagen: Agentic Workspace",
  description: "Agen AI yang menggambar dan menulis bersama Anda, secara langsung.",
};

// Versi sementara Langkah 4. AppShell, Tooltip, UpgradeDialog dan Toaster ditambahkan di langkah berikutnya.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        theme: dark,
        variables: { colorPrimary: "oklch(0.74 0.16 55)" },
      }}
    >
      <html
        lang="id"
        className={`dark ${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <TooltipProvider>{children}
          </TooltipProvider>
          <Toaster richColors/>
        </body>
      </html>
    </ClerkProvider>
  );
}