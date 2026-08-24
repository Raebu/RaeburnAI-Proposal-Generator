import { NextRequest, NextResponse } from 'next/server';

async function digest(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function validBasicAuth(request: NextRequest, expectedUser: string, expectedPassword: string) {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Basic ')) return false;

  let decoded = '';
  try {
    decoded = atob(authorization.slice('Basic '.length));
  } catch {
    return false;
  }

  const separator = decoded.indexOf(':');
  if (separator < 0) return false;
  const username = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);

  const [actualUserHash, expectedUserHash, actualPasswordHash, expectedPasswordHash] = await Promise.all([
    digest(username),
    digest(expectedUser),
    digest(password),
    digest(expectedPassword),
  ]);
  return actualUserHash === expectedUserHash && actualPasswordHash === expectedPasswordHash;
}

export async function middleware(request: NextRequest) {
  if (process.env.NODE_ENV !== 'production') return NextResponse.next();
  if (request.nextUrl.pathname === '/api/health') return NextResponse.next();

  const username = process.env.PROPOSAL_APP_USER;
  const password = process.env.PROPOSAL_APP_PASSWORD;
  if (!username || !password || password.length < 24) {
    return NextResponse.json(
      { error: 'Production authentication is not configured.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  if (!(await validBasicAuth(request, username, password))) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="RaeburnAI Proposal Generator", charset="UTF-8"',
        'Cache-Control': 'no-store',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
