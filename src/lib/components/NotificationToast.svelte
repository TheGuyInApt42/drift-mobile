<script lang="ts">
	interface Props {
		message: string;
		type?: 'success' | 'info' | 'warning' | 'error';
		duration?: number;
		onClose?: () => void;
	}

	let { message, type = 'info', duration = 3000, onClose = () => {} }: Props = $props();

	let isVisible = $state(true);

	const typeClasses = {
		success: 'bg-green-500/20 text-green-300 border-green-500/30',
		info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
		warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
		error: 'bg-red-500/20 text-red-300 border-red-500/30'
	};

	const typeIcons = {
		success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
		info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
		warning:
			'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
		error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
	};

	function closeToast() {
		isVisible = false;
		setTimeout(() => {
			onClose();
		}, 300); // Wait for animation to complete
	}

	// Auto close after duration
	if (duration > 0) {
		setTimeout(closeToast, duration);
	}
</script>

{#if isVisible}
	<div
		class="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 backdrop-blur-md transition-all duration-300 {typeClasses[
			type
		]} {isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}"
		role="alert"
		aria-live="polite"
	>
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d={typeIcons[type]}
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
		<span class="text-sm font-medium">{message}</span>
		<button
			onclick={closeToast}
			class="ml-2 rounded-full p-1 transition hover:bg-white/10"
			aria-label="Close notification"
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path
					d="M18 6L6 18M6 6l12 12"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>
	</div>
{/if}
