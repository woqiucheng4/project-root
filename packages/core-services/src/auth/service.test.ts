import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './service';
import { prisma } from '@repo/database';
import bcrypt from 'bcrypt';

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@repo/database', () => ({
  prisma: mockPrisma,
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
  },
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should register a new user and hash the password', async () => {
    const mockUser = { id: 'cuid-123', email: 'test@example.com', name: 'Test User', passwordHash: 'hashedPwd' };
    
    // Setup Mock Returns
    mockPrisma.user.findUnique.mockResolvedValue(null); // User does not exist
    vi.mocked(bcrypt.hash).mockResolvedValue('hashedPwd' as never);
    mockPrisma.user.create.mockResolvedValue(mockUser);

    const result = await authService.registerUser({
      email: 'test@example.com',
      password: 'plainPassword',
      name: 'Test User'
    });

    // Assertions
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', 10);
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashedPwd',
      }
    });
    expect(result).toEqual(mockUser);
  });

  it('should throw an error if the user already exists', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'cuid-123', email: 'test@example.com' });

    await expect(authService.registerUser({
      email: 'test@example.com',
      password: 'plainPassword'
    })).rejects.toThrow('User already exists');
    
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });
});
