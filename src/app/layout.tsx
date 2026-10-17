import type { Metadata } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: new URL("https:/shubhammoredev.com"),

  title: "Shubham More | Full-Stack Software Engineer",
  description:
    "Full-stack software engineer building web and mobile applications, scalable backend systems, and AI-powered solutions from initial architecture through production deployment.",

  icons: {
    icon: [
      { url: "/favicon.ico" },
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: "/apple-touch-icon.png",
  },

  openGraph: {
    type: "website",
    url: "/",
    siteName: "Shubham More",
    title: "Shubham More | Full-Stack Software Engineer",
    description:
      "Explore my projects, skills, engineering experience, and writing.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Shubham More — Full-Stack Software Engineer",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Shubham More | Full-Stack Software Engineer",
    description:
      "Explore my projects, skills, engineering experience, and writing.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
