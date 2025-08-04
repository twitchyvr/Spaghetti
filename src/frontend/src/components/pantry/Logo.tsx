import React from 'react';
import { Sparkles } from 'lucide-react';

export const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg" style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
        backdropFilter: 'blur(10px)'
      }}>
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-white">Spaghetti</h1>
        <p className="text-sm text-white/80">Enterprise Platform</p>
      </div>
    </div>
  );
};