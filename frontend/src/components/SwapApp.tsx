import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { QuoteService } from '../services/quoteService'
import type { QuoteRequest } from '../types/quote'
import type { MultipleQuotesResponse } from '../services/quoteService'
import LimitOrderForm from './LimitOrderForm'

// Token mapping for Ethereum mainnet
const TOKEN_ADDRESSES = {
  'ETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH address for 1inch API
  'USDC': '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC on Ethereum mainnet
  'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT on Ethereum mainnet
  'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F'  // DAI on Ethereum mainnet
}

// Helper function to format gas amounts properly
const formatGasAmount = (gasAmount: string | number): string => {
  const amount = typeof gasAmount === 'string' ? parseFloat(gasAmount) : gasAmount;
  
  // Convert from wei to ETH if the amount is very large (likely in wei)
  const ethAmount = amount > 1e10 ? amount / Math.pow(10, 18) : amount;
  
  // If the amount is very small (less than 0.0001), show as "Less than 0.0001 ETH"
  if (ethAmount < 0.0001 && ethAmount > 0) {
    return "Less than 0.0001 ETH";
  }
  
  // If the amount is 0, show as "0 ETH"
  if (ethAmount === 0) {
    return "0 ETH";
  }
  
  // Format with appropriate decimal places
  if (ethAmount < 0.01) {
    return `${ethAmount.toFixed(6)} ETH`;
  } else if (ethAmount < 1) {
    return `${ethAmount.toFixed(4)} ETH`;
  } else {
    return `${ethAmount.toFixed(2)} ETH`;
  }
}

