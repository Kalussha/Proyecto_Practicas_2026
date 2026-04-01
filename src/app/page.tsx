"use client";
import { useEffect, useState } from 'react';
import { useFolioStore } from '@/store/useFolioStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Package, CheckCircle2, AlertCircle, Clock, Wrench, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const { folios } = useFolioStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <div className="p-8 text-primary-500 font-medium">Cargando métricas...</div>;

  const total = folios.length;
  const abiertos = folios.filter(f => f.status === 'Abierto').length;
  const cerrados = folios.filter(f => f.status === 'Cerrado').length;
  const enEspera = folios.filter(f => f.status === 'En Espera').length;
  const soporte = folios.filter(f => f.type === 'Soporte').length;
  const garantias = folios.filter(f => f.type === 'Garantía').length;

  // Mock data for Response Times
  const timeData = [
    { name: 'Lun', horas: 24 },
    { name: 'Mar', horas: 30 },
    { name: 'Mié', horas: 18 },
    { name: 'Jue', horas: 45 },
    { name: 'Vie', horas: 28 },
  ];

  // Top Brands
  const brandCount = folios.reduce((acc, f) => {
    acc[f.brand] = (acc[f.brand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topBrands = Object.entries(brandCount).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Panel de Control Ejecutivo</h1>
        <p className="text-slate-500 mt-1">Resumen general del Sistema de Gestión de Folios y Garantías.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6 hover:cursor-default">
        <MetricCard title="Total Servicios" value={total} icon={<Package />} color="bg-primary-50 text-primary-600" />
        <MetricCard title="Soporte" value={soporte} icon={<Wrench />} color="bg-indigo-50 text-indigo-600" />
        <MetricCard title="Garantías" value={garantias} icon={<ShieldCheck />} color="bg-cyan-50 text-cyan-600" />
        <MetricCard title="Abiertos" value={abiertos} icon={<AlertCircle />} color="bg-orange-50 text-orange-600" />
        <MetricCard title="En Espera" value={enEspera} icon={<Clock />} color="bg-red-50 text-red-600" />
        <MetricCard title="Cerrados" value={cerrados} icon={<CheckCircle2 />} color="bg-green-50 text-green-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Tiempos de Respuesta */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Promedio de Respuesta (Horas)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                <Line type="monotone" dataKey="horas" stroke="#1e3a8a" strokeWidth={3} dot={{r: 4, fill: '#1e3a8a'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Marcas */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Top Marcas (Garantías)</h2>
          <div className="space-y-4">
            {topBrands.length > 0 ? topBrands.map((brand, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                    {i+1}
                  </div>
                  <span className="font-medium text-slate-700">{brand.name}</span>
                </div>
                <span className="bg-primary-50 text-primary-700 px-2 py-1 rounded text-xs font-bold">{brand.count} casos</span>
              </div>
            )) : (
              <p className="text-slate-400 text-sm">No hay datos suficientes.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }: { title: string, value: number | string, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between items-start hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl inline-flex ${color}`}>
        {icon}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 mt-1">{value}</h3>
      </div>
    </div>
  );
}
