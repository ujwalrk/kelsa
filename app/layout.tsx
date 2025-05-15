// src/app/layout.tsx
// import './globals.css'
import { ReactNode } from 'react'
import Script from 'next/script'

export const metadata = {
  title: 'Kelsa',
  description: 'Trello-like MVP with Supabase & MUI',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
         <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>
      <body>
          <nav style={{ padding: 20 }}>
            <a href="/">Home</a> | <a href="/login">Login</a> | <a href="/register">Register</a>
          </nav>
        {children}
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
