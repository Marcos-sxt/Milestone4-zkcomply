"use client";

import { motion } from "framer-motion";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { ProofProgress as ProofProgressType } from "../services/generateProof";

interface ProofProgressProps {
  progress: ProofProgressType;
  isCompleted?: boolean;
  hasError?: boolean;
}

export const ProofProgress = ({ progress, isCompleted = false, hasError = false }: ProofProgressProps) => {
  const { currentStep, totalSteps, stepName, message } = progress;
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
    >
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Generating ZK Proof
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>{currentStep}</span>
          <span>/</span>
          <span>{totalSteps}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{stepName}</span>
          <span className="text-sm text-gray-500">{Math.round(progressPercentage)}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Current Status */}
      <div className="flex items-center space-x-3">
        {hasError ? (
          <AlertCircle className="w-5 h-5 text-red-500" />
        ) : isCompleted ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <Check className="w-5 h-5 text-green-500" />
          </motion.div>
        ) : (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-5 h-5 text-blue-500" />
          </motion.div>
        )}
        
        <span className={`text-sm ${
          hasError ? 'text-red-600' : 
          isCompleted ? 'text-green-600' : 
          'text-gray-600'
        }`}>
          {message}
        </span>
      </div>

      {/* Steps visualization */}
      <div className="mt-6 grid grid-cols-4 gap-2">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepIndex = index + 1;
          const isActive = stepIndex === currentStep;
          const isComplete = stepIndex < currentStep;
          const isFuture = stepIndex > currentStep;

          return (
            <motion.div
              key={stepIndex}
              className={`h-2 rounded-full ${
                isComplete ? 'bg-green-500' :
                isActive ? 'bg-blue-500' :
                'bg-gray-200'
              }`}
              initial={{ scale: 0.8 }}
              animate={{ 
                scale: isActive ? 1.1 : 1,
                opacity: isFuture ? 0.5 : 1
              }}
              transition={{ duration: 0.3 }}
            />
          );
        })}
      </div>
    </motion.div>
  );
};
