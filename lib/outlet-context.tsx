"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type Outlet = {
  id: string
  name: string
  address: string
}

export const outlets: Outlet[] = [
  {
    id: "OTL-001",
    name: "CarProBan Ringroad Selatan",
    address: "Jl. Ringroad Selatan, Bantul, Yogyakarta",
  },
  {
    id: "OTL-002",
    name: "CarProBan Magelang",
    address: "Jl. Magelang KM 5, Sleman, Yogyakarta",
  },
  {
    id: "OTL-003",
    name: "CarProBan Solo",
    address: "Jl. Slamet Riyadi No. 88, Solo",
  },
]

type OutletContextType = {
  selectedOutletId: string
  setSelectedOutletId: (id: string) => void
  selectedOutlet: Outlet | null
}

const OutletContext = createContext<OutletContextType | undefined>(undefined)

export function OutletProvider({ children }: { children: ReactNode }) {
  const [selectedOutletId, setSelectedOutletId] = useState<string>("all")

  const selectedOutlet = selectedOutletId === "all"
    ? null
    : outlets.find((o) => o.id === selectedOutletId) ?? null

  return (
    <OutletContext.Provider value={{ selectedOutletId, setSelectedOutletId, selectedOutlet }}>
      {children}
    </OutletContext.Provider>
  )
}

export function useOutlet() {
  const ctx = useContext(OutletContext)
  if (!ctx) throw new Error("useOutlet must be used within OutletProvider")
  return ctx
}
