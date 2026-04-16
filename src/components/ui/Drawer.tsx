import { Dialog } from '@kobalte/core/dialog';
import { RiSystemCloseLine } from 'solid-icons/ri';
import type { JSX } from 'solid-js/types/jsx.d.ts';

export function Drawer(props: {
	title: string;
	trigger?: JSX.Element;
	children: JSX.Element;
	defaultOpen?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}) {
	return (
		<Dialog
			defaultOpen={props.defaultOpen}
			open={props.open}
			onOpenChange={props.onOpenChange}
			preventScroll={false}
		>
			<Dialog.Trigger>{props.trigger}</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay class="fixed inset-0 bg-black/25 ui-expanded:animate-in ui-expanded:fade-in ui-closed:animate-out ui-closed:fade-out" />
				<Dialog.Content class="fixed inset-y-0 right-0 flex w-[min(560px,100vw)] flex-col bg-white ease-out ui-expanded:animate-in ui-expanded:fade-in ui-expanded:slide-in-from-right-4 ui-closed:animate-out ui-closed:fade-out ui-closed:slide-out-to-right-4">
					<header class="flex h-14 flex-row items-center justify-between px-4">
						<Dialog.Title class="text-2xl font-bold">{props.title}</Dialog.Title>
						<Dialog.CloseButton class="size-9 border border-theme-base-600 bg-theme-base-600 text-theme-base-200 transition grid-center hover:border-theme-base-600">
							<RiSystemCloseLine />
							<span class="sr-only">Dismiss</span>
						</Dialog.CloseButton>
					</header>
					<div class="border-b border-theme-base-600" />
					<main class="flex-1 overflow-y-auto px-6">{props.children}</main>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog>
	);
}
