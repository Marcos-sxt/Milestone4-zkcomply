// src/app/components/Header.tsx
"use client";

import { motion } from "framer-motion";
import { Shield, Atom, Zap } from "lucide-react";

export const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden"
    >
      {/* Background com gradiente */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600" />
      
      {/* Efeito glassmorphism */}
      <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-sm" />
      
      {/* Partículas flutuantes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + i * 10}%`,
            }}
          />
        ))}
      </div>
      
      {/* Conteúdo */}
      <div className="relative z-10 container mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-center space-x-3 mb-4"
        >
          <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-black tracking-tight drop-shadow-lg">
            ZK-COMPLY
          </h1>
          <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
            <Atom className="w-8 h-8 text-white" />
          </div>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl text-black mb-6 max-w-2xl mx-auto drop-shadow-md font-medium"
        >
          Zero-Knowledge Molecular Compliance Verification
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex items-center justify-center space-x-6 text-black font-medium"
        >
          <div className="flex items-center space-x-2">
            <Atom className="w-5 h-5 text-black" />
            <span className="text-black">SMILES Integration</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-black" />
            <span className="text-black">UltraPlonk Proofs</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-black" />
            <span className="text-black">zkVerify Blockchain</span>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
};
