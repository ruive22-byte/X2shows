export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    // Strip telemetry parameters
    const paramsToStrip = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'ref'];
    paramsToStrip.forEach(param => parsed.searchParams.delete(param));
    return parsed.toString();
  } catch (e) {
    // If it's a relative path starting with /, it's fine
    if (url.startsWith('/')) return url;
    return null; // Reject invalid URLs
  }
}

export function sanitizeString(input: string | null | undefined): string {
  if (!input) return '';
  return input.replace(/<\/?[^>]+(>|$)/g, "");
}
