import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — Start an E-commerce Visual Project',
  description: 'Contact GROTON AI to start your premium e-commerce product imagery or AI visual production project.',
  openGraph: {
    title: 'Contact — Start an E-commerce Visual Project',
    description: 'Contact GROTON AI to start your premium e-commerce product imagery or AI visual production project.',
    url: 'https://groton.in/contact',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
