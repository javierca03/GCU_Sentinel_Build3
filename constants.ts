export const API_BASE_URL = 'http://localhost:3000'; // Adjust if hosted on same origin
export const WS_URL = 'ws://localhost:3000/ws';

export const TEMP_THRESHOLD_WARNING = 75.0;

// Thermal Palette Generation (Ironbow style approximation)
// Maps 0-1 normalized value to RGB
export const getThermalColor = (value: number): [number, number, number] => {
  const v = Math.max(0, Math.min(1, value));
  // Simple heatmap: Blue -> Green -> Red
  // 0.0 - 0.25: Blue
  // 0.25 - 0.5: Cyan
  // 0.5 - 0.75: Yellow
  // 0.75 - 1.0: Red/White
  
  if (v < 0.25) return [0, 0, Math.floor(v * 4 * 255)];
  if (v < 0.5) return [0, Math.floor((v - 0.25) * 4 * 255), 255];
  if (v < 0.75) return [Math.floor((v - 0.5) * 4 * 255), 255, 255 - Math.floor((v - 0.5) * 4 * 255)];
  return [255, 255 - Math.floor((v - 0.75) * 4 * 255), 0];
};