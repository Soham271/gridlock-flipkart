import type { Metadata } from "next"
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google"
import "./globals.css"
import "leaflet/dist/leaflet.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
})

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
})

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-data",
})

export const metadata: Metadata = {
  title: "ASTRAM Gridlock — Bengaluru Traffic Intelligence",
  description:
    "Event-driven congestion prediction and resource recommendation system",
  icons: { icon: "/favicon.svg" },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} font-body bg-[var(--bg-base)] text-[var(--text-primary)] min-h-screen`}
      >
        {children}
      </body>
    </html>
  )
}
