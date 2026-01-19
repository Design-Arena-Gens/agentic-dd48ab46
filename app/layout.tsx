import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Winget Indexer",
  description:
    "Index installed applications on Windows devices, filter the results, and generate reproducible winget commands."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
