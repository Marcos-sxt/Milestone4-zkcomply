// test-rdkit-api.js - Teste para verificar API do RDKit

const testRDKit = async () => {
  try {
    console.log("🔧 Testando importação do RDKit...");
    
    // Teste de importação
    const RDKit = await import("@rdkit/rdkit");
    console.log("✅ RDKit importado:", Object.keys(RDKit));
    
    // Teste de inicialização
    console.log("🔧 Tentando inicializar módulo...");
    const rdkitModule = await RDKit.default();
    
    console.log("✅ RDKit Module:", typeof rdkitModule);
    console.log("📋 Métodos disponíveis:", Object.getOwnPropertyNames(rdkitModule).filter(name => typeof rdkitModule[name] === 'function').slice(0, 15));
    
    // Teste com uma molécula simples (etanol)
    console.log("\n🧪 Testando com etanol (CCO)...");
    
    try {
      const mol = rdkitModule.get_mol("CCO");
      console.log("✅ Molécula criada:", typeof mol);
      
      if (mol && mol.is_valid()) {
        console.log("✅ Molécula válida!");
        
        // Testar métodos de propriedades
        const methods = [
          'get_molwt',
          'get_exact_mw', 
          'get_num_hbd',
          'get_num_hba',
          'get_num_rotatable_bonds',
          'get_numhbd',
          'get_numhba'
        ];
        
        for (const method of methods) {
          try {
            if (typeof mol[method] === 'function') {
              const value = mol[method]();
              console.log(`  ${method}(): ${value}`);
            }
          } catch (e) {
            console.log(`  ${method}(): ERRO - ${e.message}`);
          }
        }
        
        mol.delete();
      } else {
        console.log("❌ Molécula inválida");
      }
      
    } catch (molError) {
      console.error("❌ Erro ao criar molécula:", molError);
    }
    
  } catch (error) {
    console.error("❌ Erro:", error);
  }
};

testRDKit();
