import "./globals.css";
import { Kumbh_Sans } from "next/font/google";

const kumbhSans = Kumbh_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-kumbh-sans",
});

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
    <html lang="en" className={kumbhSans.variable}>
      <body className={`${kumbhSans.className} bg-[#0B0F19] text-white antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
