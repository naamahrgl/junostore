import { createSignal } from "solid-js"
import { supabase } from "../lib/supabase"

export default function LoginForm() {
  const [email, setEmail] = createSignal("")
  const [loading, setLoading] = createSignal(false)

  async function signInWithEmail() {
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email: email(),
        options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`
  }
    })

    if (error) {
      alert(error.message)
    } else {
      alert("Check your email ✉️")
    }

    setLoading(false)
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
    })
  }

  return (
    <div class="w-full max-w-md mx-auto space-y-4 mt-4">
      <button
        onClick={signInWithGoogle}
        class="w-full border rounded-xl p-3 bg-white text-gray-400"
      >
        Continue with Google
      </button>

      <div class="text-center text-sm text-gray-500">OR</div>

      <input
        type="email"
        placeholder="Email address"
        class="w-full border rounded-xl p-3 text-center"
        value={email()}
        onInput={(e) => setEmail(e.currentTarget.value)}
      />

      <button
        onClick={signInWithEmail}
        disabled={loading()}
        class="w-full bg-theme-base-600 text-white rounded-xl p-3"
      >
        הירשמו
      </button>
    </div>
  )
}
