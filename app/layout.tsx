import type { Metadata, Viewport } from "next"
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

const APP_NAME = "Eat-dentity";
const APP_DEFAULT_TITLE = "Eat-dentity - You Are What You Eat!";
const APP_TITLE_TEMPLATE = "%s - Eat-dentity";
const APP_DESCRIPTION = "Track your meals for 7 days and discover your unique food persona!";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
};

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

