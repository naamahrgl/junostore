// src/scripts/test-boss.ts

import "dotenv/config"

import { fetchCustomersFromBoss } from "../lib/boss-client"

async function testBoss() {
  

  console.log("fetching boss products...")

  const data = await fetchCustomersFromBoss(0, 10)

  console.log(
    "response preview:",
    JSON.stringify(data, null, 2).slice(0, 9000)
  )

}

testBoss()