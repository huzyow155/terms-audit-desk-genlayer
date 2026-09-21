export interface UrlValidationResult {
  valid: boolean;
  error?: string;
}

const IP_V4_REGEX = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
const IP_V6_REGEX = /^\[?[a-fA-F0-9:]+\]?$/;

export function validateDocumentUrl(rawUrl: string): UrlValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, error: 'Document URL is required' };
  }

  const url = rawUrl.trim();

  if (url.length > 300) {
    return { valid: false, error: 'URL must not exceed 300 characters' };
  }

  if (/\s/.test(url)) {
    return { valid: false, error: 'URL must not contain whitespace' };
  }

  if (url.includes('@')) {
    return { valid: false, error: 'URL must not contain userinfo (@ symbol)' };
  }

  if (url.includes('#')) {
    return { valid: false, error: 'URL must not contain fragment identifier (#)' };
  }

  if (!url.startsWith('https://')) {
    return { valid: false, error: 'URL must use secure https:// protocol' };
  }

  try {
    const parsed = new URL(url);

    if (parsed.protocol !== 'https:') {
      return { valid: false, error: 'Only https:// protocol is supported' };
    }

    const hostname = parsed.hostname.toLowerCase();

    if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
      return { valid: false, error: 'Localhost addresses are not allowed' };
    }

    if (IP_V4_REGEX.test(hostname) || (hostname.startsWith('[') && hostname.endsWith(']')) || IP_V6_REGEX.test(hostname)) {
      return { valid: false, error: 'Direct IP addresses are not allowed' };
    }

    if (!hostname.includes('.')) {
      return { valid: false, error: 'Invalid hostname: fully qualified domain name required' };
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, error: 'Malformed URL structure' };
  }
}
