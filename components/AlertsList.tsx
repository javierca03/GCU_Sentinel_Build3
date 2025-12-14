import React from 'react';
import { Alert, GCU_LABELS } from '../types';
import { AlertTriangle, Trash2, Calendar, HardDrive } from 'lucide-react';
import { API_BASE_URL } from '../constants';

interface AlertsListProps {
  alerts: Alert[];
  onDelete: (id: number) => void;
  onDeleteAll: () => void;
}

export const AlertsList: React.FC<AlertsListProps> = ({ alerts, onDelete, onDeleteAll }) => {
  if (alerts.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 border border-slate-800 border-dashed rounded-xl">
        <HardDrive className="w-12 h-12 mb-2 opacity-50" />
        <p>No hay alertas registradas en la base de datos.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Alertas Recientes ({alerts.length})
        </h3>
        <button 
          onClick={onDeleteAll}
          className="text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 px-3 py-1.5 rounded transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          Borrar Todo
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors flex gap-4">
            
            {/* Minimalist GCU Vector Symbol */}
            <div className="w-24 h-24 shrink-0 bg-slate-900 rounded border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden group">
               {/* Cabinet Enclosure */}
               <div className="w-12 h-16 border-2 border-slate-600 rounded-sm bg-slate-800 flex flex-col items-center pt-2 gap-1 relative shadow-sm">
                  {/* Digital Display */}
                  <div className="w-8 h-4 bg-emerald-950 border border-slate-600 rounded-[1px] flex items-center justify-center">
                    <div className="w-4 h-0.5 bg-emerald-500/50 rounded-full"></div>
                  </div>
                  {/* Control Panel Grid */}
                  <div className="grid grid-cols-2 gap-1 mt-1">
                     <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                     <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                     <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                     <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                  </div>
                  {/* Vents at bottom */}
                  <div className="mt-auto mb-1 flex flex-col gap-[2px]">
                     <div className="w-8 h-[1px] bg-slate-700"></div>
                     <div className="w-8 h-[1px] bg-slate-700"></div>
                     <div className="w-8 h-[1px] bg-slate-700"></div>
                  </div>
               </div>

               {/* Temp Overlay */}
               <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] px-1.5 py-0.5 font-bold rounded-bl">
                 {Math.round(alert.max_temp)}°C
               </div>
            </div>
            
            <div className="flex-1 min-w-0">
               <div className="flex justify-between items-start">
                 <h4 className="font-medium text-slate-200 truncate">{GCU_LABELS[alert.gcu_id]}</h4>
                 <button onClick={() => onDelete(alert.id)} className="text-slate-600 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                 </button>
               </div>
               
               <div className="mt-2 text-xs text-slate-400 flex flex-col gap-1">
                 <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(alert.timestamp).toLocaleString('es-ES')}
                 </div>
                 <div className="flex items-center gap-1.5 text-amber-500/80">
                    <AlertTriangle className="w-3 h-3" />
                    Umbral Temp Máx Excedido
                 </div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};