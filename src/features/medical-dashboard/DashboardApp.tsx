import React, { useEffect, useState, useCallback } from "react"
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore"

import { useSensorData } from "../../hooks/useSensorData"
import useSession from "../../store/useSession"
import { useConnection } from "../../store/useConnection"
import { sanitizeUID } from "../../services/firebase"

import MedicalDashboard from "./medical-dashboard"

const db = getFirestore()

type Vitals = {
  heartRate: number
  systolic: number
  diastolic: number
  spo2: number
  temperature: number
  weight: number
  bmi: number
}

type LastVitals = {
  heartRate: number
  systolic: number
  diastolic: number
  spo2: number
  temperature: number
  weight: number
}

// Timestamps de cuándo se actualizó cada vital
type VitalTimestamps = {
  heartRate: number | null
  bloodPressure: number | null
  spo2: number | null
  temperature: number | null
  weight: number | null
}

// Tipos para datos históricos
type HistoricalDataPoint = {
  date: string // YYYY-MM-DD (fecha simulada del documento)
  timestampHR?: number // Timestamp real de frecuencia cardíaca (epoch ms)
  timestampBP?: number // Timestamp real de presión arterial (epoch ms)
  timestampSpO2?: number // Timestamp real de SpO2 (epoch ms)
  timestampWeight?: number // Timestamp real de peso (epoch ms)
  timestampTemp?: number // Timestamp real de temperatura (epoch ms)
  heartRate: number
  systolic: number
  diastolic: number
  spo2: number
  temperature: number
  weight: number
}

type HistoricalData = {
  [key: string]: HistoricalDataPoint[]
}

// ================================
// 🔍 Funciones de consulta histórica
// ================================

/**
 * Consulta datos históricos de Firestore desde la colección unificada "mediciones"
 * @param userUUID - UUID del usuario (ID del documento Firestore)
 * @param uid - UID del dispositivo
 * @param maxDocs - Número máximo de documentos a obtener
 */
async function fetchMedicionesHistory(
  userUUID: string,
  uid: string,
  maxDocs: number = 365
): Promise<any[]> {
  try {
    // ✅ Sanitizar el UID usando función centralizada
    const safeUID = sanitizeUID(uid);

    // ✅ Estructura unificada: usuarios/{userUUID}/sensores/{safeUID}/mediciones
    const colRef = collection(db, "usuarios", userUUID, "sensores", safeUID, "mediciones")

    // 📅 Calcular la fecha mínima (hace maxDocs días)
    const today = new Date()
    const minDateObj = new Date(today)
    minDateObj.setDate(today.getDate() - maxDocs)
    const minDate = minDateObj.toISOString().split('T')[0] // YYYY-MM-DD

    // ⚡ Filtrar en Firestore usando where() - no requiere índices compuestos
    // Solo descarga documentos con fecha >= minDate (últimos maxDocs días)
    const q = query(colRef, where("__name__", ">=", minDate))
    const snapshot = await getDocs(q)

    const data: any[] = []
    snapshot.forEach((doc) => {
      const docData = doc.data()
      // Convertir Timestamp de Firestore a epoch milliseconds
      const firestoreTimestamp = docData.timestamp?.toMillis ? docData.timestamp.toMillis() : null
      data.push({
        date: doc.id, // El ID del documento es la fecha (YYYY-MM-DD)
        ...docData,
        timestamp: firestoreTimestamp, // Timestamp real en epoch ms
      })
    })

    // Ordenar por fecha (más antiguo primero)
    return data.sort((a, b) => a.date.localeCompare(b.date))
  } catch (error) {
    console.error(`Error fetching mediciones history:`, error)
    return []
  }
}

/**
 * Filtra datos históricos según el rango seleccionado
 * @param data - Datos completos
 * @param range - "7D" | "1M" | "3M" | "1Y"
 */
function filterDataByRange(data: HistoricalDataPoint[], range: string): HistoricalDataPoint[] {
  if (data.length === 0) return []

  switch (range) {
    case "7D":
      // Últimos 7 días (uno por día)
      return data.slice(-7)

    case "1M":
      // Últimos 30 días, mostrar 15 puntos (uno cada 2 días)
      const last30 = data.slice(-30)
      return last30.filter((_, index) => index % 2 === 0).slice(-15)

    case "3M":
      // Últimos 90 días, mostrar 18 puntos (uno cada 5 días)
      const last90 = data.slice(-90)
      return last90.filter((_, index) => index % 5 === 0).slice(-18)

    case "1Y":
      // Últimos 365 días, mostrar 52 puntos (uno cada 7 días)
      const last365 = data.slice(-365)
      return last365.filter((_, index) => index % 7 === 0).slice(-52)

    default:
      return data
  }
}

/**
 * Obtiene todos los datos históricos desde la colección unificada "mediciones"
 * @param userUUID - UUID del usuario (ID del documento Firestore)
 * @param uid - UID del dispositivo
 */
