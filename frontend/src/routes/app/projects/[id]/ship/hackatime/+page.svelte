<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import InputPrompt from '$lib/components/InputPrompt.svelte';
	import heroPlaceholder from '$lib/assets/projects/hero-placeholder.png';
	import { api } from '$lib/api';
	import TurbulentImage from '$lib/components/TurbulentImage.svelte';

	const projectId = $derived($page.params.id);

	let loading = $state(true);
	let errorMsg = $state<string | null>(null);
	let submitting = $state(false);
	let heroUrl = $state<string | null>(null);
	let projectTitle = $state('');

	let allProjects = $state<{ id: number; name: string; total_seconds?: number }[]>([]);
	let selectedNames = $state<Set<string>>(new Set());

	let totalHours = $derived(() => {
		let total = 0;
		for (const p of allProjects) {
			if (selectedNames.has(p.name)) {
				total += (p.total_seconds ?? 0) / 3600;
			}
		}
		return Math.round(total * 10) / 10;
	});

	async function fetchData(id: string) {
		loading = true;
		errorMsg = null;

		const { data: projectData } = await api.GET('/api/projects/auth/{id}', {
			params: { path: { id: parseInt(id) } }
		});
		if (projectData) {
			heroUrl = (projectData as any).screenshotUrl ?? null;
			projectTitle = (projectData as any).projectTitle ?? '';
		}

		const [allRes, linkedRes] = await Promise.all([
			api.GET('/api/hackatime/projects/all'),
			api.GET('/api/projects/auth/{id}/hackatime-projects', {
				params: { path: { id: parseInt(id) } }
			})
		]);

		if (allRes.data) {
			allProjects = allRes.data.projects;
		} else {
			errorMsg = 'Failed to load hackatime projects';
		}

		if (linkedRes.data) {
			selectedNames = new Set(linkedRes.data.hackatimeProjects ?? []);
		}

		loading = false;
	}

	$effect(() => {
		if (projectId) fetchData(projectId);
	});

	function toggleProject(name: string) {
		const next = new Set(selectedNames);
		if (next.has(name)) {
			next.delete(name);
		} else {
			next.add(name);
		}
		selectedNames = next;
	}

	function formatHours(seconds?: number): string {
		if (!seconds) return '0.0 Hours';
		const hours = Math.round((seconds / 3600) * 10) / 10;
		return `${hours} Hours`;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			goto(`/app/projects/${projectId}`);
		}
	}

	async function handleNext() {
		submitting = true;
		errorMsg = null;

		const { data, error } = await api.PUT('/api/projects/auth/{id}/hackatime-projects', {
			params: { path: { id: Number(projectId) } },
			body: {
				projectNames: Array.from(selectedNames)
			}
		});

		if (data) {
			goto(`/app/projects/${projectId}/ship/personal`);
		} else {
			errorMsg = 'Failed to update hackatime projects. Please try again.';
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

		<!-- Project card -->
		<div class="absolute left-1/2 top-9/16 -translate-x-[calc(50%+0.5px)] -translate-y-[calc(50%+0.5px)] w-[727px] bg-[#f3e8d8] border-4 border-black rounded-[20px] p-[30px] shadow-[4px_4px_0px_0px_black] flex flex-col gap-4 overflow-clip z-[1]">
			<!-- Header -->
			<div class="flex flex-col gap-2 text-black">
				<h1 class="font-cook text-[36px] font-semibold m-0 leading-normal">READY TO SUBMIT?</h1>
				<p class="font-bricolage text-[20px] leading-[1.5] tracking-[-0.22px] m-0">Fill out this information and make sure it looks correct</p>
			</div>

			<!-- Project list container -->
			<div class="flex flex-col gap-2.5 w-full">
				<!-- Scrollable project list -->
				<div class="bg-[#f3e8d8] border-2 border-black rounded-lg p-2 w-full max-h-[300px] overflow-y-auto">
					<div class="flex flex-col gap-2">
						{#each allProjects as project}
							<button
								type="button"
								class="project-item border-2 border-black rounded-lg p-4 w-full flex items-center justify-between cursor-pointer"
								class:bg-[#ffa936]={selectedNames.has(project.name)}
								class:bg-[#f3e8d8]={!selectedNames.has(project.name)}
								onclick={() => toggleProject(project.name)}
							>
								<div class="flex flex-col items-start text-black">
									<span class="font-sf-pro text-[20px] font-bold">{project.name}</span>
									<span class="font-sf-pro text-[14px] font-bold">{formatHours(project.total_seconds)}</span>
								</div>
								<div
									class="border-2 border-black rounded-lg px-4 py-2 flex items-center justify-center"
									class:bg-[#ffa936]={selectedNames.has(project.name)}
									class:bg-[#f3e8d8]={!selectedNames.has(project.name)}
								>
									{#if selectedNames.has(project.name)}
										<span class="text-black text-base font-semibold">&#x2714;&#xFE0E;</span>
									{:else}
										<span class="text-black text-base font-semibold">&nbsp;&nbsp;</span>
									{/if}
								</div>
							</button>
						{:else}
							<p class="font-bricolage text-base text-black/50 text-center p-4">No hackatime projects found. Make sure your hackatime account is linked.</p>
						{/each}
					</div>
				</div>

				<!-- Total hours -->
				<div class="bg-[#f3e8d8] border-2 border-black rounded-lg px-4 py-2.5 w-full">
					<span class="font-bricolage text-base text-black">Total Hours: {totalHours()}</span>
				</div>
			</div>

			<!-- Error message -->
			{#if errorMsg}
				<p class="font-bricolage text-sm font-semibold text-red-600 m-0 text-center">{errorMsg}</p>
			{/if}

			<!-- Form buttons -->
			<div class="flex gap-2.5 items-center justify-center w-full">
				<button
					class="hover-juice border-2 border-black rounded-lg px-4 py-2 w-[231px] font-bricolage text-base font-semibold text-black cursor-pointer bg-[#f3e8d8]"
					type="button"
					onclick={() => goto(`/app/projects/${projectId}/ship/project`)}
				>
					← BACK
				</button>
				<button
					class="hover-juice bg-[#ffa936] border-2 border-black rounded-lg px-4 py-2 w-[231px] font-bricolage text-base font-semibold text-black cursor-pointer"
					type="button"
					onclick={handleNext}
					disabled={submitting}
				>
					{submitting ? 'SAVING...' : 'NEXT →'}
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

	.project-item {
		transition: transform var(--juice-duration) var(--juice-easing);
	}
	.project-item:hover {
		transform: scale(1.01);
	}

	/* Custom scrollbar styling */
	.overflow-y-auto::-webkit-scrollbar {
		width: 8px;
	}
	.overflow-y-auto::-webkit-scrollbar-track {
		background: transparent;
	}
	.overflow-y-auto::-webkit-scrollbar-thumb {
		background: black;
		border-radius: 8px;
	}
</style>
