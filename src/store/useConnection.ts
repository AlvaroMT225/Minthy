import { create } from "zustand";

interface ConnectionState {
  userId: string | null;
  uid: string | null;
  status: "disconnected" | "connecting" | "connected";
  setUserId: (id: string) => void;
  setUid: (uid: string) => void;
  setStatus: (status: "disconnected" | "connecting" | "connected") => void;
  clearConnection: () => void;
}

/**
 * 🧩 Estado global de la conexión BLE + usuario
 * Gestionado con Zustand
 * ✅ CRÍTICO: NO cargar deviceUID de localStorage al inicializar para evitar usar UIDs de otros usuarios
 */
export const useConnection = create<ConnectionState>((set) => ({
  userId: localStorage.getItem("username") || null,
  uid: null, // ✅ NO cargar de localStorage - el hook useBluetooth lo cargará desde Firestore si existe
  status: "disconnected",

  setUserId: (id) => {
    localStorage.setItem("username", id);
    set({ userId: id });
  },

  setUid: (uid) => {
    localStorage.setItem("deviceUID", uid);
    set({ uid });
  },

  setStatus: (status) => set({ status }),

  clearConnection: () => {
    // ❌ NO eliminar deviceUID de localStorage
    // El UID debe persistir para mantener el contador de días
    // Solo cambiar el estado a desconectado
    set({ status: "disconnected" });
  },
}));

// ✅ Export default agregado para compatibilidad
export default useConnection;
