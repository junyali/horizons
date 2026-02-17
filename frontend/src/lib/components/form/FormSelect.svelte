<script lang="ts">
	interface Props {
		label: string;
		id: string;
		value?: string;
		options: { label: string; value: string }[];
	}

	let {
		label,
		id,
		value = $bindable(''),
		options,
	}: Props = $props();
</script>

<div class="flex flex-col gap-1 w-full">
	<label class="font-bricolage text-base font-semibold text-black leading-normal" for={id}>{label}</label>
	<div class="relative w-full">
		<select {id} class="bg-[#f3e8d8] border-2 border-black rounded-lg px-4 py-2 pr-10 shadow-[2px_2px_0px_0px_black] font-bricolage text-base font-semibold text-black w-full outline-none appearance-none cursor-pointer" bind:value>
			{#each options as opt}
				<option value={opt.value}>{opt.label}</option>
			{/each}
		</select>
		<svg class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="8" viewBox="0 0 12 8" fill="none">
			<path d="M1 1.5L6 6.5L11 1.5" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
	</div>
</div>
