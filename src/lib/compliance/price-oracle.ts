import type { PriceData, PriceOracleConfig } from '@/types/compliance';

// ============================================
// PRICE ORACLE CONFIGURATION
// ============================================

const DEFAULT_CONFIG: PriceOracleConfig = {
  primarySource: 'coingecko',
  fallbackSources: ['binance', 'bitso'],
  cacheTTLSeconds: 60,
};

let cachedPrice: PriceData | null = null;
let lastFetch: number = 0;

// ============================================
// PRICE FETCHERS
// ============================================

async function fetchCoinGecko(): Promise<PriceData | null> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=mxn,usd',
      { next: { revalidate: 60 } }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      btcMXN: data.bitcoin.mxn,
      btcUSD: data.bitcoin.usd,
      timestamp: new Date(),
      source: 'coingecko',
    };
  } catch (error) {
    console.error('💥 CoinGecko fetch error:', error);
    return null;
  }
}

async function fetchBinance(): Promise<PriceData | null> {
  try {
    // Binance doesn't have BTC/MXN directly, use USDT as proxy
    const [btcUsdt, usdtMxn] = await Promise.all([
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT').then(r => r.json()),
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTMXN').then(r => r.json()),
    ]);
    
    const btcUSD = parseFloat(btcUsdt.price);
    const usdtToMxn = parseFloat(usdtMxn.price);
    const btcMXN = btcUSD * usdtToMxn;
    
    return {
      btcMXN,
      btcUSD,
      timestamp: new Date(),
      source: 'binance',
    };
  } catch (error) {
    console.error('💥 Binance fetch error:', error);
    return null;
  }
}

async function fetchBitso(): Promise<PriceData | null> {
  try {
    // Bitso is a Mexican exchange with BTC/MXN
    const response = await fetch('https://api.bitso.com/v3/ticker/?book=btc_mxn');
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const btcMXN = parseFloat(data.payload.last);
    
    // Get USD price from another source or estimate
    const usdResponse = await fetch('https://api.bitso.com/v3/ticker/?book=usd_mxn');
    const usdData = await usdResponse.json();
    const mxnToUsd = parseFloat(usdData.payload.last);
    const btcUSD = btcMXN / mxnToUsd;
    
    return {
      btcMXN,
      btcUSD,
      timestamp: new Date(),
      source: 'bitso',
    };
  } catch (error) {
    console.error('💥 Bitso fetch error:', error);
    return null;
  }
}

// ============================================
// MAIN ORACLE FUNCTION
// ============================================

/**
 * Obtiene el precio actual de BTC con fallbacks
 */
export async function getBTCPrice(
  config: PriceOracleConfig = DEFAULT_CONFIG
): Promise<PriceData> {
  const now = Date.now();
  
  // Return cached if still valid
  if (cachedPrice && (now - lastFetch) < config.cacheTTLSeconds * 1000) {
    return cachedPrice;
  }
  
  // Try primary source
  let price: PriceData | null = null;
  
  const fetchers: Record<string, () => Promise<PriceData | null>> = {
    coingecko: fetchCoinGecko,
    binance: fetchBinance,
    bitso: fetchBitso,
  };
  
  // Try primary
  price = await fetchers[config.primarySource]?.();
  
  // Try fallbacks
  if (!price) {
    for (const source of config.fallbackSources) {
      price = await fetchers[source]?.();
      if (price) break;
    }
  }
  
  // If all fail, return last known or throw
  if (!price) {
    if (cachedPrice) {
      console.warn('⚠️ All price sources failed, using cached price');
      return cachedPrice;
    }
    throw new Error('Unable to fetch BTC price from any source');
  }
  
  // Update cache
  cachedPrice = price;
  lastFetch = now;
  
  return price;
}

/**
 * Convierte sats a fiat
 */
export async function convertSatsToFiat(
  sats: number
): Promise<{ mxn: number; usd: number; btc: number; price: PriceData }> {
  const price = await getBTCPrice();
  const btc = sats / 100_000_000;
  
  return {
    btc,
    mxn: btc * price.btcMXN,
    usd: btc * price.btcUSD,
    price,
  };
}
