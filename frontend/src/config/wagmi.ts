import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'CipherSwap',
  projectId: 'YOUR_PROJECT_ID', // WalletConnect project ID (optional)
  chains: [mainnet], // Ethereum mainnet
  ssr: false, // Disable SSR for better wallet detection
}) 