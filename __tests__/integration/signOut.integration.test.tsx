import { render, fireEvent, screen } from '@testing-library/react';
import { signOut } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/Button';

jest.mock('@/app/(auth)/actions', () => ({
  signOut: jest.fn(),
}));

function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit">Sign Out</Button>
    </form>
  );
}

describe('SignOut integration', () => {
  it('should call the signOut action when the button is clicked', () => {
    render(<SignOutButton />);

    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(signOutButton);

    expect(signOut).toHaveBeenCalled();
  });
});