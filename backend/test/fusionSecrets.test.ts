import { SwapService } from '../src/services/swapService';
import { 
  FusionSecretRequest, 
  EscrowStatusRequest,
  LimitOrderRequest 
} from '../src/types/swap';

// Mock axios
jest.mock('axios');
const axios = require('axios');

describe('SwapService - Fusion+ Secrets and Escrow', () => {
  let swapService: SwapService;

  beforeEach(() => {
    // Mock environment variables
    process.env.INCH_API_KEY = 'test-api-key';
    swapService = new SwapService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkEscrowStatus', () => {
    it('should check escrow status successfully', async () => {
      // First create a limit order
      const mockQuoteResponse = {
        data: {
          toTokenAmount: '1000000000000000000',
          estimatedGas: '150000',
          route: []
        }
      };

      const mockOrderResponse = {
        data: {
          tx: { hash: '0x123...' },
          nonce: 1,
          signature: '0xabc...'
        }
      };

      axios.get.mockResolvedValueOnce(mockQuoteResponse);
      axios.post.mockResolvedValueOnce(mockOrderResponse);

      const limitOrderRequest: LimitOrderRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C4',
        toToken: '0xB0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C4',
        amount: '1000000000000000000',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890',
        limitPrice: '2000',
        orderType: 'buy'
      };

      const createResult = await swapService.createLimitOrder(limitOrderRequest);
      expect(createResult.success).toBe(true);

      const orderId = createResult.data!.orderId;

      // Mock escrow status response
      const mockEscrowResponse = {
        data: {
          escrowAddress: '0xEscrow123456789012345678901234567890123456',
          isReady: true,
          readyTimestamp: Date.now(),
          expirationTimestamp: Date.now() + 300000,
          depositedAmount: '1000000000000000000',
          requiredAmount: '1000000000000000000',
          status: 'ready'
        }
      };

      axios.get.mockResolvedValueOnce(mockEscrowResponse);

      const escrowRequest: EscrowStatusRequest = {
        orderId,
        userAddress: '0x1234567890123456789012345678901234567890'
      };

      const result = await swapService.checkEscrowStatus(escrowRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.orderId).toBe(orderId);
      expect(result.data?.isReady).toBe(true);
      expect(result.data?.escrowAddress).toBe('0xEscrow123456789012345678901234567890123456');
    });

    it('should return error for unauthorized user', async () => {
      const escrowRequest: EscrowStatusRequest = {
        orderId: 'order_123',
        userAddress: '0xUnauthorizedUser123456789012345678901234567890'
      };

      const result = await swapService.checkEscrowStatus(escrowRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Order not found');
    });
  });

  describe('submitSecret', () => {
    it('should submit secret successfully when escrow is ready', async () => {
      // First create a limit order
      const mockQuoteResponse = {
        data: {
          toTokenAmount: '1000000000000000000',
          estimatedGas: '150000',
          route: []
        }
      };

      const mockOrderResponse = {
        data: {
          tx: { hash: '0x123...' },
          nonce: 1,
          signature: '0xabc...'
        }
      };

      axios.get.mockResolvedValueOnce(mockQuoteResponse);
      axios.post.mockResolvedValueOnce(mockOrderResponse);

      const limitOrderRequest: LimitOrderRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C4',
        toToken: '0xB0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C4',
        amount: '1000000000000000000',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890',
        limitPrice: '2000',
        orderType: 'buy'
      };

      const createResult = await swapService.createLimitOrder(limitOrderRequest);
      const orderId = createResult.data!.orderId;

      // Mock escrow status response (ready)
      const mockEscrowResponse = {
        data: {
          escrowAddress: '0xEscrow123456789012345678901234567890123456',
          isReady: true,
          readyTimestamp: Date.now(),
          expirationTimestamp: Date.now() + 300000,
          depositedAmount: '1000000000000000000',
          requiredAmount: '1000000000000000000',
          status: 'ready'
        }
      };

      // Mock secret submission response
      const mockSecretResponse = {
        data: {
          secretHash: '0xSecretHash123456789012345678901234567890123456',
          submissionTxHash: '0xSubmissionTx123456789012345678901234567890123456'
        }
      };

      axios.get.mockResolvedValueOnce(mockEscrowResponse);
      axios.post.mockResolvedValueOnce(mockSecretResponse);

      const secretRequest: FusionSecretRequest = {
        orderId,
        userAddress: '0x1234567890123456789012345678901234567890',
        secret: '0xSecret1234567890123456789012345678901234567890123456789012345678901234',
        signature: '0xSignature1234567890123456789012345678901234567890123456789012345678901234',
        nonce: 1
      };

      const result = await swapService.submitSecret(secretRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.secretId).toBeDefined();
      expect(result.data?.orderId).toBe(orderId);
      expect(result.data?.status).toBe('pending');
      expect(result.data?.escrowReady).toBe(true);
    });

    it('should return error when escrow is not ready', async () => {
      // First create a limit order
      const mockQuoteResponse = {
        data: {
          toTokenAmount: '1000000000000000000',
          estimatedGas: '150000',
          route: []
        }
      };

      const mockOrderResponse = {
        data: {
          tx: { hash: '0x123...' },
          nonce: 1,
          signature: '0xabc...'
        }
      };

      axios.get.mockResolvedValueOnce(mockQuoteResponse);
      axios.post.mockResolvedValueOnce(mockOrderResponse);

      const limitOrderRequest: LimitOrderRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C4',
        toToken: '0xB0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C4',
        amount: '1000000000000000000',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890',
        limitPrice: '2000',
        orderType: 'buy'
      };

      const createResult = await swapService.createLimitOrder(limitOrderRequest);
      const orderId = createResult.data!.orderId;

      // Mock escrow status response (not ready)
      const mockEscrowResponse = {
        data: {
          escrowAddress: '0xEscrow123456789012345678901234567890123456',
          isReady: false,
          readyTimestamp: null,
          expirationTimestamp: Date.now() + 300000,
          depositedAmount: '0',
          requiredAmount: '1000000000000000000',
          status: 'pending'
        }
      };

      axios.get.mockResolvedValueOnce(mockEscrowResponse);

      const secretRequest: FusionSecretRequest = {
        orderId,
        userAddress: '0x1234567890123456789012345678901234567890',
        secret: '0xSecret1234567890123456789012345678901234567890123456789012345678901234',
        signature: '0xSignature1234567890123456789012345678901234567890123456789012345678901234',
        nonce: 1
      };

      const result = await swapService.submitSecret(secretRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Escrow is not ready for secret submission');
    });

    it('should validate secret request parameters', async () => {
      const invalidSecretRequest: FusionSecretRequest = {
        orderId: '',
        userAddress: '',
        secret: '',
        signature: '',
        nonce: 0
      };

      const result = await swapService.submitSecret(invalidSecretRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('orderId is required');
      expect(result.error).toContain('userAddress is required');
      expect(result.error).toContain('secret is required');
      expect(result.error).toContain('signature is required');
      expect(result.error).toContain('nonce is required');
    });
  });

  describe('waitForEscrowAndSubmitSecret', () => {
    it('should wait for escrow and submit secret successfully', async () => {
      // First create a limit order
      const mockQuoteResponse = {
        data: {
          toTokenAmount: '1000000000000000000',
          estimatedGas: '150000',
          route: []
        }
      };

      const mockOrderResponse = {
        data: {
          tx: { hash: '0x123...' },
          nonce: 1,
          signature: '0xabc...'
        }
      };

      axios.get.mockResolvedValueOnce(mockQuoteResponse);
      axios.post.mockResolvedValueOnce(mockOrderResponse);

      const limitOrderRequest: LimitOrderRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C4',
        toToken: '0xB0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C4',
        amount: '1000000000000000000',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890',
        limitPrice: '2000',
        orderType: 'buy'
      };

      const createResult = await swapService.createLimitOrder(limitOrderRequest);
      const orderId = createResult.data!.orderId;

      // Mock escrow status responses (first not ready, then ready)
      const mockEscrowNotReadyResponse = {
        data: {
          escrowAddress: '0xEscrow123456789012345678901234567890123456',
          isReady: false,
          readyTimestamp: null,
          expirationTimestamp: Date.now() + 300000,
          depositedAmount: '0',
          requiredAmount: '1000000000000000000',
          status: 'pending'
        }
      };

      const mockEscrowReadyResponse = {
        data: {
          escrowAddress: '0xEscrow123456789012345678901234567890123456',
          isReady: true,
          readyTimestamp: Date.now(),
          expirationTimestamp: Date.now() + 300000,
          depositedAmount: '1000000000000000000',
          requiredAmount: '1000000000000000000',
          status: 'ready'
        }
      };

      // Mock secret submission response
      const mockSecretResponse = {
        data: {
          secretHash: '0xSecretHash123456789012345678901234567890123456',
          submissionTxHash: '0xSubmissionTx123456789012345678901234567890123456'
        }
      };

      // Set up mocks for the sequence of calls
      axios.get
        .mockResolvedValueOnce(mockEscrowNotReadyResponse) // First escrow check in waitForEscrowAndSubmitSecret
        .mockResolvedValueOnce(mockEscrowReadyResponse)    // Second escrow check in waitForEscrowAndSubmitSecret
        .mockResolvedValueOnce(mockEscrowReadyResponse);   // Third escrow check in submitSecret (called from waitForEscrowAndSubmitSecret)
      
      axios.post.mockResolvedValueOnce(mockSecretResponse); // Secret submission

      const result = await swapService.waitForEscrowAndSubmitSecret(
        orderId,
        '0x1234567890123456789012345678901234567890',
        '0xSecret1234567890123456789012345678901234567890123456789012345678901234',
        '0xSignature1234567890123456789012345678901234567890123456789012345678901234',
        1,
        10000 // 10 second timeout for testing
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.secretId).toBeDefined();
      expect(result.data?.orderId).toBe(orderId);
    });
  });

  describe('getSecretStatus', () => {
    it('should get secret status successfully', async () => {
      // First submit a secret
      const mockQuoteResponse = {
        data: {
          toTokenAmount: '1000000000000000000',
          estimatedGas: '150000',
          route: []
        }
      };

      const mockOrderResponse = {
        data: {
          tx: { hash: '0x123...' },
          nonce: 1,
          signature: '0xabc...'
        }
      };

      const mockEscrowResponse = {
        data: {
          escrowAddress: '0xEscrow123456789012345678901234567890123456',
          isReady: true,
          readyTimestamp: Date.now(),
          expirationTimestamp: Date.now() + 300000,
          depositedAmount: '1000000000000000000',
          requiredAmount: '1000000000000000000',
          status: 'ready'
        }
      };

      const mockSecretResponse = {
        data: {
          secretHash: '0xSecretHash123456789012345678901234567890123456',
          submissionTxHash: '0xSubmissionTx123456789012345678901234567890123456'
        }
      };

      axios.get.mockResolvedValueOnce(mockQuoteResponse);
      axios.post.mockResolvedValueOnce(mockOrderResponse);
      axios.get.mockResolvedValueOnce(mockEscrowResponse);
      axios.post.mockResolvedValueOnce(mockSecretResponse);

      const limitOrderRequest: LimitOrderRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C4',
        toToken: '0xB0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C4',
        amount: '1000000000000000000',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890',
        limitPrice: '2000',
        orderType: 'buy'
      };

      const createResult = await swapService.createLimitOrder(limitOrderRequest);
      const orderId = createResult.data!.orderId;

      const secretRequest: FusionSecretRequest = {
        orderId,
        userAddress: '0x1234567890123456789012345678901234567890',
        secret: '0xSecret1234567890123456789012345678901234567890123456789012345678901234',
        signature: '0xSignature1234567890123456789012345678901234567890123456789012345678901234',
        nonce: 1
      };

      const submitResult = await swapService.submitSecret(secretRequest);
      expect(submitResult.success).toBe(true);

      const secretId = submitResult.data!.secretId;
      const statusResult = await swapService.getSecretStatus(secretId, '0x1234567890123456789012345678901234567890');

      expect(statusResult.success).toBe(true);
      expect(statusResult.data?.secretId).toBe(secretId);
      expect(statusResult.data?.status).toBe('pending');
    });

    it('should return error for unauthorized user', async () => {
      const result = await swapService.getSecretStatus('secret_123', '0xUnauthorizedUser123456789012345678901234567890');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Secret not found');
    });
  });

  describe('getUserSecrets', () => {
    it('should get user secrets successfully', async () => {
      // Submit multiple secrets for the same user
      const userAddress = '0x1234567890123456789012345678901234567890';
      
      // Mock responses for multiple secret submissions
      const mockQuoteResponse = {
        data: {
          toTokenAmount: '1000000000000000000',
          estimatedGas: '150000',
          route: []
        }
      };

      const mockOrderResponse = {
        data: {
          tx: { hash: '0x123...' },
          nonce: 1,
          signature: '0xabc...'
        }
      };

      const mockEscrowResponse = {
        data: {
          escrowAddress: '0xEscrow123456789012345678901234567890123456',
          isReady: true,
          readyTimestamp: Date.now(),
          expirationTimestamp: Date.now() + 300000,
          depositedAmount: '1000000000000000000',
          requiredAmount: '1000000000000000000',
          status: 'ready'
        }
      };

      const mockSecretResponse = {
        data: {
          secretHash: '0xSecretHash123456789012345678901234567890123456',
          submissionTxHash: '0xSubmissionTx123456789012345678901234567890123456'
        }
      };

      // Mock all API calls
      axios.get.mockResolvedValue(mockQuoteResponse);
      axios.post.mockResolvedValue(mockOrderResponse);
      axios.get.mockResolvedValue(mockEscrowResponse);
      axios.post.mockResolvedValue(mockSecretResponse);

      // Create and submit multiple secrets
      for (let i = 0; i < 3; i++) {
        const limitOrderRequest: LimitOrderRequest = {
          fromToken: '0xA0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C4',
          toToken: '0xB0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C4',
          amount: '1000000000000000000',
          chainId: 1,
          userAddress,
          limitPrice: '2000',
          orderType: 'buy'
        };

        const createResult = await swapService.createLimitOrder(limitOrderRequest);
        const orderId = createResult.data!.orderId;

        const secretRequest: FusionSecretRequest = {
          orderId,
          userAddress,
          secret: `0xSecret${i}1234567890123456789012345678901234567890123456789012345678901234`,
          signature: `0xSignature${i}1234567890123456789012345678901234567890123456789012345678901234`,
          nonce: i + 1
        };

        await swapService.submitSecret(secretRequest);
      }

      const userSecrets = await swapService.getUserSecrets(userAddress, 10, 1);

      expect(userSecrets.length).toBeGreaterThan(0);
      expect(userSecrets.every(secret => secret.userAddress === userAddress)).toBe(true);
    });
  });
}); 