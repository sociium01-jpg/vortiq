// Vortiq Security & Anti-Data-Leak Utility Module

/**
 * Sanitize raw string input to prevent Cross-Site Scripting (XSS) and injection threats.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Strip potential script tags or malicious executable vectors from user inputs.
 */
export function stripScriptTags(html: string): string {
  if (!html) return '';
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

/**
 * Mask PII (Personally Identifiable Information) such as phone numbers, emails, or payment keys for safe logging/display.
 */
export function maskPII(text: string, type: 'email' | 'phone' | 'key' = 'email'): string {
  if (!text) return '';
  if (type === 'email') {
    const parts = text.split('@');
    if (parts.length !== 2) return '***@***.com';
    const name = parts[0];
    const maskedName = name.length > 2 ? `${name.substring(0, 2)}***` : '***';
    return `${maskedName}@${parts[1]}`;
  }
  if (type === 'phone') {
    return text.replace(/(\d{2,4})\d{4,6}(\d{2})/, '$1****$2');
  }
  if (type === 'key') {
    if (text.length <= 8) return '********';
    return `${text.substring(0, 4)}...${text.substring(text.length - 4)}`;
  }
  return '***';
}

/**
 * Validate URL strings to ensure they use safe protocols (prevent javascript: URI XSS injection)
 */
export function isSafeUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url, window.location.origin);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
