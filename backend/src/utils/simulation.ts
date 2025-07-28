// Simulation utilities for slippage and gain calculations

export interface SimulationParams {
  fromToken: string;
  toToken: string;
  amount: string;
  slippage?: number;
  marketPrice?: number;
}

export interface SimulationResult {
  estimatedSlippage: number;
  priceImpact: number;
  estimatedGains: number;
  gasEstimate: string;
  route: any[];
}

export class SimulationUtils {
  /**
   * Calculate slippage based on quote and market price
   */
  static calculateSlippage(quote: any, marketPrice: number): number {
    if (!quote || !marketPrice) return 0;
    
    const quotePrice = parseFloat(quote.toTokenAmount) / parseFloat(quote.fromTokenAmount);
    const slippage = ((marketPrice - quotePrice) / marketPrice) * 100;
    
    return Math.max(0, slippage); // Slippage cannot be negative
  }
  
  /**
   * Calculate price impact based on trade size and market cap
   */
  static calculatePriceImpact(quote: any, marketCap: number): number {
    if (!quote || !marketCap) return 0;
    
    const tradeValue = parseFloat(quote.fromTokenAmount) * parseFloat(quote.fromTokenPrice || '0');
    const priceImpact = (tradeValue / marketCap) * 100;
    
    return Math.min(priceImpact, 100); // Cap at 100%
  }
  
  /**
   * Estimate gas cost for the route
   */
  static estimateGasCost(route: any[]): string {
    if (!route || route.length === 0) return '0';
    
    let totalGas = 0;
    for (const step of route) {
      totalGas += parseInt(step.estimatedGas || '0');
    }
    
    return totalGas.toString();
  }
  
  /**
   * Calculate estimated gains based on trade parameters
   */
  static calculateEstimatedGains(quote: any, userBalance: number): number {
    if (!quote || !userBalance) return 0;
    
    const tradeValue = parseFloat(quote.fromTokenAmount) * parseFloat(quote.fromTokenPrice || '0');
    const potentialGain = tradeValue * 0.002; // %0.2 example gain
    
    return Math.min(potentialGain, userBalance * 0.1); // Cap at 10% of balance
  }
  
  /**
   * Simulate complete swap transaction
   */
  static simulateSwap(params: SimulationParams, quote: any): SimulationResult {
    const marketPrice = params.marketPrice || parseFloat(quote.toTokenAmount) / parseFloat(quote.fromTokenAmount);
    
    const estimatedSlippage = this.calculateSlippage(quote, marketPrice);
    const priceImpact = this.calculatePriceImpact(quote, 1000000000); // Example market cap
    const estimatedGains = this.calculateEstimatedGains(quote, 10000); // Example balance
    const gasEstimate = this.estimateGasCost(quote.route || []);
    
    return {
      estimatedSlippage,
      priceImpact,
      estimatedGains,
      gasEstimate,
      route: quote.route || []
    };
  }
  
  /**
   * Validate if slippage is within acceptable range
   */
  static validateSlippage(slippage: number, maxSlippage: number = 5): boolean {
    return slippage <= maxSlippage;
  }
  
  /**
   * Calculate optimal route for minimum slippage
   */
  static calculateOptimalRoute(quotes: any[]): any {
    if (!quotes || quotes.length === 0) return null;
    
    // Find quote with lowest slippage
    let bestQuote = quotes[0];
    let lowestSlippage = this.calculateSlippage(quotes[0], parseFloat(quotes[0].toTokenAmount) / parseFloat(quotes[0].fromTokenAmount));
    
    for (const quote of quotes) {
      const slippage = this.calculateSlippage(quote, parseFloat(quote.toTokenAmount) / parseFloat(quote.fromTokenAmount));
      if (slippage < lowestSlippage) {
        lowestSlippage = slippage;
        bestQuote = quote;
      }
    }
    
    return bestQuote;
  }
}

export default SimulationUtils; 