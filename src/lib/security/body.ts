export type BoundedBodyResult =
  | { ok: true; value: string }
  | { ok: false; reason: 'invalid' | 'too_large' };

export async function readBoundedText(
  request: Request,
  maxBytes: number
): Promise<BoundedBodyResult> {
  const declared = request.headers.get('content-length');
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > maxBytes)) {
    return { ok: false, reason: 'too_large' };
  }
  if (!request.body) return { ok: true, value: '' };

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let value = '';
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > maxBytes) {
        await reader.cancel('Request body exceeds configured limit').catch(() => undefined);
        return { ok: false, reason: 'too_large' };
      }
      value += decoder.decode(chunk.value, { stream: true });
    }
    value += decoder.decode();
    return { ok: true, value };
  } catch {
    return { ok: false, reason: 'invalid' };
  }
}
