import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Public Speaking Practice Platform",
  description: "Practice public speaking with AI-powered scenarios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}