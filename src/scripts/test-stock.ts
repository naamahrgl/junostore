import "dotenv/config"

import {
  fetchProductsFromBoss,
  fetchStockForProduct
} from "../lib/boss-client"

type BossProductsResponse = {
  Results?: {
    UniqueId: number
  }[]
}

async function testStock() {

  const products =
    await fetchProductsFromBoss() as BossProductsResponse

  const firstProduct =
    products.Results?.[1]

  if (!firstProduct) {

    console.error("No products returned from BOS")

    return
  }

  const firstId =
    firstProduct.UniqueId

  console.log("checking stock for", firstId)

  const stock =
    await fetchStockForProduct(firstId)

  console.log(
    "stock response:",
    JSON.stringify(stock, null, 2)
  )
}

testStock()