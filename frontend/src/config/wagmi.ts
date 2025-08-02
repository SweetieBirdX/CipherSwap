import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'CipherSwap',
  projectId: 'YOUR_PROJECT_ID', // WalletConnect project ID (optional)
  chains: [sepolia], // Only Sepolia testnet
  ssr: false, // Disable SSR for better wallet detection
}) 