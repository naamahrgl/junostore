// src/lib/boss-client.ts
import { getBossToken } from "./boss-auth.ts"

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


export async function fetchProductsFromBoss(start = 0, max = 50): Promise<BossProductsResponse> {

  const token = await getBossToken()

  const url =
    `${process.env.BOSS_API_URL}/api/Product?StartPoint=${start}&MaxResults=${max}`

  console.log("👉 FETCH:", url)

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })


  if (!res.ok) {
    console.error(await res.text())
    throw new Error("failed fetching products")
  }

const data = await res.json() as BossProductsResponse
  console.log("👉 full response keys:", Object.keys(data))
console.log("👉 MaxAvailableResults:", (data as any).MaxAvailableResults)

  console.log(
    `👉 got ${data.Results?.length ?? 0} results (start=${start})`
  )

  return data
}

// src/lib/boss-client.ts

export async function fetchStockForProduct(productId: number): Promise<BossStockResponse>  {

  const token = await getBossToken()

  const endpoint =
    `${process.env.BOSS_API_URL}/api/ProductBranch?ProductUniqueId=${productId}`

  const res = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {

    console.error("stock fetch failed", res.status)

    console.error(await res.text())

    throw new Error("stock fetch failed")
  }

  return res.json() as BossStockResponse
}


export async function fetchStocksFromBoss(): Promise<BossStockResponse>  {

  const token = await getBossToken()

  const url =
    `${process.env.BOSS_API_URL}/api/ProductBranch`

  console.log("👉 FETCH:", url)

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })


  if (!res.ok) {
    console.error(await res.text())
    throw new Error("failed fetching products")
  }

const data = await res.json() as BossStockResponse
  console.log("👉 full response keys:", Object.keys(data))

  console.log(
    `👉 got ${data.Results?.length ?? 0})`
  )

  return data
}

export async function fetchCustomersFromBoss(start = 0, max = 50): Promise<BossCustomersResponse> {

  const token = await getBossToken()

  const url =
    `${process.env.BOSS_API_URL}/api/Client?StartPoint=${start}&MaxResults=${max}`

  console.log("👉 FETCH:", url)

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })


  if (!res.ok) {
    console.error(await res.text())
    throw new Error("failed fetching products")
  }

const data = await res.json() as BossCustomersResponse
  console.log("👉 full response keys:", Object.keys(data))
console.log("👉 MaxAvailableResults:", (data as any).MaxAvailableResults)

  console.log(
    `👉 got ${data.Results?.length ?? 0} results (start=${start})`
  )

  return data
}

export async function fetchProductById(id: number): Promise<BossProductsResponse> {

  const token = await getBossToken()

  const url =
    `${process.env.BOSS_API_URL}/api/Product/${id}`

  console.log("👉 FETCH:", url)

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })


  if (!res.ok) {
    console.error(await res.text())
    throw new Error("failed fetching products")
  }

const data = await res.json() as BossProductsResponse
  console.log("👉 full response keys:", Object.keys(data))
console.log("👉 MaxAvailableResults:", (data as any).MaxAvailableResults)

  console.log(
    `👉 got ${data.Results?.length ?? 0} results (id=${id})`
  )

  return data
}

export async function createBossCustomer(formData: { firstName: string, lastName: string, email: string, phone: string }) {
  // Inside getBossToken
console.log("🔑 Auth Attempt with:", process.env.BOSS_USERNAME); 
// Check if this prints 'undefined' or the wrong username

  const token = await getBossToken();
  const url = `${process.env.BOSS_API_URL}/api/Client`;

  const body = {
    FirstName: formData.firstName,
    LastName: formData.lastName,
    Email: formData.email,
    Phone: [{ Number: formData.phone }]
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Boss API Error Details:", errorText); // This will tell you if it's a validation error
    throw new Error(`Failed to create customer: ${res.status}`);
  }

  return await res.json();
}


export async function findCustomerByEmail(){}
export async function createOrder(){}