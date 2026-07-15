import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RET Industry Partner Directory",
  description:
    "A teacher-facing partner finder for RET industry, university, lab, nonprofit, and STEM outreach connections.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
