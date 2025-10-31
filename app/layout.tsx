import type { Metadata } from "next"
import { Prompt, Roboto } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

const prompt = Prompt({ 
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
})

const roboto = Roboto({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
})

export const metadata: Metadata = {
  title: "Eat-dentity - You Are What You Eat!",
  description: "Track your meals, discover your food persona!",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="th" className={`${prompt.variable} ${roboto.variable}`}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}

