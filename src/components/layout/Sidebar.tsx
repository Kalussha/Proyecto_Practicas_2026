import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, ClipboardList, BarChart3, ShieldCheck, UserCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuthStore, UserRole } from '@/store/useAuthStore';
import { useEffect, useState } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const { role, userName, setAuth } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  const navItems = [
    { label: 'Dashboard', href: '/', icon: <LayoutDashboard size={20} />, roles: ['Soporte', 'Alta directiva'] },
    { label: 'Nuevo Folio', href: '/folios/nuevo', icon: <FileText size={20} />, roles: ['Ventas', 'Soporte', 'Alta directiva'] },
    { label: 'Gestión y Atención', href: '/folios', icon: <ClipboardList size={20} />, roles: ['Soporte', 'Alta directiva', 'Ventas'] }, // Ventas can access now, but it will be filtered
    { label: 'Reportes Calidad', href: '/reportes', icon: <BarChart3 size={20} />, roles: ['Soporte', 'Alta directiva'] },
  ];

  if (!isClient) return <aside className="w-64 h-screen bg-primary-900 text-white fixed shadow-xl"></aside>;

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));

  const handleSwitchUser = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'soporte') {
      setAuth('Soporte', 'Soporte Admin');
    } else if (val === 'directiva') {
      setAuth('Alta directiva', 'Directiva');
    } else {
      setAuth('Ventas', val);
    }
  };

  return (
    <aside className="w-64 h-screen bg-primary-900 text-white flex flex-col shadow-xl fixed z-50">
      <div className="flex items-center gap-3 p-6 border-b border-primary-800">
        <ShieldCheck className="text-primary-400" size={32} />
        <h1 className="text-xl font-bold tracking-tight">SGFG <span className="text-sm font-normal text-primary-300 block">Corpo</span></h1>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-2">
        {filteredNavItems.map((item) => {
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
        <div className="flex flex-col gap-2">
          <p className="text-xs text-primary-400 uppercase tracking-widest font-bold">Simular Usuario</p>
          <div className="flex items-center gap-2 bg-primary-800 p-2 rounded-lg border border-primary-700">
            <UserCircle className="text-primary-300" size={24} />
            <select 
              className="bg-transparent text-sm text-white font-medium outline-none w-full cursor-pointer hover:text-primary-200"
              value={role === 'Soporte' ? 'soporte' : role === 'Alta directiva' ? 'directiva' : userName}
              onChange={handleSwitchUser}
            >
              <optgroup label="Soporte">
                <option value="soporte">Soporte (Admin)</option>
              </optgroup>
              <optgroup label="Alta directiva">
                <option value="directiva">Directiva (Visualización)</option>
              </optgroup>
              <optgroup label="Ventas">
                <option value="Luis">Luis</option>
                <option value="Miguel">Miguel</option>
                <option value="Gabriela">Gabriela</option>
                <option value="Fabián">Fabián</option>
                <option value="Alberto">Alberto</option>
                <option value="Asunción">Asunción</option>
              </optgroup>
            </select>
          </div>
          <p className="text-[10px] text-primary-500 mt-1">
            Rol actual: {role}
          </p>
        </div>
      </div>
    </aside>
  );
}
