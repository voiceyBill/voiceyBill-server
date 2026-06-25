/**
 * Lightweight span timer for instrumenting hot paths inside controllers and
 * services — DB queries, external API calls (speech-to-text, AI, exchange
 * rates), file I/O, and expensive computation.
 *
 * Usage:
 *   const t = timer("db:findTransactions");
 *   const rows = await TransactionModel.find(filter).lean();
 *   t.end({ count: rows.length });   // → [TIMER] db:findTransactions → 12.34ms { count: 20 }
 *
 * SECURITY: only pass non-sensitive metadata to `end()` — never request
 * bodies, tokens, or user PII.
 */
export function timer(label: string) {
  const start = process.hrtime.bigint();
  return {
    end(meta: Record<string, unknown> = {}): number {
      const ms = Number(process.hrtime.bigint() - start) / 1_000_000;
      console.log(`[TIMER] ${label} → ${ms.toFixed(2)}ms`, meta);
      return ms;
    },
  };
}

export default timer;
