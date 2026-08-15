export type TerritoryType = 
  | 'NATIONAL' 
  | 'PROVINCE' 
  | 'MUNICIPALITY' 
  | 'COMMUNE' 
  | 'SERVICE_POINT';

export type TerritoryStatus = 
  | 'ACTIVE' 
  | 'INACTIVE' 
  | 'PENDING' 
  | 'SUSPENDED' 
  | 'ARCHIVED';

export type ServicePointType = 
  | 'CONSERVATORIA' 
  | 'POSTO_IDENTIFICACAO' 
  | 'BALCAO_SILA';

export interface ServicePointCapabilities {
  biometrics: boolean;
  photography: boolean;
  civilRegistry: boolean;
  biIssuance: boolean;
}

export interface ServicePoint {
  id: string; // e.g. CSIC-ING-001
  name: string; // e.g. Conservatória do Registo Civil da Ingombota
  type: ServicePointType;
  provinceCode: string;
  provinceName: string;
  municipalityId: string;
  municipalityName: string;
  communeName: string;
  status: 'OPERACIONAL' | 'MANUTENÇÃO' | 'SUSPENSO';
  capabilities: ServicePointCapabilities;
  dailyCapacity: number;
  contactPhone?: string;
  operatingHours?: string;
}

export type JurisdictionScope = 
  | 'NATIONAL' 
  | 'PROVINCIAL' 
  | 'MUNICIPAL' 
  | 'COMMUNAL' 
  | 'SERVICE_POINT';

export interface JurisdictionRule {
  id: string;
  scopeLevel: JurisdictionScope;
  territoryCode: string;
  territoryName: string;
  allowedRoles: string[];
  restrictedActions: string[];
  abacCondition: string;
}

export interface TerritoryResponsibility {
  id: string;
  territoryCode: string;
  territoryName: string;
  organization: string; // e.g. MJDH - Ministério da Justiça e Direitos Humanos
  unitName: string; // e.g. CSIC - Delegação Provincial de Luanda
  administratorName: string; // e.g. Dr. António Burity (Diretor Provincial)
  administratorRole: string;
  contactEmail: string;
}

export type ProposalStatus = 
  | 'PROPOSTA' 
  | 'VALIDACAO' 
  | 'APROVACAO' 
  | 'PUBLICACAO' 
  | 'ATIVO';

export interface TerritoryChangeProposal {
  id: string; // e.g. PROP-TERR-2026-004
  territoryName: string;
  type: TerritoryType;
  provinceCode: string;
  municipalityName?: string;
  communeName?: string;
  proposerName: string;
  proposerRole: string;
  justification: string;
  status: ProposalStatus;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface TerritoryAuditRecord {
  id: string;
  timestamp: string;
  operatorName: string;
  operatorRole: string;
  action: string;
  territoryCode: string;
  territoryName: string;
  details: string;
  previousHash: string;
  currentHash: string;
  eventSignature: string;
}

export interface ProcessJurisdictionSnapshot {
  processId: string;
  citizenName: string;
  processDate: string;
  territoryVersion: string; // e.g. TERR_VER_2026_01
  provinceId: string;        // e.g. HUA
  provinceName: string;
  municipalityId: string;    // e.g. HUA-muni-1
  municipalityName: string;
  communeId: string;         // e.g. HUA-com-sede
  communeName: string;
  servicePointId: string;    // e.g. CSIC-HUA-001
  jurisdictionId: string;    // e.g. JUR-HUA-PROV-01
  isImmutableSnapshot: true;
  sha256Proof: string;
}

export interface TerritoryVersion {
  versionId: string; // e.g. TERR_VER_2026_01
  officialDecree: string; // e.g. Lei n.º 14/24 da Nova Divisão Político-Administrativa
  validFrom: string;
  validTo?: string;
  isCurrent: boolean;
  provincesCount: number;
  municipalitiesCount: number;
  communesCount: number;
  servicePointsCount: number;
  publishedBy: string;
  checksumSha256: string;
  previousVersionHash?: string;
  notes: string;
}

export interface HistoricalJurisdictionLookup {
  processId: string;
  citizenName: string;
  processDate: string;
  matchedVersionId: string;
  effectiveProvinceCode: string;
  effectiveProvinceName: string;
  effectiveMunicipalityName: string;
  effectiveServicePointId: string;
  effectiveJurisdictionScope: JurisdictionScope;
  isImmutableSnapshot: boolean;
  jurisdictionSnapshot?: ProcessJurisdictionSnapshot;
}
