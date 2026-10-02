import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('groton_auth_token');
  const isLoggedIn = token?.value === 'secure_admin_token_2026';

  if (!isLoggedIn) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-zinc-100 font-sans">
      <aside className="w-64 border-r border-zinc-800/50 bg-[#0d0d0d] p-6 flex flex-col">
        <h1 className="text-xl font-bold tracking-widest uppercase mb-12">Groton<span className="text-[#8B7CFF]">Studio</span></h1>
        <nav className="flex flex-col gap-2 flex-1">
          <Link href="/studio" className="px-4 py-2.5 rounded-lg bg-zinc-800/50 text-sm font-medium">Pages (HOME)</Link>
          <Link href="/studio" className="px-4 py-2.5 rounded-lg hover:bg-zinc-800/30 text-zinc-400 text-sm font-medium transition-colors">Media Library</Link>
          <Link href="/studio" className="px-4 py-2.5 rounded-lg hover:bg-zinc-800/30 text-zinc-400 text-sm font-medium transition-colors">Settings</Link>
        </nav>
        <button onClick={() => {
            fetch('/api/studio/auth', { method: 'DELETE' }).then(() => window.location.href = '/studio/login');
        }} className="text-left px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Logout</button>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}