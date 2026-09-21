import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ayucare | Patient Case Monitoring and Management',
  description: 'Clinical workspace for authorized healthcare professionals to record, organize, monitor, and manage patient cases throughout the care journey.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-stone-50 dark:bg-[#080b12] text-slate-900 dark:text-slate-100 antialiased selection:bg-orange-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
