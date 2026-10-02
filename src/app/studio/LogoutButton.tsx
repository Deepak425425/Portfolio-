'use client';
export default function LogoutButton() {
  return (
    <button onClick={() => {
        fetch('/api/studio/auth', { method: 'DELETE' }).then(() => window.location.href = '/studio/login');
    }} className="text-left px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Logout</button>
  );
}
