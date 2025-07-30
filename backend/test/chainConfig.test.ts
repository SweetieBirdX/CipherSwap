import { ChainConfigUtils, NETWORKS, TESTNETS } from '../src/utils/chainConfig';

describe('ChainConfigUtils', () => {
  describe('getChainConfig', () => {
    it('should return Ethereum mainnet config for chainId 1', () => {
      const config = ChainConfigUtils.getChainConfig(1);
      expect(config).toBeDefined();
      expect(config?.name).toBe('Ethereum Mainnet');
      expect(config?.chainId).toBe(1);
    });

    it('should return Arbitrum config for chainId 42161', () => {
      const config = ChainConfigUtils.getChainConfig(42161);
      expect(config).toBeDefined();
      expect(config?.name).toBe('Arbitrum One');
      expect(config?.features.supportsL2).toBe(true);
    });

    it('should return null for invalid chainId', () => {
      const config = ChainConfigUtils.getChainConfig(999999);
      expect(config).toBeNull();
    });
  });

  describe('supportsFusion', () => {
    it('should return true for Ethereum mainnet', () => {
      expect(ChainConfigUtils.supportsFusion(1)).toBe(true);
    });

    it('should return true for Arbitrum', () => {
      expect(ChainConfigUtils.supportsFusion(42161)).toBe(true);
    });

    it('should return false for zkSync', () => {
      expect(ChainConfigUtils.supportsFusion(324)).toBe(false);
    });
  });

  describe('isL2', () => {
    it('should return false for Ethereum mainnet', () => {
      expect(ChainConfigUtils.isL2(1)).toBe(false);
    });

    it('should return true for Arbitrum', () => {
      expect(ChainConfigUtils.isL2(42161)).toBe(true);
    });

    it('should return true for Base', () => {
      expect(ChainConfigUtils.isL2(8453)).toBe(true);
    });
  });

  describe('getGasSettings', () => {
    it('should return gas settings for Ethereum', () => {
      const gasSettings = ChainConfigUtils.getGasSettings(1);
      expect(gasSettings.maxFeePerGas).toBe('50');
      expect(gasSettings.maxPriorityFeePerGas).toBe('2');
      expect(gasSettings.gasLimit).toBe(500000);
    });

    it('should return default gas settings for invalid chain', () => {
      const gasSettings = ChainConfigUtils.getGasSettings(999999);
      expect(gasSettings.maxFeePerGas).toBe('50');
      expect(gasSettings.maxPriorityFeePerGas).toBe('2');
      expect(gasSettings.gasLimit).toBe(500000);
    });
  });

  describe('getNetworkName', () => {
    it('should return correct network name', () => {
      expect(ChainConfigUtils.getNetworkName(1)).toBe('Ethereum Mainnet');
      expect(ChainConfigUtils.getNetworkName(42161)).toBe('Arbitrum One');
      expect(ChainConfigUtils.getNetworkName(8453)).toBe('Base');
    });

    it('should return Unknown Network for invalid chainId', () => {
      expect(ChainConfigUtils.getNetworkName(999999)).toBe('Unknown Network');
    });
  });

  describe('isValidChainId', () => {
    it('should return true for valid chain IDs', () => {
      expect(ChainConfigUtils.isValidChainId(1)).toBe(true);
      expect(ChainConfigUtils.isValidChainId(42161)).toBe(true);
      expect(ChainConfigUtils.isValidChainId(5)).toBe(true); // Goerli testnet
    });

    it('should return false for invalid chain IDs', () => {
      expect(ChainConfigUtils.isValidChainId(999999)).toBe(false);
    });
  });

  describe('getAllNetworks', () => {
    it('should return all networks including mainnets and testnets', () => {
      const allNetworks = ChainConfigUtils.getAllNetworks();
      expect(allNetworks.length).toBeGreaterThan(0);
      
      const mainnetCount = Object.keys(NETWORKS).length;
      const testnetCount = Object.keys(TESTNETS).length;
      expect(allNetworks.length).toBe(mainnetCount + testnetCount);
    });
  });

  describe('getMainnetNetworks', () => {
    it('should return only mainnet networks', () => {
      const mainnetNetworks = ChainConfigUtils.getMainnetNetworks();
      expect(mainnetNetworks.length).toBe(Object.keys(NETWORKS).length);
      
      // Check that all returned networks are mainnets
      mainnetNetworks.forEach(network => {
        expect(NETWORKS[network.chainId]).toBeDefined();
      });
    });
  });

  describe('getTestnetNetworks', () => {
    it('should return only testnet networks', () => {
      const testnetNetworks = ChainConfigUtils.getTestnetNetworks();
      expect(testnetNetworks.length).toBe(Object.keys(TESTNETS).length);
      
      // Check that all returned networks are testnets
      testnetNetworks.forEach(network => {
        expect(TESTNETS[network.chainId]).toBeDefined();
      });
    });
  });
}); 