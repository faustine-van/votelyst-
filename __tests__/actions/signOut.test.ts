import { signOut } from '@/app/(auth)/actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('signOut action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should sign out and redirect on success', async () => {
    const signOutMock = jest.fn().mockResolvedValue({ error: null });
    (createClient as jest.Mock).mockReturnValue({
      auth: { signOut: signOutMock },
    });

    await signOut();

    expect(signOutMock).toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith('/');
  });

  it('should log an error on failure', async () => {
    const error = new Error('Sign out failed');
    const signOutMock = jest.fn().mockResolvedValue({ error });
    (createClient as jest.Mock).mockReturnValue({
      auth: { signOut: signOutMock },
    });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await signOut();

    expect(signOutMock).toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error signing out:', error);

    consoleErrorSpy.mockRestore();
  });
});