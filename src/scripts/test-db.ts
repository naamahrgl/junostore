// src/scripts/test-db.ts
import "dotenv/config";
import { supabase } from "../lib/supabase";

async function testDB() {

  console.log("SUPABASE_URL:", process.env.SUPABASE_URL);

  const testProduct = {
    id: 999999,
    name: "test product",
    description: "testing",
    price: 10,
    category: "test",
    image_url: "",
    active: true,
    updated_at: new Date().toISOString(),
    raw_json: { test: true }
  };

  const insertRes = await supabase
    .from("products")
    .upsert(testProduct);

  console.log("insert result:", insertRes);

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", 999999)
    .single();

  console.log("fetch result:", data);
  console.log("error:", error);
}

testDB();