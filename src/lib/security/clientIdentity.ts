export function getClientKey(request: Request) {
  const cloudflareClientIp = request.headers.get('cf-connecting-ip')?.trim();
  if (cloudflareClientIp) return cloudflareClientIp;

  if (process.env.TRUST_PROXY_HEADERS === 'true') {
    return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
  }

  return 'anonymous';
}
