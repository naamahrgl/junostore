import { actions } from 'astro:actions';
import type { LineItemInput, Product } from 'storefront:client';
import { createMutation } from '@tanstack/solid-query';
import { For, Show, createEffect, createSignal } from 'solid-js';
import { Button } from '~/components/ui/Button.tsx';
import { NumberInput } from '~/components/ui/NumberInput.tsx';
import { queryClient } from '~/lib/query.ts';
import { CartStore } from './store.ts';

export function TinyAddToCartForm(props: { product: Product }) {
	const [selectedOptions, setSelectedOptions] = createSignal<Record<string, string>>({});
	const [quantity, setQuantity] = createSignal(1);

	// Auto-select first options if not picked
createEffect(() => {
    // 1. Guard against empty arrays
    if (props.product.variants && props.product.variants.length > 0) {
        // 2. Use a local variable or optional chaining to satisfy TS
        const firstVariantOptions = props.product.variants[0]?.options;
        if (firstVariantOptions) {
            setSelectedOptions(firstVariantOptions);
        }
    }
});


	const selectedVariant = () =>
		props.product.variants.find((variant) =>
			Object.entries(selectedOptions()).every(([key, value]) => variant.options[key] === value),
		);

	const mutation = createMutation(
		() => ({
			mutationKey: ['cart', 'items', 'add', props.product.id],
			mutationFn: async (input: LineItemInput) => await actions.cart.addItems.orThrow(input),
			onSuccess: async () => {
				await queryClient.invalidateQueries();
				CartStore.openDrawer();
			},
		}),
		() => queryClient,
	);

	return (
		<form
			class="flex flex-col gap-3"
			onSubmit={(e) => {
				e.preventDefault();
				const variant = selectedVariant();
				if (variant) mutation.mutate({ productVariantId: variant.id, quantity: quantity() });
			}}
		>
			<Show when={props.product.variants.length > 1}>
				<select 
					class="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-sm text-right"
					onChange={(e) => {
						const variant = props.product.variants.find(v => v.id === e.currentTarget.value);
						if (variant) setSelectedOptions(variant.options);
					}}
				>
					<For each={props.product.variants}>
						{(variant) => (
							<option value={variant.id}>
								{/* 🚀 FIX 2: Correctly reference props.product.price */}
								{variant.name} - ₪{(props.product.price / 100).toFixed(0)}
							</option>
						)}
					</For>
				</select>
			</Show>

			<div class="flex items-center gap-2">
				<div class="w-24 shrink-0">
					<NumberInput value={quantity()} setValue={setQuantity} min={1} />
				</div>
				
				<Button 
					type="submit" 
					pending={mutation.isPending} 
					disabled={selectedVariant()?.stock === 0}
					class="flex-1 bg-theme-base-100 text-white rounded-xl py-3 text-lg font-bold shadow-sm"
				>
					{selectedVariant()?.stock === 0 ? "אזל" : "הוסף"}
				</Button>
			</div>
		</form>
	);
}