import { logger } from '../utils/logger';
import { 
  RFQRequest, 
  RFQResponse, 
  RFQExecution,
  RFQStatus, 
  RFQResponseStatus,
  ExecutionStatus,
  RFQQuery,
  RFQStats,
  ResolverQuote,
  RFQNotification,
  RFQAnalytics,
  RFQ_CONSTANTS
} from '../types/rfq';
import { OrderbookService } from './orderbookService';
import { PredicateService } from './predicateService';
import { QuoteService } from './quoteService';

export class RFQService {
  private requests: Map<string, RFQRequest> = new Map();
  private responses: Map<string, RFQResponse> = new Map();
  private executions: Map<string, RFQExecution> = new Map();
  private userRequests: Map<string, Set<string>> = new Map(); // userAddress -> Set<requestId>
  private requestResponses: Map<string, Set<string>> = new Map(); // requestId -> Set<responseId>
  
  private orderbookService: OrderbookService;
  private predicateService: PredicateService;
  private quoteService: QuoteService;
  
  constructor() {
    this.orderbookService = new OrderbookService();
    this.predicateService = new PredicateService();
    this.quoteService = new QuoteService();
  }
  
  /**
   * Create a new RFQ request
   */
  async createRequest(params: {
    userAddress: string;
    fromToken: string;
    toToken: string;
    amount: string;
    chainId: number;
    useMEVProtection?: boolean;
    allowedResolvers?: string[];
    maxSlippage?: number;
    predicateId?: string;
    preferredExecutionTime?: number;
    gasOptimization?: boolean;
    partialFill?: boolean;
    metadata?: any;
  }): Promise<{ success: boolean; data?: RFQRequest; error?: string }> {
    try {
      logger.info('Creating RFQ request', { params });
      
      // Validate request
      const validation = this.validateRequestParams(params);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Check user request limits
      const userRequestCount = this.getUserRequestCount(params.userAddress);
      if (userRequestCount >= RFQ_CONSTANTS.MAX_REQUESTS_PER_USER) {
        return {
          success: false,
          error: `Maximum requests per user exceeded (${RFQ_CONSTANTS.MAX_REQUESTS_PER_USER})`
        };
      }
      
      // Create request data
      const requestId = `rfq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const deadline = Date.now() + RFQ_CONSTANTS.REQUEST_EXPIRY_TIME;
      
      const request: RFQRequest = {
        requestId,
        userAddress: params.userAddress,
        fromToken: params.fromToken,
        toToken: params.toToken,
        amount: params.amount,
        chainId: params.chainId,
        deadline,
        timestamp: Date.now(),
        status: RFQStatus.PENDING,
        useMEVProtection: params.useMEVProtection || false,
        allowedResolvers: params.allowedResolvers,
        maxSlippage: params.maxSlippage || RFQ_CONSTANTS.DEFAULT_SLIPPAGE,
        predicateId: params.predicateId,
        preferredExecutionTime: params.preferredExecutionTime,
        gasOptimization: params.gasOptimization,
        partialFill: params.partialFill,
        metadata: params.metadata
      };
      
      // Store request
      this.requests.set(requestId, request);
      
      // Update user requests index
      if (!this.userRequests.has(params.userAddress)) {
        this.userRequests.set(params.userAddress, new Set());
      }
      this.userRequests.get(params.userAddress)!.add(requestId);
      
      // Initialize responses set
      this.requestResponses.set(requestId, new Set());
      
      logger.info('RFQ request created successfully', { 
        requestId,
        userAddress: params.userAddress,
        amount: params.amount,
        chainId: params.chainId
      });
      
      return {
        success: true,
        data: request
      };
      
    } catch (error: any) {
      logger.error('Create RFQ request error', { 
        error: error.message, 
        params 
      });
      
      return {
        success: false,
        error: 'Failed to create RFQ request'
      };
    }
  }
  
  /**
   * Submit a quote response from a resolver
   */
  async submitQuote(params: {
    requestId: string;
    resolverAddress: string;
    resolverName: string;
    fromAmount: string;
    toAmount: string;
    priceImpact: number;
    gasEstimate: string;
    gasPrice: string;
    executionTime: number;
    mevProtectionType: 'flashbots' | 'fusion' | 'none';
    bundleId?: string;
    escrowAddress?: string;
    resolverFee: string;
    protocolFee: string;
    totalCost: string;
    resolverReputation: number;
    averageExecutionTime: number;
    successRate: number;
  }): Promise<{ success: boolean; data?: RFQResponse; error?: string }> {
    try {
      logger.info('Submitting RFQ quote', { params });
      
      // Validate request exists and is active
      const request = this.requests.get(params.requestId);
      if (!request) {
        return {
          success: false,
          error: 'RFQ request not found'
        };
      }
      
      if (request.status !== RFQStatus.PENDING) {
        return {
          success: false,
          error: 'RFQ request is not active'
        };
      }
      
      // Check if request is expired
      if (Date.now() > request.deadline) {
        request.status = RFQStatus.EXPIRED;
        this.requests.set(params.requestId, request);
        return {
          success: false,
          error: 'RFQ request has expired'
        };
      }
      
      // Validate resolver is allowed
      if (request.allowedResolvers && request.allowedResolvers.length > 0) {
        if (!request.allowedResolvers.includes(params.resolverAddress)) {
          return {
            success: false,
            error: 'Resolver not authorized for this request'
          };
        }
      }
      
      // Validate quote parameters
      const validation = this.validateQuoteParams(params);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Create response data
      const responseId = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const validUntil = Date.now() + RFQ_CONSTANTS.QUOTE_VALIDITY_TIME;
      
      const response: RFQResponse = {
        responseId,
        requestId: params.requestId,
        resolverAddress: params.resolverAddress,
        resolverName: params.resolverName,
        fromAmount: params.fromAmount,
        toAmount: params.toAmount,
        priceImpact: params.priceImpact,
        gasEstimate: params.gasEstimate,
        gasPrice: params.gasPrice,
        executionTime: params.executionTime,
        mevProtectionType: params.mevProtectionType,
        bundleId: params.bundleId,
        escrowAddress: params.escrowAddress,
        resolverFee: params.resolverFee,
        protocolFee: params.protocolFee,
        totalCost: params.totalCost,
        validUntil,
        timestamp: Date.now(),
        status: RFQResponseStatus.PENDING,
        resolverReputation: params.resolverReputation,
        averageExecutionTime: params.averageExecutionTime,
        successRate: params.successRate
      };
      
      // Store response
      this.responses.set(responseId, response);
      
      // Update request responses index
      this.requestResponses.get(params.requestId)!.add(responseId);
      
      // Update request status to quoted
      request.status = RFQStatus.QUOTED;
      this.requests.set(params.requestId, request);
      
      logger.info('RFQ quote submitted successfully', { 
        responseId,
        requestId: params.requestId,
        resolverAddress: params.resolverAddress,
        toAmount: params.toAmount
      });
      
      return {
        success: true,
        data: response
      };
      
    } catch (error: any) {
      logger.error('Submit RFQ quote error', { 
        error: error.message, 
        params 
      });
      
      return {
        success: false,
        error: 'Failed to submit RFQ quote'
      };
    }
  }
  
  /**
   * Get quotes for a request
   */
  async getQuotes(requestId: string): Promise<{ success: boolean; data?: ResolverQuote[]; error?: string }> {
    try {
      const request = this.requests.get(requestId);
      if (!request) {
        return {
          success: false,
          error: 'RFQ request not found'
        };
      }
      
      const responseIds = this.requestResponses.get(requestId);
      if (!responseIds || responseIds.size === 0) {
        return {
          success: true,
          data: []
        };
      }
      
      const quotes: ResolverQuote[] = [];
      const now = Date.now();
      
      for (const responseId of responseIds) {
        const response = this.responses.get(responseId);
        if (response && response.validUntil > now && response.status === RFQResponseStatus.PENDING) {
          quotes.push({
            resolverAddress: response.resolverAddress,
            resolverName: response.resolverName,
            quote: response,
            performance: {
              reputation: response.resolverReputation,
              successRate: response.successRate,
              averageExecutionTime: response.averageExecutionTime,
              totalFills: 0 // Would be populated from resolver stats
            }
          });
        }
      }
      
      // Sort by best quote (lowest total cost)
      quotes.sort((a, b) => parseFloat(a.quote.totalCost) - parseFloat(b.quote.totalCost));
      
      return {
        success: true,
        data: quotes
      };
      
    } catch (error: any) {
      logger.error('Get RFQ quotes error', { error: error.message, requestId });
      return {
        success: false,
        error: 'Failed to get RFQ quotes'
      };
    }
  }
  
  /**
   * Accept a quote and execute the swap
   */
  async acceptQuote(responseId: string): Promise<{ success: boolean; data?: RFQExecution; error?: string }> {
    try {
      logger.info('Accepting RFQ quote', { responseId });
      
      const response = this.responses.get(responseId);
      if (!response) {
        return {
          success: false,
          error: 'RFQ response not found'
        };
      }
      
      if (response.status !== RFQResponseStatus.PENDING) {
        return {
          success: false,
          error: 'RFQ response is not available for acceptance'
        };
      }
      
      if (Date.now() > response.validUntil) {
        response.status = RFQResponseStatus.EXPIRED;
        this.responses.set(responseId, response);
        return {
          success: false,
          error: 'RFQ response has expired'
        };
      }
      
      const request = this.requests.get(response.requestId);
      if (!request) {
        return {
          success: false,
          error: 'RFQ request not found'
        };
      }
      
      // Create execution record
      const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const execution: RFQExecution = {
        executionId,
        requestId: response.requestId,
        responseId,
        userAddress: request.userAddress,
        resolverAddress: response.resolverAddress,
        fromToken: request.fromToken,
        toToken: request.toToken,
        fromAmount: response.fromAmount,
        toAmount: response.toAmount,
        txHash: '',
        blockNumber: 0,
        gasUsed: '0',
        gasPrice: response.gasPrice,
        status: ExecutionStatus.PENDING,
        executionTime: 0,
        timestamp: Date.now()
      };
      
      // Store execution
      this.executions.set(executionId, execution);
      
      // Update response status
      response.status = RFQResponseStatus.ACCEPTED;
      this.responses.set(responseId, response);
      
      // Update request status
      request.status = RFQStatus.EXECUTED;
      this.requests.set(response.requestId, request);
      
      logger.info('RFQ quote accepted successfully', { 
        executionId,
        responseId,
        requestId: response.requestId
      });
      
      return {
        success: true,
        data: execution
      };
      
    } catch (error: any) {
      logger.error('Accept RFQ quote error', { 
        error: error.message, 
        responseId 
      });
      
      return {
        success: false,
        error: 'Failed to accept RFQ quote'
      };
    }
  }
  
  /**
   * Update execution status
   */
  async updateExecutionStatus(executionId: string, status: ExecutionStatus, executionData?: {
    txHash?: string;
    blockNumber?: number;
    gasUsed?: string;
    executionTime?: number;
    error?: {
      code: string;
      message: string;
      details?: any;
    };
  }): Promise<{ success: boolean; data?: RFQExecution; error?: string }> {
    try {
      const execution = this.executions.get(executionId);
      if (!execution) {
        return {
          success: false,
          error: 'RFQ execution not found'
        };
      }
      
      execution.status = status;
      
      if (executionData) {
        if (executionData.txHash) execution.txHash = executionData.txHash;
        if (executionData.blockNumber) execution.blockNumber = executionData.blockNumber;
        if (executionData.gasUsed) execution.gasUsed = executionData.gasUsed;
        if (executionData.executionTime) execution.executionTime = executionData.executionTime;
        if (executionData.error) execution.error = executionData.error;
      }
      
      this.executions.set(executionId, execution);
      
      // Update response status
      const response = this.responses.get(execution.responseId);
      if (response) {
        if (status === ExecutionStatus.CONFIRMED) {
          response.status = RFQResponseStatus.EXECUTED;
        } else if (status === ExecutionStatus.FAILED) {
          response.status = RFQResponseStatus.FAILED;
        }
        this.responses.set(execution.responseId, response);
      }
      
      logger.info('RFQ execution status updated', { 
        executionId, 
        status, 
        executionData 
      });
      
      return {
        success: true,
        data: execution
      };
      
    } catch (error: any) {
      logger.error('Update RFQ execution status error', { 
        error: error.message, 
        executionId 
      });
      
      return {
        success: false,
        error: 'Failed to update RFQ execution status'
      };
    }
  }
  
  /**
   * Get RFQ request by ID
   */
  async getRequest(requestId: string): Promise<{ success: boolean; data?: RFQRequest; error?: string }> {
    try {
      const request = this.requests.get(requestId);
      if (!request) {
        return {
          success: false,
          error: 'RFQ request not found'
        };
      }
      
      return {
        success: true,
        data: request
      };
      
    } catch (error: any) {
      logger.error('Get RFQ request error', { error: error.message, requestId });
      return {
        success: false,
        error: 'Failed to get RFQ request'
      };
    }
  }
  
  /**
   * Query RFQ requests with filters
   */
  async queryRequests(query: RFQQuery): Promise<RFQRequest[]> {
    try {
      logger.info('Querying RFQ requests', { query });
      
      let filteredRequests = Array.from(this.requests.values());
      
      // Apply filters
      if (query.userAddress) {
        filteredRequests = filteredRequests.filter(request => request.userAddress === query.userAddress);
      }
      
      if (query.fromToken) {
        filteredRequests = filteredRequests.filter(request => request.fromToken === query.fromToken);
      }
      
      if (query.toToken) {
        filteredRequests = filteredRequests.filter(request => request.toToken === query.toToken);
      }
      
      if (query.chainId) {
        filteredRequests = filteredRequests.filter(request => request.chainId === query.chainId);
      }
      
      if (query.status) {
        filteredRequests = filteredRequests.filter(request => request.status === query.status);
      }
      
      if (query.startTime) {
        filteredRequests = filteredRequests.filter(request => request.timestamp >= query.startTime!);
      }
      
      if (query.endTime) {
        filteredRequests = filteredRequests.filter(request => request.timestamp <= query.endTime!);
      }
      
      // Sort requests
      if (query.sortBy) {
        filteredRequests.sort((a, b) => {
          let aValue: any, bValue: any;
          
          switch (query.sortBy) {
            case 'timestamp':
              aValue = a.timestamp;
              bValue = b.timestamp;
              break;
            case 'amount':
              aValue = parseFloat(a.amount);
              bValue = parseFloat(b.amount);
              break;
            case 'price':
              // Would need to calculate price impact
              aValue = 0;
              bValue = 0;
              break;
            default:
              aValue = a.timestamp;
              bValue = b.timestamp;
          }
          
          if (query.sortOrder === 'desc') {
            return bValue - aValue;
          }
          return aValue - bValue;
        });
      }
      
      // Apply pagination
      const limit = query.limit || 50;
      const page = query.page || 1;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      const paginatedRequests = filteredRequests.slice(startIndex, endIndex);
      
      logger.info('RFQ requests queried successfully', { 
        total: filteredRequests.length,
        returned: paginatedRequests.length,
        page,
        limit
      });
      
      return paginatedRequests;
      
    } catch (error: any) {
      logger.error('Query RFQ requests error', { error: error.message, query });
      return [];
    }
  }
  
  /**
   * Get RFQ statistics
   */
  async getRFQStats(): Promise<RFQStats> {
    try {
      const requests = Array.from(this.requests.values());
      const activeRequests = requests.filter(request => 
        request.status === RFQStatus.PENDING || request.status === RFQStatus.QUOTED
      );
      
      // Calculate total volume
      const totalVolume = requests
        .filter(request => request.status === RFQStatus.EXECUTED)
        .reduce((sum, request) => sum + parseFloat(request.amount), 0)
        .toString();
      
      // Calculate average response time
      const responseTimes: number[] = [];
      for (const request of requests) {
        const responseIds = this.requestResponses.get(request.requestId);
        if (responseIds && responseIds.size > 0) {
          for (const responseId of responseIds) {
            const response = this.responses.get(responseId);
            if (response) {
              responseTimes.push(response.timestamp - request.timestamp);
            }
          }
        }
      }
      
      const averageResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0;
      
      // Calculate success rate
      const executedRequests = requests.filter(request => request.status === RFQStatus.EXECUTED);
      const successRate = requests.length > 0 ? (executedRequests.length / requests.length) * 100 : 0;
      
      // Get most active pairs
      const pairStats = new Map<string, { volume: number; count: number }>();
      requests.forEach(request => {
        const pair = `${request.fromToken}-${request.toToken}`;
        const current = pairStats.get(pair) || { volume: 0, count: 0 };
        current.volume += parseFloat(request.amount);
        current.count += 1;
        pairStats.set(pair, current);
      });
      
      const mostActivePairs = Array.from(pairStats.entries())
        .map(([pair, stats]) => ({
          pair,
          volume: stats.volume.toString(),
          requestCount: stats.count
        }))
        .sort((a, b) => b.requestCount - a.requestCount)
        .slice(0, 5);
      
      // Get resolver stats
      const responses = Array.from(this.responses.values());
      const uniqueResolvers = new Set(responses.map(r => r.resolverAddress));
      const activeResolvers = uniqueResolvers.size;
      const averageReputation = responses.length > 0 
        ? responses.reduce((sum, r) => sum + r.resolverReputation, 0) / responses.length
        : 0;
      
      const stats: RFQStats = {
        totalRequests: requests.length,
        activeRequests: activeRequests.length,
        totalVolume,
        averageResponseTime,
        successRate,
        mostActivePairs,
        resolverStats: {
          total: uniqueResolvers.size,
          active: activeResolvers,
          averageReputation
        }
      };
      
      return stats;
      
    } catch (error: any) {
      logger.error('Get RFQ stats error', { error: error.message });
      return {
        totalRequests: 0,
        activeRequests: 0,
        totalVolume: '0',
        averageResponseTime: 0,
        successRate: 0,
        mostActivePairs: [],
        resolverStats: {
          total: 0,
          active: 0,
          averageReputation: 0
        }
      };
    }
  }
  
  /**
   * Clean up expired requests and responses
   */
  async cleanupExpired(): Promise<void> {
    try {
      const now = Date.now();
      let expiredRequests = 0;
      let expiredResponses = 0;
      
      // Clean up expired requests
      for (const [requestId, request] of this.requests.entries()) {
        if (request.status === RFQStatus.PENDING && now > request.deadline) {
          request.status = RFQStatus.EXPIRED;
          this.requests.set(requestId, request);
          expiredRequests++;
        }
      }
      
      // Clean up expired responses
      for (const [responseId, response] of this.responses.entries()) {
        if (response.status === RFQResponseStatus.PENDING && now > response.validUntil) {
          response.status = RFQResponseStatus.EXPIRED;
          this.responses.set(responseId, response);
          expiredResponses++;
        }
      }
      
      if (expiredRequests > 0 || expiredResponses > 0) {
        logger.info('Cleaned up expired RFQ data', { 
          expiredRequests, 
          expiredResponses 
        });
      }
      
    } catch (error: any) {
      logger.error('Cleanup expired RFQ error', { error: error.message });
    }
  }
  
  // Private helper methods
  
  private validateRequestParams(params: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!params.userAddress) {
      errors.push('userAddress is required');
    }
    
    if (!params.fromToken) {
      errors.push('fromToken is required');
    }
    
    if (!params.toToken) {
      errors.push('toToken is required');
    }
    
    if (!params.amount) {
      errors.push('amount is required');
    }
    
    if (!params.chainId) {
      errors.push('chainId is required');
    }
    
    if (params.amount) {
      const amount = parseFloat(params.amount);
      if (amount < parseFloat(RFQ_CONSTANTS.MIN_AMOUNT)) {
        errors.push(`Amount too small. Minimum: ${RFQ_CONSTANTS.MIN_AMOUNT}`);
      }
      if (amount > parseFloat(RFQ_CONSTANTS.MAX_AMOUNT)) {
        errors.push(`Amount too large. Maximum: ${RFQ_CONSTANTS.MAX_AMOUNT}`);
      }
    }
    
    if (params.allowedResolvers && params.allowedResolvers.length > RFQ_CONSTANTS.MAX_ALLOWED_RESOLVERS) {
      errors.push(`Too many allowed resolvers. Maximum: ${RFQ_CONSTANTS.MAX_ALLOWED_RESOLVERS}`);
    }
    
    if (params.maxSlippage && (params.maxSlippage < 0 || params.maxSlippage > RFQ_CONSTANTS.MAX_SLIPPAGE)) {
      errors.push(`Invalid slippage. Must be between 0 and ${RFQ_CONSTANTS.MAX_SLIPPAGE}%`);
    }
    
    if (params.preferredExecutionTime && (params.preferredExecutionTime < RFQ_CONSTANTS.MIN_RESPONSE_TIME || params.preferredExecutionTime > RFQ_CONSTANTS.MAX_RESPONSE_TIME)) {
      errors.push(`Invalid execution time. Must be between ${RFQ_CONSTANTS.MIN_RESPONSE_TIME} and ${RFQ_CONSTANTS.MAX_RESPONSE_TIME} seconds`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  private validateQuoteParams(params: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!params.requestId) {
      errors.push('requestId is required');
    }
    
    if (!params.resolverAddress) {
      errors.push('resolverAddress is required');
    }
    
    if (!params.resolverName) {
      errors.push('resolverName is required');
    }
    
    if (!params.fromAmount) {
      errors.push('fromAmount is required');
    }
    
    if (!params.toAmount) {
      errors.push('toAmount is required');
    }
    
    if (typeof params.priceImpact !== 'number') {
      errors.push('priceImpact is required and must be a number');
    }
    
    if (!params.gasEstimate) {
      errors.push('gasEstimate is required');
    }
    
    if (!params.gasPrice) {
      errors.push('gasPrice is required');
    }
    
    if (typeof params.executionTime !== 'number') {
      errors.push('executionTime is required and must be a number');
    }
    
    if (!params.mevProtectionType) {
      errors.push('mevProtectionType is required');
    }
    
    if (!params.resolverFee) {
      errors.push('resolverFee is required');
    }
    
    if (!params.protocolFee) {
      errors.push('protocolFee is required');
    }
    
    if (!params.totalCost) {
      errors.push('totalCost is required');
    }
    
    if (typeof params.resolverReputation !== 'number') {
      errors.push('resolverReputation is required and must be a number');
    }
    
    if (typeof params.averageExecutionTime !== 'number') {
      errors.push('averageExecutionTime is required and must be a number');
    }
    
    if (typeof params.successRate !== 'number') {
      errors.push('successRate is required and must be a number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  private getUserRequestCount(userAddress: string): number {
    const userRequestSet = this.userRequests.get(userAddress);
    return userRequestSet ? userRequestSet.size : 0;
  }
} 