async function fetchHistoricalData(userUUID: string, uid: string): Promise<HistoricalDataPoint[]> {
  try {
    // ✅ Consultar la colección unificada "mediciones"
    const medicionesData = await fetchMedicionesHistory(userUUID, uid, 365)

    // Mapear datos al formato esperado por las gráficas
    // Soporta tanto estructura anidada (oximetro.pulse) como plana (frecuenciaCardiaca)
    const historicalPoints: HistoricalDataPoint[] = medicionesData
      .map((item) => {
        // 📊 Extraer datos del oxímetro (estructura anidada)
        const heartRate = item.oximetro?.pulse ?? item.frecuenciaCardiaca ?? 0
        const spo2 = item.oximetro?.spo2 ?? item.spo2 ?? 0

        // 📊 Extraer presión arterial (estructura anidada o plana)
        const systolic = item.presion?.sistolica ?? item.presionSistolica ?? 0
        const diastolic = item.presion?.diastolica ?? item.presionDiastolica ?? 0

        // 📊 Extraer temperatura (puede ser objeto o valor directo)
        const temperature = typeof item.temperatura === 'object'
          ? item.temperatura?.valor ?? 0
          : item.temperatura ?? 0

        // 📊 Extraer peso (puede ser objeto o valor directo)
        const weight = typeof item.peso === 'object'
          ? item.peso?.valor ?? 0
          : item.peso ?? 0

        return {
          date: item.date,
          heartRate,
          systolic,
          diastolic,
          spo2,
          temperature,
          weight,
          // Todos los sensores comparten el mismo timestamp en la estructura unificada
          timestampHR: item.timestamp,
          timestampBP: item.timestamp,
          timestampSpO2: item.timestamp,
          timestampTemp: item.timestamp,
          timestampWeight: item.timestamp,
        }
      })
      // Filtrar puntos que tienen ALGÚN valor real (no todos en cero)
      .filter((point) => {
        return (
          point.heartRate > 0 ||
          point.systolic > 0 ||
          point.diastolic > 0 ||
          point.spo2 > 0 ||
          point.temperature > 0 ||
          point.weight > 0
        )
      })

    return historicalPoints
  } catch (error) {
    console.error("Error fetching historical data:", error)
    return []
  }
}

interface DashboardAppProps {
  username?: string | null
  uid?: string | null
  onLogout?: () => void
}

