/**
 * Offline Authentication using JWT and Prisma
 * Used when USE_OFFLINE=true in environment
 *
 * Note: This file is designed to work in both Edge Runtime (middleware)
 * and Node.js Runtime (server actions). Prisma operations are isolated
 * to Node.js runtime only.
 *
 * SECURITY: JWT_SECRET must be set and at least 32 characters for production.
 */

import * as jose from 'jose';

// Validate JWT_SECRET strength
const JWT_SECRET_STRING = process.env.JWT_SECRET;

if (!JWT_SECRET_STRING) {
  throw new Error(
    'SECURITY ERROR: JWT_SECRET environment variable is required. ' +
      'Set a strong secret (minimum 32 characters) in your .env file.'
  );
}

if (JWT_SECRET_STRING.length < 32) {
  throw new Error(
    `SECURITY ERROR: JWT_SECRET must be at least 32 characters long. ` +
      `Current length: ${JWT_SECRET_STRING.length}. ` +
      `Generate a secure secret: openssl rand -base64 32`
  );
}

// Warn about weak default (should never happen in production)
if (JWT_SECRET_STRING === 'offline-test-secret-key') {
  console.warn(
    '⚠️  WARNING: Using default JWT_SECRET! This is INSECURE for production. ' +
      'Generate a strong secret: openssl rand -base64 32'
  );
}

const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export interface OfflineUser {
  id: string;
  email: string;
  role: string;
}

export interface OfflineSession {
  user: OfflineUser;
  access_token: string;
}

/**
 * Get Prisma Client instance (Node.js runtime only)
 * This function dynamically imports Prisma to avoid edge runtime issues
 */
async function getPrismaClient() {
  const { PrismaClient } = await import('@prisma/client');
  return new PrismaClient();
}

/**
 * Sign up a new user (offline mode)
 * Node.js runtime only - uses Prisma
 */
export async function offlineSignUp(email: string, password: string, fullName: string, role: string = 'CUSTOMER') {
  try {
    const prisma = await getPrismaClient();
    const bcrypt = await import('bcryptjs');

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      await prisma.$disconnect();
      return {
        data: null,
        error: { message: 'User already exists' }
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        fullName,
        role,
        isVerified: true, // Auto-verify in offline mode
      }
    });

    await prisma.$disconnect();

    // Generate JWT token
    const token = await new jose.SignJWT({
      sub: user.id,
      email: user.email,
      role: user.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    return {
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        session: {
          access_token: token,
          refresh_token: token
        }
      },
      error: null
    };
  } catch (error) {
    console.error('Offline sign up error:', error);
    return {
      data: null,
      error: { message: 'Failed to create user' }
    };
  }
}

/**
 * Sign in a user (offline mode)
 * Node.js runtime only - uses Prisma
 */
export async function offlineSignIn(email: string, password: string) {
  try {
    const prisma = await getPrismaClient();
    const bcrypt = await import('bcryptjs');

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.passwordHash) {
      await prisma.$disconnect();
      return {
        data: null,
        error: { message: 'Invalid credentials' }
      };
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      await prisma.$disconnect();
      return {
        data: null,
        error: { message: 'Invalid credentials' }
      };
    }

    await prisma.$disconnect();

    // Generate JWT token
    const token = await new jose.SignJWT({
      sub: user.id,
      email: user.email,
      role: user.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    return {
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        session: {
          access_token: token,
          refresh_token: token
        }
      },
      error: null
    };
  } catch (error) {
    console.error('Offline sign in error:', error);
    return {
      data: null,
      error: { message: 'Failed to sign in' }
    };
  }
}

/**
 * Sign out a user (offline mode)
 */
export async function offlineSignOut() {
  // In offline mode, we just return success
  // The client will clear the token
  return {
    error: null
  };
}

/**
 * Get current user from token (offline mode)
 * Node.js runtime only - uses Prisma
 */
export async function offlineGetUser(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    const prisma = await getPrismaClient();

    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string }
    });

    await prisma.$disconnect();

    if (!user) {
      return {
        data: { user: null },
        error: null
      };
    }

    return {
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      },
      error: null
    };
  } catch (error) {
    return {
      data: { user: null },
      error: null
    };
  }
}

/**
 * Verify JWT token (offline mode)
 * Edge runtime compatible - does NOT use Prisma
 * This function is safe to use in middleware
 */
export async function offlineVerifyToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return {
      valid: true,
      payload
    };
  } catch (error) {
    return {
      valid: false,
      payload: null
    };
  }
}
