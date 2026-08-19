import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProcessItem } from '../components/admin/AdminPortalApp';

const PROCESSES_COLLECTION = 'processes';

export const INITIAL_PROCESSES_DATA: ProcessItem[] = [
  {
    id: 'REQ-000184',
    cidadao: 'JOÃO MANUEL DA SILVA',
    tipo: 'Renovação',
    estado: 'Em análise',
    dataCriacao: 'Hoje, 14:20',
    identidadeStatus: 'CONFIRMADA',
    documentacaoStatus: 'OFICIAIS',
    biometriaStatus: 'RECEBIDA',
    fotografiaStatus: 'RECEBIDA',
    analiseStatus: 'EM_ANALISE',
    emissaoStatus: 'PENDENTE'
  },
  {
    id: 'REQ-000185',
    cidadao: 'MARIA JOSÉ FERREIRA',
    tipo: 'Primeiro',
    estado: 'Biometria',
    dataCriacao: 'Hoje, 13:45',
    identidadeStatus: 'CONFIRMADA',
    documentacaoStatus: 'OFICIAIS',
    biometriaStatus: 'PENDENTE',
    fotografiaStatus: 'RECEBIDA',
    analiseStatus: 'PENDENTE',
    emissaoStatus: 'PENDENTE'
  },
  {
    id: 'REQ-000186',
    cidadao: 'ANTÓNIO PEDRO NETO',
    tipo: 'Renovação',
    estado: 'Pendente',
    dataCriacao: 'Hoje, 11:10',
    identidadeStatus: 'CONFIRMADA',
    documentacaoStatus: 'INCOMPLETA',
    biometriaStatus: 'RECEBIDA',
    fotografiaStatus: 'RECEBIDA',
    analiseStatus: 'PENDENTE',
    emissaoStatus: 'PENDENTE'
  },
  {
    id: 'REQ-000187',
    cidadao: 'TERESA AMÉLIA BENGUELA',
    tipo: 'Primeiro',
    estado: 'Aprovado',
    dataCriacao: 'Ontem, 16:30',
    identidadeStatus: 'CONFIRMADA',
    documentacaoStatus: 'OFICIAIS',
    biometriaStatus: 'RECEBIDA',
    fotografiaStatus: 'RECEBIDA',
    analiseStatus: 'CONCLUIDA',
    emissaoStatus: 'EMITIDO'
  },
  {
    id: 'REQ-000188',
    cidadao: 'CARLOS ALBERTO DOS SANTOS',
    tipo: 'Renovação',
    estado: 'Novo',
    dataCriacao: 'Hoje, 15:02',
    identidadeStatus: 'CONFIRMADA',
    documentacaoStatus: 'OFICIAIS',
    biometriaStatus: 'RECEBIDA',
    fotografiaStatus: 'RECEBIDA',
    analiseStatus: 'PENDENTE',
    emissaoStatus: 'PENDENTE'
  },
  {
    id: 'REQ-000189',
    cidadao: 'ISABEL VICTORIA ZAIRE',
    tipo: 'Primeiro',
    estado: 'Em análise',
    dataCriacao: 'Hoje, 10:15',
    identidadeStatus: 'CONFIRMADA',
    documentacaoStatus: 'OFICIAIS',
    biometriaStatus: 'RECEBIDA',
    fotografiaStatus: 'RECEBIDA',
    analiseStatus: 'EM_ANALISE',
    emissaoStatus: 'PENDENTE'
  }
];

// Seed initial processes if collection is empty
export async function seedInitialProcesses() {
  try {
    for (const p of INITIAL_PROCESSES_DATA) {
      const docRef = doc(db, PROCESSES_COLLECTION, p.id);
      await setDoc(docRef, {
        ...p,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (err) {
    console.error("Error seeding initial processes:", err);
  }
}

// Subscribe to processes collection in Firestore in real-time
export function subscribeProcesses(callback: (items: ProcessItem[]) => void) {
  try {
    const colRef = collection(db, PROCESSES_COLLECTION);
    
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          seedInitialProcesses();
          callback(INITIAL_PROCESSES_DATA);
          return;
        }
        const list: ProcessItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as ProcessItem);
        });
        list.sort((a, b) => b.id.localeCompare(a.id));
        callback(list);
      },
      (error) => {
        console.warn("Firestore offline or unavailable; running in resilient local cache mode:", error.message);
        // Fallback to local default demo processes when backend is temporarily offline
        callback(INITIAL_PROCESSES_DATA);
      }
    );
  } catch (err) {
    console.warn("Could not initiate Firestore snapshot listener, operating in offline fallback:", err);
    callback(INITIAL_PROCESSES_DATA);
    return () => {};
  }
}

// Create or update a process in Firestore
export async function saveProcess(process: ProcessItem) {
  try {
    const docRef = doc(db, PROCESSES_COLLECTION, process.id);
    await setDoc(docRef, {
      ...process,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error("Error saving process to Firestore:", err);
  }
}

// Update process state in Firestore
export async function updateProcessStatusInDb(
  processId: string, 
  newEstado: ProcessItem['estado'],
  extraFields?: Partial<ProcessItem>
) {
  try {
    const docRef = doc(db, PROCESSES_COLLECTION, processId);
    const updates = {
      estado: newEstado,
      updatedAt: new Date().toISOString(),
      ...extraFields
    };
    await updateDoc(docRef, updates as any);
  } catch (err) {
    console.error("Error updating process status in Firestore:", err);
  }
}
