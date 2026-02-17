<script lang="ts">
	interface Props {
		message: string | null;
	}

	let { message }: Props = $props();
</script>

{#if message}
	<p class="font-bricolage text-sm font-semibold text-red-600 m-0 text-center">{message}</p>
{/if}
