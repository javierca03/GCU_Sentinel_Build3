export interface SystemHealth {
  mqtt_status: 'online' | 'offline';
  zeromq_status: 'online' | 'offline';
  uptime_seconds: number;
  timestamp: string;
}

export interface Alert {
  id: number;
  timestamp: string;
  gcu_id: number; // 1 or 2
  max_temp: number;
  image_path_complete: string;
  image_path_hotspot: string;
}

export interface TelemetryFrame {
  gcuId: number; // 1 = Left, 2 = Right
  timestamp: number;
  maxTemp: number;
  avgTemp: number;
  payloadLen: number;
  rawMatrix: Float32Array;
}

export interface Config {
  limits: {
    max_temp_warning: number;
    notification_cooldown_min: number;
  };
  turbine: {
    turbine_number: number;
    park_id: number;
  };
}

// Map logical IDs to Display Names
export const GCU_LABELS: Record<number, string> = {
  1: "GCU 1 (Izquierda)",
  2: "GCU 2 (Derecha)"
};