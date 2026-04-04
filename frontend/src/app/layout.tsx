import React from 'react';
import type { Metadata } from 'next';
import { AuthProvider } from '@/store/AuthContext';
import { CourseProvider } from '@/store/CourseContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'FinOps Academy | Master Cloud Financial Management',
  description:
    'Learn FinOps with industry experts. Ignite your skills with core concepts or Transform your career with our comprehensive program.',
  keywords: ['FinOps', 'Cloud', 'Cost Optimization', 'Training', 'Certification'],
  authors: [{ name: 'FinOps Academy' }],
  openGraph: {
    title: 'FinOps Academy',
    description: 'Master cloud financial management and optimize your cloud costs',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white text-secondary-900">
        <AuthProvider>
          <CourseProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </CourseProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
