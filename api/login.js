import crypto from 'crypto';

const RUNTIME_SESSION_SECRET = crypto.randomBytes(32).toString('hex');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const password = (body.password || body.passwordGuess || '').trim();
  const username = (body.username || body.user || '').trim();

  const SECRET_PASSWORD = (process.env.SITE_PASSWORD || process.env.BASIC_AUTH_PASSWORD || '').trim();
  const SECRET_USER = (process.env.BASIC_AUTH_USER || 'syle').trim();

  if (process.env.NODE_ENV === 'production') {
    if (!SECRET_PASSWORD) {
      return res.status(500).json({ success: false, message: 'Server configuration error: SITE_PASSWORD missing in production.' });
    }
    if (!process.env.SESSION_SECRET) {
      return res.status(500).json({ success: false, message: 'Server configuration error: SESSION_SECRET missing in production.' });
    }
  }

  const targetPass = SECRET_PASSWORD || (process.env.NODE_ENV !== 'production' ? 'sylenumber1' : '');

  if (!username || !password || !targetPass) {
    return res.status(401).json({ success: false, message: 'Invalid credentials. Verification failed.' });
  }

  const isPasswordCorrect = password === targetPass;
  const isUserCorrect = username.toLowerCase() === SECRET_USER.toLowerCase();

  if (isPasswordCorrect && isUserCorrect) {
    const secret = (process.env.SESSION_SECRET || RUNTIME_SESSION_SECRET).trim();
    const now = Date.now();
    const payload = {
      u: SECRET_USER,
      c: now,
      e: now + 7 * 24 * 60 * 60 * 1000,
      n: crypto.randomBytes(16).toString('hex')
    };
    const jsonStr = JSON.stringify(payload);
    const base64Data = Buffer.from(jsonStr).toString('base64url');
    const signature = crypto.createHmac('sha256', secret).update(base64Data).digest('base64url');
    const token = `${base64Data}.${signature}`;

    const isSecure = process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https';
    res.setHeader('Set-Cookie', `x2shows_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${isSecure ? '; Secure' : ''}`);

    return res.status(200).json({ 
      success: true, 
      user: { email: `${SECRET_USER}@x2shows.local`, role: 'authenticated' }
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials. Verification failed.' });
}
