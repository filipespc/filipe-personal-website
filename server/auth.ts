import bcrypt from 'bcrypt';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import type { Express, RequestHandler } from 'express';

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: 'sessions',
  });
  
  // Validate required environment variables
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is required for security');
  }
  
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Railway terminates HTTPS at load balancer, internal routing is HTTP
      maxAge: sessionTtl,
      sameSite: 'lax',
    },
  });
}

export const requireAuth: RequestHandler = (req, res, next) => {
  // Debug logging for production troubleshooting
  console.log('Auth check:', {
    hasSession: !!req.session,
    sessionId: req.session?.id,
    userId: req.session?.userId,
    username: req.session?.username,
    sessionCookieValues: req.session?.cookie,
    cookies: Object.keys(req.cookies || {}),
    rawCookie: req.headers.cookie,
    headers: {
      host: req.headers.host,
      origin: req.headers.origin,
      cookie: req.headers.cookie ? 'present' : 'missing',
      userAgent: req.headers['user-agent']?.substring(0, 50)
    },
    path: req.path,
    method: req.method,
    env: process.env.NODE_ENV
  });
  
  if (req.session && req.session.userId) {
    console.log('✅ Authentication successful for user:', req.session.username);
    return next();
  }
  
  console.log('❌ Authentication failed - missing session or userId');
  res.status(401).json({ message: 'Authentication required' });
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}