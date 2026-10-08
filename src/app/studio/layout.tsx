import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import LogoutButton from './LogoutButton';

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
        <nav className="flex flex-col gap-1 flex-1">
          <span className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase mb-2 mt-4">Pages</span>
          <Link href="/studio?page=HOME" className="px-4 py-2 rounded-lg hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-100 text-sm font-medium transition-colors">HOME</Link>
          <Link href="/studio?page=ABOUT" className="px-4 py-2 rounded-lg hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-100 text-sm font-medium transition-colors">ABOUT</Link>
          <Link href="/studio?page=SERVICES" className="px-4 py-2 rounded-lg hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-100 text-sm font-medium transition-colors">SERVICES</Link>
          <Link href="/studio?page=WORK" className="px-4 py-2 rounded-lg hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-100 text-sm font-medium transition-colors">WORK</Link>
          <Link href="/studio?page=TEAM" className="px-4 py-2 rounded-lg hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-100 text-sm font-medium transition-colors">TEAM</Link>
          <Link href="/studio?page=CONTACT" className="px-4 py-2 rounded-lg hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-100 text-sm font-medium transition-colors">CONTACT</Link>
          <Link href="/studio?page=PRICING" className="px-4 py-2 rounded-lg hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-100 text-sm font-medium transition-colors">PRICING</Link>
          <Link href="/studio?page=BLOG" className="px-4 py-2 rounded-lg hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-100 text-sm font-medium transition-colors">INSIGHTS / BLOG</Link>
          <Link href="/studio?page=TOOLS" className="px-4 py-2 rounded-lg hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-100 text-sm font-medium transition-colors">TOOLS</Link>
          <Link href="/studio?page=GLOBAL" className="px-4 py-2 rounded-lg hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-100 text-sm font-medium transition-colors">GLOBAL TEXT</Link>
          
          <span className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase mb-2 mt-8">Global</span>
          <Link href="/studio?view=media" className="px-4 py-2 rounded-lg hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-100 text-sm font-medium transition-colors">Media Library</Link>
          <Link href="/studio" className="px-4 py-2 rounded-lg hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-100 text-sm font-medium transition-colors">Settings</Link>
        </nav>
        <LogoutButton />
      </aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
