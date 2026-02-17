<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import InputPrompt from '$lib/components/InputPrompt.svelte';
	import heroPlaceholder from '$lib/assets/projects/hero-placeholder.png';
	import { api, type components } from '$lib/api';
	import TurbulentImage from '$lib/components/TurbulentImage.svelte';

	type ProjectType = components['schemas']['CreateProjectDto']['projectType'];

	const projectTypes: { label: string; value: ProjectType }[] = [
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
	let readmeUrl = $state('');
	let submitting = $state(false);
	let errorMsg = $state<string | null>(null);

	let fileInput: HTMLInputElement;
	let mediaUrl = $state<string | null>(null);
	let mediaPreview = $state<string | null>(null);
	let uploading = $state(false);

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

	async function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		mediaPreview = URL.createObjectURL(file);
		uploading = true;
		errorMsg = null;

		const formData = new FormData();
		formData.append('file', file);

		const { data, error } = await api.POST('/api/uploads', {
			body: formData as any,
			bodySerializer: (body: any) => body,
		});

		if (data) {
			mediaUrl = data.url;
		} else {
			errorMsg = 'Failed to upload file. Please try again.';
			mediaPreview = null;
			mediaUrl = null;
		}

		uploading = false;
		input.value = '';
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			goto(`/app/projects/${projectId}`);
		}
	}

	async function handleNext() {
		const missing: string[] = [];
		if (!title.trim()) missing.push('Title');
		if (!description.trim()) missing.push('Description');
		if (!demoUrl.trim()) missing.push('Demo URL');
		if (!codeUrl.trim()) missing.push('Code URL');
		if (!readmeUrl.trim()) missing.push('README URL');
		if (!mediaUrl) missing.push('Screenshot/Video');

		if (missing.length > 0) {
			errorMsg = `Required: ${missing.join(', ')}`;
			return;
		}

		submitting = true;
		errorMsg = null;

		const { data, error } = await api.PUT('/api/projects/auth/{id}', {
			params: { path: { id: Number(projectId) } },
			body: {
				projectTitle: title.trim(),
				description: description.trim(),
				playableUrl: demoUrl.trim(),
				repoUrl: codeUrl.trim(),
				screenshotUrl: mediaUrl!,
			},
		});

		if (data) {
			goto(`/app/projects/${projectId}/ship/hackatime`);
		} else {
			errorMsg = 'Failed to save project. Please try again.';
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
				src={mediaPreview || heroPlaceholder}
				alt={title}
				inset="0 0 0 0"
				filterId="hero-turbulence"
			/>
		</div>

		<!-- Form card -->
		<div class="absolute left-1/2 top-9/16 -translate-x-[calc(50%+0.5px)] -translate-y-[calc(50%+0.5px)] w-[727px] bg-[#f3e8d8] border-4 border-black rounded-[20px] p-[30px] shadow-[4px_4px_0px_0px_black] flex flex-col gap-4 overflow-clip z-[1]">
			<!-- Header -->
			<div class="flex flex-col gap-2 text-black">
				<h1 class="font-cook text-[36px] font-semibold m-0 leading-normal">READY TO SUBMIT?</h1>
				<p class="font-bricolage text-[20px] leading-[1.5] tracking-[-0.22px] m-0">Fill out this information and make sure it looks correct</p>
			</div>

			<!-- Two-column form -->
			<div class="flex gap-4 w-full">
				<!-- Column 1 -->
				<div class="flex-1 flex flex-col gap-2 min-w-0">
					<div class="flex flex-col gap-1 w-full">
						<label class="font-bricolage text-base font-semibold text-black leading-normal" for="title">Title</label>
						<input
							id="title"
							class="bg-[#f3e8d8] border-2 border-black rounded-lg px-4 py-2 shadow-[2px_2px_0px_0px_black] font-bricolage text-base font-semibold text-black w-full outline-none appearance-none placeholder:text-black/50"
							type="text"
							placeholder="Horizons"
							bind:value={title}
						/>
					</div>

					<div class="flex flex-col gap-1 w-full">
						<label class="font-bricolage text-base font-semibold text-black leading-normal" for="project-type">Project Type</label>
						<div class="relative w-full">
							<select id="project-type" class="bg-[#f3e8d8] border-2 border-black rounded-lg px-4 py-2 pr-10 shadow-[2px_2px_0px_0px_black] font-bricolage text-base font-semibold text-black w-full outline-none appearance-none" bind:value={projectType}>
								{#each projectTypes as pt}
									<option value={pt.value}>{pt.label}</option>
								{/each}
							</select>
							<svg class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="8" viewBox="0 0 12 8" fill="none">
								<path d="M1 1.5L6 6.5L11 1.5" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</div>
					</div>

					<div class="flex flex-col gap-1 w-full">
						<label class="font-bricolage text-base font-semibold text-black leading-normal" for="description">Description</label>
						<textarea
							id="description"
							class="bg-[#f3e8d8] border-2 border-black rounded-lg px-4 py-2 shadow-[2px_2px_0px_0px_black] font-bricolage text-base font-semibold text-black w-full outline-none resize-none placeholder:text-black/50"
							placeholder="Describe what your project does..."
							rows="4"
							bind:value={description}
						></textarea>
					</div>
				</div>

				<!-- Column 2 -->
				<div class="flex-1 flex flex-col gap-2 min-w-0">
					<div class="flex flex-col gap-1 w-full">
						<label class="font-bricolage text-base font-semibold text-black leading-normal" for="demo-url">Demo URL</label>
						<input
							id="demo-url"
							class="bg-[#f3e8d8] border-2 border-black rounded-lg px-4 py-2 shadow-[2px_2px_0px_0px_black] font-bricolage text-base font-semibold text-black w-full outline-none appearance-none placeholder:text-black/50"
							type="url"
							placeholder="https://username.itch.io/mygame"
							bind:value={demoUrl}
						/>
					</div>

					<div class="flex flex-col gap-1 w-full">
						<label class="font-bricolage text-base font-semibold text-black leading-normal" for="code-url">Code URL</label>
						<input
							id="code-url"
							class="bg-[#f3e8d8] border-2 border-black rounded-lg px-4 py-2 shadow-[2px_2px_0px_0px_black] font-bricolage text-base font-semibold text-black w-full outline-none appearance-none placeholder:text-black/50"
							type="url"
							placeholder="https://username.itch.io/mygame"
							bind:value={codeUrl}
						/>
					</div>

					<div class="flex flex-col gap-1 w-full">
						<label class="font-bricolage text-base font-semibold text-black leading-normal" for="readme-url">README URL</label>
						<input
							id="readme-url"
							class="bg-[#f3e8d8] border-2 border-black rounded-lg px-4 py-2 shadow-[2px_2px_0px_0px_black] font-bricolage text-base font-semibold text-black w-full outline-none appearance-none placeholder:text-black/50"
							type="url"
							placeholder="https://username.itch.io/mygame"
							bind:value={readmeUrl}
						/>
					</div>

					<div class="flex flex-col gap-1 w-full">
						<!-- svelte-ignore a11y_label_has_associated_control -->
						<label class="font-bricolage text-base font-semibold text-black leading-normal">Screenshot/Video</label>
						<input
							bind:this={fileInput}
							type="file"
							accept="image/*,video/*"
							class="hidden"
							onchange={handleFileSelect}
						/>
						{#if mediaPreview}
							<button
								class="hover-juice-bg bg-[#f3e8d8] border-2 border-black rounded-lg overflow-hidden shadow-[2px_2px_0px_0px_black] w-full cursor-pointer relative"
								type="button"
								onclick={() => fileInput.click()}
								disabled={uploading}
							>
								<img src={mediaPreview} alt="Upload preview" class="w-full h-32 object-cover" />
								{#if uploading}
									<div class="absolute inset-0 bg-black/40 flex items-center justify-center">
										<span class="font-bricolage text-base font-semibold text-white">Uploading...</span>
									</div>
								{/if}
							</button>
						{:else}
							<button
								class="hover-juice-bg bg-[#f3e8d8] border-2 border-black rounded-lg p-4 shadow-[2px_2px_0px_0px_black] w-full cursor-pointer"
								type="button"
								onclick={() => fileInput.click()}
							>
								<span class="font-bricolage text-base font-semibold text-black/50 text-center block">+ Upload Screenshot/Video</span>
							</button>
						{/if}
						<p class="font-bricolage text-xs font-semibold text-black/60 m-0 leading-normal">
							If your project is difficult to experience, we recommend uploading a video
						</p>
					</div>
				</div>
			</div>

			<!-- Form buttons -->
			{#if errorMsg}
				<p class="font-bricolage text-sm font-semibold text-red-600 m-0 text-center">{errorMsg}</p>
			{/if}
			<div class="flex gap-2.5 items-center justify-center w-full">
				<button
					class="hover-juice border-2 border-black rounded-lg px-4 py-2 w-[231px] font-bricolage text-base font-semibold text-black cursor-pointer bg-[#f3e8d8]"
					type="button"
					onclick={() => goto(`/app/projects/${projectId}/ship/presubmit`)}
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
</style>
