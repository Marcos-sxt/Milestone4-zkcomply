// test-rdkit-simple.js - Teste simples do RDKit

const testMolecule = async () => {
  try {
    const RDKit = await import("@rdkit/rdkit");
    const rdkit = await RDKit.default();
    
    const mol = rdkit.get_mol("CCO");
    
    console.log("Mol object methods:");
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(mol));
    methods.sort().forEach(method => {
      if (typeof mol[method] === 'function') {
        console.log(`  ${method}`);
      }
    });
    
    // Testar alguns métodos comuns
    console.log("\nTesting methods:");
    
    try { console.log("get_molwt:", mol.get_molwt()); } catch(e) { console.log("get_molwt: ERROR"); }
    try { console.log("get_exact_mw:", mol.get_exact_mw()); } catch(e) { console.log("get_exact_mw: ERROR"); }
    try { console.log("get_num_hbd:", mol.get_num_hbd()); } catch(e) { console.log("get_num_hbd: ERROR"); }
    try { console.log("get_num_hba:", mol.get_num_hba()); } catch(e) { console.log("get_num_hba: ERROR"); }
    try { console.log("get_num_rotatable_bonds:", mol.get_num_rotatable_bonds()); } catch(e) { console.log("get_num_rotatable_bonds: ERROR"); }
    
    mol.delete();
    
  } catch (error) {
    console.error("Error:", error);
  }
};

testMolecule();
