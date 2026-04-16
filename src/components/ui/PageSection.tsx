import { type JSX, type ParentProps, splitProps } from 'solid-js';
import { twMerge } from 'tailwind-merge';

interface PageSectionProps extends JSX.HTMLAttributes<HTMLElement> {
	children?: JSX.Element;
}

export function PageSection(props: PageSectionProps) {
	const [local, others] = splitProps(props, ['children', 'class']);

	return (
		<section class={`flex flex-col gap-4  ${local.class || ''}`} {...others}>
			{local.children}
		</section>
	);
}

export function PageHeading(props: ParentProps<JSX.HTMLAttributes<HTMLHeadingElement>>) {
	const [local, others] = splitProps(props, ['children', 'class']);
	return (
		<h2 {...others} class={twMerge('text-4xl font-bold md:text-6xl', local.class)}>
			{local.children}
		</h2>
	);
}

export function PageSubHeading(props: ParentProps<JSX.HTMLAttributes<HTMLHeadingElement>>) {
	const [local, others] = splitProps(props, ['children', 'class']);
	return (
		<h2 {...others} class={twMerge('text-2xl  md:text-3xl', local.class)}>
			{local.children}
		</h2>
	);
}

export function PageSubtitle(props: ParentProps<JSX.HTMLAttributes<HTMLHeadingElement>>) {
	const [local, others] = splitProps(props, ['children', 'class']);
	return (
		<h2 {...others} class={twMerge('text-xs md:text-xl', local.class)}>
			{local.children}
		</h2>
	);
}