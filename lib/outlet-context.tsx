"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode, type Dispatch, type SetStateAction } from "react"
import { toast } from "sonner"

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

const defaultOutlets: Outlet[] = []
const defaultAdminUsers: AdminUser[] = []

export type BrandItem = {
  id: string
  name: string
}

export type CategoryItem = {
  id: string
  name: string
}

export type StockPerOutlet = Record<string, number>

export type ProductItem = {
  id: string
  name: string
  code: string
  brand: string
  category: string
  costPrice: number
  sellPrice: number
  stock: StockPerOutlet
}

const initialProducts: ProductItem[] = [
  { id: "P001", name: "Ecopia EP150", code: "185/65R15", brand: "Bridgestone", category: "Ban Mobil", costPrice: 600000, sellPrice: 750000, stock: { "OTL-001": 24, "OTL-002": 12 } },
  { id: "P002", name: "Champiro Eco", code: "175/65R14", brand: "GT Radial", category: "Ban Mobil", costPrice: 400000, sellPrice: 520000, stock: { "OTL-001": 18, "OTL-002": 10 } },
  { id: "P003", name: "Enasave EC300+", code: "195/60R16", brand: "Dunlop", category: "Ban Mobil", costPrice: 700000, sellPrice: 880000, stock: { "OTL-001": 12, "OTL-002": 8 } },
  { id: "P004", name: "Kinergy EX", code: "205/55R16", brand: "Hankook", category: "Ban Mobil", costPrice: 560000, sellPrice: 720000, stock: { "OTL-001": 15, "OTL-002": 6 } },
  { id: "P005", name: "PHI-R", code: "205/45R17", brand: "Accelera", category: "Ban Mobil", costPrice: 480000, sellPrice: 650000, stock: { "OTL-001": 10, "OTL-002": 20 } },
  { id: "P006", name: "Turanza T005A", code: "215/60R17", brand: "Bridgestone", category: "Ban SUV", costPrice: 980000, sellPrice: 1250000, stock: { "OTL-001": 4, "OTL-002": 8 } },
  { id: "P007", name: "Savero SUV", code: "225/65R17", brand: "GT Radial", category: "Ban SUV", costPrice: 720000, sellPrice: 950000, stock: { "OTL-001": 6, "OTL-002": 10 } },
  { id: "P008", name: "AT3", code: "265/65R17", brand: "Dunlop", category: "Ban SUV", costPrice: 1100000, sellPrice: 1450000, stock: { "OTL-001": 3, "OTL-002": 6 } },
  { id: "P009", name: "K415", code: "185/70R14", brand: "Hankook", category: "Ban Mobil", costPrice: 360000, sellPrice: 480000, stock: { "OTL-001": 22, "OTL-002": 14 } },
  { id: "P010", name: "Techno Sport", code: "195/50R16", brand: "Accelera", category: "Ban Mobil", costPrice: 420000, sellPrice: 580000, stock: { "OTL-001": 8, "OTL-002": 14 } },
  { id: "P011", name: "Ban Dalam Motor", code: "70/90-17", brand: "IRC", category: "Ban Motor", costPrice: 30000, sellPrice: 45000, stock: { "OTL-001": 50, "OTL-002": 30 } },
  { id: "P012", name: "NR76 Tubeless", code: "80/90-17", brand: "IRC", category: "Ban Motor", costPrice: 120000, sellPrice: 165000, stock: { "OTL-001": 30, "OTL-002": 20 } },
]

export type CustomerItem = {
  id: string
  name: string
  phone: string
  outletId: string
}

const initialCustomers: CustomerItem[] = [
  { id: "CST-001", name: "Budi Santoso", phone: "081234567890", outletId: "OTL-001" },
  { id: "CST-002", name: "Siti Rahayu", phone: "082345678901", outletId: "OTL-001" },
  { id: "CST-003", name: "Ahmad Wijaya", phone: "083456789012", outletId: "OTL-002" },
  { id: "CST-004", name: "Dewi Lestari", phone: "084567890123", outletId: "OTL-002" },
  { id: "CST-005", name: "Eko Prasetyo", phone: "085678901234", outletId: "OTL-001" },
]

export type TransferItem = {
  productId: string
  productName: string
  productCode: string
  qty: number
}

export type TransferStatus = "pending" | "diterima" | "selesai" | "dibatalkan"

