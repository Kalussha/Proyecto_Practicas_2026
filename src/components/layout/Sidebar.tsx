import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, ClipboardList, BarChart3, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: <LayoutDashboard size={20} /> },
    { label: 'Nuevo Folio', href: '/folios/nuevo', icon: <FileText size={20} /> },
    { label: 'Gestión y Atención', href: '/folios', icon: <ClipboardList size={20} /> },
    { label: 'Reportes Calidad', href: '/reportes', icon: <BarChart3 size={20} /> },
  ];

  return (
    <aside className="w-64 h-screen bg-primary-900 text-white flex flex-col shadow-xl fixed">
      <div className="flex items-center gap-3 p-6 border-b border-primary-800">
        <ShieldCheck className="text-primary-400" size={32} />
        <h1 className="text-xl font-bold tracking-tight">SGFG <span className="text-sm font-normal text-primary-300 block">Corpo</span></h1>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={twMerge(
                clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm",
                  isActive 
                    ? "bg-primary-800 text-white shadow-sm" 
                    : "text-primary-200 hover:bg-primary-800/50 hover:text-white"
                )
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-primary-800 mt-auto">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-full bg-primary-700 flex items-center justify-center font-bold text-sm">
            AD
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-primary-400">Panel Ejecutivo</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
