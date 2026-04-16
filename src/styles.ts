import { type ClassNameValue, twMerge } from 'tailwind-merge';

export function button({
	theme = 'dark',
	className,
}: {
	theme?: 'light' | 'dark' |'ghost';
	className?: ClassNameValue;
} = {}) {
	return twMerge(
		theme === 'dark' && 'bg-theme-base-900 hover:bg-theme-base-600 text-theme-base-600 rounded-xl',
		theme === 'light' && 'bg-theme-base-600 hover:bg-theme-base-200 text-theme-base-400 rounded-xl',
		theme === 'ghost' && ' hover:bg-theme-base-900 text-theme-base-600 border-2 border-theme-base-600 rounded-xl',

		'h-9 px-4 text-sm font-semibold uppercase transition flex items-center justify-center gap-1.5',
		className,
	);
}

export function input({
	theme = 'light',
	className,
}: {
	theme?: 'light' | 'dark' | 'ghost';
	className?: ClassNameValue;
} = {}) {
	return twMerge(
		'border px-3 min-h-9 min-w-0 block w-64',
		theme === 'dark' && 'bg-theme-base-800 text-white border-theme-base-700',
		theme === 'light' && 'bg-theme-base-100 text-theme-base-600 border-theme-base-200',
				theme === 'ghost' && ' text-theme-base-100 border-theme-base-100',
		className,
	);
}

export function card({ className }: { className?: ClassNameValue } = {}) {
	return twMerge('relative flex bg-theme-base-100', className);
}