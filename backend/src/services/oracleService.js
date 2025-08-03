"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.oracleService = exports.OracleService = void 0;
var ethers_1 = require("ethers");
var logger_1 = require("../utils/logger");
var chainConfig_1 = require("../utils/chainConfig");
// Chainlink Price Feed ABI (simplified for latestRoundData)
var PRICE_FEED_ABI = [
    {
        "inputs": [],
        "name": "latestRoundData",
        "outputs": [
            {
                "internalType": "uint80",
                "name": "roundId",
                "type": "uint80"
            },
            {
                "internalType": "int256",
                "name": "answer",
                "type": "int256"
            },
            {
                "internalType": "uint256",
                "name": "startedAt",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "updatedAt",
                "type": "uint256"
            },
            {
                "internalType": "uint80",
                "name": "answeredInRound",
                "type": "uint80"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
// Chainlink Price Feed addresses for different networks
var PRICE_FEEDS = {
    // Ethereum Mainnet
    1: {
        'ETH/USD': '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
        'BTC/USD': '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
        'USDC/USD': '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
        'DAI/USD': '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee5',
        'LINK/USD': '0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c',
        'UNI/USD': '0x553303d460EE0afB37EdFf9bE42922D8FF732f70',
        'AAVE/USD': '0x547a514d5e3769680Ce22B2361c10Ea13619e8a9',
        'MATIC/USD': '0x7bAC85A8a13A4BcD8abb3eB7d6b35d45465Dc063'
    },
    // Sepolia Testnet
    11155111: {
        'ETH/USD': '0x694AA1769357215DE4FAC081bf1f309aDC325306',
        'BTC/USD': '0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43',
        'USDC/USD': '0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E',
        'DAI/USD': '0x14866185B1962B63C3Ea9E03Bc1da838bab34C19',
        'LINK/USD': '0x42585eD362B3f1BCa95c640FdFf35Ef899212734',
        'UNI/USD': '0x0000000000000000000000000000000000000000', // Sepolia'da yok
        'AAVE/USD': '0x0000000000000000000000000000000000000000', // Sepolia'da yok
        'MATIC/USD': '0x0000000000000000000000000000000000000000' // Sepolia'da yok
    },
    // Arbitrum One
    42161: {
        'ETH/USD': '0x639Fe6ab55C921f74e7d1aDdEa6682642eA29a9',
        'BTC/USD': '0x6ce185860a496310F6C54D98eAaa266bC946E1de',
        'USDC/USD': '0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3',
        'DAI/USD': '0xc5C8E77B397E531B8EC06Eb188CcC5E40bBe1A3c'
    },
    // Base
    8453: {
        'ETH/USD': '0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70',
        'USDC/USD': '0x7e860098F58bBFC8648a4311b374B1D669a2bc6B'
    },
    // Polygon
    137: {
        'ETH/USD': '0xF9680D99D6C9589e2a93a78A04A279e509205945',
        'BTC/USD': '0xc907E116054ad103354f2D350FD2514433D57F0f',
        'USDC/USD': '0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7',
        'DAI/USD': '0x4746DeC9e833A82EC7C2C1356372CcF2cfcF2b3D',
        'MATIC/USD': '0xAB594600376Ec9fD91F8e885dADF0CE036862dE0'
    }
};
var OracleService = /** @class */ (function () {
    function OracleService() {
        this.providers = new Map();
        this.priceFeeds = new Map();
        this.initializeProviders();
    }
    /**
     * Initialize providers for all supported networks
     */
    OracleService.prototype.initializeProviders = function () {
        var _this = this;
        var networks = chainConfig_1.ChainConfigUtils.getAllNetworks();
        networks.forEach(function (network) {
            try {
                // Use more reliable RPC URLs for testing
                var rpcUrl = network.rpcUrl;
                // For testing, use public RPC endpoints
                if (process.env.NODE_ENV === 'test') {
                    switch (network.chainId) {
                        case 1: // Ethereum Mainnet
                            rpcUrl = 'https://eth.llamarpc.com';
                            break;
                        case 137: // Polygon
                            rpcUrl = 'https://polygon-rpc.com';
                            break;
                        case 42161: // Arbitrum
                            rpcUrl = 'https://arb1.arbitrum.io/rpc';
                            break;
                        case 8453: // Base
                            rpcUrl = 'https://mainnet.base.org';
                            break;
                        case 324: // zkSync
                            rpcUrl = 'https://mainnet.era.zksync.io';
                            break;
                        default:
                            rpcUrl = network.rpcUrl;
                    }
                }
                var provider = new ethers_1.JsonRpcProvider(rpcUrl);
                _this.providers.set(network.chainId, provider);
                logger_1.logger.info("Provider initialized for ".concat(network.name), { chainId: network.chainId });
            }
            catch (error) {
                logger_1.logger.error("Failed to initialize provider for ".concat(network.name), {
                    chainId: network.chainId,
                    error: error.message
                });
            }
        });
    };
    /**
     * Get price from Chainlink Oracle
     */
    OracleService.prototype.getPrice = function (chainId, pair) {
        return __awaiter(this, void 0, void 0, function () {
            var priceFeedAddress, provider, priceFeed, roundData, decimals, price, networkName, oraclePrice, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        logger_1.logger.info('Getting oracle price', { chainId: chainId, pair: pair });
                        // Validate chain ID
                        if (!chainConfig_1.ChainConfigUtils.isValidChainId(chainId)) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: "Invalid chain ID: ".concat(chainId)
                                }];
                        }
                        priceFeedAddress = this.getPriceFeedAddress(chainId, pair);
                        if (!priceFeedAddress) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: "Price feed not found for ".concat(pair, " on chain ").concat(chainId)
                                }];
                        }
                        provider = this.providers.get(chainId);
                        if (!provider) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: "Provider not available for chain ".concat(chainId)
                                }];
                        }
                        priceFeed = this.getPriceFeedContract(chainId, pair, priceFeedAddress, provider);
                        return [4 /*yield*/, priceFeed.latestRoundData()];
                    case 1:
                        roundData = _a.sent();
                        return [4 /*yield*/, priceFeed.decimals()];
                    case 2:
                        decimals = _a.sent();
                        price = this.calculatePrice(roundData.answer, decimals);
                        networkName = chainConfig_1.ChainConfigUtils.getNetworkName(chainId);
                        oraclePrice = {
                            price: price,
                            decimals: Number(decimals),
                            roundId: Number(roundData.roundId),
                            updatedAt: Number(roundData.updatedAt),
                            network: networkName,
                            pair: pair,
                            oracleAddress: priceFeedAddress,
                            timestamp: Date.now()
                        };
                        logger_1.logger.info('Oracle price retrieved successfully', {
                            chainId: chainId,
                            pair: pair,
                            price: price,
                            network: networkName
                        });
                        return [2 /*return*/, {
                                success: true,
                                data: oraclePrice
                            }];
                    case 3:
                        error_1 = _a.sent();
                        logger_1.logger.error('Oracle service error', {
                            chainId: chainId,
                            pair: pair,
                            error: error_1.message,
                            stack: error_1.stack
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: "Failed to get price: ".concat(error_1.message)
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get multiple prices at once
     */
    OracleService.prototype.getMultiplePrices = function (chainId, pairs) {
        return __awaiter(this, void 0, void 0, function () {
            var promises;
            var _this = this;
            return __generator(this, function (_a) {
                promises = pairs.map(function (pair) { return _this.getPrice(chainId, pair); });
                return [2 /*return*/, Promise.all(promises)];
            });
        });
    };
    /**
     * Get price with tolerance check
     */
    OracleService.prototype.getPriceWithTolerance = function (chainId_1, pair_1, expectedPrice_1) {
        return __awaiter(this, arguments, void 0, function (chainId, pair, expectedPrice, tolerance) {
            var response, actualPrice, priceDifference;
            if (tolerance === void 0) { tolerance = 1.0; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getPrice(chainId, pair)];
                    case 1:
                        response = _a.sent();
                        if (!response.success || !response.data) {
                            return [2 /*return*/, response];
                        }
                        actualPrice = response.data.price;
                        priceDifference = Math.abs((actualPrice - expectedPrice) / expectedPrice) * 100;
                        if (priceDifference > tolerance) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: "Price deviation too high: ".concat(priceDifference.toFixed(2), "% (max: ").concat(tolerance, "%)")
                                }];
                        }
                        return [2 /*return*/, response];
                }
            });
        });
    };
    /**
     * Get available price feeds for a network
     */
    OracleService.prototype.getAvailablePriceFeeds = function (chainId) {
        var feeds = PRICE_FEEDS[chainId];
        return feeds ? Object.keys(feeds) : [];
    };
    /**
     * Get all supported networks with their price feeds
     */
    OracleService.prototype.getAllSupportedNetworks = function () {
        var _this = this;
        var networks = chainConfig_1.ChainConfigUtils.getAllNetworks();
        return networks.map(function (network) { return ({
            chainId: network.chainId,
            name: network.name,
            feeds: _this.getAvailablePriceFeeds(network.chainId)
        }); });
    };
    /**
     * Get all supported networks (for backward compatibility)
     */
    OracleService.prototype.getAllNetworks = function () {
        return this.getAllSupportedNetworks();
    };
    /**
     * Get price feed address for a specific pair and chain
     */
    OracleService.prototype.getPriceFeedAddress = function (chainId, pair) {
        var feeds = PRICE_FEEDS[chainId];
        return (feeds === null || feeds === void 0 ? void 0 : feeds[pair]) || null;
    };
    /**
     * Get or create price feed contract
     */
    OracleService.prototype.getPriceFeedContract = function (chainId, pair, address, provider) {
        var key = "".concat(chainId, "-").concat(pair);
        if (!this.priceFeeds.has(key)) {
            var contract = new ethers_1.Contract(address, PRICE_FEED_ABI, provider);
            this.priceFeeds.set(key, contract);
        }
        return this.priceFeeds.get(key);
    };
    /**
     * Calculate price from raw answer and decimals
     */
    OracleService.prototype.calculatePrice = function (answer, decimals) {
        var answerNumber = Number(answer);
        var decimalsNumber = Number(decimals);
        return answerNumber / Math.pow(10, decimalsNumber);
    };
    /**
     * Validate if a price feed is stale (older than 1 hour)
     */
    OracleService.prototype.isPriceStale = function (updatedAt) {
        var oneHour = 60 * 60; // 1 hour in seconds
        var currentTime = Math.floor(Date.now() / 1000);
        return (currentTime - updatedAt) > oneHour;
    };
    /**
     * Get price feed health status
     */
    OracleService.prototype.getPriceFeedHealth = function (chainId, pair) {
        return __awaiter(this, void 0, void 0, function () {
            var response, isStale, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getPrice(chainId, pair)];
                    case 1:
                        response = _a.sent();
                        if (!response.success || !response.data) {
                            return [2 /*return*/, {
                                    isHealthy: false,
                                    lastUpdate: 0,
                                    isStale: false,
                                    error: response.error
                                }];
                        }
                        isStale = this.isPriceStale(response.data.updatedAt);
                        return [2 /*return*/, {
                                isHealthy: true,
                                lastUpdate: response.data.updatedAt,
                                isStale: isStale
                            }];
                    case 2:
                        error_2 = _a.sent();
                        return [2 /*return*/, {
                                isHealthy: false,
                                lastUpdate: 0,
                                isStale: false,
                                error: error_2.message
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return OracleService;
}());
exports.OracleService = OracleService;
// Export singleton instance
exports.oracleService = new OracleService();
exports.default = exports.oracleService;
