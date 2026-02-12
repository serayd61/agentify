import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agentify.ch | KI-Assistenten für Schweizer KMU",
  description:
    "Die Schweizer Plattform für branchenspezifische KI-Assistenten. Automatisieren Sie Kundenanfragen mit einem Klick. Für Treuhand, Handwerk, Gastronomie und mehr.",
  keywords: [
    "KI-Assistent",
    "Chatbot",
    "Schweiz",
    "KMU",
    "Automatisierung",
    "Kundenservice",
    "Treuhand",
    "Handwerk",
  ],
  authors: [{ name: "Agentify.ch" }],
  openGraph: {
    title: "Agentify.ch | KI-Assistenten für Schweizer KMU",
    description:
      "Branchenspezifische KI-Assistenten für Ihr Unternehmen. Automatisieren Sie Kundenanfragen mit einem Klick.",
    url: "https://agentify.ch",
    siteName: "Agentify.ch",
    locale: "de_CH",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de-CH">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
