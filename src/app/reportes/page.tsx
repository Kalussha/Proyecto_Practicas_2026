"use client";
import React, { useState, useEffect } from 'react';
import { useFolioStore } from '@/store/useFolioStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { ShieldAlert, Trophy, Award } from 'lucide-react';

export default function ReportesPage() {
  const { folios } = useFolioStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);
  if (!isClient) return <div>Cargando reportes...</div>;

  // Top 5 Marcas con más Garantías (Más problemáticas)
  const brandCount = folios.reduce((acc, f) => {
    acc[f.brand] = (acc[f.brand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topBrands = Object.entries(brandCount)
    .map(([name, incidencias]) => ({ name, incidencias }))
    .sort((a,b) => b.incidencias - a.incidencias)
    .slice(0, 5);

  // Ranking de Proveedores por tiempo (Mock de tiempos para el MVP)
  // En un caso real se calcularía (fechaCierre - fechaApertura) / totalCasos
  const providerRanking = [
    { provider: 'QuickFix', time: 18, score: 9.5 },
    { provider: 'Servicios Alfa', time: 24, score: 8.8 },
    { provider: 'TechSupplies', time: 36, score: 7.2 },
    { provider: 'GlobalParts', time: 48, score: 6.0 },
  ];

  const COLORS = ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reportes de Calidad</h1>
        <p className="text-slate-500 mt-1">Análisis de incidencias por marca y evaluación de proveedores.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Gráfico de Top 5 Marcas */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <ShieldAlert />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Top 5 Marcas Problemáticas</h2>
              <p className="text-sm text-slate-500">Equipos con mayor volumen de garantías.</p>
            </div>
          </div>
          
          <div className="flex-1 h-64 lg:h-auto min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topBrands} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontWeight: 600}} width={100} />
                <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="incidencias" radius={[0, 8, 8, 0]} barSize={32}>
                  {topBrands.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ranking de Proveedores */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Trophy />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Ranking de Proveedores</h2>
              <p className="text-sm text-slate-500">Evaluados por tiempo promedio de resolución.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {providerRanking.map((prov, index) => (
              <div key={index} className="flex items-center p-4 border border-slate-100 rounded-xl bg-slate-50 hover:bg-white transition-colors cursor-default">
                <div className="text-2xl font-black text-slate-300 w-8">{index + 1}</div>
                <div className="flex-1 ml-4">
                  <h3 className="font-bold text-slate-800">{prov.provider}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    Tiempo de resp. prom: <span className="font-bold text-slate-700">{prov.time} hrs</span>
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                    <Award size={14} />
                    {prov.score} / 10
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
