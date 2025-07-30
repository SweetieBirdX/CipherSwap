import { SimulationUtils } from '../src/utils/simulation';
import { QuoteData } from '../src/types/quote';

describe('SimulationUtils', () => {
  const mockQuoteData: QuoteData = {
    quote: {
      fromTokenAddress: '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8',
      toTokenAddress: '0xB0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8',
      fromTokenAmount: '1000000000000000000', // 1 ETH
      toTokenAmount: '1800000000000000000000', // 1800 USDC
      estimatedGas: '500000'
    },
    estimatedGas: '0.01',
    slippage: 1.5,
    priceImpact: 0.8,
    estimatedGains: 0.002,
    route: [
      {
        fromToken: '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8',
        toToken: '0xB0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8',
        fromTokenAmount: '1000000000000000000',
        toTokenAmount: '1800000000000000000000',
        estimatedGas: '500000',
        protocol: 'Uniswap V3'
      }
    ],
    timestamp: Date.now()
  };

  describe('calculateSlippage', () => {
    it('should calculate slippage correctly', () => {
      const expected = '1800000000000000000000';
      const actual = '1790000000000000000000'; // 1% less
      
      const slippage = SimulationUtils.calculateSlippage(expected, actual);
      
      // Expected: (1800 - 1790) / 1800 * 100 = 0.556%
      expect(slippage).toBeCloseTo(0.556, 2);
    });

    it('should return 0 for zero expected amount', () => {
      const slippage = SimulationUtils.calculateSlippage('0', '1000000000000000000');
      expect(slippage).toBe(0);
    });
  });

  describe('calculatePriceImpact', () => {
    it('should calculate price impact correctly', () => {
      const inputAmount = '1000000000000000000'; // 1 ETH
      const outputAmount = '1800000000000000000000'; // 1800 USDC
      const poolLiquidity = '10000000000000000000000000'; // 10M tokens
      
      const priceImpact = SimulationUtils.calculatePriceImpact(
        inputAmount,
        outputAmount,
        poolLiquidity
      );
      
      expect(priceImpact).toBeGreaterThan(0);
      expect(priceImpact).toBeLessThan(100);
    });

    it('should return 0 for zero liquidity', () => {
      const priceImpact = SimulationUtils.calculatePriceImpact(
        '1000000000000000000',
        '1800000000000000000000',
        '0'
      );
      
      expect(priceImpact).toBe(0);
    });
  });

  describe('calculateGasCost', () => {
    it('should calculate gas cost correctly', () => {
      const gasLimit = '500000';
      const gasPrice = '20000000000'; // 20 gwei
      const chainId = 1;
      
      const gasCost = SimulationUtils.calculateGasCost(gasLimit, gasPrice, chainId);
      
      expect(parseFloat(gasCost)).toBeGreaterThan(0);
    });

    it('should handle invalid gas parameters', () => {
      const gasCost = SimulationUtils.calculateGasCost('invalid', 'invalid', 1);
      expect(gasCost).toBe('0');
    });
  });

  describe('calculateProfitLoss', () => {
    it('should calculate profit/loss correctly', () => {
      const inputAmount = '1000000000000000000'; // 1 ETH
      const outputAmount = '1800000000000000000000'; // 1800 USDC
      const expectedOutput = '1800000000000000000000';
      const gasCost = '0.01';
      const inputTokenPrice = 2000; // ETH = $2000
      const outputTokenPrice = 1; // USDC = $1
      
      const result = SimulationUtils.calculateProfitLoss(
        inputAmount,
        outputAmount,
        expectedOutput,
        gasCost,
        inputTokenPrice,
        outputTokenPrice
      );
      
      expect(result.profitLoss).toBeDefined();
      expect(result.roi).toBeDefined();
      expect(typeof result.isProfitable).toBe('boolean');
    });
  });

  describe('simulateSwap', () => {
    it('should simulate swap with default parameters', () => {
      const simulation = SimulationUtils.simulateSwap(mockQuoteData);
      
      expect(simulation.originalQuote).toBe(mockQuoteData);
      expect(simulation.simulatedQuote).toBeDefined();
      expect(simulation.slippageDifference).toBeDefined();
      expect(simulation.gasDifference).toBeDefined();
      expect(simulation.priceImpactDifference).toBeDefined();
    });

    it('should simulate swap with custom parameters', () => {
      const simulation = SimulationUtils.simulateSwap(mockQuoteData, {
        slippageTolerance: 1.0,
        gasPriceMultiplier: 1.5,
        priceImpactThreshold: 5
      });
      
      expect(simulation.simulatedQuote.slippage).toBeGreaterThan(mockQuoteData.slippage);
    });
  });

  describe('validateSwapSafety', () => {
    it('should validate safe swap', () => {
      const safeQuote = { ...mockQuoteData, slippage: 0.5, priceImpact: 0.1 };
      const result = SimulationUtils.validateSwapSafety(safeQuote);
      
      expect(result.isSafe).toBe(true);
      expect(result.risks).toHaveLength(0);
    });

    it('should detect high slippage risk', () => {
      const riskyQuote = { ...mockQuoteData, slippage: 15, priceImpact: 5 };
      const result = SimulationUtils.validateSwapSafety(riskyQuote);
      
      expect(result.isSafe).toBe(false);
      expect(result.risks.length).toBeGreaterThan(0);
    });

    it('should respect user slippage tolerance', () => {
      const quote = { ...mockQuoteData, slippage: 2.5 };
      const result = SimulationUtils.validateSwapSafety(quote, 2.0);
      
      expect(result.risks.some(risk => risk.includes('exceeds your tolerance'))).toBe(true);
    });
  });

  describe('calculateOptimalTradeSize', () => {
    it('should calculate optimal trade size', () => {
      const poolLiquidity = '10000000000000000000000000'; // 10M tokens
      const currentPrice = 1800;
      const maxSlippage = 1;
      
      const result = SimulationUtils.calculateOptimalTradeSize(
        poolLiquidity,
        currentPrice,
        maxSlippage
      );
      
      expect(result.optimalAmount).toBeDefined();
      expect(result.maxSafeAmount).toBeDefined();
      expect(result.recommendedSplits).toBeGreaterThan(0);
    });
  });

  describe('calculateTWAP', () => {
    it('should calculate TWAP splits', () => {
      const totalAmount = '1000000000000000000000'; // 1000 tokens
      const timeWindow = 3600; // 1 hour
      const numberOfSplits = 10;
      
      const result = SimulationUtils.calculateTWAP(
        totalAmount,
        timeWindow,
        numberOfSplits
      );
      
      expect(result.splitAmount).toBeDefined();
      expect(result.timeInterval).toBe(360); // 3600 / 10
      expect(result.splits).toHaveLength(10);
      expect(result.splits[0].amount).toBe(result.splitAmount);
    });
  });

  describe('compareQuotes', () => {
    it('should compare multiple quotes', () => {
      const quotes = [
        { ...mockQuoteData, slippage: 1.0, estimatedGas: '0.005' },
        { ...mockQuoteData, slippage: 2.0, estimatedGas: '0.003' },
        { ...mockQuoteData, slippage: 0.5, estimatedGas: '0.008' }
      ];
      
      const result = SimulationUtils.compareQuotes(quotes, {
        prioritizeLowSlippage: true,
        maxSlippage: 5,
        maxGasCost: 0.1
      });
      
      expect(result.bestQuote).toBeDefined();
      expect(result.ranking).toHaveLength(3);
      expect(result.ranking[0].score).toBeGreaterThan(result.ranking[1].score);
    });
  });

  describe('generateSimulationReport', () => {
    it('should generate simulation report', () => {
      const simulation = SimulationUtils.simulateSwap(mockQuoteData);
      const userPreferences = {
        maxSlippage: 5,
        maxGasCost: 0.1,
        priority: 'slippage' as const
      };
      
      const report = SimulationUtils.generateSimulationReport(simulation, userPreferences);
      
      expect(report.summary.isRecommended).toBeDefined();
      expect(report.summary.riskLevel).toBeDefined();
      expect(report.details.slippageAnalysis).toBeDefined();
      expect(report.details.gasAnalysis).toBeDefined();
      expect(report.details.recommendations).toBeInstanceOf(Array);
    });
  });
}); 