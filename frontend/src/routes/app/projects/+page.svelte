<script lang="ts">
	import { tick } from 'svelte';
	import heroPlaceholder from '$lib/assets/projects/hero-placeholder.png';
    import { goto } from '$app/navigation';
    import InputPrompt from '$lib/components/InputPrompt.svelte';
    import { createListNav } from '$lib/nav/wasd.svelte';

	interface Project {
		id: string;
		title: string;
		description: string;
		hoursLogged: number;
		image: string;
	}

	const projects: Project[] = [
		{
			id: '1',
			title: 'TEST PROJECT 1',
			description: 'Description',
			hoursLogged: 12,
			image: heroPlaceholder
		},
		{
			id: '2',
			title: 'TEST PROJECT 2',
			description: 'Description',
			hoursLogged: 8,
			image: heroPlaceholder
		},
		{
			id: '3',
			title: 'TEST PROJECT 3',
			description: 'Description',
			hoursLogged: 3,
			image: heroPlaceholder
		},
		{
			id: '4',
			title: 'TEST PROJECT 1',
			description: 'Description',
			hoursLogged: 12,
			image: heroPlaceholder
		},
		{
			id: '5',
			title: 'TEST PROJECT 2',
			description: 'Description',
			hoursLogged: 8,
			image: heroPlaceholder
		},
		{
			id: '6',
			title: 'TEST PROJECT 3',
			description: 'Description',
			hoursLogged: 3,
			image: heroPlaceholder
		}        
	];

	let scrollOffset = $state(0);
	let listEl: HTMLDivElement;

	const nav = createListNav({
		count: () => projects.length,
		wheel: 80,
		onChange: () => updateScroll(),
		onEscape: () => goto('/app?noanimate'),
		onSelect: (i) => {
			const project = projects[i];
			if (project) {
				// navigate to project detail
			}
		},
	});

	async function updateScroll() {
		await tick();
		if (!listEl) return;
		const cards = listEl.querySelectorAll('.project-card') as NodeListOf<HTMLElement>;
		const card = cards[nav.selectedIndex];
		if (!card) return;

		const containerHeight = listEl.parentElement?.clientHeight ?? 0;
		const cardTop = card.offsetTop;
		const cardHeight = card.offsetHeight;

		// Center the selected card vertically
		scrollOffset = -(cardTop + cardHeight / 2 - containerHeight / 2);
	}

	const selectedProject = $derived(projects[nav.selectedIndex]);
</script>

<svelte:window onkeydown={nav.handleKeydown} onwheel={nav.handleWheel} />

