const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

/** True for an in-app path such as `/tools` (but not protocol-relative `//host`). */
export function isInternalHref(value: string): boolean {
  const href = value.trim();
  return href.startsWith('/') && !href.startsWith('//');
}

/** True for a safe absolute URL (http, https, mailto). Blocks javascript:, data:, etc. */
export function isSafeExternalHref(value: string): boolean {
  return safeExternalUrl(value) !== null;
}

/**
 * Returns the URL when its scheme is safe to put in an href, otherwise null.
 * Keeps user- and admin-authored content from creating javascript:/data: links.
 */
export function safeExternalUrl(value: string): string | null {
  const href = value.trim();
  if (!href) return null;
  try {
    const url = new URL(href);
    return SAFE_PROTOCOLS.has(url.protocol) ? href : null;
  } catch {
    return null;
  }
}