export type Transfer = {
  id: string
  fromOutletId: string
  toOutletId: string
  date: string
  note: string
  items: TransferItem[]
  status: TransferStatus
  createdAt: string
}

const initialTransfers: Transfer[] = [
  {
    id: "TRF-001",
    fromOutletId: "OTL-001",
    toOutletId: "OTL-002",
    date: "2026-02-10",
    note: "Restock ban mobil",
    items: [
      { productId: "P001", productName: "Ecopia EP150", productCode: "185/65R15", qty: 4 },
      { productId: "P002", productName: "Champiro Eco", productCode: "175/65R14", qty: 2 },
    ],
    status: "selesai",
    createdAt: "2026-02-10T08:00:00",
  },
  {
    id: "TRF-002",
    fromOutletId: "OTL-002",
    toOutletId: "OTL-001",
    date: "2026-02-12",
    note: "Transfer ban SUV",
    items: [
      { productId: "P006", productName: "Turanza T005A", productCode: "215/60R17", qty: 2 },
    ],
    status: "diterima",
    createdAt: "2026-02-12T10:30:00",
  },
  {
    id: "TRF-003",
    fromOutletId: "OTL-001",
    toOutletId: "OTL-002",
    date: "2026-02-14",
    note: "",
    items: [
      { productId: "P005", productName: "PHI-R", productCode: "205/45R17", qty: 3 },
      { productId: "P009", productName: "K415", productCode: "185/70R14", qty: 5 },
    ],
    status: "pending",
    createdAt: "2026-02-14T09:15:00",
  },
]

export type PiutangItem = {
  id: string
  invoice: string
  date: string
  customerId: string
  customerName: string
  nopol: string
  total: number
  paid: number
  outletId: string
  status: "belum_lunas" | "lunas"
}

const initialPiutang: PiutangItem[] = [
  {
    id: "PTG-001",
    invoice: "INV-2026-0001",
    date: "2026-02-01",
    customerId: "CST-001",
    customerName: "Budi Santoso",
    nopol: "AB 1234 CD",
    total: 2400000,
    paid: 1000000,
    outletId: "OTL-001",
    status: "belum_lunas",
  },
  {
    id: "PTG-002",
    invoice: "INV-2026-0002",
    date: "2026-02-03",
    customerId: "CST-002",
    customerName: "Siti Rahayu",
    nopol: "AB 5678 EF",
    total: 1800000,
    paid: 1800000,
    outletId: "OTL-001",
    status: "lunas",
  },
  {
    id: "PTG-003",
    invoice: "INV-2026-0003",
    date: "2026-02-05",
    customerId: "CST-003",
    customerName: "Ahmad Wijaya",
    nopol: "AB 9012 GH",
    total: 3200000,
    paid: 500000,
    outletId: "OTL-002",
    status: "belum_lunas",
  },
  {
    id: "PTG-004",
    invoice: "INV-2026-0004",
    date: "2026-02-08",
    customerId: "CST-005",
    customerName: "Eko Prasetyo",
    nopol: "AB 3456 IJ",
    total: 950000,
    paid: 0,
    outletId: "OTL-001",
    status: "belum_lunas",
  },
  {
    id: "PTG-005",
    invoice: "INV-2026-0005",
    date: "2026-02-10",
    customerId: "CST-004",
    customerName: "Dewi Lestari",
    nopol: "AB 7890 KL",
    total: 1500000,
    paid: 1500000,
    outletId: "OTL-002",
    status: "lunas",
  },
  {
    id: "PTG-006",
    invoice: "INV-2026-0006",
    date: "2026-02-12",
    customerId: "CST-001",
    customerName: "Budi Santoso",
    nopol: "AB 1234 CD",
    total: 4200000,
    paid: 2000000,
    outletId: "OTL-001",
    status: "belum_lunas",
  },
]

export type PaymentMethodType = "tunai" | "qris" | "debit_kredit" | "piutang"

export type PaymentEntry = {
  method: PaymentMethodType
  amount: number
}

export type TransactionItem = {
  name: string
  price: number
  qty: number
  productId?: string
}

export type TransactionRecord = {
  id: string
  invoice: string
  date: string
  customerName: string
  customerPhone: string
  nopol: string
  vehicle: string
  items: TransactionItem[]
  subtotal: number
  discount: number
  total: number
  paymentType: "penuh" | "campuran"
  payments: PaymentEntry[]
  nominalBayar: number
  sisa: number
  isPiutang: boolean
  note: string
  outletId: string
  status: "Selesai" | "Proses" | "Batal"
}

