import React from 'react';
import { SystemHealth } from '../types';
import { Server, Wifi, Clock, Cpu } from 'lucide-react';

interface StatusPanelProps {
  health: SystemHealth;
}

const StatusIndicator: React.FC<{ label: string; status: 'online' | 'offline'; icon: React.ReactNode }> = ({ label, status, icon }) => (
  <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded border border-slate-700/50">
    <div className={`p-2 rounded-full ${status === 'online' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-xs text-slate-500 font-semibold uppercase">{label}</span>
      <span className={`text-sm font-bold capitalize ${status === 'online' ? 'text-slate-200' : 'text-red-400'}`}>
        {status === 'online' ? 'En Línea' : 'Desconectado'}
      </span>
    </div>
  </div>
);

export const StatusPanel: React.FC<StatusPanelProps> = ({ health }) => {
  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
       <StatusIndicator 
         label="Flujo ZeroMQ" 
         status={health.zeromq_status} 
         icon={<Cpu className="w-4 h-4" />} 
       />
       <StatusIndicator 
         label="Control MQTT" 
         status={health.mqtt_status} 
         icon={<Wifi className="w-4 h-4" />} 
       />
       
       <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded border border-slate-700/50">
        <div className="p-2 rounded-full bg-blue-500/10 text-blue-400">
          <Clock className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 font-semibold uppercase">Tiempo Actividad</span>
          <span className="text-sm font-bold text-slate-200">{formatUptime(health.uptime_seconds)}</span>
        </div>
      </div>

       <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded border border-slate-700/50">
        <div className="p-2 rounded-full bg-indigo-500/10 text-indigo-400">
          <Server className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 font-semibold uppercase">Último Check</span>
          <span className="text-sm font-bold text-slate-200">{new Date(health.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};