import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WagmiConfig, configureChains, createConfig, mainnet } from 'wagmi'
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit'
import localFont from 'next/font/local'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import { Providers } from './providers'

export const berkeley = localFont({
   src: [
      {
         path: './font/BerkeleyMono-Regular.otf',
         weight: '400',
         style: 'normal',
      },
      {
         path: './font/BerkeleyMono-Italic.otf',
         weight: '400',
         style: 'italic',
      },
      {
         path: './font/BerkeleyMono-Bold.otf',
         weight: '700',
         style: 'normal',
      },
      {
         path: './font/BerkeleyMono-BoldItalic.otf',
         weight: '700',
         style: 'italic',
      },
   ],
})

export const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
   title: 'Streams',
   description: 'See all Nouns DAO payment streams',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
   return (
      <html lang='en'>
         <body className={`${berkeley.className}`}>
            <Providers>{children}</Providers>
         </body>
      </html>
   )
}
