import { Citizen, VerificationLog, AdminKPIData, ChartDataPoint } from '../types/identity';
import { generateQrPayload, generateDigitalSignature } from '../utils/cryptoUtils';

const JOAO_MANUEL_BI = '001234567LA032';

export const DEMO_CITIZENS: Citizen[] = [
  {
    id: 'citizen-2',
    biNumber: JOAO_MANUEL_BI,
    fullName: 'João Manuel da Silva',
    preferredName: 'João Manuel',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    birthDate: '1988-11-23',
    nationality: 'Angolana',
    gender: 'M',
    address: 'Rua Rainha Ginga, Lote 45, Ingombota, Luanda',
    provincia: 'Luanda',
    municipio: 'Ingombota',
    naturalidade: 'Ingombota, Luanda',
    filiacaoPai: 'Manuel Agostinho da Silva',
    filiacaoMae: 'Maria Antónia Pedro',
    status: 'VERIFIED',
    biometricHash: 'SHA256-3E4A-91C2-88B3-11AA-D409',
    lastVerifiedAt: 'Hoje, 14:20',
    processCount: 3,
    validationCount: 18,
    auditEventsCount: 42,
    documents: [
      {
        id: 'doc-bi-joao',
        type: 'BI',
        title: 'Bilhete de Identidade Digital (BI)',
        documentNumber: JOAO_MANUEL_BI,
        issueDate: '2021-08-14',
        expiryDate: '2026-08-14',
        issuingAuthority: 'Min. Justiça & DH',
        status: 'ACTIVE',
        hashSignature: generateDigitalSignature(JOAO_MANUEL_BI),
        qrPayload: '',
        metadata: {
          'Altura': '1.80m',
          'Estado Civil': 'Casado',
          'NIF': '5412349001',
          'Assinatura': 'Biométrico RSA'
        }
      },
      {
        id: 'doc-assento-joao',
        type: 'REGISTO_CIVIL',
        title: 'Assento de Nascimento Digital',
        documentNumber: 'ASS-2026-998812',
        issueDate: '2026-01-10',
        expiryDate: 'PERMANENTE',
        issuingAuthority: 'Conservatória do Registo Civil',
        status: 'ACTIVE',
        hashSignature: generateDigitalSignature('ASS-2026-998812'),
        qrPayload: '',
        metadata: {
          'Conservatória': '1ª Conservatória de Luanda',
          'Averbamento': 'Inscrição Definitiva'
        }
      }
    ]
  },
  {
    id: 'citizen-3',
    biNumber: '008765432BE045',
    fullName: 'Maria José Ferreira',
    preferredName: 'Maria José',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    birthDate: '1992-05-14',
    nationality: 'Angolana',
    gender: 'F',
    address: 'Bairro do Lias, Rua 12, Benguela',
    provincia: 'Benguela',
    municipio: 'Benguela',
    naturalidade: 'Lobito, Benguela',
    filiacaoPai: 'José António Ferreira',
    filiacaoMae: 'Teresa de Jesus Ferreira',
    status: 'VERIFIED',
    biometricHash: 'SHA256-88F1-22C4-99D0-A11B-33CC',
    lastVerifiedAt: 'Hoje, 13:45',
    processCount: 1,
    validationCount: 9,
    auditEventsCount: 15,
    documents: [
      {
        id: 'doc-bi-maria',
        type: 'BI',
        title: 'Bilhete de Identidade Digital (BI)',
        documentNumber: '008765432BE045',
        issueDate: '2022-03-10',
        expiryDate: '2027-03-10',
        issuingAuthority: 'Min. Justiça & DH',
        status: 'ACTIVE',
        hashSignature: generateDigitalSignature('008765432BE045'),
        qrPayload: '',
        metadata: {
          'Altura': '1.68m',
          'Estado Civil': 'Solteira',
          'NIF': '5498765432'
        }
      }
    ]
  },
  {
    id: 'citizen-4',
    biNumber: '005432189HU012',
    fullName: 'António Pedro Neto',
    preferredName: 'António Pedro',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    birthDate: '1985-09-02',
    nationality: 'Angolana',
    gender: 'M',
    address: 'Avenida da Independência, Huambo',
    provincia: 'Huambo',
    municipio: 'Huambo',
    naturalidade: 'Huambo Central',
    filiacaoPai: 'Pedro Kiala Neto',
    filiacaoMae: 'Ana Rosa Neto',
    status: 'PENDING',
    biometricHash: 'SHA256-11B2-33C4-55D6-E77F-8899',
    lastVerifiedAt: 'Hoje, 11:10',
    processCount: 2,
    validationCount: 5,
    auditEventsCount: 21,
    documents: [
      {
        id: 'doc-bi-antonio',
        type: 'BI',
        title: 'Bilhete de Identidade Digital (BI)',
        documentNumber: '005432189HU012',
        issueDate: '2019-11-20',
        expiryDate: '2024-11-20',
        issuingAuthority: 'Min. Justiça & DH',
        status: 'PENDING_RENEWAL',
        hashSignature: generateDigitalSignature('005432189HU012'),
        qrPayload: '',
        metadata: {
          'Altura': '1.75m',
          'Estado Civil': 'Casado'
        }
      }
    ]
  },
  {
    id: 'citizen-5',
    biNumber: '009812345ZA099',
    fullName: 'Teresa Amélia Benguela',
    preferredName: 'Teresa Amélia',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    birthDate: '1998-01-30',
    nationality: 'Angolana',
    gender: 'F',
    address: 'Bairro Sagrada Família, Mbanza Kongo',
    provincia: 'Zaire',
    municipio: 'Mbanza Kongo',
    naturalidade: 'Mbanza Kongo, Zaire',
    filiacaoPai: 'Afonso Benguela',
    filiacaoMae: 'Amélia Nzuzi',
    status: 'VERIFIED',
    biometricHash: 'SHA256-44EE-55FF-66AA-77BB-88CC',
    lastVerifiedAt: 'Ontem, 16:30',
    processCount: 1,
    validationCount: 12,
    auditEventsCount: 18,
    documents: [
      {
        id: 'doc-bi-teresa',
        type: 'BI',
        title: 'Bilhete de Identidade Digital (BI)',
        documentNumber: '009812345ZA099',
        issueDate: '2026-02-01',
        expiryDate: '2031-02-01',
        issuingAuthority: 'Min. Justiça & DH',
        status: 'ACTIVE',
        hashSignature: generateDigitalSignature('009812345ZA099'),
        qrPayload: '',
        metadata: {
          'Altura': '1.65m',
          'Estado Civil': 'Solteira'
        }
      }
    ]
  }
];

