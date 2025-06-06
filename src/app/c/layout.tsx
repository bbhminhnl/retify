export const metadata = {
  title: "Retify",
  description: "Chat Embed",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex w-screen h-screen">{children}</body>
    </html>
  );
}
