import type { Metadata } from "next";
import { Viaoda_Libre, Imprima } from "next/font/google";
import "./globals.css";

const viaodaLibre = Viaoda_Libre({
  variable: "--font-viaoda",
  weight: "400",
  subsets: ["latin"],
});

const imprima = Imprima({
  variable: "--font-imprima",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reverie",
  description: "High-fidelity interactive landing page.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${viaodaLibre.variable} ${imprima.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
