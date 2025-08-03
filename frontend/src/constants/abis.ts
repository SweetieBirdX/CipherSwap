// Limit Order Protocol ABI (1inch)
export const LIMIT_ORDER_ABI = [
  {
    "inputs": [
      {
        "components": [
          {"name": "makerAsset", "type": "address"},
          {"name": "takerAsset", "type": "address"},
          {"name": "makingAmount", "type": "uint256"},
          {"name": "takingAmount", "type": "uint256"},
          {"name": "maker", "type": "address"},
          {"name": "receiver", "type": "address"},
          {"name": "makerTraits", "type": "uint256"}
        ],
        "name": "order",
        "type": "tuple"
      },
      {"name": "signature", "type": "bytes"},
      {"name": "makingAmount", "type": "uint256"},
      {"name": "takingAmount", "type": "uint256"},
      {"name": "thresholdAmount", "type": "uint256"}
    ],
    "name": "fillOrder",
    "outputs": [
      {"name": "makingAmount", "type": "uint256"},
      {"name": "takingAmount", "type": "uint256"}
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {"name": "makerAsset", "type": "address"},
          {"name": "takerAsset", "type": "address"},
          {"name": "makingAmount", "type": "uint256"},
          {"name": "takingAmount", "type": "uint256"},
          {"name": "maker", "type": "address"},
          {"name": "receiver", "type": "address"},
          {"name": "makerTraits", "type": "uint256"}
        ],
        "name": "order",
        "type": "tuple"
      },
      {"name": "signature", "type": "bytes"}
    ],
    "name": "cancelOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

// ERC20 ABI for token approvals
export const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_spender", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "_owner", "type": "address"},
      {"name": "_spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  }
] as const 