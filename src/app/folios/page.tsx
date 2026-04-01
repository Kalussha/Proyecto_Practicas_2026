"use client";
import React, { useState, useEffect } from 'react';
import { useFolioStore, Folio, FolioStatus, WarrantyUpdateStatus } from '@/store/useFolioStore';
import { differenceInHours } from 'date-fns';
import { AlertTriangle, CheckSquare, XCircle, Search, Clock, ShieldCheck, Ban, FileUp } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

export default function FoliosPage() {
  const { folios, updateFolioStatus, updateFolio } = useFolioStore();
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [selectedFolio, setSelectedFolio] = useState<Folio | null>(null);
  const [tests, setTests] = useState<{name: string, completed: boolean}[]>([
    {name: 'Encendido y Diagnóstico', completed: false},
    {name: 'Reemplazo de pieza defectuosa', completed: false},
    {name: 'Pruebas de estrés / funcionamiento', completed: false},
    {name: 'Limpieza e Inspección Final', completed: false},
  ]);
  const [delivery, setDelivery] = useState({ name: '', idNumber: '' });
  const [justification, setJustification] = useState('');

  // Novedades Soporte
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if(!selectedFolio || !newComment.trim()) return;
    const comment = { id: Date.now().toString(), text: newComment, createdAt: new Date().toISOString() };
    const currentComments = selectedFolio.comments || [];
    updateFolio(selectedFolio.id, { comments: [...currentComments, comment] });
    setSelectedFolio({...selectedFolio, comments: [...currentComments, comment]});
    setNewComment('');
  };

  const handleToggleAssembly = (val: boolean) => {
    if(!selectedFolio) return;
    updateFolio(selectedFolio.id, { assemblyFinished: val });
    setSelectedFolio({...selectedFolio, assemblyFinished: val});
  };

  const handleToggleParts = (val: boolean) => {
    if(!selectedFolio) return;
    updateFolio(selectedFolio.id, { partsRequested: val });
    setSelectedFolio({...selectedFolio, partsRequested: val});
  };

  // Novedades Garantía
  const handleToggleWarrantyParts = (val: boolean) => {
    if(!selectedFolio) return;
    updateFolio(selectedFolio.id, { warrantyRequiresParts: val });
    setSelectedFolio({...selectedFolio, warrantyRequiresParts: val});
  };

  const handleUpdateWarrantyPartsComment = (val: string) => {
    if(!selectedFolio) return;
    updateFolio(selectedFolio.id, { warrantyPartsComment: val });
    setSelectedFolio({...selectedFolio, warrantyPartsComment: val});
  };

  const handleUpdateWarrantyStatus = (status: WarrantyUpdateStatus) => {
    if(!selectedFolio) return;
    updateFolio(selectedFolio.id, { warrantyUpdateStatus: status });
    setSelectedFolio({...selectedFolio, warrantyUpdateStatus: status});
  };

  useEffect(() => setIsClient(true), []);
  if (!isClient) return <div>Cargando folios...</div>;

  const filteredFolios = folios.filter(f => {
    const matchesSearch = f.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Si no hay búsqueda activa, ocultamos los cerrados para mantener limpio el dashboard
    if (!searchTerm) {
      return matchesSearch && f.status !== 'Cerrado';
    }
    
    // Si el usuario busca algo, revelamos todo (incluyendo los Cerrados)
    return matchesSearch;
  });

  const handleCloseFolio = () => {
    if (!selectedFolio) return;
    if (tests.some(t => !t.completed)) {
      alert("Debes completar todas las pruebas antes de cerrar el folio.");
      return;
    }
    if (!delivery.name || !delivery.idNumber) {
      alert("Datos de quien retira son obligatorios.");
      return;
    }

    updateFolioStatus(selectedFolio.id, 'Cerrado', {
      testsCompleted: tests.map(t => t.name),
      deliveryInfo: { ...delivery, date: new Date().toISOString() }
    });
    setSelectedFolio(null);
  };

  const handleSaveJustification = () => {
    if(!selectedFolio || !justification) return;
    updateFolio(selectedFolio.id, { justification });
    // Reseteamos el estado updatedAt para "reiniciar" el contador si es necesario,
    // o simplemente guardamos la justificación. Para el MVP la guardaremos.
    alert("Justificación guardada correctamente.");
  };

  const handleCancelFolio = (id: string) => {
    if (confirm("¿Estás seguro de cancelar este folio? No se eliminará del sistema.")) {
      updateFolioStatus(id, 'Cancelado');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestión y Atención</h1>
          <p className="text-slate-500 mt-1">Control de tickets activos y asignación de cierres.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por ID o Cliente..." 
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none w-full md:w-64"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium text-sm">
                <th className="p-4">Folio ID</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Marca/Proveedor</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Tiempo Activo</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFolios.map(folio => {
                const hoursActive = differenceInHours(new Date(), new Date(folio.updatedAt));
                const isOverdue = folio.status !== 'Cerrado' && folio.status !== 'Cancelado' && hoursActive > 48;

                return (
                  <tr key={folio.id} className={clsx(
                    "transition-colors hover:bg-slate-50",
                    isOverdue && !folio.justification && "bg-red-50 hover:bg-red-100"
                  )}>
                    <td className="p-4 font-bold text-slate-900">{folio.id}</td>
                    <td className="p-4 text-slate-700">{folio.clientName}</td>
                    <td className="p-4">
                      <div className="text-slate-900 font-medium">{folio.brand}</div>
                      <div className="text-xs text-slate-500">{folio.provider}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold border border-slate-200">
                        {folio.type || 'Garantía'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={clsx(
                        "px-2 py-1 rounded-full text-xs font-bold",
                        folio.status === 'Abierto' && "bg-blue-100 text-blue-700",
                        folio.status === 'Cerrado' && "bg-green-100 text-green-700",
                        folio.status === 'En Espera' && "bg-orange-100 text-orange-700",
                        folio.status === 'Cancelado' && "bg-slate-200 text-slate-600"
                      )}>
                        {folio.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {folio.status === 'Cerrado' || folio.status === 'Cancelado' ? (
                        <span className="text-slate-400 text-sm">Completado</span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Clock size={16} className={isOverdue ? "text-red-500" : "text-slate-400"} />
                          <span className={clsx("text-sm font-medium", isOverdue ? "text-red-600" : "text-slate-600")}>
                            {hoursActive} hrs
                          </span>
                        </div>
                      )}
                      
                      {isOverdue && folio.justification && (
                        <div className="text-xs text-orange-600 mt-1 font-medium bg-orange-100 inline-block px-1 rounded">Justificado</div>
                      )}
                    </td>
                    <td className="p-4 flex gap-2">
                      {folio.status !== 'Cerrado' && folio.status !== 'Cancelado' && (
                        <>
                          <button 
                            onClick={() => {
                              setSelectedFolio(folio);
                              setDelivery({name: '', idNumber: ''});
                              setJustification(folio.justification || '');
                              setNewComment('');
                            }}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                            title="Gestionar Cierre / Justificación"
                          >
                            <CheckSquare size={18} />
                          </button>
                          <button 
                            onClick={() => handleCancelFolio(folio.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Cancelar Ruta"
                          >
                            <Ban size={18} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filteredFolios.length === 0 && (
            <div className="p-8 text-center text-slate-500">No se encontraron folios.</div>
          )}
        </div>
      </div>

      {/* MODAL DE GESTIÓN */}
      {selectedFolio && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 sticky top-0">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck className="text-primary-600" />
                Gestión Folio {selectedFolio.id}
              </h2>
              <button onClick={() => setSelectedFolio(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Alerta Justificación 48h */}
              {differenceInHours(new Date(), new Date(selectedFolio.updatedAt)) > 48 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-red-700 font-bold">
                    <AlertTriangle size={20} /> ALERTA DE RETRASO (&gt;48h)
                  </div>
                  <p className="text-sm text-red-600">Este folio ha excedido el tiempo límite de espera sin actualizaciones. Por favor, ingresa una justificación.</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="flex-1 px-3 py-2 border border-red-200 rounded-lg text-sm outline-none" 
                      placeholder="Motivo del retraso..."
                      value={justification}
                      onChange={e => setJustification(e.target.value)}
                    />
                    <button onClick={handleSaveJustification} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700">Guardar</button>
                  </div>
                </div>
              )}

              {/* Detalles de Servicio (Soporte o Garantía) */}
              {selectedFolio.serviceDetails && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                  <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">Detalles del Servicio</h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                    <div><span className="text-indigo-700 font-semibold">Clave Cliente:</span> <span className="text-slate-700">{selectedFolio.serviceDetails.clientKey}</span></div>
                    <div><span className="text-indigo-700 font-semibold">Venta (Fac):</span> <span className="text-slate-700">{selectedFolio.serviceDetails.saleNumber || 'N/A'}</span></div>
                    <div><span className="text-indigo-700 font-semibold">Correo:</span> <span className="text-slate-700">{selectedFolio.serviceDetails.email || 'N/A'}</span></div>
                    <div><span className="text-indigo-700 font-semibold">Teléfono:</span> <span className="text-slate-700">{selectedFolio.serviceDetails.phone || 'N/A'}</span></div>
                    
                    <div className="col-span-2 mt-2 pt-2 border-t border-indigo-200/50">
                      <span className="text-indigo-700 font-semibold">Producto:</span> <span className="text-slate-700 ml-1 format-medium">{selectedFolio.serviceDetails.product}</span> (Cant: {selectedFolio.serviceDetails.quantity})
                    </div>
                    <div className="col-span-2"><span className="text-indigo-700 font-semibold">Observaciones:</span> <span className="text-slate-700 block mt-1">{selectedFolio.serviceDetails.observations || 'Ninguna'}</span></div>
                    
                    {selectedFolio.type === 'Garantía' && selectedFolio.serviceDetails.supportAreaObservations && (
                      <div className="col-span-2 bg-indigo-100/50 p-3 rounded-lg mt-1 border border-indigo-200">
                        <span className="text-indigo-800 font-bold block mb-1">Observaciones del Área de Soporte:</span> 
                        <span className="text-slate-700 italic">{selectedFolio.serviceDetails.supportAreaObservations}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Bloque Soporte Específico */}
                  {selectedFolio.type === 'Soporte' && (
                    <div className="mt-4 pt-4 border-t border-indigo-200/60 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-indigo-100 cursor-pointer shadow-sm hover:border-indigo-300 transition">
                        <input type="checkbox" checked={!!selectedFolio.assemblyFinished} onChange={(e) => handleToggleAssembly(e.target.checked)} className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-sm font-medium text-slate-700">Ensamble Terminado</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-indigo-100 cursor-pointer shadow-sm hover:border-indigo-300 transition">
                        <input type="checkbox" checked={!!selectedFolio.partsRequested} onChange={(e) => handleToggleParts(e.target.checked)} className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-sm font-medium text-slate-700">Refacciones Solicitadas</span>
                      </label>
                    </div>
                  )}

                  {/* Bloque Garantía Específico */}
                  {selectedFolio.type === 'Garantía' && (
                    <div className="mt-4 pt-4 border-t border-indigo-200/60 space-y-4">
                      <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-indigo-100 cursor-pointer shadow-sm hover:border-indigo-300 transition w-full md:w-1/2">
                        <input type="checkbox" checked={!!selectedFolio.warrantyRequiresParts} onChange={(e) => handleToggleWarrantyParts(e.target.checked)} className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-sm font-medium text-slate-700">Requiere piezas del almacén</span>
                      </label>
                      
                      {selectedFolio.warrantyRequiresParts && (
                        <div>
                          <input type="text" placeholder="¿Qué piezas requiere?" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none text-sm focus:border-indigo-500 shadow-sm" value={selectedFolio.warrantyPartsComment || ''} onChange={(e) => handleUpdateWarrantyPartsComment(e.target.value)} />
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-bold text-indigo-900 mb-2">Estado de Actualización (Interno)</p>
                        <div className="flex flex-wrap gap-2">
                          {(['Actualización realizada', 'No se puede realizar', 'Pedir autorización'] as WarrantyUpdateStatus[]).map(status => (
                            <button 
                              key={status}
                              onClick={() => handleUpdateWarrantyStatus(status)}
                              className={clsx(
                                "px-3 py-1.5 text-xs font-bold rounded-lg border transition shadow-sm",
                                selectedFolio.warrantyUpdateStatus === status 
                                  ? "bg-indigo-600 text-white border-indigo-600"
                                  : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                              )}
                            >
                              {status === 'No se puede realizar' ? 'No se puede realizar la actualización' : 
                               status === 'Pedir autorización' ? 'Pedir autorización a cliente' : 
                               status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Archivos Adjuntos */}
              {(selectedFolio.evidenceUrl || (selectedFolio.evidenceUrls && selectedFolio.evidenceUrls.length > 0) || selectedFolio.signature) && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-inner">
                  <h3 className="font-bold text-slate-800 mb-4">Archivos Adjuntos y Firmas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(selectedFolio.evidenceUrl || (selectedFolio.evidenceUrls && selectedFolio.evidenceUrls.length > 0)) && (
                      <div className={clsx((selectedFolio.evidenceUrls && selectedFolio.evidenceUrls.length > 1) ? "col-span-1 md:col-span-2" : "")}>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Evidencias Adjuntas</p>
                        <div className="flex flex-wrap gap-4">
                          {selectedFolio.evidenceUrl && (
                            <div className="w-full sm:w-48 lg:w-56 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm h-48 flex items-center justify-center flex-shrink-0">
                              {selectedFolio.evidenceUrl.startsWith('data:image') ? (
                                <img src={selectedFolio.evidenceUrl} alt="Evidencia" className="w-full h-full object-contain" />
                              ) : selectedFolio.evidenceUrl.startsWith('data:application/pdf') ? (
                                <iframe src={selectedFolio.evidenceUrl} className="w-full h-full" title="Evidencia PDF"></iframe>
                              ) : (
                                <a href={selectedFolio.evidenceUrl} download="evidencia" className="text-indigo-600 font-bold hover:underline flex flex-col items-center"><FileUp className="mb-2" size={24}/>Descargar</a>
                              )}
                            </div>
                          )}

                          {selectedFolio.evidenceUrls && selectedFolio.evidenceUrls.map((url, idx) => (
                            <div key={idx} className="w-full sm:w-48 lg:w-56 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm h-48 flex items-center justify-center flex-shrink-0">
                              {url.startsWith('data:image') ? (
                                <img src={url} alt={`Evidencia ${idx+1}`} className="w-full h-full object-contain" />
                              ) : url.startsWith('data:application/pdf') ? (
                                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-slate-50">
                                  <FileUp size={32} className="text-slate-400 mb-2"/>
                                  <a href={url} download={`evidencia_${idx+1}.pdf`} className="text-sm text-indigo-600 font-bold hover:underline">Descargar PDF {idx+1}</a>
                                </div>
                              ) : (
                                <a href={url} download={`evidencia_${idx+1}`} className="text-indigo-600 font-bold hover:underline flex flex-col items-center"><FileUp className="mb-2" size={24}/>Archivo {idx+1}</a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedFolio.signature && (
                      <div className={(selectedFolio.evidenceUrls && selectedFolio.evidenceUrls.length > 1) ? "col-span-1 md:col-span-2 border-t border-slate-200 pt-4" : ""}>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Firma del Cliente</p>
                        <div className="border border-slate-200 rounded-lg bg-white shadow-sm flex items-center justify-center p-2 h-48 w-full sm:w-48 lg:w-56">
                          <img src={selectedFolio.signature} alt="Firma del Cliente" className="max-w-full h-full object-contain mix-blend-multiply" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Comentarios */}
              <div>
                <h3 className="font-bold text-slate-800 mb-3">Historial y Comentarios</h3>
                <div className="flex gap-2 mb-4">
                  <input type="text" className="flex-1 px-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" placeholder="Añadir comentario o actualización..." value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} />
                  <button onClick={handleAddComment} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-900 transition">Actualizar</button>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                  {selectedFolio.comments && selectedFolio.comments.length > 0 ? (
                    [...selectedFolio.comments].reverse().map(c => (
                      <div key={c.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="text-sm text-slate-700">{c.text}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(c.createdAt).toLocaleString('es-MX')}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic">No hay comentarios aún.</p>
                  )}
                </div>
              </div>

              {/* Checklist de Cierre */}
              <div>
                <h3 className="font-bold text-slate-800 mb-3">Pruebas Realizadas (Checklist)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tests.map((t, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                      <input 
                        type="checkbox" 
                        checked={t.completed} 
                        onChange={(e) => {
                          const newTests = [...tests];
                          newTests[idx].completed = e.target.checked;
                          setTests(newTests);
                        }}
                        className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-slate-700">{t.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Datos de Entrega */}
              <div>
                <h3 className="font-bold text-slate-800 mb-3">Registro de Entrega</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Nombre completo de quien retira"
                    className="px-4 py-2 border border-slate-300 rounded-lg outline-none w-full"
                    value={delivery.name}
                    onChange={e => setDelivery({...delivery, name: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder="Identificación (Ej. INE, ID)"
                    className="px-4 py-2 border border-slate-300 rounded-lg outline-none w-full"
                    value={delivery.idNumber}
                    onChange={e => setDelivery({...delivery, idNumber: e.target.value})}
                  />
                </div>
              </div>

              <button 
                onClick={handleCloseFolio}
                className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition shadow-lg"
              >
                Cerrar Folio y Entregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
