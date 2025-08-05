"use client";
import React, { useState } from "react";
import { generateProof, ProofProgress, ProofResult } from "../services/generateProof";
import { ProgressBar } from "./ProgressBar";
import { TransactionResult } from "./TransactionResult";

export function BirthdayForm() {
  // Estados para inputs farmacêuticos
  const [molecularWeight, setMolecularWeight] = useState("180");
  const [hBondDonors, setHBondDonors] = useState("1");
  const [hBondAcceptors, setHBondAcceptors] = useState("4");
  const [rotatableBonds, setRotatableBonds] = useState("3");
  
  const [isClicked, setIsClicked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProofProgress | null>(null);
  const [result, setResult] = useState<ProofResult | null>(null);

  const handleClick = async () => {
    setIsClicked(true);
    setIsProcessing(true);
    setProgress(null);
    setResult(null);
    
    // Parâmetros farmacêuticos
    const moleculeData = {
      molecular_weight: parseInt(molecularWeight),
      h_bond_donors: parseInt(hBondDonors),
      h_bond_acceptors: parseInt(hBondAcceptors),
      rotatable_bonds: parseInt(rotatableBonds)
    };
    
    const proofResult = await generateProof(moleculeData, (progressData) => {
      setProgress(progressData);
    });
    
    setResult(proofResult);
    setIsProcessing(false);
    
    setTimeout(() => setIsClicked(false), 200);
  };

  return (
    <div className="text-center">
      <h1 className="mb-8 font-mono text-4xl font-bold tracking-tight text-foreground/80 sm:text-6xl md:text-7xl">
        <span>🧬 ZK_COMPLY</span>
        <br />
        <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">UltraPlonk!</span>
      </h1>
      
      <div className="mb-6 text-lg text-foreground/70">
        Prova Zero-Knowledge de Compliance Farmacêutica
      </div>

      <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
        {/* Molecular Weight */}
        <div className="w-full">
          <label htmlFor="mw" className="text-foreground/80 mb-1 block text-left">
            Peso Molecular (Da)
          </label>
          <input
            id="mw"
            type="number"
            value={molecularWeight}
            onChange={(e) => setMolecularWeight(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-foreground/20 bg-background"
            disabled={isProcessing}
            placeholder="180"
          />
        </div>

        {/* H-Bond Donors */}
        <div className="w-full">
          <label htmlFor="hbd" className="text-foreground/80 mb-1 block text-left">
            Doadores de H
          </label>
          <input
            id="hbd"
            type="number"
            value={hBondDonors}
            onChange={(e) => setHBondDonors(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-foreground/20 bg-background"
            disabled={isProcessing}
            placeholder="1"
          />
        </div>

        {/* H-Bond Acceptors */}
        <div className="w-full">
          <label htmlFor="hba" className="text-foreground/80 mb-1 block text-left">
            Aceptores de H
          </label>
          <input
            id="hba"
            type="number"
            value={hBondAcceptors}
            onChange={(e) => setHBondAcceptors(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-foreground/20 bg-background"
            disabled={isProcessing}
            placeholder="4"
          />
        </div>

        {/* Rotatable Bonds */}
        <div className="w-full">
          <label htmlFor="rb" className="text-foreground/80 mb-1 block text-left">
            Ligações Rotacionáveis
          </label>
          <input
            id="rb"
            type="number"
            value={rotatableBonds}
            onChange={(e) => setRotatableBonds(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-foreground/20 bg-background"
            disabled={isProcessing}
            placeholder="3"
          />
        </div>

        <button
          type="button"
          onClick={handleClick}
          disabled={isProcessing}
          className={`w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold transition-all duration-150 ${
            isClicked ? "scale-95" : "scale-100"
          } ${
            isProcessing 
              ? "opacity-50 cursor-not-allowed" 
              : "hover:opacity-90 hover:scale-105"
          }`}
        >
          {isProcessing ? "Gerando Prova ZK..." : "Gerar Prova de Compliance"}
        </button>
        
        <div className="text-sm text-foreground/60 mt-2">
          Limites Lipinski: MW≤500, HBD≤5, HBA≤10, RB≤10
        </div>
      </div>

      {/* Barra de Progresso */}
      <ProgressBar
        currentStep={progress?.currentStep || 0}
        totalSteps={progress?.totalSteps || 8}
        currentStepName={progress?.stepName || ""}
        isVisible={isProcessing}
      />

      {/* Resultado da Transação */}
      {result && result.success && result.txHash && (
        <TransactionResult
          txHash={result.txHash}
          isVisible={true}
        />
      )}

      {/* Erro */}
      {result && !result.success && (
        <div className="w-full max-w-md mx-auto p-6 bg-red-50 border border-red-200 rounded-lg mt-6">
          <div className="text-center">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Erro ao Processar
            </h3>
            <p className="text-sm text-red-700">
              {result.error || "Ocorreu um erro inesperado"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
