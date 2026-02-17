<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import heroPlaceholder from '$lib/assets/projects/hero-placeholder.png';
	import { api, type components } from '$lib/api';
	import TurbulentImage from '$lib/components/TurbulentImage.svelte';
	import { FormField, FormTextarea, FormSelect, FileUpload, FormCard, BackButton, FormError, FormSubmitButton } from '$lib/components/form';

	type ProjectType = components['schemas']['CreateProjectDto']['projectType'];

	const projectTypes = [
		{ label: 'Windows Playable', value: 'windows_playable' },
		{ label: 'Mac Playable', value: 'mac_playable' },
		{ label: 'Linux Playable', value: 'linux_playable' },
		{ label: 'Web Playable', value: 'web_playable' },
		{ label: 'Cross-Platform Playable', value: 'cross_platform_playable' },
	];

	const projectId = $derived($page.params.id);

	let loading = $state(true);
	let title = $state('');
	let projectType = $state<ProjectType>('web_playable');
	let description = $state('');
	let demoUrl = $state('');
	let codeUrl = $state('');
	let submitting = $state(false);
	let errorMsg = $state<string | null>(null);
	let mediaUrl = $state<string | null>(null);
	let mediaPreview = $state<string | null>(null);

	async function fetchProject(id: string) {
		loading = true;
		errorMsg = null;
		const { data } = await api.GET('/api/projects/auth/{id}', {
			params: { path: { id: parseInt(id) } }
		});
		if (data) {
			const p = data as any;
			title = p.projectTitle ?? '';
			projectType = p.projectType ?? 'web_playable';
			description = p.description ?? '';
			demoUrl = p.playableUrl ?? '';
			codeUrl = p.repoUrl ?? '';
			mediaUrl = p.screenshotUrl ?? null;
			mediaPreview = p.screenshotUrl ?? null;
		} else {
			errorMsg = 'Failed to load project';
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
		if (!title.trim() || !description.trim()) {
			errorMsg = 'Title and description are required';
			return;
		}

		submitting = true;
		errorMsg = null;

		const { data } = await api.PUT('/api/projects/auth/{id}', {
			params: { path: { id: Number(projectId) } },
			body: {
				projectTitle: title.trim(),
				description: description.trim(),
				playableUrl: demoUrl.trim() || undefined,
				repoUrl: codeUrl.trim() || undefined,
				screenshotUrl: mediaUrl || undefined,
			},
		});

		if (data) {
			goto(`/app/projects/${projectId}`);
		} else {
			errorMsg = 'Failed to update project. Please try again.';
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
			<TurbulentImage src={mediaPreview || heroPlaceholder} alt={title} inset="0 0 0 0" filterId="hero-turbulence" />
		</div>

		<FormCard title="Edit Project" subtitle="Update your project details below.">
			<div class="flex gap-4 w-full">
				<!-- Column 1 -->
				<div class="flex-1 flex flex-col gap-2 min-w-0">
					<FormField label="Title" id="title" placeholder="Horizons" bind:value={title} />
					<FormSelect label="Project Type" id="project-type" options={projectTypes} bind:value={projectType} />
					<FormTextarea label="Description" id="description" placeholder="Describe what your project does..." bind:value={description} />
					<FileUpload bind:mediaUrl bind:mediaPreview onerror={(msg) => errorMsg = msg} />
				</div>

				<!-- Column 2 -->
				<div class="flex-1 flex flex-col gap-2 min-w-0">
					<FormField label="Demo URL" id="demo-url" type="url" placeholder="https://username.itch.io/mygame" bind:value={demoUrl} />
					<FormField label="Code URL" id="code-url" type="url" placeholder="https://username.itch.io/mygame" bind:value={codeUrl} />
					<FormField label="Hackatime Projects" id="hackatime-link">
						<button class="hover-juice bg-[#fc5b3c] border-2 border-black rounded-lg px-4 py-2 w-full flex items-center justify-between cursor-pointer font-bricolage text-base font-semibold text-black" type="button" onclick={() => goto(`/app/projects/${projectId}/edit/hackatime`)}>
							<span>Link Hackatime Projects</span>
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
								<path d="M4 12L12 4M12 4H5M12 4V11" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</button>
					</FormField>
				</div>
			</div>

			<FormError message={errorMsg} />
			<FormSubmitButton label="SAVE CHANGES" loadingLabel="SAVING..." onclick={handleSubmit} loading={submitting} />
		</FormCard>
	{/if}

	<BackButton onclick={() => goto(`/app/projects/${projectId}`)} />
</div>

<style>
	.hover-juice {
		transition: transform var(--juice-duration) var(--juice-easing);
	}
	.hover-juice:hover {
		transform: scale(var(--juice-scale));
	}
</style>
