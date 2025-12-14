import React, { useEffect, useState, useRef, useCallback } from 'react';
import { TelemetryFrame, SystemHealth, Alert } from './types';
import { WS_URL } from './constants';
import { fetchHealth, fetchAlerts, deleteAlert, deleteAllAlerts } from './services/api';

import { ThermalViewer } from './components/ThermalViewer';
import { TelemetryCard } from './components/TelemetryCard';
import { AlertsList } from './components/AlertsList';
import { StatusPanel } from './components/StatusPanel';
import { Wind, RefreshCw, Wifi, WifiOff } from 'lucide-react';

const App: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryFrame>({
    gcuId: 0,
    timestamp: 0,
    maxTemp: 0,
    avgTemp: 0,
    payloadLen: 0,
    rawMatrix: new Float32Array(0)
  });

  const [health, setHealth] = useState<SystemHealth>({
    mqtt_status: 'offline',
    zeromq_status: 'offline',
    uptime_seconds: 0,
    timestamp: new Date().toISOString()
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // --- WebSocket Connection ---
  useEffect(() => {
    const connectWs = () => {
      const ws = new WebSocket(WS_URL);
      ws.binaryType = 'arraybuffer';

      ws.onopen = () => {
        setIsConnected(true);
        console.log('Conectado al flujo GCU Sentinel');
      };

      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(connectWs, 2000); // Reconnect
      };

      ws.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
          const view = new DataView(event.data);
          // 0: Magic Byte (0xAF)
          if (view.getUint8(0) !== 0xAF) return;

          const gcuId = view.getUint8(1);
          // Use BigInt for u64 timestamp (bytes 2-9)
          const ts = Number(view.getBigUint64(2, true)); 
          const maxTemp = view.getFloat32(10, true);
          const avgTemp = view.getFloat32(14, true);
          const payloadLen = view.getUint32(18, true);
          
          // Matrix starts at byte 22. Each pixel is f32 (4 bytes).
          // Ensure we have enough data
          if (event.data.byteLength >= 22 + payloadLen * 4) {
             const rawMatrix = new Float32Array(event.data.slice(22));
             setTelemetry({
               gcuId,
               timestamp: ts,
               maxTemp,
               avgTemp,
               payloadLen,
               rawMatrix
             });
          }
        }
      };
      
      wsRef.current = ws;
    };

    connectWs();

    // Mock Simulation for Demo if real backend isn't running
    const mockInterval = setInterval(() => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
             // Simulate telemetry for UI demonstration purposes
             const t = Date.now();
             const fakeLen = 160 * 120;
             // Generate a simple gradient matrix
             const fakeMatrix = new Float32Array(fakeLen);
             for(let i=0; i<fakeLen; i++) fakeMatrix[i] = 20 + Math.random() * 5 + (i/fakeLen)*40;
             
             setTelemetry({
                gcuId: (Math.floor(t / 5000) % 2) + 1, // switch every 5s
                timestamp: t,
                maxTemp: 65 + Math.random() * 10,
                avgTemp: 45 + Math.random() * 2,
                payloadLen: fakeLen,
                rawMatrix: fakeMatrix
             });
        }
    }, 100); // 10 FPS mock

    return () => {
      wsRef.current?.close();
      clearInterval(mockInterval);
    };
  }, []);

  // --- REST API Polling ---
  const loadData = useCallback(async () => {
    const healthData = await fetchHealth();
    setHealth(healthData);
    const alertsData = await fetchAlerts();
    setAlerts(alertsData);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [loadData]);

  const handleDeleteAlert = async (id: number) => {
    const success = await deleteAlert(id);
    if (success) loadData();
  };

  const handleDeleteAll = async () => {
    if (confirm("¿Estás seguro de que deseas eliminar TODAS las alertas?")) {
        const success = await deleteAllAlerts();
        if (success) loadData();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
               <Wind className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Monitor GCU Sentinel</h1>
              <p className="text-xs text-slate-400 font-mono">Core v2.2 // Vestas V90</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {/* Connection Status Indicator */}
             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                isConnected 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
             }`}>
                {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                {isConnected ? 'Transmisión Online' : 'Desconectado'}
             </div>

             <div className="hidden md:block text-right border-l border-slate-800 pl-4">
                <div className="text-xs text-slate-400">ID Turbina</div>
                <div className="font-mono font-bold text-slate-200">#104 (Parque 15)</div>
             </div>
             <button 
               onClick={loadData}
               className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white" 
               title="Actualizar Datos"
             >
               <RefreshCw className="w-5 h-5" />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live View (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Telemetry Stats */}
          <TelemetryCard 
             gcuId={telemetry.gcuId} 
             maxTemp={telemetry.maxTemp} 
             avgTemp={telemetry.avgTemp} 
             isConnected={isConnected || telemetry.timestamp > 0} 
          />

          {/* Thermal View */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Termografía en Vivo</h3>
            <ThermalViewer 
              rawMatrix={telemetry.rawMatrix} 
              payloadLen={telemetry.payloadLen} 
            />
          </div>

          {/* System Status Footer */}
          <StatusPanel health={health} />
        </div>

        {/* Right Column: Alerts (4 Cols) */}
        <div className="lg:col-span-4 h-[500px] lg:h-auto">
          <AlertsList 
            alerts={alerts} 
            onDelete={handleDeleteAlert} 
            onDeleteAll={handleDeleteAll}
          />
        </div>

      </main>
    </div>
  );
};

export default App;