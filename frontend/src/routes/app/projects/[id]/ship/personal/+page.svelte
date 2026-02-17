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

	let fullName = $state('');
	let email = $state('');
	let birthday = $state('');
	let addressLine1 = $state('');
	let addressLine2 = $state('');
	let city = $state('');
	let stateField = $state('');
	let country = $state('');
	let zipCode = $state('');

	async function fetchData(id: string) {
		loading = true;
		errorMsg = null;

		const [projectRes, userRes] = await Promise.all([
			api.GET('/api/projects/auth/{id}', {
				params: { path: { id: parseInt(id) } }
			}),
			api.GET('/api/user/auth/me')
		]);

		if (projectRes.data) {
			const p = projectRes.data as any;
			heroUrl = p.screenshotUrl ?? null;
			projectTitle = p.projectTitle ?? '';
		}

		if (userRes.data) {
			const u = userRes.data as any;
			fullName = [u.firstName, u.lastName].filter(Boolean).join(' ');
			email = u.email ?? '';
			birthday = u.birthday ?? '';
			addressLine1 = u.addressLine1 ?? '';
			addressLine2 = u.addressLine2 ?? '';
			city = u.city ?? '';
			stateField = u.state ?? '';
			country = u.country ?? '';
			zipCode = u.zipCode ?? '';
		} else {
			errorMsg = 'Failed to load user info';
		}

		loading = false;
	}

	$effect(() => {
		if (projectId) fetchData(projectId);
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			goto(`/app/projects/${projectId}`);
		}
	}

	async function handleNext() {
		if (!fullName.trim() || !email.trim()) {
			errorMsg = 'Full name and email are required';
			return;
		}

		submitting = true;
		errorMsg = null;

		const nameParts = fullName.trim().split(/\s+/);
		const firstName = nameParts[0] ?? '';
		const lastName = nameParts.slice(1).join(' ') ?? '';

		const { data, error } = await api.PUT('/api/user', {
			body: {
				firstName,
				lastName,
				birthday: birthday.trim() || undefined,
				addressLine1: addressLine1.trim() || undefined,
				addressLine2: addressLine2.trim() || undefined,
				city: city.trim() || undefined,
				state: stateField.trim() || undefined,
				country: country.trim() || undefined,
				zipCode: zipCode.trim() || undefined,
			},
		});

		if (data) {
			goto(`/app/projects/${projectId}/ship/finish`);
		} else {
			errorMsg = 'Failed to save. Please try again.';
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

		<!-- Form card -->
		<div class="absolute left-1/2 top-9/16 -translate-x-[calc(50%+0.5px)] -translate-y-[calc(50%+0.5px)] w-[727px] bg-[#f3e8d8] border-4 border-black rounded-[20px] p-[30px] shadow-[4px_4px_0px_0px_black] flex flex-col gap-4 overflow-clip z-[1]">
			<!-- Header -->
			<div class="flex flex-col gap-2 text-black">
				<h1 class="font-cook text-[36px] font-semibold m-0 leading-normal">READY TO SUBMIT?</h1>
				<p class="font-bricolage text-[20px] leading-[1.5] tracking-[-0.22px] m-0">Verify this information is correct and fill out any blank fields.</p>
			</div>

			<!-- Personal info section -->
			<div class="flex gap-4 w-full">
				<!-- Column 1: Full Name, Email -->
				<div class="flex-1 flex flex-col gap-2 min-w-0">
					<div class="flex flex-col gap-1 w-full">
						<label class="font-bricolage text-base font-semibold text-black leading-normal" for="full-name">Full Name</label>
						<input
							id="full-name"
							class="prefilled-field border-2 border-black rounded-lg px-4 py-2 shadow-[2px_2px_0px_0px_black] font-bricolage text-base font-semibold text-black/50 w-full outline-none appearance-none"
							type="text"
							placeholder="Heidi Hacksworth"
							bind:value={fullName}
						/>
					</div>

					<div class="flex flex-col gap-1 w-full">
						<label class="font-bricolage text-base font-semibold text-black leading-normal" for="email">Email</label>
						<input
							id="email"
							class="prefilled-field border-2 border-black rounded-lg px-4 py-2 shadow-[2px_2px_0px_0px_black] font-bricolage text-base font-semibold text-black/50 w-full outline-none appearance-none"
							type="email"
							placeholder="heidi@hackclub.com"
							bind:value={email}
						/>
					</div>
				</div>

				<!-- Column 2: Birthday -->
				<div class="flex-1 flex flex-col gap-2 min-w-0">
					<div class="flex flex-col gap-1 w-full">
						<label class="font-bricolage text-base font-semibold text-black leading-normal" for="birthday">Birthday</label>
						<input
							id="birthday"
							class="prefilled-field border-2 border-black rounded-lg px-4 py-2 shadow-[2px_2px_0px_0px_black] font-bricolage text-base font-semibold text-black/50 w-full outline-none appearance-none"
							type="text"
							placeholder="10/10/2010"
							bind:value={birthday}
						/>
					</div>
				</div>
			</div>

			<!-- Divider -->
			<hr class="border-t-2 border-black/20 w-full m-0" />

			<!-- Address section -->
			<div class="flex gap-4 w-full">
				<!-- Column 1: Address Line 1, Address Line 2, City -->
				<div class="flex-1 flex flex-col gap-2 min-w-0">
					<div class="flex flex-col gap-1 w-full">
						<label class="font-bricolage text-base font-semibold text-black leading-normal" for="address1">Address Line 1</label>
						<input
							id="address1"
							class="prefilled-field border-2 border-black rounded-lg px-4 py-2 shadow-[2px_2px_0px_0px_black] font-bricolage text-base font-semibold text-black/50 w-full outline-none appearance-none"
							type="text"
							placeholder="15 Falls Rd"
							bind:value={addressLine1}
						/>
					</div>

					<div class="flex flex-col gap-1 w-full">
						<label class="font-bricolage text-base font-semibold text-black leading-normal" for="address2">Address Line 2</label>
						<input
							id="address2"
							class="prefilled-field border-2 border-black rounded-lg px-4 py-2 shadow-[2px_2px_0px_0px_black] font-bricolage text-base font-semibold text-black/50 w-full outline-none appearance-none"
							type="text"
							bind:value={addressLine2}
						/>
					</div>

					<div class="flex flex-col gap-1 w-full">
						<label class="font-bricolage text-base font-semibold text-black leading-normal" for="city">City</label>
						<input
							id="city"
							class="prefilled-field border-2 border-black rounded-lg px-4 py-2 shadow-[2px_2px_0px_0px_black] font-bricolage text-base font-semibold text-black/50 w-full outline-none appearance-none"
							type="text"
							placeholder="Shelburnetown"
							bind:value={city}
						/>
					</div>
				</div>

				<!-- Column 2: State, Country, Zip Code -->
				<div class="flex-1 flex flex-col gap-2 min-w-0">
					<div class="flex flex-col gap-1 w-full">
						<label class="font-bricolage text-base font-semibold text-black leading-normal" for="state">State</label>
						<input
							id="state"
							class="prefilled-field border-2 border-black rounded-lg px-4 py-2 shadow-[2px_2px_0px_0px_black] font-bricolage text-base font-semibold text-black/50 w-full outline-none appearance-none"
							type="text"
							placeholder="Vermontland"
							bind:value={stateField}
						/>
					</div>

					<div class="flex flex-col gap-1 w-full">
						<label class="font-bricolage text-base font-semibold text-black leading-normal" for="country">Country</label>
						<input
							id="country"
							class="prefilled-field border-2 border-black rounded-lg px-4 py-2 shadow-[2px_2px_0px_0px_black] font-bricolage text-base font-semibold text-black/50 w-full outline-none appearance-none"
							type="text"
							placeholder="Hacksmerica"
							bind:value={country}
						/>
					</div>

					<div class="flex flex-col gap-1 w-full">
						<label class="font-bricolage text-base font-semibold text-black leading-normal" for="zip-code">Zip Code</label>
						<input
							id="zip-code"
							class="prefilled-field border-2 border-black rounded-lg px-4 py-2 shadow-[2px_2px_0px_0px_black] font-bricolage text-base font-semibold text-black/50 w-full outline-none appearance-none"
							type="text"
							placeholder="05482"
							bind:value={zipCode}
						/>
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
					onclick={() => goto(`/app/projects/${projectId}/ship/hackatime`)}
				>
					← BACK
				</button>
				<button
					class="hover-juice bg-[#ffa936] border-2 border-black rounded-lg px-4 py-2 w-[231px] font-bricolage text-base font-semibold text-black cursor-pointer"
					type="button"
					onclick={handleNext}
					disabled={submitting}
				>
					{submitting ? 'SAVING...' : 'THIS IS CORRECT →'}
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
	.prefilled-field {
		background: linear-gradient(90deg, rgba(204, 204, 204, 0.5), rgba(204, 204, 204, 0.5)),
			linear-gradient(90deg, #f3e8d8, #f3e8d8);
	}

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
