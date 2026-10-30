import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SEAGULL RECORDS · Sistema de Gestión Integral",
  description: "Plataforma de gestión para estudio de producción musical. CRM, cotizaciones, proyectos, contratos, finanzas e integraciones Google Workspace.",
  keywords: ["estudio musical", "producción musical", "CRM", "cotizaciones", "Chimbote", "Perú"],
  authors: [{ name: "SEAGULL RECORDS S.A.C." }],
  icons: {
    icon: "/logo-seagull.png",
    apple: "/logo-seagull.png",
  },
  openGraph: {
    title: "SEAGULL RECORDS · Studio OS",
    description: "Sistema de Gestión Integral para Estudio de Producción Musical",
    images: ["/logo-seagull.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
