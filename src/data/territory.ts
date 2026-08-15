export const PROVINCE_CODES: Record<string, string> = {
  "Cabinda": "CAB",
  "Zaire": "ZAI",
  "Uíge": "UIG",
  "Bengo": "BGO",
  "Icolo e Bengo": "ICB",  // Nova
  "Luanda": "LUA",
  "Cuanza-Norte": "CNO",
  "Cuanza-Sul": "CSU",
  "Malanje": "MAL",
  "Lunda-Norte": "LNO",
  "Lunda-Sul": "LSU",
  "Benguela": "BGU",
  "Huambo": "HUA",
  "Bié": "BIE",
  "Moxico": "MOX",
  "Moxico Leste": "MXL",   // Nova
  "Huíla": "HUI",
  "Namibe": "NAM",
  "Cunene": "CNN",
  "Cubango": "CCU",        // Renomeada (ex-Cuando Cubango Oeste)
  "Quando": "CND"          // Nova (ex-Cuando Cubango Leste)
};

export interface Commune {
  id: string;
  name: string;
  status?: 'ACTIVE' | 'INACTIVE';
  validFrom?: string;
  validTo?: string;
  versionId?: string;
}

export interface Municipality {
  id: string;
  name: string;
  status?: 'ACTIVE' | 'INACTIVE';
  validFrom?: string;
  validTo?: string;
  versionId?: string;
  communes: Commune[];
}

export interface ProvinceTerritory {
  code: string;
  name: string;
  status?: 'ACTIVE' | 'INACTIVE';
  validFrom?: string;
  validTo?: string;
  versionId?: string;
  municipalities: Municipality[];
}

export interface UtenteAddress {
  provinceCode: string;
  provinceName: string;
  municipalityName: string;
  communeName: string;
  bairro: string;
  rua: string;
  numeroCasa: string;
}

// Initial default territory hierarchy base
export const INITIAL_PROVINCES: ProvinceTerritory[] = Object.entries(PROVINCE_CODES).map(([name, code]) => {
  let defaultMunis: { name: string; communes: string[] }[] = [];

  if (code === "LUA") {
    defaultMunis = [
      { name: "Luanda (Ingombota)", communes: ["Ingombota", "Maianga", "Sambizanga", "Rangel", "Neves Bendinha"] },
      { name: "Talatona", communes: ["Talatona", "Benfica", "Camama", "Futu"] },
      { name: "Viana", communes: ["Viana Sede", "Kikuxi", "Zango", "Baia"] },
      { name: "Belas", communes: ["Kilamba", "Ramiros", "Barra do Cuanza"] },
      { name: "Cacuaco", communes: ["Cacuaco Sede", "Kicolo", "Funda"] },
      { name: "Cazenga", communes: ["Cazenga Sede", "Tala Hady", "Kalawenda"] },
      { name: "Kilamba Kiaxi", communes: ["Golfe", "Palanca", "Sapú"] }
    ];
  } else if (code === "ICB") {
    defaultMunis = [
      { name: "Catete", communes: ["Catete Sede", "Bom Jesus", "Cabo Ledo"] },
      { name: "Bela Vista", communes: ["Bela Vista Sede", "Cassoneca"] }
    ];
  } else if (code === "BGU") {
    defaultMunis = [
      { name: "Benguela", communes: ["Benguela Sede", "Zona A", "Zona B"] },
      { name: "Lobito", communes: ["Lobito Sede", "Canata", "Compão", "Restinga"] },
      { name: "Catumbela", communes: ["Catumbela Sede", "Gama", "Biópio"] },
      { name: "Ganda", communes: ["Ganda Sede", "Babaera", "Ebanga"] }
    ];
  } else if (code === "HUA") {
    defaultMunis = [
      { name: "Huambo", communes: ["Huambo Sede", "Calima", "São Pedro"] },
      { name: "Caála", communes: ["Caála Sede", "Cuima", "Catata"] },
      { name: "Bailundo", communes: ["Bailundo Sede", "Lunge", "Luinga"] }
    ];
  } else if (code === "CAB") {
    defaultMunis = [
      { name: "Cabinda", communes: ["Cabinda Sede", "Malembo", "Tando Zinze"] },
      { name: "Buco-Zau", communes: ["Buco-Zau Sede", "Inhuca", "Necuto"] },
      { name: "Cacongo", communes: ["Lândana", "Massabi"] }
    ];
  } else if (code === "HUI") {
    defaultMunis = [
      { name: "Lubango", communes: ["Lubango Sede", "Arimba", "Hoque"] },
      { name: "Humpata", communes: ["Humpata Sede", "Palanca"] },
      { name: "Chibia", communes: ["Chibia Sede", "Capunda Cavilongo"] }
    ];
  } else if (code === "BGO") {
    defaultMunis = [
      { name: "Dande", communes: ["Caxito", "Barra do Dande", "Úcua"] },
      { name: "Ambriz", communes: ["Ambriz Sede", "Bela Vista"] }
    ];
  } else {
    // Default fallback municipalities for other provinces
    defaultMunis = [
      { name: `${name} Sede`, communes: ["Comuna Central", "Comuna Norte", "Comuna Sul"] },
      { name: `Município Secundário de ${name}`, communes: ["Comuna Leste", "Comuna Oeste"] }
    ];
  }

  return {
    code,
    name,
    municipalities: defaultMunis.map((m, idx) => ({
      id: `${code}-muni-${idx + 1}`,
      name: m.name,
      communes: m.communes.map((c, cIdx) => ({
        id: `${code}-muni-${idx + 1}-com-${cIdx + 1}`,
        name: c
      }))
    }))
  };
});

export const formatFullAddress = (addr: UtenteAddress): string => {
  const parts: string[] = [];
  if (addr.rua) parts.push(`Rua/Av. ${addr.rua}`);
  if (addr.numeroCasa) parts.push(`Nº ${addr.numeroCasa}`);
  if (addr.bairro) parts.push(`Bairro ${addr.bairro}`);
  if (addr.communeName) parts.push(`Comuna de ${addr.communeName}`);
  if (addr.municipalityName) parts.push(`Mun. ${addr.municipalityName}`);
  if (addr.provinceName) parts.push(`Província de ${addr.provinceName} [${addr.provinceCode}]`);
  return parts.join(', ');
};
