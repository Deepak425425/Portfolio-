import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 - Page Not Found | GROTON AI',
  robots: {
    index: false,
    follow: false,
  }
}

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#EEF0F4] flex flex-col items-center justify-center p-6 text-center font-sans text-[#242631]">
      <div className="bg-[#F3F4F7] shadow-[6px_6px_12px_rgba(120,125,140,0.12),-6px_-6px_12px_rgba(255,255,255,0.9)] p-12 rounded-3xl max-w-lg w-full flex flex-col items-center gap-6">
         <h1 className="text-6xl font-serif text-black">404</h1>
         <h2 className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#7B7F89]">GROTON AI STUDIO</h2>
         <p className="text-sm font-light text-[#7B7F89] max-w-xs mt-2">
           The page you are looking for doesn't exist or has been moved.
         </p>
         <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full">
            <Link href="/" className="flex-1 px-6 py-4 bg-[#F3F4F7] shadow-[4px_4px_8px_rgba(120,125,140,0.12),-4px_-4px_8px_rgba(255,255,255,0.9)] rounded-xl text-[10px] uppercase tracking-widest font-bold text-[#7B7F89] hover:text-[#8B7CFF] transition-all text-center hover:shadow-[inset_3px_3px_6px_rgba(120,125,140,0.15),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]">
              Back to Home
            </Link>
            <Link href="/tools" className="flex-1 px-6 py-4 bg-[#F3F4F7] shadow-[4px_4px_8px_rgba(120,125,140,0.12),-4px_-4px_8px_rgba(255,255,255,0.9)] rounded-xl text-[10px] uppercase tracking-widest font-bold text-[#7B7F89] hover:text-[#8B7CFF] transition-all text-center hover:shadow-[inset_3px_3px_6px_rgba(120,125,140,0.15),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]">
              Explore Tools
            </Link>
         </div>
      </div>
    </main>
  )
}