<div class="relative size-full">
	<!-- Hero image -->
	<svg class="filters" aria-hidden="true">
		<filter id="turbulence">
			<feTurbulence type="turbulence" baseFrequency="0.01 0.02" numOctaves="2" seed="2" result="noise" />
			<feColorMatrix type="hueRotate" values="0" result="rotatedNoise">
				<animate attributeName="values" from="0" to="360" dur="5s" repeatCount="indefinite" />
			</feColorMatrix>
			<feDisplacementMap in="SourceGraphic" in2="rotatedNoise" scale="25" xChannelSelector="R" yChannelSelector="G" />
		</filter>
	</svg>
	<div class="hero-image h-full">
		<img src={selectedProject.image} alt={selectedProject.title} class="h-full" style="filter: url(#turbulence);" />
	</div>

	<!-- Scrollable project list -->
	<div class="projects-scroll" role="listbox" tabindex="-1">
		<div class="projects-list" bind:this={listEl} style="transform: translateY({scrollOffset}px)">
			{#each projects as project, i (project.id)}
				{@const selected = i === nav.selectedIndex}
				<button
					class="project-card"
					class:selected
					onclick={() => { nav.select(i); }}
				>
					<div class="details">
						<p class="title">{project.title}</p>
						<p class="subtitle">{project.description}</p>
						<p class="subtitle">{project.hoursLogged} hours logged</p>
					</div>

					{#if selected}
						<div class="controls">
							<InputPrompt type="Enter" /> 

							<span class="controls-text">OR</span>

							<InputPrompt type="click" /> 

							<span class="controls-text">TO VIEW</span>
						</div>
					{/if}

					</button>
			{/each}
		</div>
	</div>

	<!-- Back button -->
	<button class="back-card" onclick={() => goto('/app?noanimate')}>
		<InputPrompt type="ESC" /> 
		<span class="back-text">BACK</span>
	</button>

	<!-- Navigate hint -->
	<div class="nav-hint">
		<span class="nav-text">USE</span>
		<InputPrompt type="WS" />
		<span class="nav-text">OR</span>
		<InputPrompt type="mouse-scroll" />
		<span class="nav-text">TO NAVIGATE</span>
	</div>
</div>

<style>
	.filters {
		position: absolute;
		width: 0;
		height: 0;
		overflow: hidden;
	}

	/* Hero image */
	.hero-image {
		position: absolute;
		inset: 0 -40% 0 40%;
		overflow: visible;
		z-index: 0;
		pointer-events: none;
	}

	.hero-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transform: scale(1.2);
	}

	/* Project list scroll area */
	.projects-scroll {
		position: absolute;
		left: 42px;
		top: 180px;
		bottom: 40px;
		width: 860px;
		overflow: visible;
		z-index: 2;
	}

	.projects-list {
		display: flex;
		flex-direction: column;
		gap: 30px;
		transition: transform var(--juice-duration) var(--juice-easing);
	}

	/* Project cards */
	.project-card {
		background-color: #f3e8d8;
		border: 4px solid black;
		border-radius: 20px;
		padding: 30px;
		box-shadow: 4px 4px 0px 0px black;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		overflow: hidden;
		position: relative;
		width: 649px;
		cursor: pointer;
		text-align: left;
		transition:
			width var(--juice-duration) var(--juice-easing),
			background-color var(--selected-duration) ease,
			padding 0.3s ease;
	}

	.project-card.selected {
		background-color: var(--selected-color);
		width: 824px;
		gap: 32px;
	}

	/* Details */
	.details {
		display: flex;
		flex-direction: column;
		gap: 4px;
		z-index: 1;
		width: 100%;
	}

	.title {
		font-family: 'Cook Widetype', sans-serif;
		font-size: 40px;
		font-weight: 600;
		color: black;
		margin: 0;
		line-height: 1.1;
		transition: font-size 0.3s ease;
	}

	.project-card.selected .title {
		font-size: 64px;
	}

	.subtitle {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-size: 20px;
		font-weight: 600;
		color: black;
		margin: 0;
		transition: font-size 0.3s ease;
	}

	.project-card.selected .subtitle {
		font-size: 32px;
	}

	/* Controls (selected card only) */
	.controls {
		display: flex;
		align-items: center;
		gap: 8px;
		z-index: 1;
	}

	.controls-text {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-size: 24px;
		font-weight: 700;
		color: black;
	}

	/* Back button */
	.back-card {
		position: absolute;
		left: 32px;
		top: 52px;
		z-index: 5;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 20px;
		background-color: #f3e8d8;
		border: 4px solid black;
		border-radius: 20px;
		box-shadow: 4px 4px 0px 0px black;
		cursor: pointer;
		overflow: hidden;

		transition: 
			background-color var(--selected-duration) ease,
			transform var(--juice-duration) var(--juice-easing);
	}

	.back-card:hover {
		background-color: #ffa936;
		transform: scale(var(--juice-scale));
	}

	.back-text {
		font-family: 'Cook Widetype', sans-serif;
		font-size: 24px;
		font-weight: 600;
		color: black;
	}

	/* Navigate hint */
	.nav-hint {
		position: absolute;
		bottom: 35px;
		right: 24px;
		z-index: 5;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 20px;
		background-color: #f3e8d8;
		border: 4px solid black;
		border-radius: 20px;
		box-shadow: 4px 4px 0px 0px black;
		overflow: hidden;
	}

	.nav-text {
		font-family: 'Cook Widetype', sans-serif;
		font-size: 24px;
		font-weight: 600;
		color: black;
		flex-shrink: 0;
	}
</style>
