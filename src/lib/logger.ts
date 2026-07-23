// Vortiq Structured Logger Harness

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
  message: string;
  context?: Record<string, any>;
  tenantId?: string;
  userId?: string;
}

class Logger {
  private formatLog(level: LogLevel, payload: LogPayload) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message: payload.message,
      tenantId: payload.tenantId || 'global',
      userId: payload.userId || 'system',
      context: payload.context || {},
    };
  }

  info(message: string, context?: Record<string, any>) {
    const entry = this.formatLog('info', { message, context });
    console.log(`[INFO] ${entry.timestamp} | ${entry.message}`, entry.context);
  }

  warn(message: string, context?: Record<string, any>) {
    const entry = this.formatLog('warn', { message, context });
    console.warn(`[WARN] ${entry.timestamp} | ${entry.message}`, entry.context);
  }

  error(message: string, errorObj?: any, context?: Record<string, any>) {
    const entry = this.formatLog('error', {
      message,
      context: { ...context, error: errorObj?.message || errorObj },
    });
    console.error(`[ERROR] ${entry.timestamp} | ${entry.message}`, entry.context);
  }
}

export const logger = new Logger();
