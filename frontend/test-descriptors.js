// test-descriptors.js - Teste dos descritores RDKit

const testDescriptors = async () => {
  try {
    const RDKit = await import("@rdkit/rdkit");
    const rdkit = await RDKit.default();
    
    const mol = rdkit.get_mol("CCO"); // Etanol
    
    console.log("Testing get_descriptors:");
    const descriptors = mol.get_descriptors();
    console.log("Descriptors:", descriptors);
    
    // Teste com Aspirina
    const mol2 = rdkit.get_mol("CC(=O)OC1=CC=CC=C1C(=O)O");
    const descriptors2 = mol2.get_descriptors();
    console.log("\nAspirina descriptors:", descriptors2);
    
    mol.delete();
    mol2.delete();
    
  } catch (error) {
    console.error("Error:", error);
  }
};

testDescriptors();
