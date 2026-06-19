import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "leaflet/dist/leaflet.css"
import Navbar from "@/components/shared/Navbar"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "ASTRAM Gridlock — Bengaluru Traffic Intelligence",
  description: "Event-driven congestion prediction and resource recommendation system",
  icons: { icon: "/favicon.svg" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-[#09090b] text-[#e4e4e7] min-h-screen`}>
        <Navbar />
        <main className="min-h-[calc(100vh-52px)]">
          {children}
        </main>
      </body>
    </html>
  )
}
