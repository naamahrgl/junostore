// src/lib/boss-auth.ts

type BossAuthResponse = {
  access_token: string
  token_type: string
  expires_in: number
}

let cachedToken: string | null = null
let tokenExpiresAt = 0

export async function getBossToken() {
    console.log("env check", {
  user: process.env.BOSS_USERNAME,
  url: process.env.BOSS_API_URL
})

  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken
  }

  const res = await fetch(
    `${process.env.BOSS_API_URL}/token`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "password",
        UserName: process.env.BOSS_USERNAME!,
        Password: process.env.BOSS_PASSWORD!,
        ProxyPassword: process.env.BOSS_PROXY_PASSWORD!,
        BossUniqueId: process.env.BOSS_UNIQUE_ID!
      })
    }
  )

  if (!res.ok) {

    console.error("auth failed", res.status)

    console.error(await res.text())

    throw new Error("BOS auth failed")
  }

  const json = await res.json() as BossAuthResponse

  cachedToken = json.access_token

  tokenExpiresAt =
    Date.now() + (json.expires_in - 60) * 1000

  return cachedToken
}