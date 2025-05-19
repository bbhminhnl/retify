import "../globals.css";

import { ReactNode } from "react";

/** Define the correct props type */
type LayoutProps = {
  children: ReactNode;
  /** params is a Promise for [id] */
  params: Promise<{ id: string }>;
};

export default async function IdLayout({ children, params }: LayoutProps) {
  return (
    <html lang="en">
      <body className="flex w-screen h-screen">{children}</body>
    </html>
  );
}
