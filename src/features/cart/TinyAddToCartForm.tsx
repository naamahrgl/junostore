import { actions } from 'astro:actions';
import type { LineItemInput, Product } from 'storefront:client';
import { createMutation } from '@tanstack/solid-query';
import { For, Show, createEffect, createSignal } from 'solid-js';
import { Button } from '~/components/ui/Button.tsx';
import { NumberInput } from '~/components/ui/NumberInput.tsx';
import { queryClient } from '~/lib/query.ts';
import { CartStore } from './store.ts';
import { RiSystemCheckLine } from 'solid-icons/ri';


export function TinyAddToCartForm(props: { product: Product }) {
	const [selectedOptions, setSelectedOptions] = createSignal<Record<string, string>>({});
	const [quantity, setQuantity] = createSignal(1);

	createEffect(() => {
		if (props.product.variants && props.product.variants.length > 0) {
			const firstVariantOptions = props.product.variants[0]?.options;
			if (firstVariantOptions) setSelectedOptions(firstVariantOptions);
		}
	});

	const selectedVariant = () =>
		props.product.variants.find((variant) =>
			Object.entries(selectedOptions()).every(([key, value]) => variant.options[key] === value),
		);

	const productOptionValues = () => {
		const result = new Map<string, Set<string>>();
		for (const variant of props.product.variants) {
			for (const [option, value] of Object.entries(variant.options)) {
				const values = result.get(option) ?? new Set();
				values.add(value);
				result.set(option, values);
			}
		}
		return result;
	};

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
			class="flex flex-col w-full gap-3"
			onSubmit={(e) => {
				e.preventDefault();
				const variant = selectedVariant();
				if (variant) mutation.mutate({ productVariantId: variant.id, quantity: quantity() });
			}}
		>
			{/* COMPACT WRAPPING VARIANTS */}
			<Show when={props.product.variants.length > 1}>
				<div class="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto py-1 justify-center">
					<For each={[...productOptionValues().entries()]}>
						{([option, values]) => (
							<For each={[...values]}>
								{(value) => (
									<label class="cursor-pointer group">
										<input
											type="radio"
											name={`${props.product.id}-${option}`}
											class="peer sr-only"
											checked={selectedOptions()[option] === value}
											onChange={() => setSelectedOptions(prev => ({ ...prev, [option]: value }))}
										/>
										<div class="px-2 py-1 text-[10px] font-bold border rounded-lg border-slate-200 bg-slate-50 text-slate-500 peer-checked:border-theme-base-600 peer-checked:bg-theme-base-600 peer-checked:text-white transition-all">
											{value}
										</div>
									</label>
								)}
							</For>
						)}
					</For>
				</div>
			</Show>

			{/* ACTION ROW: ALIGNED */}
			<div class="flex items-center gap-2 w-full mt-auto ">
				<div class=" shrink-0">
					<NumberInput value={quantity()} setValue={setQuantity} min={1} size="sm" />
				</div>
				
				<Button 
					type="submit" 
					pending={mutation.isPending} 
					disabled={selectedVariant()?.stock === 0}
					class="flex-1 bg-theme-base-600 text-white rounded-xl py-2 text-xs font-bold shadow-sm whitespace-nowrap"
				>
					{selectedVariant()?.stock === 0 ? "אזל" : "הוסף לסל"}
				</Button>
			</div>
		</form>
	);
}
