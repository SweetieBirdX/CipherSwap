import { useState } from 'react'
import { useLimitOrder } from '../hooks/useLimitOrder'

// Token mapping for Ethereum mainnet
const TOKEN_ADDRESSES = {
  'ETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH address for 1inch API
  'USDC': '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC on Ethereum mainnet
  'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT on Ethereum mainnet
  'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F'  // DAI on Ethereum mainnet
}

// Helper function to format token amounts properly
const formatTokenAmount = (amount: string | number, token: string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (numAmount < 0.01) {
    return `${numAmount.toFixed(6)} ${token}`;
  } else if (numAmount < 1) {
    return `${numAmount.toFixed(4)} ${token}`;
  } else if (numAmount < 1000) {
    return `${numAmount.toFixed(2)} ${token}`;
  } else {
    return `${numAmount.toFixed(0)} ${token}`;
  }
}

export default function LimitOrderForm() {
  const { createLimitOrder, isLoading, error, isConnected } = useLimitOrder()
  
  const [formData, setFormData] = useState({
    fromToken: 'ETH',
    toToken: 'USDC',
    amount: '',
    limitPrice: '',
    deadline: 3600, // 1 hour default
  })

  const [orderResult, setOrderResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'create' | 'orders'>('create')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    try {
      // Convert amount to wei (assuming ETH has 18 decimals)
      const amountInWei = (parseFloat(formData.amount) * Math.pow(10, 18)).toString()
      
      // Convert limit price to proper format (assuming 6 decimals for USDC)
      const limitPriceInWei = (parseFloat(formData.limitPrice) * Math.pow(10, 6)).toString()
      
      const orderParams = {
        fromToken: TOKEN_ADDRESSES[formData.fromToken as keyof typeof TOKEN_ADDRESSES],
        toToken: TOKEN_ADDRESSES[formData.toToken as keyof typeof TOKEN_ADDRESSES],
        amount: amountInWei,
        limitPrice: limitPriceInWei,
        deadline: formData.deadline,
        chainId: 1, // Ethereum mainnet
        orderType: 'sell' as const, // Default to sell order
      }
      
      console.log('Sending order params:', orderParams)
      
      const result = await createLimitOrder(orderParams)

      setOrderResult(result)
      
      if (result.success) {
        alert('Limit order created successfully!')
      }
    } catch (err: any) {
      console.error('Limit order creation failed:', err)
    }
  }

  if (!isConnected) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px 20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ color: '#4169E1', marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>
          🔐 Wallet Required
        </h3>
        <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.6' }}>
          Please connect your wallet to create and manage limit orders
        </p>
      </div>
    )
  }

  return (
    <div style={{ 
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      padding: '25px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ 
          color: '#4169E1', 
          fontSize: '28px', 
          fontWeight: 'bold', 
          marginBottom: '10px' 
        }}>
          📈 Limit Orders
        </h2>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Create advanced limit orders with MEV protection
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        marginBottom: '25px',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '4px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <button
          onClick={() => setActiveTab('create')}
          style={{
            flex: 1,
            padding: '12px 20px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: activeTab === 'create' ? '#4169E1' : 'transparent',
            color: activeTab === 'create' ? 'white' : '#666',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          ➕ Create Order
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            flex: 1,
            padding: '12px 20px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: activeTab === 'orders' ? '#4169E1' : 'transparent',
            color: activeTab === 'orders' ? 'white' : '#666',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          📋 My Orders
        </button>
      </div>

      {/* Create Order Tab */}
      {activeTab === 'create' && (
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            marginBottom: '20px', 
            color: '#4169E1', 
            fontWeight: 'bold',
            fontSize: '20px'
          }}>
            🎯 Create New Limit Order
          </h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
            {/* Token Selection Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  From Token
                </label>
                <select
                  value={formData.fromToken}
                  onChange={(e) => setFormData({ ...formData, fromToken: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '16px',
                    backgroundColor: 'white'
                  }}
                  required
                >
                  <option value="ETH">🟡 ETH</option>
                  <option value="USDC">🔵 USDC</option>
                  <option value="USDT">🟢 USDT</option>
                  <option value="DAI">🟣 DAI</option>
                </select>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  To Token
                </label>
                <select
                  value={formData.toToken}
                  onChange={(e) => setFormData({ ...formData, toToken: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '16px',
                    backgroundColor: 'white'
                  }}
                  required
                >
                  <option value="USDC">🔵 USDC</option>
                  <option value="ETH">🟡 ETH</option>
                  <option value="USDT">🟢 USDT</option>
                  <option value="DAI">🟣 DAI</option>
                </select>
              </div>
            </div>

            {/* Amount and Price Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  Amount ({formData.fromToken})
                </label>
                <input
                  type="text"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.1"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '16px'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  Limit Price ({formData.toToken})
                </label>
                <input
                  type="text"
                  value={formData.limitPrice}
                  onChange={(e) => setFormData({ ...formData, limitPrice: e.target.value })}
                  placeholder="1800"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '16px'
                  }}
                  required
                />
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold',
                color: '#333'
              }}>
                ⏰ Order Expiry (seconds)
              </label>
              <input
                type="number"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '16px'
                }}
                required
              />
              <div style={{ 
                fontSize: '14px', 
                color: '#666', 
                marginTop: '5px' 
              }}>
                Current: {Math.floor(formData.deadline / 60)} minutes {formData.deadline % 60} seconds
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: '#4169E1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {isLoading ? '🔄 Creating Order...' : '📈 Create Limit Order'}
            </button>
          </form>

          {/* Error Display */}
          {error && (
            <div style={{ 
              marginTop: '20px',
              padding: '15px', 
              backgroundColor: '#f8d7da', 
              color: '#721c24', 
              borderRadius: '8px',
              border: '1px solid #f5c6cb'
            }}>
              ❌ Error: {error}
            </div>
          )}

          {/* Success Result */}
          {orderResult && orderResult.success && (
            <div style={{ 
              marginTop: '20px',
              padding: '20px', 
              backgroundColor: '#d4edda', 
              color: '#155724', 
              borderRadius: '8px',
              border: '1px solid #c3e6cb'
            }}>
              <h4 style={{ 
                marginBottom: '15px', 
                fontWeight: 'bold',
                fontSize: '18px'
              }}>
                ✅ Order Created Successfully!
              </h4>
              <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
                <div><strong>Order ID:</strong> {orderResult.data?.orderId}</div>
                {orderResult.data?.txHash && (
                  <div><strong>Transaction Hash:</strong> {orderResult.data.txHash}</div>
                )}
                <div><strong>Status:</strong> {orderResult.data?.status}</div>
                <div><strong>Amount:</strong> {formatTokenAmount(formData.amount, formData.fromToken)}</div>
                <div><strong>Limit Price:</strong> {formatTokenAmount(formData.limitPrice, formData.toToken)}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* My Orders Tab */}
      {activeTab === 'orders' && (
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            marginBottom: '20px', 
            color: '#4169E1', 
            fontWeight: 'bold',
            fontSize: '20px'
          }}>
            📋 Your Limit Orders
          </h3>
          
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: '#666'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
            <h4 style={{ marginBottom: '10px', color: '#333', fontWeight: 'bold' }}>
              Order Management Coming Soon
            </h4>
            <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
              Track, modify, and cancel your limit orders in real-time
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 