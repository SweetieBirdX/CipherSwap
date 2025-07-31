import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, polygon, arbitrum, base, zkSync } from 'wagmi/chains'

export const chains = [
  mainnet,
  polygon,
  arbitrum,
  base,
  zkSync
]

export const config = getDefaultConfig({
  appName: 'CipherSwap',
  projectId: 'YOUR_PROJECT_ID', // WalletConnect project ID (optional)
  chains,
  ssr: false, // Disable SSR for better wallet detection
}) 