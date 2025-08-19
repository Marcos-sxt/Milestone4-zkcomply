// src/app/components/LoadingSpinner.tsx
"use client";

import { motion } from "framer-motion";
import { Loader2, Atom, Zap, Shield } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "molecule" | "zk" | "shield";
  className?: string;
}

export const LoadingSpinner = ({ 
  size = "md", 
  variant = "default",
  className = "" 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  const iconMap = {
    default: Loader2,
    molecule: Atom,
    zk: Zap,
    shield: Shield
  };

  const Icon = iconMap[variant];

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ 
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
      className={`${sizeClasses[size]} ${className}`}
    >
      <Icon className="w-full h-full text-blue-500" />
    </motion.div>
  );
};

// Componente de loading com texto
export const LoadingWithText = ({ 
  text, 
  variant = "default" 
}: { 
  text: string;
  variant?: "default" | "molecule" | "zk" | "shield";
}) => {
  return (
    <div className="flex items-center space-x-3">
      <LoadingSpinner variant={variant} />
      <span className="text-gray-600 animate-pulse">{text}</span>
    </div>
  );
};

// Loading para tela inteira
export const FullPageLoading = ({ message = "Processando..." }: { message?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center z-50"
    >
      <div className="text-center">
        <LoadingSpinner size="lg" variant="molecule" className="mx-auto mb-4" />
        <p className="text-lg text-gray-700 font-medium">{message}</p>
      </div>
    </motion.div>
  );
};
