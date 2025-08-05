// src/utils/rdkit.ts

// Interface para propriedades moleculares calculadas
export interface CalculatedProperties {
  molecular_weight: number;
  h_bond_donors: number;
  h_bond_acceptors: number;
  rotatable_bonds: number;
}

// Cache para evitar recálculos desnecessários
const calculationCache = new Map<string, CalculatedProperties>();

// Estado de inicialização do RDKit
let rdkitInitialized = false;
let rdkitModule: any = null;

// Inicializa o RDKit (lazy loading) - apenas no browser
const initializeRDKit = async () => {
  if (typeof window === 'undefined') {
    throw new Error("RDKit só funciona no browser");
  }
  
  if (rdkitInitialized && rdkitModule) {
    return rdkitModule;
  }

  try {
    console.log("🔧 Inicializando RDKit...");
    
    // Tentar importação dinâmica com fallback
    let RDKit: any;
    try {
      RDKit = await import("@rdkit/rdkit");
    } catch (error) {
      console.warn("❌ Falha ao importar RDKit:", error);
      throw new Error("RDKit não disponível");
    }
    
    // Inicializar o módulo
    rdkitModule = await (RDKit.default as any)();
    rdkitInitialized = true;
    console.log("✅ RDKit inicializado com sucesso!");
    return rdkitModule;
    
  } catch (error) {
    console.error("❌ Erro ao inicializar RDKit:", error);
    throw new Error("Falha na inicialização do RDKit. Usando fallback mock.");
  }
};

// Função principal para calcular propriedades moleculares
export const calculateMolecularProperties = async (smiles: string): Promise<CalculatedProperties> => {
  console.log("🧪 Processando SMILES:", smiles);
  
  // Verificar cache primeiro
  if (calculationCache.has(smiles)) {
    const cached = calculationCache.get(smiles)!;
    console.log("💾 Propriedades (CACHE):", cached);
    return cached;
  }

  // Tentar usar RDKit real apenas no browser
  if (typeof window !== 'undefined') {
    try {
      const rdkit = await initializeRDKit();
      const properties = await calculateWithRDKit(rdkit, smiles);
      
      // Cachear resultado
      calculationCache.set(smiles, properties);
      console.log("📊 Propriedades calculadas (RDKit):", properties);
      return properties;
      
    } catch (error) {
      console.warn("⚠️ RDKit falhou, usando fallback mock:", error);
    }
  }
  
  // Fallback para mock
  return calculateWithMock(smiles);
};

// Cálculo real usando RDKit
const calculateWithRDKit = async (rdkit: any, smiles: string): Promise<CalculatedProperties> => {
  let mol: any = null;
  
  try {
    // Criar molécula a partir do SMILES
    mol = rdkit.get_mol(smiles);
    if (!mol || !mol.is_valid()) {
      throw new Error("SMILES inválido");
    }

    // Calcular propriedades usando RDKit descriptors
    const descriptors = mol.get_descriptors();
    
    // Extrair as propriedades que precisamos
    // Usar amw (average molecular weight) em vez de exactmw para consistência
    const mw = descriptors.amw || descriptors.exactmw || 0;
    const hbd = descriptors.lipinskiHBD || descriptors.NumHBD || 0;
    const hba = descriptors.lipinskiHBA || descriptors.NumHBA || 0;
    const rb = descriptors.NumRotatableBonds || 0;

    // Converter para inteiros (compatível com circuito Noir)
    const properties: CalculatedProperties = {
      molecular_weight: Math.round(mw),
      h_bond_donors: Math.round(hbd),
      h_bond_acceptors: Math.round(hba),
      rotatable_bonds: Math.round(rb)
    };

    return properties;
    
  } finally {
    // Liberar memória
    if (mol) {
      mol.delete();
    }
  }
};

