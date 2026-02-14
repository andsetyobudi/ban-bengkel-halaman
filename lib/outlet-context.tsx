"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type Outlet = {
  id: string
  name: string
  address: string
  phone: string
  status: "active" | "inactive"
}

export type UserRole = "super_admin" | "outlet_admin"

export type AdminUser = {
  id: string
  name: string
  email: string
  role: UserRole
  outletId?: string
}

export const outlets: Outlet[] = [
  {
    id: "OTL-001",
    name: "CarProBan Bantul",
    address: "Jl. Bantul KM 5, Bantul, Yogyakarta",
    phone: "0274-123456",
    status: "active",
  },
  {
    id: "OTL-002",
    name: "CahayaBan Wiyoro",
    address: "Jl. Wonosari KM 7, Wiyoro, Banguntapan, Bantul",
    phone: "0274-234567",
    status: "active",
  },
]

export const adminUsers: AdminUser[] = [
  {
    id: "USR-001",
    name: "Super Admin",
    email: "admin",
    role: "super_admin",
  },
  {
    id: "USR-002",
    name: "Admin Bantul",
    email: "admin.bantul",
    role: "outlet_admin",
    outletId: "OTL-001",
  },
  {
    id: "USR-003",
    name: "Admin Wiyoro",
    email: "admin.wiyoro",
    role: "outlet_admin",
    outletId: "OTL-002",
  },
]

type OutletContextType = {
  currentUser: AdminUser | null
  setCurrentUser: (user: AdminUser | null) => void
  selectedOutletId: string
  setSelectedOutletId: (id: string) => void
  selectedOutlet: Outlet | null
  isSuperAdmin: boolean
  availableOutlets: Outlet[]
  logout: () => void
}

const OutletContext = createContext<OutletContextType | undefined>(undefined)

export function OutletProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    if (typeof window === "undefined") return null
    const stored = localStorage.getItem("carproban_user")
    if (stored) {
      try {
        return JSON.parse(stored) as AdminUser
      } catch {
        return null
      }
    }
    return null
  })

  const [selectedOutletId, setSelectedOutletIdRaw] = useState<string>(() => {
    if (typeof window === "undefined") return "all"
    const stored = localStorage.getItem("carproban_selected_outlet")
    return stored || "all"
  })

  const isSuperAdmin = currentUser?.role === "super_admin"

  const availableOutlets = isSuperAdmin
    ? outlets
    : outlets.filter((o) => o.id === currentUser?.outletId)

  const selectedOutlet =
    selectedOutletId === "all"
      ? null
      : outlets.find((o) => o.id === selectedOutletId) ?? null

  const setSelectedOutletId = useCallback((id: string) => {
    setSelectedOutletIdRaw(id)
    localStorage.setItem("carproban_selected_outlet", id)
  }, [])

  const handleSetCurrentUser = useCallback((user: AdminUser | null) => {
    setCurrentUser(user)
    if (user) {
      localStorage.setItem("carproban_admin", "true")
      localStorage.setItem("carproban_user", JSON.stringify(user))
      if (user.role === "outlet_admin" && user.outletId) {
        setSelectedOutletId(user.outletId)
      } else {
        setSelectedOutletId("all")
      }
    } else {
      localStorage.removeItem("carproban_admin")
      localStorage.removeItem("carproban_user")
      localStorage.removeItem("carproban_selected_outlet")
    }
  }, [setSelectedOutletId])

  const logout = useCallback(() => {
    handleSetCurrentUser(null)
  }, [handleSetCurrentUser])

  return (
    <OutletContext.Provider
      value={{
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        selectedOutletId,
        setSelectedOutletId,
        selectedOutlet,
        isSuperAdmin,
        availableOutlets,
        logout,
      }}
    >
      {children}
    </OutletContext.Provider>
  )
}

export function useOutlet() {
  const ctx = useContext(OutletContext)
  if (!ctx) throw new Error("useOutlet must be used within OutletProvider")
  return ctx
}
