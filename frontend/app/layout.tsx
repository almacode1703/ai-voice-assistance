import "./globals.css";

export const metadata = {
  title: "AI Voice Assistant",
  description: "Agentic AI Voice Assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0B0F19] text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
