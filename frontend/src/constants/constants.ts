// Environment variables and app constants
// This file centralizes all environment variable access and app configuration

// Network configuration
export const NETWORK = import.meta.env.VITE_NETWORK || 'mainnet';
export const IS_TESTNET = NETWORK === 'testnet';
export const IS_DEVELOPMENT = import.meta.env.DEV;  
export const NETWORK_TOKEN = import.meta.env.VITE_NETWORK_TOKEN;

// API Configuration
export const ORBITAL_BACKEND_URL = import.meta.env.VITE_ORBITAL_BACKEND_URL || 'http://localhost:3000/api';
// Legacy - keeping for backward compatibility during migration
export const GENERAL_BACKEND_URL = import.meta.env.VITE_GENERAL_BACKEND_URL || 'http://localhost:8080/api';

// Network-specific constants
export const ALGORAND_NETWORK = IS_TESTNET ? 'testnet' : 'mainnet';

// Debug logging
if (IS_DEVELOPMENT) {
  console.log('App Constants:', {
    NETWORK,
    IS_TESTNET,
    IS_DEVELOPMENT,
    ORBITAL_BACKEND_URL,
    GENERAL_BACKEND_URL,
    ALGORAND_NETWORK
  });
}

// Export all environment variables for easy access
export const ENV = {
  NETWORK,
  IS_TESTNET,
  IS_DEVELOPMENT,
  ORBITAL_BACKEND_URL,
  GENERAL_BACKEND_URL,
  ALGORAND_NETWORK
} as const;
