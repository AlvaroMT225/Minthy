// src/store/useSession.ts
import { create } from "zustand"
import { signOut } from "firebase/auth"
import { auth } from "../services/firebase"

export type AppUser = {
  uid: string
  email: string | null
  username: string
}

type SessionState = {
  user: AppUser | null
  loading: boolean
  error: string | null
}

type SessionActions = {
  setUser: (user: AppUser | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => Promise<void>
}

const useSession = create<SessionState & SessionActions>((set) => ({
  user: null,
  loading: false,
  error: null,

  setUser: (user) => {
    set({ user })
    if (user) {
      localStorage.setItem("username", user.username)
    } else {
      localStorage.removeItem("username")
    }
  },

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  logout: async () => {
    try {
      set({ loading: true })
      await signOut(auth)
      set({ user: null, loading: false })
      localStorage.removeItem("username")
      // ❌ NO eliminar deviceUID - debe persistir para mantener el contador de días
      // localStorage.removeItem("deviceUID")
    } catch (err: any) {
      set({
        loading: false,
        error: err?.message ?? "Error al cerrar sesión",
      })
    }
  },
}))

export default useSession
export { useSession }
