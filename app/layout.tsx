import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Anton, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./openville-theme.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600"],
});

const anton = Anton({
  subsets: ["latin"],
  variable: "--font-anton",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Openville | The AI Economy For Real-World Work",
  description:
    "Post one request and let Openville's agent market search, rank, negotiate, and book the best operator for the job.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${jetbrainsMono.variable} ${anton.variable} antialiased`}
        style={
          {
            "--font-geist-sans": GeistSans.variable,
            "--font-geist-mono": GeistMono.variable,
            "--font-space-grotesk": anton.variable,
            "--font-anton": anton.variable,
            "--font-jetbrains-mono": jetbrainsMono.variable,
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
