// generateProof.ts

import { toast } from "sonner";

// Defina os tipos de SSE (ajuste o path conforme seu projeto)
export enum MessageTypeSSE {
  INFO = "info",
  SUCCESS = "success",
  ERROR = "error",
}

export interface MessageSSE {
  type: MessageTypeSSE;
  message: string;
}

export interface ProofProgress {
  currentStep: number;
  totalSteps: number;
  stepName: string;
  message: string;
}

export interface ProofResult {
  success: boolean;
  txHash?: string;
  explorer?: string;
  error?: string;
}

export interface MoleculeData {
  smiles?: string;  // ← NOVO campo opcional para SMILES
  molecular_weight: number;
  h_bond_donors: number;
  h_bond_acceptors: number;
  rotatable_bonds: number;
}

export const generateProof = async (
  moleculeData: MoleculeData,
  onProgress?: (progress: ProofProgress) => void
): Promise<ProofResult> => {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "https://milestone4-zkcomply.onrender.com";

  const steps = [
    "Configurando sessão...",
    "Carregando circuito...",
    "Calculando compliance...",
    "Gerando witness...",
    "Gerando prova criptográfica...",
    "Gerando chave de verificação...",
    "Verificando prova localmente...",
    "Submetendo para blockchain..."
  ];

  let currentStep = 0;
  const updateProgress = (stepName: string, message: string) => {
    currentStep++;
    onProgress?.({
      currentStep,
      totalSteps: steps.length,
      stepName,
      message
    });
  };

  try {
    updateProgress(steps[0], "Inicializando bibliotecas ZK...");
    const { UltraPlonkBackend } = await import("@aztec/bb.js");
    const { Noir } = await import("@noir-lang/noir_js");

    updateProgress(steps[1], "Carregando circuito...");
    const res = await fetch("/circuit.json");
    const circuit = await res.json();
    const noir = new Noir(circuit);
    const backend = new UltraPlonkBackend(circuit.bytecode);

    updateProgress(steps[2], "Calculando compliance (Lipinski + Veber)...");
    
    // ✅ Log SMILES se fornecido
    if (moleculeData.smiles) {
      console.log("🧪 SMILES processado:", moleculeData.smiles);
    }
    
    console.log("📊 Propriedades moleculares:", {
      MW: moleculeData.molecular_weight,
      HBD: moleculeData.h_bond_donors,
      HBA: moleculeData.h_bond_acceptors,
      RB: moleculeData.rotatable_bonds
    });
    
    const thresholds = {
      max_molecular_weight: 500,
      max_h_donors: 5,
      max_h_acceptors: 10,
      max_rotatable_bonds: 10
    };

    const mw = moleculeData.molecular_weight <= thresholds.max_molecular_weight ? 1 : 0;
    const hbd = moleculeData.h_bond_donors <= thresholds.max_h_donors ? 1 : 0;
    const hba = moleculeData.h_bond_acceptors <= thresholds.max_h_acceptors ? 1 : 0;
    const rb  = moleculeData.rotatable_bonds <= thresholds.max_rotatable_bonds ? 1 : 0;

    const compliance_result = mw * hbd * hba * rb;

    updateProgress(steps[3], "Gerando witness...");
    
    // ✅ CORREÇÃO: Converter para inteiros para o circuito Noir
    const witnessInput = {
      molecular_weight: Math.round(moleculeData.molecular_weight), // Convert to integer
      h_bond_donors: Math.round(moleculeData.h_bond_donors),
      h_bond_acceptors: Math.round(moleculeData.h_bond_acceptors),
      rotatable_bonds: Math.round(moleculeData.rotatable_bonds),
      max_molecular_weight: thresholds.max_molecular_weight,
      max_h_donors: thresholds.max_h_donors,
      max_h_acceptors: thresholds.max_h_acceptors,
      max_rotatable_bonds: thresholds.max_rotatable_bonds,
      compliance_result
    };
    
    console.log("🔧 Witness input (integers):", witnessInput);
    
    const { witness } = await noir.execute(witnessInput);

    updateProgress(steps[4], "Gerando prova UltraPlonk...");
    const { proof, publicInputs } = await backend.generateProof(witness);
    console.log("🧪 Public Inputs antes do envio:", publicInputs);


    updateProgress(steps[5], "Gerando chave de verificação...");
    const vk = await backend.getVerificationKey();

    updateProgress(steps[6], "Verificando prova localmente...");
    const verified = await backend.verifyProof({ proof, publicInputs });
    if (!verified) throw new Error("Falha na verificação local da prova");

    console.log("✅ Prova local verificada!");
    console.log("🔍 Public inputs:", publicInputs);
    console.log("📊 Compliance:", compliance_result === 1 ? "✅ COMPLIANT" : "❌ NON-COMPLIANT");

    updateProgress(steps[7], "Submetendo para zkVerify...");

    const eventSource = new EventSource(BACKEND);
    eventSource.onmessage = (event) => {
      const data: MessageSSE = JSON.parse(event.data);
      switch (data.type) {
        case MessageTypeSSE.INFO:
          toast.info(data.message); break;
        case MessageTypeSSE.SUCCESS:
          toast.success(data.message); break;
        case MessageTypeSSE.ERROR:
          toast.error(data.message); break;
      }
    };
    eventSource.onerror = () => {
      toast.error("Conexão com servidor SSE perdida");
      eventSource.close();
    };

    // 🔧 NOVO BLOCO: converte publicInputs para formato esperado pelo backend
    const formattedPublicInputs = publicInputs.map((input) => {
      const n = typeof input === "bigint" ? input : BigInt(input.toString());
      return '0x' + n.toString(16).padStart(64, '0');
    });

    // ✅ Agora envia os publicInputs formatados
    const response = await fetch(BACKEND, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proof: Array.from(proof),
        publicInputs: formattedPublicInputs,  // <--- AQUI É O AJUSTE CRÍTICO
        vk: Array.from(vk)
      })
    });


    eventSource.close();

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro HTTP: ${errorText}`);
    }

    const result = await response.json();

    // ✅ CORREÇÃO: Backend retorna { status: "ok", txHash: "0x...", explorer: "https://..." }
    if (result.txHash && result.status === "ok") {
      const message = compliance_result === 1
        ? "✅ Molecula compatível submetida com sucesso!"
        : "⚠️ Molecula não compatível, mas prova enviada!";
      toast.success(message);

      console.log("🎉 Submissão zkVerify bem-sucedida!");
      console.log("  - TX Hash:", result.txHash);
      console.log("  - Explorer:", result.explorer);

      return {
        success: true,
        txHash: result.txHash,
        explorer: result.explorer
      };
    } else {
      throw new Error("Resposta inválida do servidor");
    }

  } catch (err: any) {
    toast.error("Erro ao gerar prova: " + err.message);
    console.error("💥", err);
    return {
      success: false,
      error: err.message
    };
  }
};
