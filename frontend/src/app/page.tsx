"use client";

import { SmilesInputForm } from "./components/SmilesInputForm";
import { Header } from "./components/Header";
import { ProofProgress } from "./components/ProofProgress";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, ExternalLink, Copy, Check } from "lucide-react";
import { generateProof, type ProofResult, type ProofProgress as ProofProgressType, type MoleculeData } from "./services/generateProof";

export default function Home() {
  const [result, setResult] = useState<ProofResult | null>(null);
  const [progress, setProgress] = useState<ProofProgressType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleGenerate = async (moleculeData: MoleculeData) => {
    setIsProcessing(true);
    setResult(null);
    setProgress(null);
    
    try {
      console.log("🚀 Starting proof generation for SMILES:", moleculeData.smiles);
      const result = await generateProof(moleculeData, setProgress);
      setResult(result);
    } catch (error) {
      console.error("Error generating the Proof:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Enhanced Header */}
      <Header />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          <SmilesInputForm 
            onGenerate={handleGenerate}
            isProcessing={isProcessing}
          />
        </motion.div>

        {/* Enhanced Progress Bar */}
        <AnimatePresence>
          {progress && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 max-w-6xl mx-auto"
            >
              <ProofProgress 
                progress={progress}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 max-w-6xl mx-auto"
            >
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                {result.success ? (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                    <div className="text-center">
                      <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                      <h3 className="text-3xl font-bold mb-2">
                        ZK Proof Successfully Generated!
                      </h3>
                      <p className="text-green-100">
                        Your proof has been verified and recorded on the zkVerify blockchain
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 text-white">
                    <div className="text-center">
                      <XCircle className="w-16 h-16 mx-auto mb-4" />
                      <h3 className="text-3xl font-bold mb-2">
                        Error in Proof Generation
                      </h3>
                      <p className="text-red-100">
                        There was a problem during the verification process
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {result.success ? (
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-6 rounded-2xl">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                          <ExternalLink className="w-5 h-5 mr-2" />
                          Transaction Details
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                              Transaction Hash:
                            </label>
                            <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border">
                              <code className="flex-1 text-sm text-gray-800 break-all font-mono">
                                {result.txHash}
                              </code>
                              <button
                                onClick={() => copyToClipboard(result.txHash || '', 'txHash')}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                {copied === 'txHash' ? 
                                  <Check className="w-4 h-4 text-green-500" /> : 
                                  <Copy className="w-4 h-4" />
                                }
                              </button>
                            </div>
                          </div>
                          
                          {result.explorer && (
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-2">
                                zkVerify Explorer:
                              </label>
                              <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border">
                                <a 
                                  href={result.explorer} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex-1 text-sm text-blue-600 hover:underline break-all font-mono"
                                >
                                  {result.explorer}
                                </a>
                                <ExternalLink className="w-4 h-4 text-blue-500" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
                      <h4 className="font-bold text-red-800 mb-2">Detalhes do Erro:</h4>
                      <p className="text-red-700">{result.error}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-center mt-16 text-sm text-gray-700"
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span>Powered by</span>
            <span className="font-semibold text-gray-800">Aztec Noir</span>
            <span>•</span>
            <span className="font-semibold text-gray-800">UltraPlonk</span>
            <span>•</span>
            <span className="font-semibold text-gray-800">zkVerify Blockchain</span>
          </div>
          <p className="text-xs text-gray-600">
            Zero-Knowledge Pharmaceutical Compliance Verification
          </p>
        </motion.div>
        
      </div>
    </div>
  );
}