const initialTransactions: TransactionRecord[] = [
  {
    id: "TRX-001",
    invoice: "INV-2026-0001",
    date: "2026-02-14",
    customerName: "Ahmad Rizky",
    customerPhone: "0812-3456-7890",
    nopol: "AB 1234 CD",
    vehicle: "Toyota Avanza 2021",
    items: [{ name: "Bridgestone Ecopia EP150 195/65R15", qty: 2, price: 750000 }],
    subtotal: 1500000,
    discount: 0,
    total: 1500000,
    paymentType: "penuh",
    payments: [{ method: "qris", amount: 1500000 }],
    nominalBayar: 1500000,
    sisa: 0,
    isPiutang: false,
    note: "",
    outletId: "OTL-001",
    status: "Selesai",
  },
  {
    id: "TRX-002",
    invoice: "INV-2026-0002",
    date: "2026-02-14",
    customerName: "Siti Nurhaliza",
    customerPhone: "0856-1234-5678",
    nopol: "AB 5678 EF",
    vehicle: "Honda Jazz 2019",
    items: [
      { name: "Tambal Ban Tubeless", qty: 1, price: 50000 },
      { name: "Balancing", qty: 1, price: 70000 },
    ],
    subtotal: 120000,
    discount: 0,
    total: 120000,
    paymentType: "penuh",
    payments: [{ method: "tunai", amount: 120000 }],
    nominalBayar: 120000,
    sisa: 0,
    isPiutang: false,
    note: "",
    outletId: "OTL-001",
    status: "Selesai",
  },
  {
    id: "TRX-003",
    invoice: "INV-2026-0003",
    date: "2026-02-13",
    customerName: "Budi Santoso",
    customerPhone: "0878-9012-3456",
    nopol: "AB 9012 GH",
    vehicle: "Mitsubishi Xpander 2023",
    items: [{ name: "GT Radial Champiro Eco 205/55R16", qty: 4, price: 800000 }],
    subtotal: 3200000,
    discount: 0,
    total: 3200000,
    paymentType: "penuh",
    payments: [{ method: "qris", amount: 3200000 }],
    nominalBayar: 3200000,
    sisa: 0,
    isPiutang: false,
    note: "",
    outletId: "OTL-001",
    status: "Selesai",
  },
  {
    id: "TRX-004",
    invoice: "INV-2026-0004",
    date: "2026-02-13",
    customerName: "Dewi Lestari",
    customerPhone: "0813-5678-1234",
    nopol: "AB 3456 IJ",
    vehicle: "Suzuki Ertiga 2020",
    items: [
      { name: "Spooring", qty: 1, price: 150000 },
      { name: "Balancing", qty: 4, price: 25000 },
    ],
    subtotal: 250000,
    discount: 0,
    total: 250000,
    paymentType: "penuh",
    payments: [{ method: "tunai", amount: 250000 }],
    nominalBayar: 250000,
    sisa: 0,
    isPiutang: false,
    note: "",
    outletId: "OTL-001",
    status: "Selesai",
  },
  {
    id: "TRX-005",
    invoice: "INV-2026-0005",
    date: "2026-02-12",
    customerName: "Rina Wijaya",
    customerPhone: "0857-6789-0123",
    nopol: "AB 7890 KL",
    vehicle: "Toyota Innova 2022",
    items: [
      { name: "Hankook Kinergy EX 205/55R16", qty: 4, price: 720000 },
      { name: "Balancing", qty: 4, price: 25000 },
      { name: "Spooring", qty: 1, price: 150000 },
    ],
    subtotal: 3030000,
    discount: 0,
    total: 3030000,
    paymentType: "penuh",
    payments: [{ method: "debit_kredit", amount: 3030000 }],
    nominalBayar: 3030000,
    sisa: 0,
    isPiutang: false,
    note: "",
    outletId: "OTL-002",
    status: "Selesai",
  },
]

const initialBrands: BrandItem[] = [
  { id: "BRD-001", name: "Bridgestone" },
  { id: "BRD-002", name: "GT Radial" },
  { id: "BRD-003", name: "Dunlop" },
  { id: "BRD-004", name: "Hankook" },
  { id: "BRD-005", name: "Accelera" },
  { id: "BRD-006", name: "IRC" },
]

