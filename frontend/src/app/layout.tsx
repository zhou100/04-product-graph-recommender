import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Product Graph Recommender",
  description: "Search across catalogs with deduplicated products and recommendations",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
