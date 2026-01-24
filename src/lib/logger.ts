/**
 * Application logger using tslog
 *
 * Log levels (minLevel):
 * 0 = silly, 1 = trace, 2 = debug, 3 = info, 4 = warn, 5 = error, 6 = fatal
 */

import { Logger, ILogObj } from 'tslog';

// Parse LOG_LEVEL environment variable
function getMinLevel(): number {
  const level = process.env.LOG_LEVEL?.toLowerCase();

  switch (level) {
    case 'silly': return 0;
    case 'trace': return 1;
    case 'debug': return 2;
    case 'info': return 3;
    case 'warn': return 4;
    case 'error': return 5;
    case 'fatal': return 6;
    default:
      // Default: debug in development, info in production
      return process.env.NODE_ENV === 'production' ? 3 : 2;
  }
}

/**
 * Server-side logger for Node.js environment
 */
export const logger = new Logger<ILogObj>({
  name: 'scrumpoker',
  minLevel: getMinLevel(),
  prettyLogTemplate: '{{yyyy}}-{{mm}}-{{dd}} {{hh}}:{{MM}}:{{ss}} {{logLevelName}}\t',
  prettyLogTimeZone: 'local',
  stylePrettyLogs: process.env.NODE_ENV !== 'production',
});

/**
 * Client-side logger for browser environment
 * Uses simpler output format suitable for browser console
 */
export const clientLogger = new Logger<ILogObj>({
  name: 'scrumpoker-client',
  minLevel: process.env.NODE_ENV === 'production' ? 3 : 2,
  type: 'pretty',
  prettyLogTemplate: '{{logLevelName}}\t[{{name}}]\t',
  stylePrettyLogs: true,
});

/**
 * Create a child logger with a specific context name
 */
export function createLogger(name: string): Logger<ILogObj> {
  return logger.getSubLogger({ name });
}

/**
 * Create a client child logger with a specific context name
 */
export function createClientLogger(name: string): Logger<ILogObj> {
  return clientLogger.getSubLogger({ name });
}
