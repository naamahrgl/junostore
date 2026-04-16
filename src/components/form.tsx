import { createSignal } from 'solid-js';
import { supabase } from '../lib/supabase';

export default function AuthForm() {
	const [email, setEmail] = createSignal('');
	const [loading, setLoading] = createSignal(false);
	const [message, setMessage] = createSignal<string | null>(null);

	async function signInWithEmail(event: Event) {
		event.preventDefault();
		setLoading(true);
		setMessage(null);

		const { error } = await supabase.auth.signInWithOtp({
			email: email(),
		});

		if (error) {
			setMessage(error.message);
		} else {
			setMessage('Check your email for the login link.');
		}

		setLoading(false);
	}

	async function signInWithGoogle() {
		setLoading(true);
		setMessage(null);

		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
		});

		if (error) {
			setMessage(error.message);
			setLoading(false);
		}
	}

	return (
		<div class="mx-auto w-full max-w-md space-y-4">
			<button type="button" onClick={signInWithGoogle} class="w-full rounded-xl border p-3">
				Continue with Google
			</button>

			<div class="text-center text-sm text-gray-500">OR</div>

			<form onSubmit={signInWithEmail} class="space-y-4">
				<input
					type="email"
					placeholder="Email address"
					class="w-full rounded-xl border p-3"
					value={email()}
					onInput={(e) => setEmail(e.currentTarget.value)}
					required
				/>

				<button
					type="submit"
					disabled={loading()}
					class="w-full rounded-xl bg-blue-600 p-3 text-white"
				>
					Continue with Email
				</button>
			</form>

			{message() && <div class="text-center text-sm text-gray-700">{message()}</div>}
		</div>
	);
}