// Populate QR payloads
DEMO_CITIZENS.forEach(cit => {
  cit.documents.forEach(doc => {
    doc.qrPayload = generateQrPayload(cit, doc);
  });
});

export const DEMO_VERIFICATIONS: VerificationLog[] = [
  {
    id: 'ver-1',
    citizenId: 'citizen-2',
    citizenName: 'João Manuel da Silva',
    biNumber: JOAO_MANUEL_BI,
    timestamp: 'Oct 14, 2026 11:37:55 AM',
    verifierName: 'Identity Verification - Aeroporto 4 de Fevereiro',
    verifierType: 'AIRPORT',
    status: 'VERIFIED',
    location: 'Luanda - Terminal Internacional',
    responseTimeMs: 38
  },
  {
    id: 'ver-2',
    citizenId: 'citizen-2',
    citizenName: 'João Manuel da Silva',
    biNumber: JOAO_MANUEL_BI,
    timestamp: 'Oct 14, 2026 11:34:10 AM',
    verifierName: 'Identity Verification - Banco BFA (Agência Marginal)',
    verifierType: 'BANK',
    status: 'PENDING',
    location: 'Luanda - Centro',
    responseTimeMs: 42
  },
  {
    id: 'ver-3',
    citizenId: 'citizen-2',
    citizenName: 'João Manuel da Silva',
    biNumber: JOAO_MANUEL_BI,
    timestamp: 'Oct 14, 2026 11:28:44 AM',
    verifierName: 'Identity Verification - Polícia Nacional (Blitz Sul)',
    verifierType: 'POLICE',
    status: 'VERIFIED',
    location: 'Luanda - Via Expresso',
    responseTimeMs: 45
  },
  {
    id: 'ver-5',
    citizenId: 'citizen-2',
    citizenName: 'João Manuel da Silva',
    biNumber: JOAO_MANUEL_BI,
    timestamp: 'Oct 14, 2026 10:12:00 AM',
    verifierName: 'Identity Verification - AGT Tributária Portal',
    verifierType: 'GOV_API',
    status: 'VERIFIED',
    location: 'Luanda',
    responseTimeMs: 51
  },
  {
    id: 'ver-8',
    citizenId: 'citizen-2',
    citizenName: 'João Manuel da Silva',
    biNumber: JOAO_MANUEL_BI,
    timestamp: 'Oct 14, 2026 08:30:45 AM',
    verifierName: 'Identity Verification - SIAC Talatona',
    verifierType: 'PUBLIC_PORTAL',
    status: 'FLAGGED',
    location: 'Luanda - Talatona',
    responseTimeMs: 62
  }
];

export const DEMO_ADMIN_KPIS: AdminKPIData = {
  verificationsCount: 1482,
  verificationsGrowthPercent: 6.3,
  renewalsPending: 79,
  renewalsGrowthPercent: -1.8,
  securityAlerts: 5,
  systemLatencyMs: 49,
  systemStatus: 'Optimal'
};

export const DEMO_CHART_DATA: ChartDataPoint[] = [
  { time: '08:00', volume: 80, verified: 74, pending: 6 },
  { time: '10:00', volume: 160, verified: 145, pending: 15 },
  { time: '12:00', volume: 380, verified: 350, pending: 30 },
  { time: '14:00', volume: 220, verified: 200, pending: 20 },
  { time: '16:00', volume: 410, verified: 388, pending: 22 },
  { time: '18:00', volume: 240, verified: 228, pending: 12 },
  { time: '20:00', volume: 190, verified: 178, pending: 12 },
  { time: '22:00', volume: 310, verified: 295, pending: 15 },
  { time: '00:00', volume: 420, verified: 401, pending: 19 },
  { time: '02:00', volume: 250, verified: 238, pending: 12 },
  { time: '04:00', volume: 380, verified: 360, pending: 20 },
  { time: '06:00', volume: 290, verified: 278, pending: 12 }
];
