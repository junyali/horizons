<script lang="ts">
	interface Props {
		backLabel?: string;
		nextLabel?: string;
		loadingLabel?: string;
		onback: () => void;
		onnext: () => void;
		disabled?: boolean;
		loading?: boolean;
		blink?: boolean;
	}

	let {
		backLabel = '← BACK',
		nextLabel = 'NEXT →',
		loadingLabel = 'SAVING...',
		onback,
		onnext,
		disabled = false,
		loading = false,
		blink = false,
	}: Props = $props();
</script>

<div class="flex gap-2.5 items-center justify-center w-full">
	<button
		class="back-btn border-2 border-black rounded-lg px-4 py-2 w-[231px] font-bricolage text-base font-semibold text-black cursor-pointer bg-[#f3e8d8]"
		type="button"
		onclick={onback}
	>
		{backLabel}
	</button>
	<button
		class="next-btn bg-[#ffa936] border-2 border-black rounded-lg px-4 py-2 w-[231px] font-bricolage text-base font-semibold text-black cursor-pointer"
		class:blink
		type="button"
		onclick={onnext}
		disabled={disabled || loading}
	>
		{loading ? loadingLabel : nextLabel}
	</button>
</div>

<style>
	.back-btn, .next-btn {
		transition: transform var(--juice-duration) var(--juice-easing);
	}
	.back-btn:hover, .next-btn:hover {
		transform: scale(var(--juice-scale));
	}

	.blink {
		animation: white-blink 1.5s ease-in-out infinite;
	}

    @keyframes white-blink {
        0%, 100% { background-color: #fdd9a8; }
        50% { background-color: #fba74d; }
    }
</style>
