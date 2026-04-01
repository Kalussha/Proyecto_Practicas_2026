"use client";
import "./globals.css";
import { Sidebar } from '@/components/layout/Sidebar';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 flex print:bg-white text-slate-900">
        <div className="print:hidden">
          <Sidebar />
        </div>
        <main className="flex-1 ml-64 print:ml-0 p-8 print:p-0 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto print:max-w-none">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
