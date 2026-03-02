import { prisma } from '@/lib/prisma';
import type { FiscalReportData, ReportType } from '@/types/compliance';

// ============================================
// FISCAL CALCULATIONS
// ============================================

interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Obtiene el rango de fechas para un período
 */
export function getPeriodRange(type: ReportType, reference: Date = new Date()): DateRange {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  
  switch (type) {
    case 'daily':
      return {
        start: new Date(year, month, reference.getDate(), 0, 0, 0),
        end: new Date(year, month, reference.getDate(), 23, 59, 59),
      };
    
    case 'weekly':
      const dayOfWeek = reference.getDay();
      const startOfWeek = new Date(reference);
      startOfWeek.setDate(reference.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      return { start: startOfWeek, end: endOfWeek };
    
    case 'monthly':
      return {
        start: new Date(year, month, 1, 0, 0, 0),
        end: new Date(year, month + 1, 0, 23, 59, 59),
      };
    
    case 'quarterly':
      const quarter = Math.floor(month / 3);
      return {
        start: new Date(year, quarter * 3, 1, 0, 0, 0),
        end: new Date(year, quarter * 3 + 3, 0, 23, 59, 59),
      };
    
    case 'annual':
      return {
        start: new Date(year, 0, 1, 0, 0, 0),
        end: new Date(year, 11, 31, 23, 59, 59),
      };
    
    default:
      throw new Error(`Unknown report type: ${type}`);
  }
}

/**
 * Calcula los datos fiscales para un período
 */
export async function calculateFiscalReport(
  type: ReportType,
  period: string
): Promise<FiscalReportData> {
  // Parse period (e.g., "2024-01", "2024-Q1", "2024")
  const referenceDate = parsePeriodString(period);
  const range = getPeriodRange(type, referenceDate);
  
  // Fetch transactions
  const transactions = await prisma.complianceTransaction.findMany({
    where: {
      timestamp: {
        gte: range.start,
        lte: range.end,
      },
      status: 'confirmed',
    },
    orderBy: {
      timestamp: 'asc',
    },
  });
  
  // Calculate totals
  const totalSats = transactions.reduce((sum, tx) => sum + tx.amountSats, 0);
  const totalBTC = totalSats / 100_000_000;
  
  // MXN and USD totals
  const totalMXN = transactions.reduce((sum, tx) => sum + (Number(tx.amountMXN) || 0), 0);
  const totalUSD = transactions.reduce((sum, tx) => sum + (Number(tx.amountUSD) || 0), 0);
  
  // Stats
  const amounts = transactions.map(tx => tx.amountSats);
  const averageTransactionSats = transactions.length > 0 ? totalSats / transactions.length : 0;
  const largestTransactionSats = Math.max(...amounts, 0);
  const smallestTransactionSats = amounts.length > 0 ? Math.min(...amounts) : 0;
  
  // By source
  const bySource = {
    lightning: transactions.filter(tx => tx.source === 'lightning').reduce((s, t) => s + t.amountSats, 0),
    onchain: transactions.filter(tx => tx.source === 'onchain').reduce((s, t) => s + t.amountSats, 0),
    manual: transactions.filter(tx => tx.source === 'manual').reduce((s, t) => s + t.amountSats, 0),
  };
  
  // Daily breakdown
  const dailyMap = new Map<string, { sats: number; mxn: number; count: number }>();
  
  for (const tx of transactions) {
    const dateKey = tx.timestamp.toISOString().split('T')[0];
    const existing = dailyMap.get(dateKey) || { sats: 0, mxn: 0, count: 0 };
    dailyMap.set(dateKey, {
      sats: existing.sats + tx.amountSats,
      mxn: existing.mxn + (Number(tx.amountMXN) || 0),
      count: existing.count + 1,
    });
  }
  
  const dailyBreakdown = Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  // Previous period comparison
  const previousPeriod = getPreviousPeriod(type, referenceDate);
  const previousRange = getPeriodRange(type, previousPeriod);
  
  const previousTransactions = await prisma.complianceTransaction.findMany({
    where: {
      timestamp: {
        gte: previousRange.start,
        lte: previousRange.end,
      },
      status: 'confirmed',
    },
  });
  
  const previousTotalSats = previousTransactions.reduce((sum, tx) => sum + tx.amountSats, 0);
  const previousPeriodChange = totalSats - previousTotalSats;
  const previousPeriodChangePercent = previousTotalSats > 0 
    ? ((totalSats - previousTotalSats) / previousTotalSats) * 100 
    : undefined;
  
  return {
    reportType: type,
    period,
    totalSats,
    totalBTC,
    totalMXN,
    totalUSD,
    transactionCount: transactions.length,
    averageTransactionSats,
    largestTransactionSats,
    smallestTransactionSats,
    previousPeriodChange,
    previousPeriodChangePercent,
    bySource,
    dailyBreakdown,
  };
}

/**
 * Parse period string to Date
 */
function parsePeriodString(period: string): Date {
  // "2024-01" -> monthly
  if (/^\d{4}-\d{2}$/.test(period)) {
    const [year, month] = period.split('-').map(Number);
    return new Date(year, month - 1, 1);
  }
  
  // "2024-Q1" -> quarterly
  if (/^\d{4}-Q[1-4]$/.test(period)) {
    const [yearPart, quarterPart] = period.split('-');
    const year = Number(yearPart);
    const quarter = Number(quarterPart[1]) - 1;
    return new Date(year, quarter * 3, 1);
  }
  
  // "2024" -> annual
  if (/^\d{4}$/.test(period)) {
    return new Date(Number(period), 0, 1);
  }
  
  // "2024-W05" -> weekly
  if (/^\d{4}-W\d{2}$/.test(period)) {
    const [yearPart, weekPart] = period.split('-W');
    const year = Number(yearPart);
    const week = Number(weekPart);
    const date = new Date(year, 0, 1 + (week - 1) * 7);
    return date;
  }
  
  // Default to current date
  return new Date();
}

/**
 * Get previous period date
 */
function getPreviousPeriod(type: ReportType, reference: Date): Date {
  const result = new Date(reference);
  
  switch (type) {
    case 'daily':
      result.setDate(result.getDate() - 1);
      break;
    case 'weekly':
      result.setDate(result.getDate() - 7);
      break;
    case 'monthly':
      result.setMonth(result.getMonth() - 1);
      break;
    case 'quarterly':
      result.setMonth(result.getMonth() - 3);
      break;
    case 'annual':
      result.setFullYear(result.getFullYear() - 1);
      break;
  }
  
  return result;
}