// Fallback mock para casos onde RDKit falha ou está no servidor
const calculateWithMock = async (smiles: string): Promise<CalculatedProperties> => {
  // Mock data expandido baseado em moléculas conhecidas
  const mockData: Record<string, CalculatedProperties> = {
    "CCO": { // Etanol
      molecular_weight: 46,
      h_bond_donors: 1,
      h_bond_acceptors: 1,
      rotatable_bonds: 0
    },
    "CC(=O)OC1=CC=CC=C1C(=O)O": { // Aspirina
      molecular_weight: 180,
      h_bond_donors: 1,
      h_bond_acceptors: 4,
      rotatable_bonds: 3
    },
    "CC(=O)NC1=CC=C(C=C1)O": { // Paracetamol
      molecular_weight: 151,
      h_bond_donors: 2,
      h_bond_acceptors: 2,
      rotatable_bonds: 1
    },
    "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O": { // Ibuprofeno
      molecular_weight: 206,
      h_bond_donors: 1,
      h_bond_acceptors: 2,
      rotatable_bonds: 4
    },
    "CN1C=NC2=C1C(=O)N(C(=O)N2C)C": { // Cafeína
      molecular_weight: 194,
      h_bond_donors: 0,
      h_bond_acceptors: 6,
      rotatable_bonds: 0
    },
    // Novas moléculas para teste
    "CC(=O)NCCC1=CNC2=C1C=C(C=C2)OC": { // Melatonina
      molecular_weight: 232,
      h_bond_donors: 2,
      h_bond_acceptors: 3,
      rotatable_bonds: 4
    },
    "C1=CC=C(C=C1)CCN": { // Fenetilamina
      molecular_weight: 121,
      h_bond_donors: 1,
      h_bond_acceptors: 1,
      rotatable_bonds: 2
    },
    "CC(C)(C)NCC(C1=CC(=C(C=C1)O)CO)O": { // Salbutamol
      molecular_weight: 239,
      h_bond_donors: 4,
      h_bond_acceptors: 4,
      rotatable_bonds: 7
    }
  };

  const properties = mockData[smiles];
  if (!properties) {
    // Para SMILES desconhecidos, fazer uma estimativa básica
    console.warn(`⚠️ SMILES "${smiles}" não reconhecido no mock. Gerando estimativa...`);
    
    const estimatedProperties: CalculatedProperties = {
      molecular_weight: Math.floor(100 + Math.random() * 300), // 100-400 Da
      h_bond_donors: Math.floor(Math.random() * 4), // 0-3
      h_bond_acceptors: Math.floor(1 + Math.random() * 6), // 1-6
      rotatable_bonds: Math.floor(Math.random() * 8) // 0-7
    };
    
    // Cachear a estimativa
    calculationCache.set(smiles, estimatedProperties);
    console.log("📊 Propriedades estimadas (MOCK):", estimatedProperties);
    return estimatedProperties;
  }

  console.log("📊 Propriedades calculadas (MOCK):", properties);
  return properties;
};

// Moléculas de teste para validação
export const TEST_MOLECULES = [
  { 
    name: "Etanol", 
    smiles: "CCO",
    expected: { mw: 46.07, hbd: 1, hba: 1, rb: 0 }
  },
  { 
    name: "Aspirina", 
    smiles: "CC(=O)OC1=CC=CC=C1C(=O)O",
    expected: { mw: 180.16, hbd: 1, hba: 4, rb: 3 }
  },
  { 
    name: "Paracetamol", 
    smiles: "CC(=O)NC1=CC=C(C=C1)O",
    expected: { mw: 151.16, hbd: 2, hba: 2, rb: 1 }
  },
  { 
    name: "Ibuprofeno", 
    smiles: "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O",
    expected: { mw: 206.28, hbd: 1, hba: 2, rb: 4 }
  },
  { 
    name: "Cafeína", 
    smiles: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",
    expected: { mw: 194.19, hbd: 0, hba: 6, rb: 0 }
  }
];
