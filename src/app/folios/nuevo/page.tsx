"use client";
import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useFolioStore, Folio } from '@/store/useFolioStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { FileUp, Save, PenTool, Printer, ArrowLeft } from 'lucide-react';

export default function NuevoFolioPage() {
  const { addFolio } = useFolioStore();
  const { role, userName } = useAuthStore();
  const router = useRouter();
  const sigCanvas = useRef<SignatureCanvas>(null);
  
  const [createdFolio, setCreatedFolio] = useState<Folio | null>(null);
  const isVentas = role === 'Ventas';

  const [formData, setFormData] = useState({
    clientName: '',
    provider: '',
    type: 'Garantía' as 'Soporte' | 'Garantía',
    evidenceFiles: [] as File[],
    creationComments: '',
  });

  const [serviceData, setServiceData] = useState({
    clientKey: '',
    email: '',
    phone: '',
    saleNumber: '',
    product: '',
    quantity: 1,
    observations: '',
    supportAreaObservations: '',
  });

  const handleClearSignature = () => {
    sigCanvas.current?.clear();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || (!isVentas && !formData.provider) || !serviceData.product || !serviceData.clientKey) {
      alert("Por favor completa todos los campos obligatorios (Cliente, Proveedor, Producto, Clave de Cliente).");
      return;
    }

    const signatureBase64 = sigCanvas.current?.isEmpty() ? undefined : sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');

    const evidenceBase64Array: string[] = [];
    if (formData.evidenceFiles.length > 0) {
      for (const file of formData.evidenceFiles) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        evidenceBase64Array.push(base64);
      }
    }

    // We only attach supportAreaObservations if the type is Garantía
    let finalServiceData = { ...serviceData };
    if (formData.type !== 'Garantía') {
      const { supportAreaObservations, ...rest } = finalServiceData;
      finalServiceData = rest as typeof serviceData;
    }
    
    const newFolio = addFolio({
      clientName: formData.clientName,
      brand: serviceData.product, // Mapeamos producto a brand para mantener compatibilidad histórica
      provider: isVentas ? 'Por Asignar' : formData.provider,
      type: formData.type,
      evidenceUrls: evidenceBase64Array,
      signature: signatureBase64,
      serviceDetails: finalServiceData,
      createdBy: userName,
      creationComments: formData.creationComments,
    });

    setCreatedFolio(newFolio); // Ambos flujos ahora ven el recibo
  };

  if (createdFolio) {
    return (
      <div className="max-w-2xl mx-auto print:max-w-none print:w-full print:m-0 print:p-0">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0">
          <div className="text-center mb-8 pb-6 border-b border-slate-200 print:border-black">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Recibo de {createdFolio.type === 'Soporte' ? 'Soporte Técnico' : 'Garantía'}
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Folio: {createdFolio.id}</p>
            <p className="text-sm text-slate-400 mt-1">Fecha: {new Date(createdFolio.createdAt).toLocaleString('es-MX')}</p>
          </div>
          
          <div className="space-y-6 text-slate-800">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</p>
                <p className="font-medium text-lg">{createdFolio.clientName}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clave Cliente</p>
                <p className="font-medium text-lg">{createdFolio.serviceDetails?.clientKey}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Correo Electrónico</p>
                <p className="font-medium">{createdFolio.serviceDetails?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Teléfono</p>
                <p className="font-medium">{createdFolio.serviceDetails?.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 print:border-slate-400">
              <h3 className="font-bold text-lg mb-3">Detalles del Servicio</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Producto</p>
                  <p className="font-medium">{createdFolio.serviceDetails?.product}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cantidad</p>
                  <p className="font-medium">{createdFolio.serviceDetails?.quantity}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Número de Venta (Factura)</p>
                  <p className="font-medium">{createdFolio.serviceDetails?.saleNumber || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Observaciones Comunes</p>
                  <div className="bg-slate-50 print:bg-transparent p-3 rounded-lg print:p-0 border border-slate-100 print:border-none min-h-[40px]">
                    <p className="text-sm">{createdFolio.serviceDetails?.observations || 'Ninguna'}</p>
                  </div>
                </div>
                {createdFolio.type === 'Garantía' && createdFolio.serviceDetails?.supportAreaObservations && (
                  <div className="col-span-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Observación Área Soporte</p>
                    <div className="bg-slate-50 print:bg-transparent p-3 rounded-lg print:p-0 border border-slate-100 print:border-none min-h-[40px]">
                      <p className="text-sm italic">{createdFolio.serviceDetails?.supportAreaObservations}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {createdFolio.signature && (
              <div className="pt-8 text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Firma del Cliente de Conformidad</p>
                <img src={createdFolio.signature} alt="Firma del cliente" className="mx-auto h-24 object-contain border-b border-black w-64" />
                <p className="mt-2 font-medium">{createdFolio.clientName}</p>
              </div>
            )}
            
            <div className="pt-8 text-center text-xs text-slate-400 print:block">
              Este documento sirve como comprobante de recepción para el área técnica. Conservar para cualquier aclaración técnica o de garantía.
            </div>
          </div>

          <div className="mt-8 pt-6 flex justify-center gap-4 print:hidden border-t border-slate-200">
            <button 
              onClick={() => router.push('/folios')}
              className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Volver al listado
            </button>
            <button 
              onClick={() => window.print()}
              className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow-md flex items-center gap-2"
            >
              <Printer size={18} />
              Imprimir Recibo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Nuevo Folio {formData.type === 'Soporte' ? 'de Soporte Técnico' : 'de Garantía'}</h1>
        <p className="text-slate-500 mt-1">Ingresa los datos correspondientes para apertura del caso.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tipo de Servicio *</label>
              <select 
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 outline-none transition bg-white"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as 'Soporte' | 'Garantía'})}
              >
                <option value="Garantía">Garantía</option>
                <option value="Soporte">Soporte</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nombre del Cliente *</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 outline-none transition"
                placeholder="Ej. Juan Pérez"
                value={formData.clientName}
                onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              />
            </div>

            {!isVentas && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Proveedor Asignado *</label>
                <select 
                  required={!isVentas}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 outline-none transition bg-white"
                  value={formData.provider}
                  onChange={(e) => setFormData({...formData, provider: e.target.value})}
                >
                  <option value="">Selecciona un proveedor</option>
                  <option value="Servicios Alfa">Servicios Alfa</option>
                  <option value="TechSupplies">TechSupplies</option>
                  <option value="GlobalParts">GlobalParts</option>
                  <option value="QuickFix">QuickFix</option>
                  {formData.type === 'Soporte' && <option value="Interno (Soporte Técnico)">Interno (Soporte Técnico)</option>}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Clave de Cliente *</label>
              <input type="text" required className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition" placeholder="Ej. CLI-001" value={serviceData.clientKey} onChange={(e) => setServiceData({...serviceData, clientKey: e.target.value})} />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Correo Electrónico</label>
              <input type="email" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition" placeholder="ejemplo@correo.com" value={serviceData.email} onChange={(e) => setServiceData({...serviceData, email: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Teléfono de Contacto</label>
              <input type="tel" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition" placeholder="10 dígitos" value={serviceData.phone} onChange={(e) => setServiceData({...serviceData, phone: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Número de Venta (Factura)</label>
              <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition" placeholder="Ej. FAC-9824" value={serviceData.saleNumber} onChange={(e) => setServiceData({...serviceData, saleNumber: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Producto / Equipo *</label>
              <input type="text" required className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition" placeholder="Nombre completo del producto y/o marca" value={serviceData.product} onChange={(e) => setServiceData({...serviceData, product: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Cantidad *</label>
              <input type="number" required min="1" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition" value={serviceData.quantity} onChange={(e) => setServiceData({...serviceData, quantity: parseInt(e.target.value)})} />
            </div>

            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Observaciones Generales</label>
              <textarea rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition" placeholder="Detalles de la falla, estado físico del equipo, accesorios entregados..." value={serviceData.observations} onChange={(e) => setServiceData({...serviceData, observations: e.target.value})} />
            </div>

            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">Comentarios Adicionales del Alta (Interno)</label>
              <textarea rows={2} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none bg-orange-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition" placeholder="Notas internas para el equipo de soporte sobre esta recepción..." value={formData.creationComments} onChange={(e) => setFormData({...formData, creationComments: e.target.value})} />
            </div>

            {!isVentas && formData.type === 'Garantía' && (
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-2">Observaciones del Área de Soporte</label>
                <textarea rows={2} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="Notas sobre revisión inicial que avale la garantía..." value={serviceData.supportAreaObservations} onChange={(e) => setServiceData({...serviceData, supportAreaObservations: e.target.value})} />
              </div>
            )}

            {!isVentas && (
              <div className="space-y-2 col-span-1 md:col-span-2 mt-2 pt-4 border-t border-slate-100">
                <label className="text-sm font-medium text-slate-700">Evidencias (Máx 20 archivos)</label>
                <div className="w-full relative border-2 border-dashed border-slate-300 rounded-lg px-4 py-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition group cursor-pointer">
                  <input 
                    type="file" 
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files);
                        if (formData.evidenceFiles.length + newFiles.length > 20) {
                          alert('Solo puedes subir hasta 20 evidencias por folio.');
                          return;
                        }
                        setFormData({...formData, evidenceFiles: [...formData.evidenceFiles, ...newFiles]});
                      }
                    }}
                  />
                  <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-primary-600 transition">
                    <FileUp size={24} />
                    <span className="text-sm font-medium">Click o arrastrar para subir imágenes/PDFs</span>
                  </div>
                </div>
                
                {formData.evidenceFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.evidenceFiles.map((f, i) => (
                      <div key={i} className="bg-slate-200 text-slate-700 text-xs px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                        <span className="truncate max-w-[150px]">{f.name}</span>
                        <button type="button" onClick={() => setFormData({...formData, evidenceFiles: formData.evidenceFiles.filter((_, index) => index !== i)})} className="text-slate-500 hover:text-red-500">
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-slate-200 pt-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <PenTool size={18} className="text-slate-400" />
                Firma Digital del Cliente
              </label>
              <button type="button" onClick={handleClearSignature} className="text-xs text-primary-600 hover:text-primary-800 font-medium">
                Limpiar Firma
              </button>
            </div>
            <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-inner isolate w-full">
              <SignatureCanvas 
                ref={sigCanvas} 
                penColor="black"
                canvasProps={{className: 'signature-canvas w-full h-40'}} 
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">El cliente debe firmar dentro del recuadro para consentir el servicio.</p>
          </div>

          <div className="pt-6 flex justify-end gap-4">
            <button 
              type="button" 
              onClick={() => router.push('/')}
              className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition shadow-md flex items-center gap-2"
            >
              <Save size={18} />
              Generar Folio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
