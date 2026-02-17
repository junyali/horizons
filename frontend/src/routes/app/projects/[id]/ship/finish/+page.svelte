<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import InputPrompt from '$lib/components/InputPrompt.svelte';
	import heroPlaceholder from '$lib/assets/projects/hero-placeholder.png';
	import { api } from '$lib/api';
	import TurbulentImage from '$lib/components/TurbulentImage.svelte';

	const projectId = $derived($page.params.id);

	let loading = $state(true);
	let submitting = $state(false);
	let errorMsg = $state<string | null>(null);
	let heroUrl = $state<string | null>(null);
	let projectTitle = $state('');

	async function fetchProject(id: string) {
		loading = true;
		const { data } = await api.GET('/api/projects/auth/{id}', {
			params: { path: { id: parseInt(id) } }
		});
		if (data) {
			const p = data as any;
			heroUrl = p.screenshotUrl ?? null;
			projectTitle = p.projectTitle ?? '';
		}
		loading = false;
	}

	$effect(() => {
		if (projectId) fetchProject(projectId);
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			goto(`/app/projects/${projectId}`);
		}
	}

	async function handleSubmit() {
		submitting = true;
		errorMsg = null;

		const { error } = await api.POST('/api/projects/auth/submissions', {
			body: {
				projectId: Number(projectId),
			},
		});

		if (!error) {
			goto(`/app/projects/${projectId}`);
		} else {
			errorMsg = 'Failed to submit project. Please try again.';
		}

		submitting = false;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="relative size-full">
	{#if loading}
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
			<p class="font-cook text-[36px] font-semibold text-black m-0">LOADING...</p>
		</div>
	{:else}
		<!-- Hero image -->
		<div
			class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+73px)] w-214 h-120.5 z-0 pointer-events-none"
		>
			<TurbulentImage
				src={heroUrl || heroPlaceholder}
				alt={projectTitle}
				inset="0 0 0 0"
				filterId="hero-turbulence"
			/>
		</div>

		<!-- Submit card -->
		<div class="absolute left-1/2 top-9/16 -translate-x-[calc(50%+0.5px)] -translate-y-[calc(50%+0.5px)] w-[727px] bg-[#f3e8d8] border-4 border-black rounded-[20px] p-[30px] shadow-[4px_4px_0px_0px_black] flex flex-col gap-4 overflow-clip z-[1]">
			<!-- Header -->
			<div class="flex flex-col gap-2 text-black w-full">
				<h1 class="font-cook text-[36px] font-semibold m-0 leading-normal">READY TO SUBMIT?</h1>
				<p class="font-bricolage text-[20px] leading-[1.5] tracking-[-0.22px] m-0">Hit submit to submit your project. You won't be able to make any changes until your project is reviewed. You can resubmit your project once reviewed.</p>
			</div>

			<!-- Form buttons -->
			{#if errorMsg}
				<p class="font-bricolage text-sm font-semibold text-red-600 m-0 text-center">{errorMsg}</p>
			{/if}
			<div class="flex gap-2.5 items-center justify-center w-full">
				<button
					class="hover-juice border-2 border-black rounded-lg px-4 py-2 w-[231px] font-bricolage text-base font-semibold text-black cursor-pointer bg-[#f3e8d8]"
					type="button"
					onclick={() => goto(`/app/projects/${projectId}/ship/personal`)}
				>
					← BACK
				</button>
				<button
					class="hover-juice bg-[#ffa936] border-2 border-black rounded-lg px-4 py-2 w-[231px] font-bricolage text-base font-semibold text-black cursor-pointer"
					type="button"
					onclick={handleSubmit}
					disabled={submitting}
				>
					{submitting ? 'SUBMITTING...' : 'SUBMIT →'}
				</button>
			</div>
		</div>
	{/if}

	<!-- Back button -->
	<button class="hover-juice-bg absolute left-8 top-13 z-5 flex items-center gap-2.5 p-5 bg-[#f3e8d8] border-4 border-black rounded-[20px] shadow-[4px_4px_0px_0px_black] cursor-pointer overflow-hidden" onclick={() => goto(`/app/projects/${projectId}`)}>
		<InputPrompt type="ESC" />
		<span class="font-cook text-2xl font-semibold text-black">BACK</span>
	</button>
</div>

<style>
	.hover-juice {
		transition: transform var(--juice-duration) var(--juice-easing);
	}
	.hover-juice:hover {
		transform: scale(var(--juice-scale));
	}

	.hover-juice-bg {
		transition:
			background-color var(--selected-duration) ease,
			transform var(--juice-duration) var(--juice-easing);
	}
	.hover-juice-bg:hover {
		background-color: #ffa936;
		transform: scale(var(--juice-scale));
	}
</style>
