import React from 'react';
import { Thermometer, Activity, Zap } from 'lucide-react';
import { GCU_LABELS } from '../types';

interface TelemetryCardProps {
  gcuId: number;
  maxTemp: number;
  avgTemp: number;
  isConnected: boolean;
}

export const TelemetryCard: React.FC<TelemetryCardProps> = ({ gcuId, maxTemp, avgTemp, isConnected }) => {
  const isWarning = maxTemp > 75.0; // Threshold from config
  const gcuName = GCU_LABELS[gcuId] || `GCU Desconocido (${gcuId})`;

  return (
    <div className={`p-6 rounded-xl border transition-all duration-500 ${
      isWarning 
        ? 'bg-red-950/20 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
        : 'bg-slate-900 border-slate-800 shadow-lg'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Unidad Activa
          </h2>
          <div className="text-2xl font-bold text-slate-100 mt-1">{isConnected ? gcuName : 'Esperando Flujo...'}</div>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-bold ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
          {isConnected ? 'EN VIVO' : 'DESCONECTADO'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1 text-slate-400 text-sm">
            <Thermometer className="w-4 h-4" />
            <span>Temp Máx</span>
          </div>
          <div className={`text-3xl font-mono font-bold ${isWarning ? 'text-red-500' : 'text-slate-100'}`}>
            {maxTemp.toFixed(1)}°C
          </div>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1 text-slate-400 text-sm">
            <Activity className="w-4 h-4" />
            <span>Temp Prom</span>
          </div>
          <div className="text-3xl font-mono font-bold text-slate-100">
            {avgTemp.toFixed(1)}°C
          </div>
        </div>
      </div>
      
      {isWarning && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm flex items-center gap-2 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          Alerta: Temperatura Alta Detectada
        </div>
      )}
    </div>
  );
};