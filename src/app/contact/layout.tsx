import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — Start an E-commerce Visual Project | GROTON AI',
  description: 'Contact GROTON AI to start your premium e-commerce product imagery or AI visual production project.',
  alternates: {
    canonical: 'https://groton.in/contact',
  },
  openGraph: {
    title: 'Contact — Start an E-commerce Visual Project | GROTON AI',
    description: 'Contact GROTON AI to start your premium e-commerce product imagery or AI visual production project.',
    url: 'https://groton.in/contact',
    siteName: 'GROTON AI',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://groton.in/campaign-worlds/groton-contact-visual-4x5.webp',
        width: 1200,
        height: 1500,
        alt: 'Contact GROTON AI Studio',
      },
      {
        url: 'https://groton.in/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'GROTON AI STUDIO',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact — Start an E-commerce Visual Project | GROTON AI',
    description: 'Contact GROTON AI to start your premium e-commerce product imagery or AI visual production project.',
    images: ['https://groton.in/campaign-worlds/groton-contact-visual-4x5.webp'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
