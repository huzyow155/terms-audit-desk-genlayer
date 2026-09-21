import { describe, it, expect } from 'vitest';
import { validateDocumentUrl } from '../src/lib/urlValidator';

describe('validateDocumentUrl', () => {
  it('accepts valid https URLs within 300 characters', () => {
    const res = validateDocumentUrl('https://raw.githubusercontent.com/org/repo/main/terms.md');
    expect(res.valid).toBe(true);
    expect(res.error).toBeUndefined();
  });

  it('rejects http URLs', () => {
    const res = validateDocumentUrl('http://example.com/terms.md');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('https://');
  });

  it('rejects URLs containing userinfo @', () => {
    const res = validateDocumentUrl('https://admin:pass@example.com/terms.md');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('@');
  });

  it('rejects URLs containing fragments #', () => {
    const res = validateDocumentUrl('https://example.com/terms.md#section-2');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('#');
  });

  it('rejects URLs with whitespace', () => {
    const res = validateDocumentUrl('https://example.com/terms of service.md');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('whitespace');
  });

  it('rejects localhost and 127.0.0.1 addresses', () => {
    const r1 = validateDocumentUrl('https://localhost:8080/doc.md');
    expect(r1.valid).toBe(false);
    expect(r1.error).toContain('Localhost');

    const r2 = validateDocumentUrl('https://127.0.0.1:8080/doc.md');
    expect(r2.valid).toBe(false);
    expect(r2.error).toContain('IP addresses');
  });

  it('rejects URLs exceeding 300 characters', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(290);
    const res = validateDocumentUrl(longUrl);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('300 characters');
  });
});
