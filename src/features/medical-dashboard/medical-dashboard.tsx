import "./medical-dashboard.css";
import { useState, useEffect } from "react";
import { Badge } from "../../components/ui/badge";
import { Heart, Thermometer, Wind, Weight, Activity, User, LogOut, UserCircle, Copy, Check, FileSpreadsheet, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { getAllSensorDataForExport } from "../../services/firebase";
import { HRChart } from "../../components/charts/hr-chart";
import { BPChartNew } from "../../components/charts/bp-chart-new";
import { WeightChartNew } from "../../components/charts/weight-chart-new";
import { SpO2Chart } from "../../components/charts/spo2-chart";
import { BluetoothStatus } from "../../components/BluetoothStatus";
import useBluetooth from "../../hooks/useBluetooth";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../../components/ui/dropdown-menu";

// Tipo para datos históricos
type HistoricalDataPoint = {
  date: string;
  heartRate: number;
  systolic: number;
  diastolic: number;
  spo2: number;
  temperature: number;
  weight: number;
};

// Timestamps de cuándo se actualizó cada vital
type VitalTimestamps = {
  heartRate: number | null;
  bloodPressure: number | null;
  spo2: number | null;
  temperature: number | null;
  weight: number | null;
};

interface MedicalDashboardProps {
  data: {
    heartRate: number;
    temperatura: number;
    spo2: number;
    peso: number;
    presionSistolica: number;
    presionDiastolica: number;
  };
  lastVitals: {
    heartRate: number;
    systolic: number;
    diastolic: number;
    spo2: number;
    temperature: number;
    weight: number;
  };
  vitalTimestamps: VitalTimestamps;
  historicalData: HistoricalDataPoint[];
  isLoadingHistory: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onLogout?: () => void;
  username?: string;
  uid?: string;
}

/**
 * Dashboard visual principal de Code4.
 * Recibe los datos ya cargados desde Firebase.
 */
export default function MedicalDashboard({
  data,
  lastVitals,
  vitalTimestamps,
  historicalData,
  isLoadingHistory,
  isRefreshing = false,
  onRefresh,
  onLogout,
  username,
  uid
}: MedicalDashboardProps) {
  const {
    heartRate,
    temperatura,
    spo2,
    peso,
    presionSistolica,
    presionDiastolica,
  } = data;

  // Estado para el reloj
  const [currentTime, setCurrentTime] = useState(new Date());

  // Estado para el botón de copiar UID
  const [copied, setCopied] = useState(false);

  // Estado para la exportación de datos
  const [isExporting, setIsExporting] = useState(false);

  // Hook de Bluetooth
  const { status: bluetoothStatus, connectBLE, disconnectBLE, uid: bluetoothUID } = useBluetooth();

  // Actualizar reloj cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Función para truncar el UID
  const truncateUID = (uid: string) => {
    if (!uid || uid === "Sin conexión") return uid;
    if (uid.length <= 12) return uid;
    return `${uid.slice(0, 6)}...${uid.slice(-6)}`;
  };

  // Función para copiar UID al portapapeles
  const copyUID = async () => {
    if (!uid || uid === "Sin conexión") return;
    try {
      await navigator.clipboard.writeText(uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar UID:', err);
    }
  };

  // Función para exportar datos a Excel
  const handleExportToExcel = async () => {
    // Obtener userUUID desde localStorage
    const userUUID = localStorage.getItem("userUUID");
    const deviceUID = uid || localStorage.getItem("deviceUID");

    if (!userUUID || !deviceUID) {
      console.error("❌ No se puede exportar: falta userUUID o deviceUID");
      alert("No hay datos disponibles para exportar. Asegúrate de estar conectado.");
      return;
    }

    setIsExporting(true);
    try {
      console.log("📊 Iniciando exportación de datos...");
      const data = await getAllSensorDataForExport(userUUID, deviceUID);

      if (data.length === 0) {
        alert("No hay datos de sensores para exportar.");
        setIsExporting(false);
        return;
      }

      // Crear workbook y worksheet
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Datos de Sensores");

      // Ajustar ancho de columnas
      const colWidths = [
        { wch: 20 }, // uid_usuario
        { wch: 12 }, // fecha
        { wch: 10 }, // hora
        { wch: 12 }, // zona_horaria
        { wch: 20 }, // sensor
        { wch: 10 }, // valor_1
        { wch: 10 }, // unidad_1
        { wch: 10 }, // valor_2
        { wch: 10 }, // unidad_2
        { wch: 35 }, // updatedAt_text
        { wch: 20 }, // observaciones
      ];
      ws["!cols"] = colWidths;

      // Generar nombre del archivo con fecha
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0];
      const fileName = `Minthy_Datos_${username || "usuario"}_${dateStr}.xlsx`;

      // Descargar archivo
      XLSX.writeFile(wb, fileName);
      console.log(`✅ Archivo exportado: ${fileName}`);
    } catch (error) {
      console.error("❌ Error exportando datos:", error);
      alert("Error al exportar los datos. Intenta de nuevo.");
    } finally {
      setIsExporting(false);
    }
  };

  // Obtener las iniciales del usuario para el avatar
  const getUserInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Formatear timestamp a fecha DD/MM/YY
  const formatVitalDate = (timestamp: number | null): string => {
    if (!timestamp) return "--/--/--";
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  // Formatear timestamp a hora hh:mm:ss
  const formatVitalTime = (timestamp: number | null): string => {
    if (!timestamp) return "--:--:--";
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // Estado de conexión basado en Bluetooth
  const isConnected = bluetoothStatus === 'connected';

  // Handlers para Bluetooth
  const handleSearchBluetooth = async () => {
    console.log("🔍 Buscando dispositivos Bluetooth...");
    await connectBLE();
  };

  const handleDisconnectBluetooth = () => {
    console.log("⏏️ Desconectando dispositivo Bluetooth...");
    disconnectBLE();
  };

  return (
    <div className="mx-auto w-full space-y-6">
      {/* Header con gradiente teal */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl px-8 py-6 shadow-lg" style={{ marginBottom: '24px' }}>
        <div className="flex items-center justify-between">
          <div style={{
            backgroundColor: '#FAF9F6',
            borderRadius: '18px',
            padding: '14px 24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3" style={{ color: '#003B73', margin: 0 }}>
              <img
                src="/monitoreo.png"
                alt="Monitoreo"
                style={{ width: '34px', height: '34px', objectFit: 'contain' }}
              />
              Monitoreo clínico en tiempo real
            </h1>
          </div>
          <div className="flex items-center" style={{ gap: '10px' }}>
            {/* Indicador Bluetooth */}
            <BluetoothStatus
              state={bluetoothStatus === 'connecting' ? 'searching' : (isConnected ? 'connected' : 'disconnected')}
              deviceName={isConnected && bluetoothUID ? bluetoothUID : undefined}
              onSearch={handleSearchBluetooth}
              onDisconnect={handleDisconnectBluetooth}
            />

            {/* Reloj Digital tipo Display 7-Segment */}
            <div
              style={{
                backgroundColor: 'rgba(240, 248, 255, 0.75)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '10px 24px',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '160px'
              }}
            >
              <span
                className="tabular-nums"
                style={{
                  fontSize: '20px',
                  color: '#334155',
                  letterSpacing: '2px',
                  fontVariantNumeric: 'tabular-nums',
                  fontFeatureSettings: '"tnum"',
                  lineHeight: '1',
                  fontFamily: '"SevenSeg", "DS-Digital", "Digital-7", "DSEG7", "Segment7", "Courier New", Courier, monospace',
                  fontWeight: 700,
                  textShadow: '0 0 1px rgba(51, 65, 85, 0.3)',
                  WebkitFontSmoothing: 'antialiased',
                  transform: 'scaleY(1.1)'
                }}
              >
                {formatTime(currentTime)}
              </span>
            </div>

            {/* Separador visual */}
            <div style={{ height: '36px', width: '2px', backgroundColor: 'rgba(255, 255, 255, 0.6)' }}></div>

            {/* Dropdown de Usuario - Badge Mejorado */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-transparent hover:bg-white/10 active:bg-white/15 transition-all duration-200 border-0 outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  style={{ outline: 'none' }}
                >
                  {/* Avatar mejorado con ring y sombra */}
                  <div
                    className="flex items-center justify-center text-white text-xs font-semibold"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {getUserInitials(username || undefined)}
                  </div>
                  {/* Nombre con estilo limpio - OCULTO */}
                  <span className="text-sm font-medium text-white" style={{ display: 'none' }}>{username || "Usuario"}</span>
                  {/* Chevron con transición - OCULTO */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white/70 transition-transform duration-200"
                    style={{ opacity: 0, display: 'none' }}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                style={{
                  minWidth: '280px',
                  borderRadius: '12px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                  padding: '8px 0',
                  backgroundColor: '#ffffff',
                  zIndex: 9999,
                }}
              >
                {/* Header del usuario */}
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px 8px 0 0',
                    marginBottom: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: 600
                      }}
                    >
                      {getUserInitials(username || undefined)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        marginBottom: '2px'
                      }}>
                        {username || "Usuario"}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: '#22c55e',
                            display: 'inline-block'
                          }}
                        />
                        Conectado
                      </p>
                    </div>
                  </div>
                </div>

                {/* Item: Exportar datos */}
                <DropdownMenuItem
                  onClick={handleExportToExcel}
                  disabled={isExporting}
                  style={{
                    padding: '12px 16px',
                    minHeight: '44px',
                    cursor: isExporting ? 'wait' : 'pointer',
                    margin: '0 4px',
                    borderRadius: '8px',
                    opacity: isExporting ? 0.7 : 1
                  }}
                >
                  {isExporting ? (
                    <Loader2 style={{ width: '20px', height: '20px', color: '#6b7280', marginRight: '12px', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <FileSpreadsheet style={{ width: '20px', height: '20px', color: '#6b7280', marginRight: '12px' }} />
                  )}
                  <span style={{ fontSize: '14px', color: '#374151' }}>
                    {isExporting ? 'Exportando...' : 'Exportar datos a Excel'}
                  </span>
                </DropdownMenuItem>

                {/* Item: UID con botón copiar */}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    copyUID();
                  }}
                  style={{
                    padding: '12px 16px',
                    minHeight: '44px',
                    cursor: 'pointer',
                    margin: '0 4px',
                    borderRadius: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      {copied ? (
                        <Check style={{ width: '20px', height: '20px', color: '#22c55e', marginRight: '12px' }} />
                      ) : (
                        <Copy style={{ width: '20px', height: '20px', color: '#6b7280', marginRight: '12px' }} />
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>UID del dispositivo</span>
                        <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#374151', marginTop: '2px' }}>
                          {truncateUID(uid || "Sin conexión")}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '8px' }}>
                      {copied ? "Copiado" : "Copiar"}
                    </span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator style={{ margin: '8px 0', backgroundColor: '#e5e7eb' }} />

                {/* Item: Cerrar sesión (rojo) */}
                <DropdownMenuItem
                  onClick={() => onLogout && onLogout()}
                  style={{
                    padding: '12px 16px',
                    minHeight: '44px',
                    cursor: 'pointer',
                    margin: '0 4px',
                    borderRadius: '8px',
                    color: '#dc2626'
                  }}
                  className="hover:bg-red-50"
                >
                  <LogOut style={{ width: '20px', height: '20px', color: '#dc2626', marginRight: '12px' }} />
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl space-y-6 px-4">

      {/* --- Tarjetas KPI --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '24px' }}>
        {/* Frecuencia Cardíaca */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          minHeight: '160px',
          position: 'relative'
        }}>
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity style={{ width: '20px', height: '20px', color: '#ef4444' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#ef4444', textTransform: 'uppercase' }}>FRECUENCIA</span>
            </div>
            <Badge variant="outline" style={{
              borderColor: '#16a34a',
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              fontSize: '12px',
              padding: '2px 10px'
            }}>
              Normal
            </Badge>
          </div>
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-0.025em', color: '#ef4444' }}>{Math.round(heartRate)}</span>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>BPM</span>
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', gap: '10px', position: 'absolute', bottom: '20px', left: '24px' }}>
            <span>Fecha: {formatVitalDate(vitalTimestamps.heartRate)}</span>
            <span>Hora: {formatVitalTime(vitalTimestamps.heartRate)}</span>
          </div>
        </div>

        {/* Presión Arterial */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          minHeight: '160px',
          position: 'relative'
        }}>
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Heart style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase' }}>PRESIÓN</span>
            </div>
            <Badge variant="outline" style={{
              borderColor: '#16a34a',
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              fontSize: '12px',
              padding: '2px 10px'
            }}>
              Normal
            </Badge>
          </div>
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '30px', fontWeight: 700, letterSpacing: '-0.025em', color: '#3b82f6' }}>{presionSistolica}</span>
            <span style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6' }}>/</span>
            <span style={{ fontSize: '30px', fontWeight: 700, letterSpacing: '-0.025em', color: '#3b82f6' }}>{presionDiastolica}</span>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>mmHg</span>
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', gap: '10px', position: 'absolute', bottom: '20px', left: '24px' }}>
            <span>Fecha: {formatVitalDate(vitalTimestamps.bloodPressure)}</span>
            <span>Hora: {formatVitalTime(vitalTimestamps.bloodPressure)}</span>
          </div>
        </div>

        {/* SpO₂ */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          minHeight: '160px',
          position: 'relative'
        }}>
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wind style={{ width: '20px', height: '20px', color: '#22c55e' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#22c55e' }}>SpO₂</span>
            </div>
            <Badge variant="outline" style={{
              borderColor: '#16a34a',
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              fontSize: '12px',
              padding: '2px 10px'
            }}>
              Normal
            </Badge>
          </div>
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-0.025em', color: '#22c55e' }}>{Math.round(spo2)}</span>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>%</span>
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', gap: '10px', position: 'absolute', bottom: '20px', left: '24px' }}>
            <span>Fecha: {formatVitalDate(vitalTimestamps.spo2)}</span>
            <span>Hora: {formatVitalTime(vitalTimestamps.spo2)}</span>
          </div>
        </div>

        {/* Temperatura */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          minHeight: '160px',
          position: 'relative'
        }}>
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Thermometer style={{ width: '20px', height: '20px', color: '#a855f7' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#a855f7', textTransform: 'uppercase' }}>TEMPERATURA</span>
            </div>
            <Badge variant="outline" style={{
              borderColor: '#16a34a',
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              fontSize: '12px',
              padding: '2px 10px'
            }}>
              Normal
            </Badge>
          </div>
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-0.025em', color: '#a855f7' }}>{temperatura.toFixed(1)}</span>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>°C</span>
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', gap: '10px', position: 'absolute', bottom: '20px', left: '24px' }}>
            <span>Fecha: {formatVitalDate(vitalTimestamps.temperature)}</span>
            <span>Hora: {formatVitalTime(vitalTimestamps.temperature)}</span>
          </div>
        </div>

        {/* Peso */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          minHeight: '160px',
          position: 'relative'
        }}>
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Weight style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase' }}>PESO</span>
            </div>
            <Badge variant="outline" style={{
              borderColor: '#16a34a',
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              fontSize: '12px',
              padding: '2px 10px'
            }}>
              Normal
            </Badge>
          </div>
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '30px', fontWeight: 700, letterSpacing: '-0.025em', color: '#f59e0b' }}>{peso.toFixed(1)}</span>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>kg</span>
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', gap: '10px', position: 'absolute', bottom: '20px', left: '24px' }}>
            <span>Fecha: {formatVitalDate(vitalTimestamps.weight)}</span>
            <span>Hora: {formatVitalTime(vitalTimestamps.weight)}</span>
          </div>
        </div>
      </div>

      {/* --- Gráficos principales --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '24px', marginTop: '32px' }}>
        <HRChart historicalData={historicalData} isLoadingHistory={isLoadingHistory} />
        <BPChartNew historicalData={historicalData} isLoadingHistory={isLoadingHistory} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        <SpO2Chart historicalData={historicalData} isLoadingHistory={isLoadingHistory} />
        <WeightChartNew historicalData={historicalData} isLoadingHistory={isLoadingHistory} />
      </div>
      </div>
    </div>
  );
}
