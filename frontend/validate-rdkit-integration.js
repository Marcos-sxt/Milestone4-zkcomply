// validate-rdkit-integration.js - Validar integração RDKit

const testIntegration = async () => {
  try {
    // Importar nossa função
    const { calculateMolecularProperties } = await import("./src/utils/rdkit.js");
    
    console.log("🧪 Testando integração RDKit...");
    
    // Teste 1: Etanol (deve usar RDKit real)
    console.log("\n1. Testando Etanol (CCO):");
    const etanol = await calculateMolecularProperties("CCO");
    console.log("Resultado:", etanol);
    
    // Teste 2: Molécula nova (não no mock) 
    console.log("\n2. Testando Melatonina (CC(=O)NCCC1=CNC2=C1C=C(C=C2)OC):");
    try {
      const melatonina = await calculateMolecularProperties("CC(=O)NCCC1=CNC2=C1C=C(C=C2)OC");
      console.log("Resultado:", melatonina);
    } catch (e) {
      console.log("Erro (esperado se RDKit não funcionar):", e.message);
    }
    
    // Teste 3: SMILES inválido
    console.log("\n3. Testando SMILES inválido:");
    try {
      const invalid = await calculateMolecularProperties("INVALID_SMILES");
      console.log("Resultado:", invalid);
    } catch (e) {
      console.log("Erro (esperado):", e.message);
    }
    
    console.log("\n✅ Teste de integração completo!");
    
  } catch (error) {
    console.error("❌ Erro na integração:", error);
  }
};

testIntegration();
