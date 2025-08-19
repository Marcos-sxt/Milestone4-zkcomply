import { toast } from "sonner";

// Define SSE types (adjust path as needed)
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
  smiles?: string;  // ← NEW optional field for SMILES
  molecular_weight: number;
  h_bond_donors: number;
  h_bond_acceptors: number;
  rotatable_bonds: number;
}

export const generateProof = async (
  moleculeData: MoleculeData,
  onProgress?: (progress: ProofProgress) => void
): Promise<ProofResult> => {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:3001";

  const steps = [
    "Configuring session...",
    "Loading circuit...",
    "Calculating compliance...",
    "Generating witness...",
    "Generating cryptographic proof...",
    "Generating verification key...",
    "Verifying proof locally...",
    "Submitting to blockchain..."
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
    updateProgress(steps[0], "Initializing ZK libraries...");
    const { UltraPlonkBackend } = await import("@aztec/bb.js");
    const { Noir } = await import("@noir-lang/noir_js");

    updateProgress(steps[1], "Loading circuit...");
    const res = await fetch("/circuit.json");
    const circuit = await res.json();
    const noir = new Noir(circuit);
    const backend = new UltraPlonkBackend(circuit.bytecode);

    updateProgress(steps[2], "Calculating compliance (Lipinski + Veber)...");
    
    // ✅ Log SMILES if provided
    if (moleculeData.smiles) {
      console.log("🧪 Processed SMILES:", moleculeData.smiles);
    }
    
    console.log("📊 Molecular properties:", {
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

    updateProgress(steps[3], "Generating witness...");
    
    // ✅ FIX: Convert to integers for Noir circuit
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

    updateProgress(steps[4], "Generating UltraPlonk proof...");
    const { proof, publicInputs } = await backend.generateProof(witness);
    console.log("🧪 Public Inputs before sending:", publicInputs);


    updateProgress(steps[5], "Generating verification key...");
    const vk = await backend.getVerificationKey();

    updateProgress(steps[6], "Verifying proof locally...");
    const verified = await backend.verifyProof({ proof, publicInputs });
    if (!verified) throw new Error("Local proof verification failed");

    console.log("✅ Local proof verified!");
    console.log("🔍 Public inputs:", publicInputs);
    console.log("📊 Compliance:", compliance_result === 1 ? "✅ COMPLIANT" : "❌ NON-COMPLIANT");

    updateProgress(steps[7], "Submitting to zkVerify...");

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
      toast.error("SSE server connection lost");
      eventSource.close();
    };

    // 🔧 NEW BLOCK: convert publicInputs to format expected by backend
    const formattedPublicInputs = publicInputs.map((input) => {
      const n = typeof input === "bigint" ? input : BigInt(input.toString());
      return '0x' + n.toString(16).padStart(64, '0');
    });

    // ✅ Now send the formatted publicInputs
    const response = await fetch(BACKEND, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proof: Array.from(proof),
        publicInputs: formattedPublicInputs,  // <--- CRITICAL FIX HERE
        vk: Array.from(vk)
      })
    });


    eventSource.close();

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP Error: ${errorText}`);
    }

    const result = await response.json();

    // ✅ FIX: Backend returns { status: "ok", txHash: "0x...", explorer: "https://..." }
    if (result.txHash && result.status === "ok") {
      const message = compliance_result === 1
        ? "✅ Compliant molecule successfully submitted!"
        : "⚠️ Non-compliant molecule, but proof submitted!";
      toast.success(message);

      console.log("🎉 zkVerify submission successful!");
      console.log("  - TX Hash:", result.txHash);
      console.log("  - Explorer:", result.explorer);

      return {
        success: true,
        txHash: result.txHash,
        explorer: result.explorer
      };
    } else {
      throw new Error("Invalid server response");
    }

  } catch (err: any) {
    toast.error("Error generating proof: " + err.message);
    console.error("💥", err);
    return {
      success: false,
      error: err.message
    };
  }
};
