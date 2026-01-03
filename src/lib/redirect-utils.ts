/**
 * Utility functions for safe URL redirects to prevent open redirect attacks.
 * Only allows internal paths starting with "/" (but not protocol-relative "//").
 */

/**
 * Validates that a redirect URL is an internal path only.
 * Blocks external URLs, protocol-relative URLs, and javascript: URIs.
 */
export function isValidRedirect(url: string): boolean {
  // Must start with "/" but not "//" (protocol-relative URLs)
  if (!url.startsWith('/') || url.startsWith('//')) {
    return false;
  }
  
  // Block javascript: and other protocols that might be URL-encoded
  const decoded = decodeURIComponent(url).toLowerCase();
  if (decoded.includes('javascript:') || decoded.includes('data:') || decoded.includes('vbscript:')) {
    return false;
  }
  
  return true;
}

/**
 * Returns a safe redirect URL, falling back to the default if the provided URL is invalid.
 * @param redirectParam - The redirect URL from query params
 * @param fallback - Default URL if redirectParam is invalid (default: '/dashboard')
 */
export function getSafeRedirectUrl(redirectParam: string | null, fallback: string = '/dashboard'): string {
  if (!redirectParam) {
    return fallback;
  }
  
  if (isValidRedirect(redirectParam)) {
    return redirectParam;
  }
  
  // Log potential attack attempt (only in development)
  if (import.meta.env.DEV) {
    console.warn('Invalid redirect URL blocked:', redirectParam);
  }
  
  return fallback;
}
