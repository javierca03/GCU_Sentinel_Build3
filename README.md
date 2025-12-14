Monitor GCU Sentinel 🦅
![alt text](https://img.shields.io/badge/version-2.2-blue)
![alt text](https://img.shields.io/badge/status-active-success)
![alt text](https://img.shields.io/badge/react-typescript-blue)
Monitor GCU Sentinel es un panel de control en tiempo real diseñado para la supervisión termográfica y operativa de unidades de control (GCU) en turbinas eólicas Vestas V90.
El sistema procesa flujos de datos binarios de alta velocidad a través de WebSockets para renderizar matrices térmicas en vivo, permitiendo la detección temprana de sobrecalentamientos y la gestión de alertas del sistema.
🚀 Características Principales
Termografía en Tiempo Real: Visualización de matrices térmicas (Heatmaps) recibidas vía WebSocket.
Protocolo Binario Optimizado: Decodificación manual de tramas binarias (ArrayBuffer / DataView) para minimizar la latencia en la transmisión de datos de sensores.
Monitoreo de Salud del Sistema: Estado de conexión de servicios críticos (MQTT, ZeroMQ) y uptime del servidor.
Gestión de Alertas: Panel lateral para visualizar, gestionar y eliminar alertas críticas provenientes de la API REST.
Modo Simulación: Generador de datos sintéticos integrado para desarrollo y pruebas sin conexión al hardware real.
Interfaz Responsiva: Diseño moderno utilizando Tailwind CSS, optimizado para monitores de sala de control y dispositivos móviles.
🛠️ Stack Tecnológico
Frontend: React 18, TypeScript.
Estilos: Tailwind CSS.
Comunicación: WebSockets (Binario) & API REST.
Iconografía: Lucide React.
Visualización: Componentes personalizados (ThermalViewer) usando Float32Array.
📡 Protocolo de Datos (WebSocket)
El sistema utiliza un protocolo binario personalizado para la transmisión de telemetría térmica. La estructura de la trama (Little Endian) es la siguiente:
Byte Offset	Tipo de Dato	Descripción
0	uint8	Magic Byte (0xAF) - Validación de trama
1	uint8	ID de la GCU
2-9	uint64	Timestamp (ms)
10-13	float32	Temperatura Máxima
14-17	float32	Temperatura Promedio
18-21	uint32	Longitud del Payload (N píxeles)
22...End	float32[]	Matriz cruda de temperaturas (Píxeles)
Nota: Si el WebSocket se desconecta, la aplicación entra automáticamente en modo "Demo/Mock", generando un patrón de gradiente simulado para mantener la UI activa.
📦 Instalación y Despliegue
Clonar el repositorio:
code
Bash
git clone https://github.com/tu-usuario/monitor-gcu-sentinel.git
cd monitor-gcu-sentinel
Instalar dependencias:
code
Bash
npm install
Configuración:
Asegúrate de configurar las constantes en src/constants.ts (especialmente WS_URL para la conexión al backend).
Ejecutar en desarrollo:
code
Bash
npm run dev
📂 Estructura del Proyecto
code
Text
src/
├── components/
│   ├── AlertsList.tsx      # Panel lateral de alertas
│   ├── StatusPanel.tsx     # Footer con estado de MQTT/ZeroMQ
│   ├── TelemetryCard.tsx   # Tarjetas de estadísticas (Max/Avg Temp)
│   └── ThermalViewer.tsx   # Canvas/Grid para visualizar la matriz térmica
├── services/
│   └── api.ts              # Llamadas REST (fetchHealth, fetchAlerts)
├── types.ts                # Interfaces TypeScript (TelemetryFrame, SystemHealth)
├── constants.ts            # Configuración de URLs (WS_URL)
└── App.tsx                 # Lógica principal y manejo de WebSocket
