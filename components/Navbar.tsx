import { Button } from './Button';

export function Navbar() {
  return (
   <nav className="flex justify-between p-4 bg-white shadow">
  <h1 className="font-bold text-xl text-blue-600">Votelyst</h1>
  <div className="space-x-2">
    <Button>Login</Button>
    <Button variant="outline">Create Poll</Button>
  </div>
</nav>

  );
}