const initialCategories: CategoryItem[] = [
  { id: "CAT-001", name: "Ban Mobil" },
  { id: "CAT-002", name: "Ban SUV" },
  { id: "CAT-003", name: "Ban Motor" },
]

type OutletContextType = {
  outlets: Outlet[]
  setOutlets: Dispatch<SetStateAction<Outlet[]>>
  adminUsers: AdminUser[]
  setAdminUsers: Dispatch<SetStateAction<AdminUser[]>>
  currentUser: AdminUser | null
  setCurrentUser: (user: AdminUser | null) => void
  selectedOutletId: string
  setSelectedOutletId: (id: string) => void
  selectedOutlet: Outlet | null
  isSuperAdmin: boolean
  availableOutlets: Outlet[]
  logout: () => void
  reloadInitialData: () => Promise<void>
  products: ProductItem[]
  setProducts: Dispatch<SetStateAction<ProductItem[]>>
  decreaseProductStock: (productId: string, outletId: string, qty: number) => void
  brands: BrandItem[]
  addBrand: (name: string) => void
  updateBrand: (id: string, name: string) => void
  removeBrand: (id: string) => void
  categories: CategoryItem[]
  addCategory: (name: string) => void
  updateCategory: (id: string, name: string) => void
  removeCategory: (id: string) => void
  customers: CustomerItem[]
  addCustomer: (name: string, phone: string, outletId: string) => void
  updateCustomer: (id: string, name: string, phone: string, outletId: string) => void
  removeCustomer: (id: string) => void
  transfers: Transfer[]
  setTransfers: React.Dispatch<React.SetStateAction<Transfer[]>>
  addTransfer: (fromOutletId: string, toOutletId: string, date: string, note: string, items: TransferItem[]) => void
  updateTransferStatus: (id: string, status: TransferStatus) => void
  piutang: PiutangItem[]
  lunaskanPiutang: (id: string) => void
  transactions: TransactionRecord[]
  addTransaction: (tx: Omit<TransactionRecord, "id">) => TransactionRecord
  removeTransaction: (id: string) => void
  addOutlet: (name: string, address: string) => Promise<void>
  updateOutlet: (id: string, name: string, address: string) => Promise<void>
  removeOutlet: (id: string) => Promise<void>
  addAdmin: (name: string, email: string, role: UserRole, outletId?: string) => Promise<void>
  updateAdmin: (id: string, name: string, email: string, role: UserRole, outletId?: string) => Promise<void>
  removeAdmin: (id: string) => Promise<void>
  nextInvoiceNumber: () => string
}

const OutletContext = createContext<OutletContextType | undefined>(undefined)

