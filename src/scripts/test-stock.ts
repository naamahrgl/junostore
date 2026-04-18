import "dotenv/config"

import {
  fetchProductsFromBoss,
  fetchStocksFromBoss,
  fetchStockForProduct
} from "../lib/boss-client"

type BossProductsResponse = {
  Results?: {
    UniqueId: number
  }[]
}

async function testStock() {



  console.log("checking stock for",)

  const stock =
    await fetchStocksFromBoss()

      if (!stock.Results || stock.Results.length === 0) {

    console.error("No products returned from BOS")

    return
  }

  console.log(
    "stock response:",
    JSON.stringify(stock, null, 2).slice(0, 5000)
  )
}

testStock()