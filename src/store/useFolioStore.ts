import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FolioStatus = 'Abierto' | 'Cerrado' | 'En Espera' | 'Cancelado';

export interface ServiceDetails {
  clientKey: string;
  email: string;
  phone: string;
  saleNumber: string;
  product: string;
  quantity: number;
  observations: string;
  supportAreaObservations?: string;
}

export type WarrantyUpdateStatus = 'Actualización realizada' | 'No se puede realizar' | 'Pedir autorización';

export interface FolioComment {
  id: string;
  text: string;
  createdAt: string;
  author?: string;
}

export interface JustificationLog {
  id: string;
  text: string;
  createdAt: string;
  author: string;
}

export interface Folio {
  id: string;
  clientName: string;
  brand: string;
  provider: string;
  evidenceUrl?: string; // Podría ser base64 temporal o nombre archivo (Hacia atrás)
  evidenceUrls?: string[]; // Nuevas múltiples evidencias en Base64
  signature?: string; // base64 de la firma
  status: FolioStatus;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  type: 'Soporte' | 'Garantía';
  testsCompleted: string[];
  deliveryInfo?: {
    name: string;
    idNumber: string;
    date: string;
  };
  justification?: string; // Mantener por retrocompatibilidad si fuese necesario, pero ya obsoleto
  justifications?: JustificationLog[];
  serviceDetails?: ServiceDetails;
  comments?: FolioComment[];
  assemblyFinished?: boolean;
  partsRequested?: boolean;
  
  // Novedades Ventas / Creación
  createdBy?: string;
  creationComments?: string;
  
  // Específicos de Garantía
  warrantyRequiresParts?: boolean;
  warrantyPartsComment?: string;
  warrantyUpdateStatus?: WarrantyUpdateStatus;
  warrantyWholesaleProvider?: string;
}

interface FolioStore {
  folios: Folio[];
  addFolio: (folioData: Omit<Folio, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'testsCompleted'>) => Folio;
  updateFolioStatus: (id: string, status: FolioStatus, extraData?: Partial<Folio>) => void;
  updateFolio: (id: string, data: Partial<Folio>) => void;
  addJustification: (id: string, text: string, author: string) => void;
}

// Datos falsos para que el MVP no se vea vacío inicialmente
const MOCK_DATA: Folio[] = [
  {
    id: 'F-001',
    clientName: 'Empresa Alpha S.A.',
    brand: 'Dell',
    provider: 'TechSupplies',
    status: 'Abierto',
    createdAt: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
    type: 'Garantía',
    testsCompleted: [],
    createdBy: 'miguel',
    creationComments: 'El equipo se apagó de repente y no vuelve a encender.',
  },
  {
    id: 'F-002',
    clientName: 'Juan Pérez',
    brand: 'HP',
    provider: 'GlobalParts',
    status: 'Cerrado',
    createdAt: new Date(Date.now() - 100 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    type: 'Soporte',
    testsCompleted: ['Encendido', 'Reemplazo de pieza'],
    createdBy: 'luis',
    creationComments: 'Cliente solicita revisión de disco duro por ruidos extraños.',
    deliveryInfo: {
      name: 'María Gómez',
      idNumber: 'INE-123456',
      date: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    }
  },
  {
    id: 'F-003',
    clientName: 'Sistemas Beta',
    brand: 'Lenovo',
    provider: 'QuickFix',
    status: 'En Espera',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    type: 'Garantía',
    testsCompleted: [],
    createdBy: 'gabriela',
    creationComments: 'Problemas de calentamiento, ya se usó garantía anteriormente.',
  }
];

export const useFolioStore = create<FolioStore>()(
  persist(
    (set, get) => ({
      folios: MOCK_DATA,

      addFolio: (folioData) => {
        const { folios } = get();
        // Generación de ID F-00X
        const currentCount = folios.length;
        const nextIdNumber = currentCount + 1;
        const nextId = `F-${nextIdNumber.toString().padStart(3, '0')}`;
        
        const newFolio: Folio = {
          ...folioData,
          id: nextId,
          status: 'Abierto',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          testsCompleted: [],
          comments: [],
          assemblyFinished: false,
          partsRequested: false,
          warrantyRequiresParts: false,
        };

        set({ folios: [...folios, newFolio] });
        return newFolio;
      },

      updateFolioStatus: (id, status, extraData) => {
        set((state) => ({
          folios: state.folios.map((folio) =>
            folio.id === id
              ? { ...folio, status, updatedAt: new Date().toISOString(), ...extraData }
              : folio
          ),
        }));
      },

      updateFolio: (id, data) => {
        set((state) => ({
          folios: state.folios.map((folio) =>
            folio.id === id
              ? { ...folio, ...data, updatedAt: new Date().toISOString() }
              : folio
          ),
        }));
      },

      addJustification: (id, text, author) => {
        set((state) => ({
          folios: state.folios.map((folio) => {
            if (folio.id === id) {
              const newJust={ id: Date.now().toString(), text, createdAt: new Date().toISOString(), author };
              return { 
                ...folio, 
                justifications: [...(folio.justifications || []), newJust],
                updatedAt: new Date().toISOString() 
              };
            }
            return folio;
          }),
        }));
      }
    }),
    {
      name: 'sgfg-folio-storage',
    }
  )
);
