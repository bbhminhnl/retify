import "../globals.css";

export const metadata = {
  title: "Retify",
  description: "Chat Embed",
};

export default function IdLayout({
  children,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  return (
    <html lang="en">
      <body className="flex w-screen h-screen">{children}</body>
    </html>
  );
}
