// ============================================
// TRANSACTION TYPES
// ============================================

export type TransactionSource = 'lightning' | 'onchain' | 'manual';

export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'refunded';

export interface TransactionRecord {
  id: string;
  paymentHash: string;
  bolt11Invoice?: string;
  
  // Amounts
  amountSats: number;
  amountBTC: number;
  amountMXN?: number;
  amountUSD?: number;
  
  // Price reference
  btcPriceMXN?: number;
  btcPriceUSD?: number;
  priceSource?: string;
  
  // Metadata
  timestamp: Date;
  source: TransactionSource;
  memo?: string;
  sessionId?: string;
  ipHash?: string;
  userAgent?: string;
  country?: string;
  
  // Status
  status: TransactionStatus;
  
  // Settlement
  walletId?: string;
  settlementDate?: Date;
  settlementTx?: string;
}

// ============================================
// REPORT TYPES
// ============================================

export type ReportType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom';

export interface FiscalReportData {
  reportType: ReportType;
  period: string;
  
  // Totals
  totalSats: number;
  totalBTC: number;
  totalMXN: number;
  totalUSD: number;
  
  // Stats
  transactionCount: number;
  averageTransactionSats: number;
  largestTransactionSats: number;
  smallestTransactionSats: number;
  
  // Period comparison
  previousPeriodChange?: number;
  previousPeriodChangePercent?: number;
  
  // Breakdown by source
  bySource: {
    lightning: number;
    onchain: number;
    manual: number;
  };
  
  // Breakdown by day (for charts)
  dailyBreakdown: Array<{
    date: string;
    sats: number;
    mxn: number;
    count: number;
  }>;
}

// ============================================
// AUDIT TYPES
// ============================================

export type AuditEventType = 
  | 'transaction_created'
  | 'transaction_status_changed'
  | 'transaction_manual_entry'
  | 'report_generated'
  | 'report_submitted'
  | 'settings_changed'
  | 'admin_login'
  | 'export_generated';

export type AuditEventCategory = 'transaction' | 'report' | 'system' | 'admin' | 'export';

export interface AuditLogEntry {
  id: string;
  transactionId?: string;
  eventType: AuditEventType;
  eventCategory: AuditEventCategory;
  description: string;
  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  actorType: 'system' | 'admin' | 'webhook';
  actorId?: string;
  actorIP?: string;
  timestamp: Date;
}

// ============================================
// COMPLIANCE CONFIG
// ============================================

export interface ComplianceConfig {
  // Umbrales de reporte
  reportingThresholdMXN: number;      // Umbral para reporte individual
  monthlyReportingThresholdMXN: number;
  
  // Jurisdicción
  primaryJurisdiction: 'MX' | 'US' | 'EU' | 'OTHER';
  taxId?: string;                      // RFC en México
  
  // Wallets monitoreadas
  monitoredWallets: string[];
  
  // Auto-reporting
  autoGenerateMonthlyReports: boolean;
  autoGenerateQuarterlyReports: boolean;
  autoGenerateAnnualReports: boolean;
  
  // Retención de datos
  dataRetentionYears: number;          // Años a conservar datos
  
  // Moneda de reporte principal
  primaryReportingCurrency: 'MXN' | 'USD' | 'BTC';
}

// ============================================
// MÉXICO SPECIFIC
// ============================================

export const MEXICO_COMPLIANCE_CONSTANTS = {
  // SAT (Servicio de Administración Tributaria)
  SAT_REPORTING_THRESHOLD_MXN: 50000,  // $50,000 MXN para operaciones relevantes
  
  // Ley FINTech
  FINTCH_REPORTING_THRESHOLD_MXN: 100000, // $100,000 MXN para operaciones inusuales
  
  // CNBV
  CNBV_MONTHLY_REPORT_THRESHOLD_MXN: 500000, // $500,000 MXN mensual
  
  // UDI (Unidad de Inversión) - para inflación
  UDI_REFERENCE: true,
  
  // ISR (Impuesto Sobre la Renta)
  ISR_CRYPTO_TREATMENT: 'activos_digitales', // Categoría fiscal 2024+
  
  // IVA
  IVA_EXEMPT: true, // Cripto no genera IVA en México
  
  // Retención de datos
  DATA_RETENTION_YEARS: 5, // 5 años mínimo
} as const;

// ============================================
// PRICE ORACLE
// ============================================

export interface PriceData {
  btcMXN: number;
  btcUSD: number;
  timestamp: Date;
  source: 'coingecko' | 'binance' | 'bitso' | 'manual';
}

export interface PriceOracleConfig {
  primarySource: 'coingecko' | 'binance' | 'bitso';
  fallbackSources: string[];
  cacheTTLSeconds: number;
}
