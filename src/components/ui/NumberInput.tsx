import { RiSystemAddFill, RiSystemSubtractFill } from 'solid-icons/ri';
import { type ComponentProps, type JSX, splitProps } from 'solid-js';
import { twMerge } from 'tailwind-merge';
import { clamp } from '~/lib/util.ts';

export function NumberInput(
    props: JSX.InputHTMLAttributes<HTMLInputElement> & {
        min?: number;
        max?: number;
        value: number;
        setValue: (value: number) => void;
        size?: 'sm' | 'md'; // Add this prop
    },
) {
    // Default to 'md' if no size is provided
    const size = () => props.size ?? 'md';
    
    // Define size configurations
    const sizes = {
        md: { container: "h-11", input: "w-12 text-base" },
        sm: { container: "h-8", input: "w-8 text-sm" }
    };

    const min = () => props.min ?? 0;
    const max = () => props.max ?? Number.POSITIVE_INFINITY;

    const update = (newValueInput: number) => {
        const newValue = clamp(newValueInput, min(), max());
        if (newValue !== props.value) {
            props.setValue(newValue);
        }
    };

    return (
        <div class={twMerge(
            "flex w-fit items-stretch divide-x divide-slate-300 border border-slate-300 bg-slate-100 text-slate-600",
            sizes[size()].container // Dynamic height
        )}>
            <NumberInputButton
                icon={<RiSystemSubtractFill size={size() === 'sm' ? 14 : 18} />}
                onClick={() => update(props.value - 1)}
                disabled={props.disabled ?? props.value <= min()}
            >
                Decrement
            </NumberInputButton>
            <input
                {...props}
                type="number"
                class={twMerge(
                    "bg-transparent bg-white p-1 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                    sizes[size()].input // Dynamic width/text
                )}
                value={props.value}
                onInput={(e) => update(e.currentTarget.valueAsNumber)}
            />
            <NumberInputButton
                icon={<RiSystemAddFill size={size() === 'sm' ? 14 : 18} />}
                onClick={() => update(props.value + 1)}
                disabled={props.disabled ?? props.value >= max()}
            >
                Increment
            </NumberInputButton>
        </div>
    );
}

function NumberInputButton(
	props: ComponentProps<'button'> & {
		icon: JSX.Element;
	},
) {
	const [local, others] = splitProps(props, ['icon', 'children']);
	return (
		<button
			type="button"
			class="flex aspect-square h-full items-center justify-center transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:text-slate-400"
			{...others}
		>
			<span class="sr-only">{local.children}</span>
			{local.icon}
		</button>
	);
}
