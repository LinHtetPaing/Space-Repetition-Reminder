import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Spaced Repetition Reminder",
  description: "Learn with an automatic multi-month review calendar.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Georgia, serif" }}>{children}</body>
    </html>
  );
}