// Helper function to format token amounts properly
const formatTokenAmount = (amount: string | number, token: string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle very large numbers (scientific notation)
  if (numAmount > 1e15) {
    // Convert from wei to normal units
    const normalizedAmount = numAmount / Math.pow(10, 18);
    return `${normalizedAmount.toFixed(2)} ${token}`;
  }
  
  // Handle normal numbers
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

// Helper function to format net values
const formatNetValue = (amount: string | number, token: string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle very large numbers
  if (numAmount > 1e15) {
    const normalizedAmount = numAmount / Math.pow(10, 18);
    return `${normalizedAmount.toFixed(2)} ${token}`;
  }
  
  // Handle normal numbers
  if (numAmount < 0.01) {
    return `${numAmount.toFixed(4)} ${token}`;
  } else if (numAmount < 1) {
    return `${numAmount.toFixed(3)} ${token}`;
  } else if (numAmount < 1000) {
    return `${numAmount.toFixed(2)} ${token}`;
  } else {
    return `${numAmount.toFixed(0)} ${token}`;
  }
}

export default function SwapApp() {
  const { address, isConnected } = useAccount()
  
  // Analysis state
  const [amount, setAmount] = useState('')
  const [slippage, setSlippage] = useState(0.5)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisData, setAnalysisData] = useState<MultipleQuotesResponse | null>(null)
  const [error, setError] = useState('')

  // Debug effect
  useEffect(() => {
    if (analysisData && analysisData.data) {
      console.log('Analysis data changed:', analysisData.data);
      console.log('Token quotes in render:', analysisData.data.tokenQuotes);
    }
  }, [analysisData])

  // Get analysis
  const getAnalysis = async () => {
    if (!amount || !address) return

    setAnalysisLoading(true)
    setError('')

    try {
      const request: QuoteRequest = {
        fromToken: TOKEN_ADDRESSES.ETH,
        toToken: TOKEN_ADDRESSES.USDC, // Default, service will handle multiple tokens
        amount,
        chainId: 1,
        slippage,
        userAddress: address
      }

      const response = await QuoteService.getMultipleQuotes(request)
      
      if (response.success && response.data) {
        console.log('Analysis data received:', response.data);
        console.log('Token quotes:', response.data.tokenQuotes);
        console.log('Token quotes length:', response.data.tokenQuotes.length);
        console.log('Token quotes details:', response.data.tokenQuotes.map(q => ({ token: q.token, amount: q.amount, rank: q.rank })));
        setAnalysisData(response)
      } else {
        setError(response.error || 'Failed to get analysis')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to get analysis')
    } finally {
      setAnalysisLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#4169E1', marginBottom: '20px' }}>Connect Wallet</h2>
        <p style={{ marginBottom: '20px' }}>Please connect your wallet to start analyzing swap options</p>
        <ConnectButton />
      </div>
    )
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#4169E1', fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
          📊 CipherSwap Analysis
        </h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Analyze the best swap offers
        </p>
      </div>

      {/* Input Section */}
      <div style={{ 
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '25px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#4169E1', fontWeight: 'bold' }}>
          ⚙️ Analysis Parameters
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Amount (ETH)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.01"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Slippage (%)
            </label>
            <input
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(parseFloat(e.target.value))}
              step="0.1"
              min="0.1"
              max="10"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '16px'
              }}
            />
          </div>
        </div>

        <button 
          onClick={getAnalysis}
          disabled={analysisLoading || !amount}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: '#4169E1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: analysisLoading ? 'not-allowed' : 'pointer',
            opacity: analysisLoading ? 0.6 : 1
          }}
        >
          {analysisLoading ? '🔄 Analyzing...' : '📊 Analyze'}
        </button>

        {error && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            borderRadius: '8px', 
            marginTop: '15px' 
          }}>
            ❌ Error: {error}
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysisData && analysisData.data && (
        <div style={{ 
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#4169E1', fontWeight: 'bold' }}>
            📊 Quote Analysis (for {amount} ETH)
          </h3>

          {/* Best Option */}
          {analysisData.data.recommendations.length > 0 && (
            <div style={{ 
              backgroundColor: '#d4edda',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px',
              border: '2px solid #28a745'
            }}>
              <h4 style={{ marginBottom: '10px', color: '#155724', fontWeight: 'bold' }}>
                🥇 Best Option
              </h4>
              {analysisData.data.recommendations.map((rec, index) => (
                <div key={index} style={{ fontSize: '16px', color: '#155724' }}>
                  {rec.type === 'BEST_VALUE' && `💎 ${rec.token} - Best net value`}
                  {rec.type === 'GASLESS' && `⚡ ${rec.strategy} - Gasless transaction`}
                  {rec.type === 'MOST_SECURE' && `🛡️ ${rec.strategy} - Most secure`}
                  {rec.type === 'LOWEST_SLIPPAGE' && `📉 ${rec.token} - Lowest slippage`}
                  {rec.savings && (
                    <div style={{ fontSize: '14px', marginTop: '5px', color: '#28a745' }}>
                      💰 {rec.savings}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Token Comparison */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '15px', color: '#333', fontSize: '18px' }}>
              🪙 Token Comparison
            </h4>
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              padding: '20px',
              border: '1px solid #ddd'
            }}>
              {analysisData.data.tokenQuotes.length > 0 ? (
                analysisData.data.tokenQuotes.map((tokenQuote, index) => (
                  <div key={tokenQuote.token} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: index < analysisData.data!.tokenQuotes.length - 1 ? '1px solid #eee' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ 
                        fontSize: '20px', 
                        marginRight: '10px',
                        color: tokenQuote.rank === 1 ? '#28a745' : '#666'
                      }}>
                        {tokenQuote.rank === 1 ? '🥇' : tokenQuote.rank === 2 ? '🥈' : tokenQuote.rank === 3 ? '🥉' : `${tokenQuote.rank}.`}
                      </span>
                      <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
                        {tokenQuote.token}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: tokenQuote.rank === 1 ? '#28a745' : '#333' }}>
                        {formatTokenAmount(tokenQuote.amount, tokenQuote.token)}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        {tokenQuote.slippage}% slippage • {formatGasAmount(tokenQuote.estimatedGas)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#28a745', marginTop: '2px' }}>
                        Net: {formatNetValue(tokenQuote.netValue, tokenQuote.token)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  Loading token comparison...
                </div>
              )}
            </div>
          </div>

          {/* Strategy Comparison */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '15px', color: '#333', fontSize: '18px' }}>
              ⚡ Strategy Comparison
            </h4>
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              padding: '20px',
              border: '1px solid #ddd'
            }}>
              {analysisData.data.strategyQuotes.map((strategyQuote, index) => (
                <div key={strategyQuote.strategy} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: index < analysisData.data!.strategyQuotes.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                      {strategyQuote.strategy}
                      {strategyQuote.gasCost === '0.000' && ' ⭐'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {strategyQuote.description}
                    </div>
                  </div>
                                     <div style={{ textAlign: 'right' }}>
                     <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                       {formatNetValue(strategyQuote.netValue, 'tokens')}
                     </div>
                     <div style={{ fontSize: '14px', color: '#666' }}>
                       {strategyQuote.gasCost === '0.000' ? '⚡ Gasless' : formatGasAmount(strategyQuote.gasCost)} • {strategyQuote.security} security
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div style={{ 
            backgroundColor: '#e7f3ff',
            borderRadius: '8px',
            padding: '20px',
            border: '1px solid #4169E1'
          }}>
            <h4 style={{ marginBottom: '15px', color: '#4169E1', fontSize: '18px' }}>
              📋 Summary
            </h4>
            <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
              <div>• <strong>Best token:</strong> {analysisData.data.tokenQuotes[0]?.token}</div>
              <div>• <strong>Best strategy:</strong> {analysisData.data.strategyQuotes[0]?.strategy}</div>
              <div>• <strong>Net value:</strong> {formatNetValue(analysisData.data.strategyQuotes[0]?.netValue || '0', analysisData.data.tokenQuotes[0]?.token || 'ETH')}</div>
              <div>• <strong>Gas cost:</strong> {analysisData.data.strategyQuotes[0]?.gasCost === '0.000' ? '⚡ Gasless (0 ETH)' : formatGasAmount(analysisData.data.strategyQuotes[0]?.gasCost || '0')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Limit Order Section */}
      {isConnected && (
        <div style={{ 
          marginTop: '40px'
        }}>
          <LimitOrderForm />
        </div>
      )}
    </div>
  )
} 