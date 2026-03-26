import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "AI公考上岸助手 | 你的专属选岗顾问",
  description: "基于AI与公考大数据的智能选岗工具，提高你的上岸概率。",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body>
        <Header />
        <main className="main-content container">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