export function OutletProvider({ children }: { children: ReactNode }) {
  const [outlets, setOutlets] = useState<Outlet[]>(defaultOutlets)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(defaultAdminUsers)

  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null)

  const [selectedOutletId, setSelectedOutletIdRaw] = useState<string>("all")

  // Load from localStorage on mount, lalu fetch data jika sudah login
  useEffect(() => {
    const savedUser = localStorage.getItem("carproban_user")
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser))
      } catch {
        // ignore
      }
    }
    const savedOutlet = localStorage.getItem("carproban_selected_outlet")
    if (savedOutlet) {
      setSelectedOutletIdRaw(savedOutlet)
    }
  }, [])

  // Helper: muat ulang seluruh data dari database (dipakai awal dan setelah CRUD penting)
  const reloadInitialData = useCallback(async () => {
    // Hanya fetch jika ada user yang login
    const isLoggedIn = localStorage.getItem("carproban_admin")
    if (!isLoggedIn) return
    try {
      const res = await fetch("/api/admin/initial-data")
      const data = await res.json()
      if (data.error) return
      if (Array.isArray(data.outlets)) setOutlets(data.outlets)
      if (Array.isArray(data.adminUsers)) setAdminUsers(data.adminUsers)
      if (Array.isArray(data.products)) setProducts(data.products)
      if (Array.isArray(data.customers)) setCustomers(data.customers)
      if (Array.isArray(data.transfers)) setTransfers(data.transfers)
      if (Array.isArray(data.piutang)) setPiutang(data.piutang)
      if (Array.isArray(data.transactions)) setTransactions(data.transactions)
      if (Array.isArray(data.brands)) setBrands(data.brands)
      if (Array.isArray(data.categories)) setCategories(data.categories)
    } catch {
      // biarkan diam jika gagal, agar UI tetap jalan dengan data terakhir
    }
  }, [])

  useEffect(() => {
    void reloadInitialData()
  }, [reloadInitialData])

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
      // Langsung muat data setelah login berhasil
      void reloadInitialData()
    } else {
      localStorage.removeItem("carproban_admin")
      localStorage.removeItem("carproban_user")
      localStorage.removeItem("carproban_selected_outlet")
    }
  }, [setSelectedOutletId, reloadInitialData])

  const logout = useCallback(() => {
    handleSetCurrentUser(null)
  }, [handleSetCurrentUser])

  // Products (stok per outlet)
  const [products, setProducts] = useState<ProductItem[]>(initialProducts)

  const decreaseProductStock = useCallback((productId: string, outletId: string, qty: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p
        const current = p.stock[outletId] ?? 0
        const next = Math.max(0, current - qty)
        return { ...p, stock: { ...p.stock, [outletId]: next } }
      })
    )
  }, [])

  // Brands CRUD (disimpan di database via API)
  const [brands, setBrands] = useState<BrandItem[]>(initialBrands)

  const addBrand = useCallback((name: string) => {
    void (async () => {
      try {
        const trimmed = name.trim()
        if (!trimmed) {
          toast.error("Nama merek wajib diisi.")
          return
        }
        const res = await fetch("/api/admin/brands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmed }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          toast.error((data as any)?.error ?? "Gagal menambah merek.")
          return
        }
        toast.success("Merek berhasil ditambahkan.")
        await reloadInitialData()
      } catch {
        toast.error("Koneksi gagal.")
      }
    })()
  }, [reloadInitialData])

  const updateBrand = useCallback((id: string, name: string) => {
    void (async () => {
      try {
        const trimmed = name.trim()
        if (!trimmed) {
          toast.error("Nama merek wajib diisi.")
          return
        }
        const res = await fetch(`/api/admin/brands/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmed }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          toast.error((data as any)?.error ?? "Gagal mengubah merek.")
          return
        }
        toast.success("Merek berhasil diubah.")
        await reloadInitialData()
      } catch {
        toast.error("Koneksi gagal.")
      }
    })()
  }, [reloadInitialData])

  const removeBrand = useCallback((id: string) => {
    void (async () => {
      try {
        const res = await fetch(`/api/admin/brands/${id}`, {
          method: "DELETE",
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          toast.error((data as any)?.error ?? "Gagal menghapus merek.")
          return
        }
        toast.success("Merek berhasil dihapus.")
        await reloadInitialData()
      } catch {
        toast.error("Koneksi gagal.")
      }
    })()
  }, [reloadInitialData])

  // Customers CRUD (disimpan di database via API)
  const [customers, setCustomers] = useState<CustomerItem[]>(initialCustomers)

  const addCustomer = useCallback((name: string, phone: string, outletId: string) => {
    void (async () => {
      try {
        const trimmedName = name.trim()
        const trimmedPhone = phone.trim()
        if (!trimmedName || !trimmedPhone || !outletId) {
          toast.error("Nama, nomor HP, dan outlet wajib diisi.")
          return
        }
        const res = await fetch("/api/admin/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: trimmedName,
            phone: trimmedPhone,
            outletId,
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          toast.error((data as any)?.error ?? "Gagal menambah pelanggan.")
          return
        }
        toast.success("Pelanggan berhasil ditambahkan.")
        await reloadInitialData()
      } catch {
        toast.error("Koneksi gagal.")
      }
    })()
  }, [reloadInitialData])

  const updateCustomer = useCallback((id: string, name: string, phone: string, outletId: string) => {
    void (async () => {
      try {
        const trimmedName = name.trim()
        const trimmedPhone = phone.trim()
        if (!trimmedName || !trimmedPhone || !outletId) {
          toast.error("Nama, nomor HP, dan outlet wajib diisi.")
          return
        }
        const res = await fetch(`/api/admin/customers/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: trimmedName,
            phone: trimmedPhone,
            outletId,
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          toast.error((data as any)?.error ?? "Gagal mengubah pelanggan.")
          return
        }
        toast.success("Pelanggan berhasil diubah.")
        await reloadInitialData()
      } catch {
        toast.error("Koneksi gagal.")
      }
    })()
  }, [reloadInitialData])

  const removeCustomer = useCallback((id: string) => {
    void (async () => {
      try {
        const res = await fetch(`/api/admin/customers/${id}`, {
          method: "DELETE",
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          toast.error((data as any)?.error ?? "Gagal menghapus pelanggan.")
          return
        }
        toast.success("Pelanggan berhasil dihapus.")
        await reloadInitialData()
      } catch {
        toast.error("Koneksi gagal.")
      }
    })()
  }, [reloadInitialData])

  // Outlets CRUD
  const addOutlet = useCallback(async (name: string, address: string) => {
    try {
      const res = await fetch("/api/admin/outlets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Gagal menambahkan outlet.")
        return
      }
      toast.success("Outlet berhasil ditambahkan.")
      await reloadInitialData()
    } catch {
      toast.error("Koneksi gagal.")
    }
  }, [reloadInitialData])

  const updateOutlet = useCallback(async (id: string, name: string, address: string) => {
    try {
      const res = await fetch(`/api/admin/outlets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Gagal mengubah outlet.")
        return
      }
      toast.success("Outlet berhasil diubah.")
      await reloadInitialData()
    } catch {
      toast.error("Koneksi gagal.")
    }
  }, [reloadInitialData])

  const removeOutlet = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/admin/outlets/${id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Gagal menghapus outlet.")
        return
      }
      toast.success("Outlet berhasil dihapus.")
      await reloadInitialData()
    } catch {
      toast.error("Koneksi gagal.")
    }
  }, [reloadInitialData])

  // Admin Users CRUD
  const addAdmin = useCallback(async (name: string, email: string, role: UserRole, outletId?: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, outletId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Gagal menambahkan admin.")
        return
      }
      toast.success("Admin berhasil ditambahkan.")
      await reloadInitialData()
    } catch {
      toast.error("Koneksi gagal.")
    }
  }, [reloadInitialData])

  const updateAdmin = useCallback(async (id: string, name: string, email: string, role: UserRole, outletId?: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, outletId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Gagal mengubah admin.")
        return
      }
      toast.success("Admin berhasil diubah.")
      await reloadInitialData()
    } catch {
      toast.error("Koneksi gagal.")
    }
  }, [reloadInitialData])

  const removeAdmin = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Gagal menghapus admin.")
        return
      }
      toast.success("Admin berhasil dihapus.")
      await reloadInitialData()
    } catch {
      toast.error("Koneksi gagal.")
    }
  }, [reloadInitialData])

  // Transfer CRUD
  const [transfers, setTransfers] = useState<Transfer[]>(initialTransfers)

  const addTransfer = useCallback((fromOutletId: string, toOutletId: string, date: string, note: string, items: TransferItem[]) => {
    setTransfers((prev) => {
      const nextNum = prev.length + 1
      return [
        ...prev,
        {
          id: `TRF-${String(nextNum).padStart(3, "0")}`,
          fromOutletId,
          toOutletId,
          date,
          note,
          items,
          status: "pending" as TransferStatus,
          createdAt: new Date().toISOString(),
        },
      ]
    })
  }, [])

  const updateTransferStatus = useCallback((id: string, status: TransferStatus) => {
    setTransfers((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
  }, [])

  // Piutang CRUD
  const [piutang, setPiutang] = useState<PiutangItem[]>(initialPiutang)

  const lunaskanPiutang = useCallback((id: string) => {
    void (async () => {
      try {
        const res = await fetch(`/api/admin/piutang/${id}`, {
          method: "PATCH",
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error ?? "Gagal melunasi piutang.")
          return
        }
        toast.success("Piutang berhasil dilunasi.")
        await reloadInitialData()
      } catch {
        toast.error("Gagal terhubung ke server.")
      }
    })()
  }, [reloadInitialData])

  // Transactions
  const [transactions, setTransactions] = useState<TransactionRecord[]>(initialTransactions)

  const nextInvoiceNumber = useCallback(() => {
    const year = new Date().getFullYear()
    const count = transactions.length + 1
    return `INV-${year}-${String(count).padStart(4, "0")}`
  }, [transactions.length])

  // Fetch the next invoice number from DB (async version)
  const fetchNextInvoiceNumber = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/transaksi?action=next-invoice")
      const data = await res.json()
      if (data.invoice) return data.invoice as string
    } catch {
      // fallback to local
    }
    const year = new Date().getFullYear()
    const count = transactions.length + 1
    return `INV-${year}-${String(count).padStart(4, "0")}`
  }, [transactions.length])

  const addTransaction = useCallback((tx: Omit<TransactionRecord, "id">) => {
    const id = `TRX-${String(transactions.length + 1).padStart(3, "0")}`
    const newTx: TransactionRecord = { ...tx, id }
    setTransactions((prev) => [newTx, ...prev])

    // Kurangi stok untuk item yang punya productId
    tx.items.forEach((item) => {
      if (item.productId && item.qty > 0) {
        decreaseProductStock(item.productId, tx.outletId, item.qty)
      }
    })

    // Auto-create piutang if payment is less than total
    if (tx.isPiutang && tx.sisa > 0) {
      const piutangId = `PTG-${String(Date.now()).slice(-6)}`
      setPiutang((prev) => [
        ...prev,
        {
          id: piutangId,
          invoice: tx.invoice,
          date: tx.date,
          customerId: "",
          customerName: tx.customerName,
          nopol: tx.nopol,
          total: tx.total,
          paid: tx.nominalBayar,
          outletId: tx.outletId,
          status: "belum_lunas" as const,
        },
      ])
    }

    return newTx
  }, [transactions.length, decreaseProductStock])

  const removeTransaction = useCallback((id: string) => {
    void (async () => {
      try {
        const res = await fetch(`/api/admin/transaksi/${id}`, {
          method: "DELETE",
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          toast.error((data as any)?.error ?? "Gagal menghapus transaksi.")
          return
        }
        toast.success("Transaksi berhasil dihapus.")
        await reloadInitialData()
      } catch {
        toast.error("Koneksi gagal.")
      }
    })()
  }, [reloadInitialData])

  // Categories CRUD (disimpan di database via API)
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories)

  const addCategory = useCallback((name: string) => {
    void (async () => {
      try {
        const trimmed = name.trim()
        if (!trimmed) {
          toast.error("Nama kategori wajib diisi.")
          return
        }
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmed }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          toast.error((data as any)?.error ?? "Gagal menambah kategori.")
          return
        }
        toast.success("Kategori berhasil ditambahkan.")
        await reloadInitialData()
      } catch {
        toast.error("Koneksi gagal.")
      }
    })()
  }, [reloadInitialData])

  const updateCategory = useCallback((id: string, name: string) => {
    void (async () => {
      try {
        const trimmed = name.trim()
        if (!trimmed) {
          toast.error("Nama kategori wajib diisi.")
          return
        }
        const res = await fetch(`/api/admin/categories/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmed }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          toast.error((data as any)?.error ?? "Gagal mengubah kategori.")
          return
        }
        toast.success("Kategori berhasil diubah.")
        await reloadInitialData()
      } catch {
        toast.error("Koneksi gagal.")
      }
    })()
  }, [reloadInitialData])

  const removeCategory = useCallback((id: string) => {
    void (async () => {
      try {
        const res = await fetch(`/api/admin/categories/${id}`, {
          method: "DELETE",
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          toast.error((data as any)?.error ?? "Gagal menghapus kategori.")
          return
        }
        toast.success("Kategori berhasil dihapus.")
        await reloadInitialData()
      } catch {
        toast.error("Koneksi gagal.")
      }
    })()
  }, [reloadInitialData])

  return (
    <OutletContext.Provider
      value={{
        outlets,
        setOutlets,
        addOutlet,
        updateOutlet,
        removeOutlet,
        adminUsers,
        setAdminUsers,
        addAdmin,
        updateAdmin,
        removeAdmin,
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        selectedOutletId,
        setSelectedOutletId,
        selectedOutlet,
        isSuperAdmin,
        availableOutlets,
        logout,
        reloadInitialData,
        products,
        setProducts,

        decreaseProductStock,
        brands,
        addBrand,
        updateBrand,
        removeBrand,
        categories,
        addCategory,
        updateCategory,
        removeCategory,
        customers,
        addCustomer,
        updateCustomer,
        removeCustomer,
        transfers,
        setTransfers,
        addTransfer,
        updateTransferStatus,

        piutang,
        lunaskanPiutang,
        transactions,
        addTransaction,
        removeTransaction,
        nextInvoiceNumber,
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
