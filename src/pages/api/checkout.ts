import type { APIRoute } from "astro"

import { z } from "zod"

import { loadCartFromCookies }
  from "~/features/cart/cart.server"

import {
  fetchStockForProduct
} from "~/lib/boss-client"

export const prerender = false; // Add this line

/*
request body schema
מונע unknown
*/

const checkoutSchema = z.object({

  email:
    z.string().email(),

  phone:
    z.string().min(5),

  name:
    z.string().min(2),

  address:
    z.string().min(3)
})



type BossStockResponse = {

  Results?: {

    ProductInfo?: {
      UniqueId: number
    }

    BranchInfo?: {

      UniqueId: number

      StorageAmounts?: {

        Current?: number
      }
    }

  }[]
}



export const POST: APIRoute = async ({ cookies, request }) => {
  console.log("Full Headers:", Object.fromEntries(request.headers.entries()));
  const clonedRequest = request.clone();
  console.log("Raw Body Text:", await clonedRequest.text());
  const cart = await loadCartFromCookies(cookies);

 
  // Check if the content-type is actually JSON
  const contentType = request.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return new Response(JSON.stringify({ error: "Invalid Content-Type" }), { status: 400 });
  }

  let body;
  try {
    body = await request.json();
    const validatedBody = checkoutSchema.parse(body);
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON or Validation Failed" }), { status: 400 });
  }



  /*
  stock validation
  */

  for (const item of cart.items) {

    const productId =
      Number(
        item.productVariant.product.id
      )

    if (
      Number.isNaN(productId)
    ) {

      return new Response(

        JSON.stringify({

          error:
            "invalid product id"
        }),

        { status: 400 }
      )
    }



    const stock =
      await fetchStockForProduct(
        productId
      ) as BossStockResponse



    const available =
      stock.Results?.[0]
        ?.BranchInfo
        ?.StorageAmounts
        ?.Current ?? 0



    if (
      available <
      item.quantity
    ) {

      return new Response(

        JSON.stringify({

          error:
            `not enough stock for ${item.productVariant.product.name}`
        }),

        { status: 400 }
      )
    }
  }



  /*
  TEMP:
  עד שנחבר createOrder אמיתי
  רק מחזירים הצלחה
  */

  return new Response(

    JSON.stringify({

      ok: true
    }),

    { status: 200 }
  )
}