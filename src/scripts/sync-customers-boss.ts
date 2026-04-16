import "dotenv/config"
import { fetchCustomersFromBoss } from "../lib/boss-client" // Ensure this is exported from your lib
import { supabase } from "../lib/supabase"

// ====== CONFIG ======
const PAGE_SIZE = 50
const MAX_CUSTOMERS = null // Set to 50 for testing, null for production

// ====== TYPES (Based on your JSON example) ======
type BossPhone = {
  Number: string
  Description?: string
  TableHandle?: { Index: number }
}

type BossAddress = {
  UniqueId: number
  City?: { Name: string }
  Street?: { Name: string }
  HouseNum?: string
  UsageTypes?: Record<string, boolean>
}

type BossCustomer = {
  UniqueId: number
  Status: string
  FirstName: string
  LastName: string
  HasPassWord?: boolean
  Phone?: BossPhone[]
  Address?: BossAddress
  SmsAllowed?: boolean
  EmailAllowed?: boolean
  WhatsAppAllowed?: boolean
  NumOfMoveMents?: number
  RewardPoints?: any
  AssociatedBranch?: any
}

type BossCustomersResponse = {
  Results?: BossCustomer[]
}

// ====== STEP 1: Fetch all customers with pagination ======
async function fetchAllCustomers(): Promise<BossCustomer[]> {
  let all: BossCustomer[] = []
  let start = 0

  while (true) {
    // Note: Reusing your fetch function logic
    const data = await fetchCustomersFromBoss(start, PAGE_SIZE) as BossCustomersResponse
    const batch = data.Results ?? []

    all.push(...batch)
    console.log(`Fetched ${all.length} customers...`)

    if (batch.length < PAGE_SIZE) break
    if (MAX_CUSTOMERS && all.length >= MAX_CUSTOMERS) {
      return all.slice(0, MAX_CUSTOMERS)
    }

    start += PAGE_SIZE
  }
  return all
}

// ====== STEP 2: Sync to Supabase ======
async function syncCustomers(customers: BossCustomer[]) {
  const rows = customers.map(c => ({
    id: c.UniqueId,
    status: c.Status ?? null,
    first_name: c.FirstName ?? null,
    last_name: c.LastName ?? null,
    has_password: c.HasPassWord ?? false,
    
    // Mapping complex objects to JSONB columns
    phone_numbers: c.Phone ?? [], 
    address: c.Address ?? null,
    reward_points: c.RewardPoints ?? {},
    associated_branch: c.AssociatedBranch ?? {},
    
    // Permissions & Stats
    sms_allowed: c.SmsAllowed ?? false,
    email_allowed: c.EmailAllowed ?? false,
    whatsapp_allowed: c.WhatsAppAllowed ?? false,
    num_of_movements: c.NumOfMoveMents ?? 0,
    
    updated_at: new Date().toISOString()
  }))

  const { error } = await supabase
    .from("customers")
    .upsert(rows, { onConflict: "id" })

  if (error) {
    console.error("❌ Customers upsert failed:", error.message)
    // If you see RLS errors here, remember to use the Service Role Key!
    throw error
  }

  console.log(`✅ Successfully synced ${rows.length} customers`)
}

// ====== MAIN ======
async function main() {
  console.log("🚀 Starting BOSS Customer Sync")

  try {
    const customers = await fetchAllCustomers()

    if (!customers.length) {
      console.warn("⚠️ No customers found")
      return
    }

    console.log(`Total customers to sync: ${customers.length}`)
    await syncCustomers(customers)

    console.log("🎉 CUSTOMER SYNC DONE")
  } catch (err) {
    console.error("💥 Fatal error during sync:", err)
    process.exit(1)
  }
}

main()
