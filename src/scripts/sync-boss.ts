import "dotenv/config"

import { fetchProductsFromBoss, fetchStockForProduct } from "../lib/boss-client"
import { supabase } from "../lib/supabase"

// ====== CONFIG ======
const PAGE_SIZE = 50         // כמה מוצרים להביא בכל בקשה
const MAX_PRODUCTS = null      // 👉 לבדיקה: שימי 50. לפרודקשן: null

// כמה בקשות מלאי במקביל
const STOCK_CONCURRENCY = 5

// =====================

type BossPrice = {
  VatExc: number
  VatInc: number
  TableHandle?: { Index: number }
}
type BossCats = {
  UniqueId: number
  Name: string
  TableHandle?: { Index: number }
}
type BossExInfo = {
  Status: string
  Name?: string
  NoteUniqueId?: number
}

type BossProduct = {
  UniqueId: number
  Name?: string
  CostVatExc?: number
  Price?: BossPrice[]
  Category?: BossCats[]
  Active?: boolean
  ImageURL?: string
  ExternalInfo?: BossExInfo
}

type BossProductsResponse = {
  Results?: BossProduct[]
}

type BossStockRow = {
  ProductInfo?: { UniqueId: number }
  BranchInfo?: {
    UniqueId: number
    StorageAmounts?: {
      Current?: number
    }
  }
}

type BossStockResponse = {
  Results?: BossStockRow[]
}

// ====== STEP 1: fetch all products (with pagination) ======
async function fetchAllProducts(): Promise<BossProduct[]> {
  let all: BossProduct[] = []
  let start = 0

  while (true) {
    const data = await fetchProductsFromBoss(start, PAGE_SIZE) as BossProductsResponse

    const batch = data.Results ?? []

    all.push(...batch)

    console.log(`fetched ${all.length} products`)

    if (batch.length < PAGE_SIZE) break

    if (MAX_PRODUCTS && all.length >= MAX_PRODUCTS) {
      return all.slice(0, MAX_PRODUCTS)
    }

    start += PAGE_SIZE
  }

  return all
}

// ====== STEP 2: sync products ======
async function syncProducts(products: BossProduct[]) {
  const rows = products.map(p => ({
    id: p.UniqueId,
    name: p.Name ?? null,
    cost_vat_exc: p.CostVatExc ?? null,
    active: p.Active ?? null,
    prices: p.Price ?? null,
        categories: p.Category ?? null,
external_info: p.ExternalInfo ?? null,
    image_url: p.ImageURL ?? null
  }))

  const { error } = await supabase
    .from("products")
    .upsert(rows, { onConflict: "id" })

  if (error) {
    console.error("❌ products upsert failed:", error.message)
    throw error
  }

  console.log(`✅ synced ${rows.length} products`)
}

// ====== STEP 3: sync stock (with concurrency limit) ======
async function syncStock(products: BossProduct[]) {
  const queue = [...products]

  async function worker() {
    while (queue.length) {
      const product = queue.shift()
      if (!product) return

      try {
        const stock = await fetchStockForProduct(product.UniqueId) as BossStockResponse

        const rows = (stock.Results ?? []).map(s => ({
          product_id: s.ProductInfo?.UniqueId,
          branch_id: s.BranchInfo?.UniqueId,
          quantity: s.BranchInfo?.StorageAmounts?.Current ?? 0
        }))

        if (rows.length > 0) {
          const { error } = await supabase
            .from("stock")
            .upsert(rows)

          if (error) {
            console.error(`❌ stock failed for ${product.UniqueId}`, error.message)
          }
        }

        console.log(`stock synced for ${product.UniqueId}`)
      } catch (err) {
        console.error(`❌ stock fetch failed for ${product.UniqueId}`)
      }
    }
  }

  const workers = Array.from({ length: STOCK_CONCURRENCY }, () => worker())

  await Promise.all(workers)

  console.log("✅ stock sync done")
}

// ====== MAIN ======
async function main() {
  console.log("🚀 starting BOSS sync")

  const products = await fetchAllProducts()

  if (!products.length) {
    console.warn("⚠️ no products found")
    return
  }

  console.log(`total products to sync: ${products.length}`)

  await syncProducts(products)

  await syncStock(products)

  console.log("🎉 ALL DONE")
}

main()