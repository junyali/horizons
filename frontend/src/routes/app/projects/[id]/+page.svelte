<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import heroPlaceholder from '$lib/assets/projects/hero-placeholder.png';
	import InputPrompt from '$lib/components/InputPrompt.svelte';
	import TurbulentImage from '$lib/components/TurbulentImage.svelte';
	import { api, type components } from '$lib/api';

	type ProjectResponse = components['schemas']['ProjectResponse'];

	const projectId = $derived($page.params.id);

	let project = $state<ProjectResponse | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	async function fetchProject(id: string) {
		loading = true;
		error = null;
		const { data, error: err } = await api.GET('/api/projects/auth/{id}', {
			params: { path: { id } }
		});
		if (data) {
			project = data as ProjectResponse;
		} else {
			error = 'Failed to load project';
		}
		loading = false;
	}

	$effect(() => {
		fetchProject(projectId);
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			goto('/app/projects?noanimate');
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="relative size-full">
	{#if loading}
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
			<p class="font-cook text-[36px] font-semibold text-black m-0">LOADING...</p>
		</div>
	{:else if error}
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
			<p class="font-cook text-[36px] font-semibold text-black m-0">ERROR</p>
			<p class="font-bricolage text-[32px] font-semibold text-black m-0">{error}</p>
		</div>
	{:else if project}
		<!-- Hero image -->
		<div
			class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+73px)] w-214 h-120.5 z-0 pointer-events-none"
		>
			<TurbulentImage
				src={project.screenshotUrl || heroPlaceholder}
				alt={project.projectTitle}
				inset="0 0 0 0"
				filterId="hero-turbulence"
			/>
		</div>

		<!-- Project details card -->
		<div
			class="absolute bottom-20 left-1/2 -translate-x-[calc(50%+0.5px)] w-181.75 bg-[#f3e8d8] border-4 border-black rounded-[20px] p-7.5 shadow-[4px_4px_0px_0px_black] flex flex-col items-start gap-8 overflow-hidden z-2"
		>
			<div class="flex flex-col gap-2 w-full">
				<p class="font-cook text-[36px] font-semibold text-black m-0">
					{project.projectTitle}
				</p>
				{#if project.description}
					<p class="font-bricolage text-[32px] font-semibold text-black m-0">
						{project.description}
					</p>
				{/if}
			</div>

			<div class="flex gap-2.5 w-full justify-center">
				<button
					class="action-btn w-70.25 py-2 px-4 bg-[#ffa936] border-2 border-black rounded-lg font-bricolage text-base font-semibold text-black cursor-pointer overflow-hidden hover:scale-(--juice-scale)"
					onclick={() => goto(`/app/projects/${projectId}/edit`)}
				>
					EDIT PROJECT
				</button>
				<button
					class="action-btn w-70.25 py-2 px-4 bg-[#ffa936] border-2 border-black rounded-lg font-bricolage text-base font-semibold text-black cursor-pointer overflow-hidden hover:scale-(--juice-scale)"
					onclick={() => goto(`/app/projects/${projectId}/ship/presubmit`)}
				>
					SHIP
				</button>
			</div>
		</div>
	{/if}

	<!-- Back button -->
	<button
		class="back-card absolute left-8 top-13 z-5 flex items-center gap-2.5 p-5 bg-[#f3e8d8] border-4 border-black rounded-[20px] shadow-[4px_4px_0px_0px_black] cursor-pointer overflow-hidden hover:bg-[#ffa936] hover:scale-(--juice-scale)"
		onclick={() => goto('/app/projects?noanimate')}
	>
		<InputPrompt type="ESC" />
		<span class="font-cook text-2xl font-semibold text-black">BACK</span>
	</button>
</div>

<style>
	.action-btn {
		transition:
			background-color var(--selected-duration) ease,
			scale var(--juice-duration) var(--juice-easing);
	}

	.back-card {
		transition:
			background-color var(--selected-duration) ease,
			scale var(--juice-duration) var(--juice-easing);
	}
</style>
