import type { Metadata } from 'next'
import './globals.css'
import dynamic from 'next/dynamic'
import MiniKitProvider from '@/components/minikit-provider'
import { ReactQueryClientProvider } from '@/components/react-query-client-provider'
import { AuthProvider } from '@/context/AuthContext'
import { FetchPatchProvider } from '@/lib/FetchPatchProvider'

export const metadata: Metadata = {
  title: 'WorldView - Voting App',
  description: 'A quadritic voting app.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const ErudaProvider = dynamic(
    () => import('../components/Eruda').then(c => c.ErudaProvider),
    {
      ssr: false,
    },
  )
  return (
    <html lang="en">
      <body>
        <ErudaProvider>
          <MiniKitProvider>
            <AuthProvider>
              <ReactQueryClientProvider>
                <FetchPatchProvider />
                {children}
              </ReactQueryClientProvider>
            </AuthProvider>
          </MiniKitProvider>
        </ErudaProvider>
      </body>
    </html>
  )
}
