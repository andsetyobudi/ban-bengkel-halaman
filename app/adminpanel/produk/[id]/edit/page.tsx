"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useOutlet } from "@/lib/outlet-context"
import { ProductForm } from "../../_components/product-form"

export default function EditProdukPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : ""
  const { products, reloadInitialData } = useOutlet()
  const [loading, setLoading] = useState(true)

  const product = useMemo(() => products.find((p) => p.id === id) ?? null, [products, id])

  useEffect(() => {
    let cancelled = false
      ; (async () => {
        if (!id) {
          toast.error("ID produk tidak valid.")
          router.push("/adminpanel/produk")
          return
        }
        try {
          await reloadInitialData()
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
    return () => {
      cancelled = true
    }
  }, [id, reloadInitialData, router])

  useEffect(() => {
    if (loading) return
    if (!product) {
      toast.error("Produk tidak ditemukan.")
      router.push("/adminpanel/produk")
    }
  }, [loading, product, router])

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground">Memuat...</div>
  }

  if (!product) return null

  return <ProductForm mode="edit" productId={id} initial={product} />
}

