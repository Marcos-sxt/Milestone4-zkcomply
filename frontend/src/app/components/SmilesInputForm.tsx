'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Atom, FlaskConical, CheckCircle2, AlertTriangle, Sparkles, Copy, Check, Calculator, Info, Shield } from "lucide-react";
import { calculateMolecularProperties, TEST_MOLECULES, type CalculatedProperties } from '../../utils/rdkit';
import { MoleculeData } from '../services/generateProof';
import { LoadingSpinner } from './LoadingSpinner';

interface SmilesFormProps {
  onGenerate: (data: MoleculeData) => void;
  isProcessing: boolean;
}

export function SmilesInputForm({ onGenerate, isProcessing }: SmilesFormProps) {
  const [smiles, setSmiles] = useState("");
  const [properties, setProperties] = useState<CalculatedProperties | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleSmilesChange = async (newSmiles: string) => {
    setSmiles(newSmiles);
    setError(null);
    
    if (newSmiles.length < 3) {
      setProperties(null);
      return;
    }

    setIsCalculating(true);
    try {
      const props = await calculateMolecularProperties(newSmiles);
      setProperties(props);
    } catch (err: any) {
      setError(err.message);
      setProperties(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSubmit = () => {
    if (properties) {
      onGenerate({
        smiles, // Include original SMILES
        ...properties
      });
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const getComplianceStatus = (props: CalculatedProperties) => {
    const mw = props.molecular_weight <= 500 ? 1 : 0;
    const hbd = props.h_bond_donors <= 5 ? 1 : 0;
    const hba = props.h_bond_acceptors <= 10 ? 1 : 0;
    const rb = props.rotatable_bonds <= 10 ? 1 : 0;
    
    const compliance = mw * hbd * hba * rb;
    return compliance === 1;
  };

  const getComplianceText = (isCompliant: boolean) => {
    return isCompliant ? "✅ COMPLIANT" : "❌ NON-COMPLIANT";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto"
    >
      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <Atom className="w-8 h-8" />
            <h2 className="text-3xl font-bold">SMILES Input</h2>
            <FlaskConical className="w-8 h-8" />
          </div>
          <p className="text-blue-100 text-center">
            Enter a SMILES to automatically calculate molecular properties
          </p>
        </div>

        <div className="p-8">
          {/* SMILES Input */}
          <div className="mb-6">
            <label className="text-gray-800 mb-3 block text-left font-semibold text-lg">
              🧪 Molecule SMILES
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: CCO (ethanol) or CC(=O)OC1=CC=CC=C1C(=O)O (aspirin)"
                value={smiles}
                onChange={(e) => handleSmilesChange(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-200 text-lg"
                disabled={isProcessing}
              />
              {isCalculating && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <LoadingSpinner variant="molecule" />
                </div>
              )}
            </div>
          </div>

          {/* Example Molecules Gallery */}
          <div className="mb-8">
            <label className="text-gray-800 mb-4 block text-left font-semibold text-lg flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
              Example Molecules
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TEST_MOLECULES.map(mol => (
                <motion.button
                  key={mol.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSmilesChange(mol.smiles)}
                  className="group p-4 bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-gray-300 rounded-xl transition-all duration-200 text-left shadow-sm hover:shadow-md"
                  disabled={isProcessing || isCalculating}
                >
                  <div className="font-semibold text-gray-900 mb-1">{mol.name}</div>
                  <div className="text-xs text-gray-700 font-mono bg-white px-2 py-1 rounded border border-gray-200">
                    {mol.smiles.length > 20 ? mol.smiles.substring(0, 20) + '...' : mol.smiles}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(mol.smiles, mol.name);
                    }}
                    className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100"
                  >
                    {copied === mol.name ? 
                      <Check className="w-4 h-4 text-green-600" /> : 
                      <Copy className="w-4 h-4 text-gray-600 hover:text-gray-800" />
                    }
                  </button>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Status */}
          <AnimatePresence>
            {isCalculating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-6"
              >
                <div className="flex items-center justify-center space-x-3 text-blue-600">
                  <LoadingSpinner variant="molecule" />
                  <span className="text-lg font-medium">Calculating properties...</span>
                </div>
              </motion.div>
            )}
            
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6"
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Error:</span>
                </div>
                <p className="mt-1">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Calculated Properties */}
          <AnimatePresence>
            {properties && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 p-6 rounded-2xl shadow-sm mb-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 text-xl flex items-center">
                    <Calculator className="w-6 h-6 mr-2 text-green-600" />
                    Calculated Properties
                  </h3>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${
                    getComplianceStatus(properties)
                      ? 'bg-green-100 text-green-800 border-green-300' 
                      : 'bg-red-100 text-red-800 border-red-300'
                  }`}>
                    {getComplianceText(getComplianceStatus(properties))}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Molecular Weight</span>
                      <strong className="text-gray-900 text-lg">{properties.molecular_weight} Da</strong>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">H-Bond Donors</span>
                      <strong className="text-gray-900 text-lg">{properties.h_bond_donors}</strong>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">H-Bond Acceptors</span>
                      <strong className="text-gray-900 text-lg">{properties.h_bond_acceptors}</strong>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Rotatable Bonds</span>
                      <strong className="text-gray-900 text-lg">{properties.rotatable_bonds}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="text-sm text-blue-800 font-medium text-center">
                    <Info className="w-4 h-4 inline mr-2" />
                    <strong>Lipinski + Veber Rules:</strong> MW ≤ 500, HBD ≤ 5, HBA ≤ 10, RB ≤ 10
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!properties || isProcessing}
            className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold text-lg shadow-lg"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-3">
                <LoadingSpinner variant="zk" />
                <span>Generating ZK Proof...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <Shield className="w-6 h-6" />
                <span>Generate Compliance Proof</span>
              </div>
            )}
          </motion.button>

          {/* SMILES Display */}
          {smiles && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-6"
            >
              <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-xl">
                <span className="text-gray-600 font-medium">SMILES:</span>
                <code className="bg-white text-gray-800 px-3 py-1 rounded-lg font-mono text-sm">
                  {smiles}
                </code>
                <button
                  onClick={() => copyToClipboard(smiles, 'SMILES')}
                  className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-200 transition-colors"
                >
                  {copied === 'SMILES' ? 
                    <Check className="w-4 h-4 text-green-600" /> : 
                    <Copy className="w-4 h-4" />
                  }
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
