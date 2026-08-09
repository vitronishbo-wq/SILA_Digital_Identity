import { Citizen, CitizenDocument } from '../types/identity';

/**
 * Generate a deterministic short cryptographic hash simulation for ID signatures
 */
export function generateDigitalSignature(biNumber: string, timestamp: string = '2026-08-02'): string {
  const seed = `${biNumber}-${timestamp}-SILA-GOV-AO`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `SILA-SIG-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

/**
 * Encodes a citizen identity into a secure JSON QR Token
 */
export function generateQrPayload(citizen: Citizen, doc?: CitizenDocument): string {
  const payload = {
    iss: 'SILA-GOV-AO',
    sub: citizen.biNumber,
    name: citizen.fullName,
    doc: doc ? doc.documentNumber : citizen.biNumber,
    exp: doc ? doc.expiryDate : '2031-12-31',
    sig: generateDigitalSignature(citizen.biNumber),
    ver: '2.4-SEC',
  };
  return JSON.stringify(payload);
}

/**
 * Simulates validating a QR Token payload or BI string
 */
export function validateQrToken(inputToken: string): {
  valid: boolean;
  biNumber?: string;
  name?: string;
  signature?: string;
  statusText: string;
} {
  try {
    if (inputToken.startsWith('{') && inputToken.includes('sub')) {
      const parsed = JSON.parse(inputToken);
      return {
        valid: true,
        biNumber: parsed.sub || parsed.doc,
        name: parsed.name || 'Cidadão SILA',
        signature: parsed.sig || 'SILA-SIG-VALID',
        statusText: 'AUTENTICADO VIA ASSINATURA DIGITAL RSA-4096',
      };
    }
  } catch {
    // Fallthrough for simple BI numbers
  }

  // Handle standard BI formats or demo numbers
  const cleaned = inputToken.trim().toUpperCase();
  if (cleaned.length >= 6) {
    return {
      valid: true,
      biNumber: cleaned,
      name: cleaned.includes('8877') ? 'Alex Chen' : cleaned.includes('0044') ? 'Ana Patrícia' : 'João Manuel da Silva',
      signature: generateDigitalSignature(cleaned),
      statusText: 'AUTENTICADO COM SUCESSO POR GOV.AO CA',
    };
  }

  return {
    valid: false,
    statusText: 'TOKEN INVÁLIDO OU EXPIRED SIGNATURE',
  };
}

export function formatBiNumber(bi: string): string {
  if (bi.length === 14) {
    return `${bi.slice(0, 9)} ${bi.slice(9, 11)} ${bi.slice(11)}`;
  }
  return bi;
}
