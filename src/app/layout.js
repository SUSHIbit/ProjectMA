import "./globals.css";
import { Inter } from "next/font/google";
import { AppProvider } from "../context/AppContent";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Video Translation App",
  description: "Translate video content to different languages with AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
