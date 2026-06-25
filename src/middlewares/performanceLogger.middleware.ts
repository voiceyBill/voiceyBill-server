import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

/**
 * Global response-time instrumentation for every request.
 *
 * SLA thresholds (Voiceybill perf audit):
 *   | duration     | level    | action                                  |
 *   | ------------ | -------- | --------------------------------------- |
 *   | < 200 ms     | OK       | no action                               |
 *   | 200–500 ms   | WARN     | investigate; consider caching           |
 *   | 500–2000 ms  | SLOW     | must fix before next release            |
 *   | > 2000 ms    | CRITICAL | fix immediately; add to tech-debt board |
 *
 * Deployment note: this API runs on Vercel serverless, so these lines land in
 * the Vercel function logs (filter by `[PERF` to find slow routes). Register
 * this as the FIRST middleware so it measures the full request, including the
 * per-request `ensureDatabaseConnection` wait on cold starts.
 *
 * SECURITY: only method, URL, status and duration are logged — never request
 * bodies, headers, tokens, cookies or audio payloads.
 */
export function performanceLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const requestId = randomUUID();
  const startHrTime = process.hrtime.bigint();

  (req as Request & { requestId?: string }).requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  // Set X-Response-Time before the body is flushed — headers can't be set in
  // the 'finish' event (they're already sent by then).
  const originalEnd = res.end.bind(res);
  res.end = function patchedEnd(...args: unknown[]) {
    if (!res.headersSent) {
      const ms = Number(process.hrtime.bigint() - startHrTime) / 1_000_000;
      res.setHeader("X-Response-Time", `${ms.toFixed(2)}ms`);
    }
    return (originalEnd as (...a: unknown[]) => Response)(...args);
  } as typeof res.end;

  res.on("finish", () => {
    const durationMs =
      Number(process.hrtime.bigint() - startHrTime) / 1_000_000;

    const level =
      durationMs > 2000
        ? "CRITICAL"
        : durationMs > 500
          ? "SLOW"
          : durationMs > 200
            ? "WARN"
            : "OK";

    const logLine = {
      timestamp: new Date().toISOString(),
      requestId,
      method: req.method,
      route: req.originalUrl,
      status: res.statusCode,
      durationMs: parseFloat(durationMs.toFixed(2)),
      level,
    };

    if (level === "OK") {
      console.log("[PERF]", JSON.stringify(logLine));
    } else {
      console.warn(`[PERF:${level}]`, JSON.stringify(logLine));
    }
  });

  next();
}

export default performanceLogger;