const DashboardApp: React.FC<DashboardAppProps> = ({ username: propUsername, uid: propUid, onLogout }) => {
  const session = useSession()
  const connection = useConnection()

  // ✅ UserUUID para queries de Firestore (ID del documento)
  const userUUID =
    (session as any)?.user?.uid ||
    localStorage.getItem("userId") ||
    undefined

  // 👤 Username para mostrar en UI
  const username =
    propUsername ||
    (session as any)?.username ||
    (session as any)?.user?.username ||
    localStorage.getItem("username") ||
    undefined

  // 🔗 UID del dispositivo BLE desde props o Zustand (NO desde localStorage para evitar UIDs de otros usuarios)
  let deviceUID =
    propUid ||
    (connection as any)?.uid ||
    undefined

  // 🆕 Si no hay deviceUID, mostrar mensaje y NO iniciar simulación
  // El usuario debe conectar su dispositivo BLE primero
  if (!deviceUID && username) {
    console.log("⚠️ No hay dispositivo BLE conectado. Usuario debe conectar su dispositivo primero.")
  }

  // 🔥 Datos en tiempo real desde Firestore
  // IMPORTANTE: Pasar userUUID (ID del documento) en lugar de username
  const { data } = useSensorData(userUUID, deviceUID)

  const [vitals, setVitals] = useState<Vitals | null>(null)
  const [lastVitals, setLastVitals] = useState<LastVitals | null>(null)

  // ⏱️ Timestamps de cuándo se actualizó cada vital
  const [vitalTimestamps, setVitalTimestamps] = useState<VitalTimestamps>({
    heartRate: null,
    bloodPressure: null,
    spo2: null,
    temperature: null,
    weight: null,
  })

  // 📊 Datos históricos para gráficas
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 🔄 Función para cargar/refrescar datos históricos
  const loadHistoricalData = useCallback(async () => {
    if (!deviceUID || !userUUID) return

    setIsLoadingHistory(true)
    setIsRefreshing(true)
    console.log("🔄 Cargando datos históricos...")
    try {
      const history = await fetchHistoricalData(userUUID, deviceUID)
      setHistoricalData(history)
      console.log(`✅ Datos históricos cargados: ${history.length} días`)
    } catch (error) {
      console.error("❌ Error al cargar datos históricos:", error)
    } finally {
      setIsLoadingHistory(false)
      setIsRefreshing(false)
    }
  }, [deviceUID, userUUID])

  // 📊 Cargar datos históricos al montar el componente
  useEffect(() => {
    if (!deviceUID || !userUUID) return

    console.log("📊 Cargando datos históricos para:", { userUUID, deviceUID })
    loadHistoricalData()

  }, [deviceUID, userUUID, loadHistoricalData])

  // ⏰ Auto-refresh cada 30 segundos
  useEffect(() => {
    if (!deviceUID || !userUUID) return

    const interval = setInterval(() => {
      console.log("⏰ Auto-refresh de datos históricos...")
      loadHistoricalData()
    }, 30000) // 30 segundos

    return () => clearInterval(interval)
  }, [deviceUID, userUUID, loadHistoricalData])

  useEffect(() => {
    if (!data) return

    let current: any = data

    // Si el hook devuelve un array, usamos la última medición
    if (Array.isArray(data) && data.length > 0) {
      current = data[data.length - 1]
    }

    // 👉 Mapeo campos Firestore → modelo del dashboard
    const baseVitals = {
      heartRate: current.frecuenciaCardiaca ?? current.heartRate ?? 0,
      systolic: current.presionSistolica ?? current.systolic ?? 0,
      diastolic: current.presionDiastolica ?? current.diastolic ?? 0,
      spo2: current.spo2 ?? 0,
      temperature: current.temperatura ?? current.temperature ?? 0,
      weight: current.peso ?? current.weight ?? 0,
    }

    // 🧮 IMC simple (altura fija 1.70 m)
    const bmi =
      baseVitals.weight > 0
        ? Number((baseVitals.weight / (1.7 * 1.7)).toFixed(1))
        : 0

    const mapped: Vitals = {
      ...baseVitals,
      bmi,
    }

    if (!vitals) {
      // Primera medición: inicializamos vitals con datos actuales y lastVitals en 0
      const now = Date.now()
      setVitals(mapped)
      setLastVitals({
        heartRate: 0,
        systolic: 0,
        diastolic: 0,
        spo2: 0,
        temperature: 0,
        weight: 0,
      })
      // ⏱️ Establecer timestamps iniciales para todos los vitales con valor > 0
      setVitalTimestamps({
        heartRate: mapped.heartRate > 0 ? now : null,
        bloodPressure: (mapped.systolic > 0 || mapped.diastolic > 0) ? now : null,
        spo2: mapped.spo2 > 0 ? now : null,
        temperature: mapped.temperature > 0 ? now : null,
        weight: mapped.weight > 0 ? now : null,
      })
      return
    }

    // Verificar si los datos realmente cambiaron antes de actualizar
    const hasChanged =
      vitals.heartRate !== mapped.heartRate ||
      vitals.systolic !== mapped.systolic ||
      vitals.diastolic !== mapped.diastolic ||
      vitals.spo2 !== mapped.spo2 ||
      vitals.temperature !== mapped.temperature ||
      vitals.weight !== mapped.weight

    // Solo actualizar si los datos son diferentes
    if (hasChanged) {
      const now = Date.now()

      // Guardamos las anteriores como "última"
      setLastVitals({
        heartRate: vitals.heartRate,
        systolic: vitals.systolic,
        diastolic: vitals.diastolic,
        spo2: vitals.spo2,
        temperature: vitals.temperature,
        weight: vitals.weight,
      })

      // ⏱️ Actualizar timestamps solo para los vitales que cambiaron
      setVitalTimestamps(prev => ({
        heartRate: vitals.heartRate !== mapped.heartRate ? now : prev.heartRate,
        bloodPressure: (vitals.systolic !== mapped.systolic || vitals.diastolic !== mapped.diastolic) ? now : prev.bloodPressure,
        spo2: vitals.spo2 !== mapped.spo2 ? now : prev.spo2,
        temperature: vitals.temperature !== mapped.temperature ? now : prev.temperature,
        weight: vitals.weight !== mapped.weight ? now : prev.weight,
      }))

      // Y actualizamos vitals con la nueva medición
      setVitals(mapped)
    }
  }, [data])

  // ================================
  // 🚨 Validaciones básicas
  // ================================
  if (!username) {
    return (
      <div className="space-y-2 p-4">
        <p className="text-center text-sm">
          No se encontró usuario. Por favor inicia sesión nuevamente.
        </p>
      </div>
    )
  }

  // ================================
  // 🧩 UI principal: dashboard Code4 adaptado
  // ================================

  // Si no hay vitals o lastVitals todavía, mostrar dashboard con valores por defecto
  const defaultVitals = {
    heartRate: 0,
    systolic: 0,
    diastolic: 0,
    spo2: 0,
    temperature: 0,
    weight: 0,
  }

  return (
    <MedicalDashboard
      data={{
        heartRate: vitals?.heartRate ?? 0,
        temperatura: vitals?.temperature ?? 0,
        spo2: vitals?.spo2 ?? 0,
        peso: vitals?.weight ?? 0,
        presionSistolica: vitals?.systolic ?? 0,
        presionDiastolica: vitals?.diastolic ?? 0,
      }}
      lastVitals={lastVitals ?? defaultVitals}
      vitalTimestamps={vitalTimestamps}
      historicalData={historicalData}
      isLoadingHistory={isLoadingHistory}
      isRefreshing={isRefreshing}
      onRefresh={loadHistoricalData}
      onLogout={onLogout}
      username={username}
      uid={deviceUID}
    />
  )

}

export default DashboardApp
export { filterDataByRange }
export type { HistoricalDataPoint }
