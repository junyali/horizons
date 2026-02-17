<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import heroPlaceholder from '$lib/assets/projects/hero-placeholder.png';
	import { api } from '$lib/api';
	import TurbulentImage from '$lib/components/TurbulentImage.svelte';
	import { FormCard, BackButton, FormError, FormSubmitButton } from '$lib/components/form';

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
			goto(`/app/projects/${projectId}/edit`);
		}
	}

	async function handleDone() {
		submitting = true;
		errorMsg = null;

		const { data, error } = await api.PUT('/api/projects/auth/{id}/hackatime-projects', {
			params: { path: { id: Number(projectId) } },
			body: {
				projectNames: Array.from(selectedNames)
			}
		});

		if (data) {
			goto(`/app/projects/${projectId}/edit`);
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
		<div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+73px)] w-214 h-120.5 z-0 pointer-events-none">
			<TurbulentImage src={heroUrl || heroPlaceholder} alt={projectTitle} inset="0 0 0 0" filterId="hero-turbulence" />
		</div>

		<FormCard title="EDIT HACKATIME PROJECTS">
			<!-- Project list outer container -->
			<div class="project-list bg-[#f3e8d8] border-2 border-black rounded-lg p-2 w-full max-h-[300px] overflow-y-auto overflow-clip">
				<div class="flex flex-col gap-2 mx-3">
					{#each allProjects as project}
						<button
							type="button"
							class="project-item border-2 border-black rounded-lg p-2 w-full flex gap-2.5 items-center justify-center cursor-pointer overflow-clip {selectedNames.has(project.name) ? 'bg-[#ffa936]' : 'bg-[#f3e8d8]'}"
							onclick={() => toggleProject(project.name)}
						>
							<div class="flex flex-col items-start text-black flex-1">
								<span class="font-bricolage text-[14px] font-semibold leading-[1.5] tracking-[-0.154px]">{project.name}</span>
								<span class="font-bricolage text-[12px] font-normal leading-[1.5] text-black/60">{formatHours(project.total_seconds)}</span>
							</div>
							<div class="size-4 border border-black rounded-sm shrink-0 flex items-center justify-center {selectedNames.has(project.name) ? 'bg-[#ffa936]' : ''}">
								{#if selectedNames.has(project.name)}
									<svg width="10" height="8" viewBox="0 0 10 8" fill="none">
										<path d="M1 4L3.5 6.5L9 1" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
									</svg>
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

			<FormError message={errorMsg} />
			<FormSubmitButton
				label="DONE"
				loadingLabel="SAVING..."
				onclick={handleDone}
				loading={submitting}
				blink={selectedNames.size > 0}
			/>
		</FormCard>
	{/if}

	<BackButton onclick={() => goto(`/app/projects/${projectId}/edit`)} />
</div>

<style>
	.project-item {
		transition:
			background-color var(--selected-duration) ease,
			transform var(--juice-duration) var(--juice-easing);
	}
	.project-item:hover {
		transform: scale(var(--juice-scale));
	}

	.project-list::-webkit-scrollbar {
		width: 8px;
	}
	.project-list::-webkit-scrollbar-track {
		background: transparent;
	}
	.project-list::-webkit-scrollbar-thumb {
		background: black;
		border-radius: 8px;
	}
</style>
