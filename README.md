# CipherSwap - Advanced DeFi OTC Swap Platform
Built on Ethereum Flashbots Integration 1inch Protocol

A decentralized platform leveraging MEV protection, intelligent split routing, and zero slippage execution to transform DeFi trading through transparency, community governance, and automated efficiency.

👥 Core Team

Tolga Buhur - Limit Order Protocol
[GitHub](https://github.com/tbuhur) [LinkedIn](https://www.linkedin.com/in/tolga-buhur-a6304b325/) [Twitter](https://x.com/tlgbuh71061)

Yahya Emir Soyer - MEV Protection & Flashbots Integration
[GitHub](https://github.com/y4hyya) [LinkedIn](https://www.linkedin.com/in/yahyaemirsoyer/) [Twitter](https://x.com/hotdogg145)

Eyüp Efe - 1inch API
[GitHub](https://github.com/SweetieBirdX) [LinkedIn](https://www.linkedin.com/in/eyupefekarakoca/) [Twitter](https://x.com/EyupEfeKrkc)

🌟 Key Features
🕵️ MEV Protection & Security
Flashbots integration for front-running protection
Real-time transaction simulation and validation
Immutable transaction history on Ethereum blockchain
User-visible fund flow analytics and gas optimization
Milestone-based execution system with slippage controls
🗳️ Community Governance
Multi-signature approval workflows
Quadratic voting implementation for large trades
Proposal lifecycle management (Draft → Review → Voting → Execution)
Anti-sybil attack protection with Proof-of-Humanity
⚡ Efficient Execution
Automated multi-sig approval workflows
Gas-optimized transaction bundling
Cross-chain compatibility (Ethereum → Polygon → Base)
Realtime market data and price feeds dashboard
📜 Smart Contract Ecosystem
Contract	Address	Technology	Purpose	Status
SwapManager	0xcf6c...712e	1inch Protocol	Token swapping & routing	Active
RFQManager	0xc10e...b8f	IPFS + AI	Request for Quote management	Active
LimitOrderSystem	0xd1ef...55a3	1inch Limit Order SDK	Decentralized limit orders	Active
MEVProtection	0x2696...58ed	Flashbots	MEV protection & bundling	Active
Flashbots Relay: 0x870679e138bcdf293b7ff14dd44b70fc97e12fc0

🏗️ Architecture Deep Dive

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CipherSwap
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your API keys
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel dashboard**
   - Go to your project settings
   - Add all required environment variables from `env.example`

## 🔧 Core Features

- **MEV Protection**: Flashbots integration for front-running protection
- **Multi-DEX Routing**: Intelligent split routing across multiple DEXs
- **RFQ System**: Request for Quote system for institutional trading
- **Real-time Analytics**: Live market data and price feeds
- **Comprehensive API**: 49+ REST endpoints
- **Chainlink Integration**: Reliable price oracles
- **Limit Orders**: Advanced limit order management
- **Slippage Controls**: Dynamic slippage tolerance management

## 📁 Project Structure

```
CipherSwap/
├── api/                    # Vercel serverless functions
│   └── index.ts           # API handler
├── backend/               # Express.js API server
│   ├── src/
│   │   ├── api/          # API routes & controllers
│   │   ├── services/     # Business logic services
│   │   ├── config/       # Configuration
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utility functions
│   └── package.json
├── frontend/              # React + TypeScript app
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API services
│   │   ├── types/        # TypeScript types
│   │   ├── hooks/        # Custom React hooks
│   │   └── config/       # Frontend configuration
│   └── package.json
├── vercel.json           # Vercel configuration
└── package.json          # Root package.json
```

## 🔑 Environment Variables

### Required
- `INCH_API_KEY`: 1inch API key
- `PRIVATE_KEY`: Ethereum private key
- `CHAINLINK_ORACLE_ADDRESS`: Chainlink oracle address

### Optional
- `INFURA_KEY`: Infura API key
- `ALCHEMY_KEY`: Alchemy API key
- `VITE_API_URL`: Frontend API URL (auto-set for Vercel)

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, TypeScript
- **Blockchain**: Ethers.js, RainbowKit, Wagmi, Viem
- **Deployment**: Vercel
- **APIs**: 1inch, Chainlink, Flashbots
- **Testing**: Jest, Supertest
- **Documentation**: Swagger/OpenAPI

## 📚 API Documentation

Visit `/docs` for comprehensive API documentation with 49+ endpoints covering:
- Swap operations with MEV protection
- RFQ (Request for Quote) system
- Limit order management
- Real-time market data
- Oracle price feeds
- Slippage tolerance controls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**ETHGlobal Unite DeFi Hackathon Project** 