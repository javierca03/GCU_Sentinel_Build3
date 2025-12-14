import React, { useEffect, useRef } from 'react';
import { getThermalColor, TEMP_THRESHOLD_WARNING } from '../constants';

interface ThermalViewerProps {
  rawMatrix: Float32Array | null;
  payloadLen: number;
}

export const ThermalViewer: React.FC<ThermalViewerProps> = ({ rawMatrix, payloadLen }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const minLabelRef = useRef<HTMLDivElement>(null);
  const maxLabelRef = useRef<HTMLDivElement>(null);
  const thresholdRef = useRef<HTMLDivElement>(null);
  
  // Tiny1-C resolution usually around 160x120 or similar, but let's assume square logic or 4:3 
  // based on payload size if unknown. For this code, we'll auto-calculate aspect ratio 
  // assuming a standard width if possible, or just square root for simplicity if metadata is missing.
  // Standard Tiny1-C is 160x120 = 19200 pixels.
  
  useEffect(() => {
    if (!rawMatrix || !canvasRef.current || payloadLen === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Determine dimensions. 
    // If payloadLen is 19200, it's 160x120.
    // If payloadLen is 49152, it's 256x192.
    let width = 160;
    let height = 120;
    
    if (payloadLen === 19200) { width = 160; height = 120; }
    else if (payloadLen === 49152) { width = 256; height = 192; }
    else {
        // Fallback to square
        width = Math.ceil(Math.sqrt(payloadLen));
        height = Math.ceil(payloadLen / width);
    }

    canvasRef.current.width = width;
    canvasRef.current.height = height;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    // Find min/max for dynamic scaling or use fixed range (0-100C)
    // Dynamic scaling provides better contrast.
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < rawMatrix.length; i++) {
        if (rawMatrix[i] < min) min = rawMatrix[i];
        if (rawMatrix[i] > max) max = rawMatrix[i];
    }

    // Update overlay labels directly
    if (minLabelRef.current) minLabelRef.current.innerText = `${min.toFixed(1)}°C`;
    if (maxLabelRef.current) maxLabelRef.current.innerText = `${max.toFixed(1)}°C`;

    // Handle Threshold Indicator
    if (thresholdRef.current) {
        if (TEMP_THRESHOLD_WARNING >= min && TEMP_THRESHOLD_WARNING <= max) {
            const range = max - min || 1;
            const pct = (TEMP_THRESHOLD_WARNING - min) / range;
            thresholdRef.current.style.display = 'flex';
            thresholdRef.current.style.bottom = `${pct * 100}%`;
        } else {
             thresholdRef.current.style.display = 'none';
        }
    }
    
    // Avoid division by zero
    const range = max - min || 1;

    for (let i = 0; i < rawMatrix.length; i++) {
      const temp = rawMatrix[i];
      // Normalize 0..1
      const normalized = (temp - min) / range;
      const [r, g, b] = getThermalColor(normalized);
      
      const idx = i * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255; // Alpha
    }

    ctx.putImageData(imageData, 0, 0);

  }, [rawMatrix, payloadLen]);

  return (
    <div className="relative w-full aspect-[4/3] bg-black rounded-lg overflow-hidden border-2 border-slate-800 shadow-inner group">
       {!rawMatrix && (
         <div className="absolute inset-0 flex items-center justify-center text-slate-600 flex-col gap-2">
            <div className="w-8 h-8 border-2 border-slate-600 border-t-slate-400 rounded-full animate-spin"></div>
            <span className="text-xs uppercase tracking-widest font-semibold">Esperando Datos Térmicos</span>
         </div>
       )}
       <canvas 
         ref={canvasRef} 
         className="w-full h-full object-contain image-pixelated"
         style={{ imageRendering: 'pixelated' }}
       />
       {/* Overlay Grid */}
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10 pointer-events-none"></div>
       <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-xs text-slate-300 rounded font-mono">
          Termografía en Tiempo Real
       </div>

       {/* Temperature Legend & Thresholds */}
       <div className="absolute right-4 top-6 bottom-6 w-3 bg-slate-900/80 rounded-full border border-slate-700/50 backdrop-blur-sm shadow-xl z-10 flex flex-col items-center">
          {/* Gradient Bar: Black -> Blue -> Cyan -> Yellow -> Red */}
          <div className="w-1.5 h-full rounded-full" style={{ background: 'linear-gradient(to top, #000000, #0000ff, #00ffff, #ffff00, #ff0000)' }}></div>
          
          {/* Labels */}
          <div ref={maxLabelRef} className="absolute -top-5 right-0 text-[10px] font-mono font-bold text-slate-200 bg-slate-900/80 px-1.5 py-0.5 rounded shadow-sm">--°C</div>
          <div ref={minLabelRef} className="absolute -bottom-5 right-0 text-[10px] font-mono font-bold text-slate-200 bg-slate-900/80 px-1.5 py-0.5 rounded shadow-sm">--°C</div>
       </div>

       {/* Critical Threshold Marker */}
       <div 
         ref={thresholdRef}
         className="absolute left-2 right-4 flex items-center justify-end z-20 pointer-events-none transition-all duration-100 ease-linear"
         style={{ display: 'none', bottom: '50%' }}
       >
         <div className="flex-1 border-t border-dashed border-red-500/80 mr-1 shadow-[0_1px_2px_rgba(0,0,0,0.8)]"></div>
         <div className="text-[9px] font-bold text-white bg-red-600 px-1.5 py-0.5 rounded-full shadow-lg border border-red-400 flex items-center gap-1">
            <span>⚠️</span>
            {TEMP_THRESHOLD_WARNING}°C
         </div>
       </div>

    </div>
  );
};