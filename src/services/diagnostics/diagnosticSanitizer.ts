/**
 * Diagnostic Sanitizer
 * Strips secrets, API keys, passwords, bearer tokens, cookies, and sensitive environment variables
 * from diagnostic logs, error messages, and reports before sending to frontend or logging.
 */

const SECRET_PATTERNS = [
  /api[_-]?key["']?\s*[:=]\s*["']?([a-zA-Z0-9_\-]{8,})/gi,
  /secret["']?\s*[:=]\s*["']?([a-zA-Z0-9_\-]{8,})/gi,
  /bearer\s+([a-zA-Z0-9_\-\.]{10,})/gi,
  /token["']?\s*[:=]\s*["']?([a-zA-Z0-9_\-]{8,})/gi,
  /password["']?\s*[:=]\s*["']?([^\s"'&]+)/gi,
  /x2shows_session=([a-zA-Z0-9_\-\.]+)/gi,
  /(AIzaSy[a-zA-Z0-9_\-]{33})/g, // Firebase / Google API key pattern
  /eyJ[a-zA-Z0-9_\-]{10,}\.[a-zA-Z0-9_\-]{10,}\.[a-zA-Z0-9_\-]{10,}/g, // JWT pattern
];

const SECRET_KEY_NAMES = new Set([
  'SESSION_SECRET',
  'SITE_PASSWORD',
  'BASIC_AUTH_PASSWORD',
  'GEMINI_API_KEY',
  'TMDB_API_KEY',
  'TMDB_ACCESS_TOKEN',
  'TMDB_TOKEN',
  'FIREBASE_API_KEY',
  'authorization',
  'cookie',
  'set-cookie',
  'x2shows_session',
  'password',
  'secret',
]);

export class DiagnosticSanitizer {
  /**
   * Sanitizes a string text by masking matched secret tokens
   */
  public static sanitizeString(text: string): string {
    if (!text || typeof text !== 'string') return text;

    let sanitized = text;
    for (const pattern of SECRET_PATTERNS) {
      sanitized = sanitized.replace(pattern, (match, captured) => {
        if (captured) {
          return match.replace(captured, '[REDACTED_SECRET]');
        }
        return '[REDACTED_SECRET]';
      });
    }

    // Mask active process secrets if present in text
    if (process.env.SESSION_SECRET) {
      sanitized = sanitized.split(process.env.SESSION_SECRET).join('[REDACTED_SESSION_SECRET]');
    }
    if (process.env.SITE_PASSWORD) {
      sanitized = sanitized.split(process.env.SITE_PASSWORD).join('[REDACTED_SITE_PASSWORD]');
    }
    if (process.env.GEMINI_API_KEY) {
      sanitized = sanitized.split(process.env.GEMINI_API_KEY).join('[REDACTED_GEMINI_KEY]');
    }
    if (process.env.TMDB_API_KEY) {
      sanitized = sanitized.split(process.env.TMDB_API_KEY).join('[REDACTED_TMDB_KEY]');
    }

    return sanitized;
  }

  /**
   * Recursively sanitizes objects or arrays
   */
  public static sanitizeObject<T>(obj: T): T {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
      return this.sanitizeString(obj) as unknown as T;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item)) as unknown as T;
    }

    if (typeof obj === 'object') {
      const sanitizedObj: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (SECRET_KEY_NAMES.has(key.toLowerCase()) || SECRET_KEY_NAMES.has(key)) {
          sanitizedObj[key] = value ? '[CONFIGURED_SECRET]' : '[MISSING]';
        } else if (typeof value === 'object' && value !== null) {
          sanitizedObj[key] = this.sanitizeObject(value);
        } else if (typeof value === 'string') {
          sanitizedObj[key] = this.sanitizeString(value);
        } else {
          sanitizedObj[key] = value;
        }
      }
      return sanitizedObj as T;
    }

    return obj;
  }
}
