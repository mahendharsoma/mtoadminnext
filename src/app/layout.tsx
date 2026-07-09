import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MTO Admin - Motor Transport Office",
  description: "Hyderabad Police Fleet Management System",
  icons: {
    icon: [{ url: "/images/hyderabad-police-logo.png", type: "image/png" }],
    shortcut: "/images/hyderabad-police-logo.png",
    apple: "/images/hyderabad-police-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
