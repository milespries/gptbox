<script lang="ts">
	import { onMount } from 'svelte'
	import { BottomNav, BottomNavItem, Button, Modal, Textarea, Label, Input, Checkbox, Helper, A, P, Heading, Span, Gallery, Card } from 'flowbite-svelte'
    import { superForm } from "sveltekit-superforms/client"
	import SuperDebug from "sveltekit-superforms/client/SuperDebug.svelte"
	import { z } from "zod"
	import type { PageData } from "./$types"
	import { applyStyles } from '@popperjs/core'
	import { page } from '$app/stores'

	export let data: PageData;

	$: formModal = false
	$: if($page.url.searchParams.get("form") && !authorizedUser){
			formModal = true
			if(appContainer){
				appContainer.classList.add('blur-sm')
			}
		}
	let authorizedUser = false

    //f(Object.keys(data.session.config).length === 0){formModal = true}
	
	const { form, errors, enhance, constraints } = superForm(data.requiredFormA, {
		taintedMessage: "Are you sure you want leave? All current form data will be lost.",
		validators: {
			name: (name) => (name.length < 2 ? "Idea name is too short." : null),
			industry: (industry) => (industry.length < 2 ? "Incomplete Input." : null),
			target_market: (target_market) => (target_market.length < 2 ? "Incomplete Input." : null),
			business_idea: (business_idea) => (business_idea.length < 50 ? "Needs more information." : null),
			problem_solved: (problem_solved) => (problem_solved.length < 2 ? "Incomplete Input." : null),
			selling_point: (selling_point) => (selling_point.length < 20 ? "Needs more information." : null),
            idea_stage: (selling_point) => (selling_point.length < 2 ? "Incomplete Input." : null)
		},
		invalidateAll: false,
		onUpdated({ form }) {
			if (form.valid) {
				formModal = false
				authorizedUser = true
				appContainer.classList.remove('blur-sm')
				location.reload()
				return false
			}
		}
	})

	//$form.name = "test"
	let appContainer: HTMLDivElement

	$: if(data.user.config){
		$form = data.user.config
		authorizedUser = true
	} else {
		// formModal = true
		// if(appContainer){
		// 	appContainer.classList.add('blur-sm')
		// }
	}

	onMount(() => {
		appContainer = document.getElementById('apps')
	})

	//const tools = [0,0,0,0,0,0,0,0,0,0]
	
</script>

<div class="lg:flex lg:flex-col lg:items-center lg:py-14 pb-6 pt-11 px-7">

	<div>
		{#if true}
			<div id="apps" class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card href="{authorizedUser ? "/mbp/stp" : "/mbp?form=true"}">
					<h5 class="mb-2 text-2xl font-bold tracking-tight text-white">Shark Tank Pitch</h5>
					<p class="font-normal text-gray-700 dark:text-gray-400 leading-tight">
						Unleash the power of AI to create a compelling pitch for your business idea.
					</p>
					<!-- <p class="font-extrabold text-gray-700 dark:text-gray-400 leading-tight">
						<Span>*</Span>Few more questions required
					</p> -->
				</Card>
			</div>
		{/if}
	</div>
	
	<BottomNav position="fixed" innerDiv="grid-cols-2">
		<BottomNavItem btnName="Apps" on:click={() => (window.location.href="/mbp")}>
			<svg
				class="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
				fill="currentColor"
				viewBox="0 0 20 20"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<g>
					<rect x="3" y="3" width="5" height="5" rx="1" ry="1" />
					<rect x="12" y="3" width="5" height="5" rx="1" ry="1" />
					<rect x="3" y="12" width="5" height="5" rx="1" ry="1" />
					<rect x="12" y="12" width="5" height="5" rx="1" ry="1" />
				</g>
			</svg>
		</BottomNavItem>
		<BottomNavItem btnName="My Business" on:click={() => (formModal=true)}>
			<svg
				class="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
				fill="currentColor"
				viewBox="0 0 20 20"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<path
					d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"
				/>
			</svg>
		</BottomNavItem>
	</BottomNav>

	<Modal bind:open={formModal} size="xs" autoclose={false} permanent={!data.user.config} class="w-full" id="modal1">
			{#if !data.user.config}
				<p class="text-gray-900 dark:text-red-500 p-0">
					<span class="font-bold">*</span>Required
				</p>
				<Heading tag="h1" class="mb-4 text-center" customSize="text-4xl font-extrabold  md:text-5xl lg:text-6xl"><Span gradient>Let's Get Started!</Span></Heading>
				<P>Share a few details about your business idea to unlock AI-powered tools tailored just for you.</P>
			{:else if data.user.config}
				<h1 class="py-5 text-3xl md:text-4xl lg:text-5xl text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-cyan-200 to-sky-300">
					{data.user.config.name}
				</h1>
			{/if}
			{#if false}
				<h3 class="text-xl text-center font-medium text-gray-900 dark:text-white p-0">What stage are you in?</h3>
				<form class="flex flex-col space-y-6" action="#">
					<Button type="submit" class="w-full">Idea</Button>
					<Button type="submit" class="w-full">Start Up</Button>
					<Button type="submit" class="w-full">Established</Button>
				</form>
			{:else if true}
				<form method="POST" autocomplete="off" action="?/required" use:enhance>
					<div class="grid gap-6 mb-6">
					  <div>
						<Label for="aA" class="mb-2">Business Name</Label>
						<Input type="text" id="aA" placeholder="(can be refined later)" name="name" bind:value={$form.name} required />
						{#if $errors.name}
							<Helper class="mt-2" color="red"><span class="font-medium">ERROR</span> {$errors.name}</Helper>
						{/if}
					  </div>
					  <div>
						<Label for="aB" class="mb-2">Business Industry</Label>
						<Input type="text" id="aB" placeholder="(e.g., Retail, Healthcare, Technology)" name="industry" bind:value={$form.industry} required />
						{#if $errors.industry}
							<Helper class="mt-2" color="red"><span class="font-medium">ERROR</span> {$errors.industry}</Helper>
						{/if}
					  </div>
					  <div>
						<Label for="aC" class="mb-2">Target Market</Label>
						<Input type="text" id="aC" placeholder="(e.g., Millennials, Working Professionals, Parents)" name="target_market" bind:value={$form.target_market} required />
						{#if $errors.target_market}
							<Helper class="mt-2" color="red"><span class="font-medium">ERROR</span> {$errors.target_market}</Helper>
						{/if}
					  </div>
					  <div>
						<Label for="aF" class="mb-2">Idea Stage</Label>
						<Input id="aF" placeholder="Describe the current stage of your idea (e.g., Just an idea, Sketches, Prototype, MVP, etc.)" name="idea_stage" bind:value={$form.idea_stage} required />
						{#if $errors.idea_stage}
							<Helper class="mt-2" color="red"><span class="font-medium">ERROR</span> {$errors.idea_stage}</Helper>
						{/if}
					  </div>
					  <div>
						<Label for="aD" class="mb-2">Business Idea</Label>
						<Textarea id="aD" placeholder="Briefly describe your business idea in 2-3 sentences:" rows="4" name="business_idea" bind:value={$form.business_idea} required />
						{#if $errors.business_idea}
							<Helper class="mt-2" color="red"><span class="font-medium">ERROR</span> {$errors.business_idea}</Helper>
						{/if}
					  </div>
					  <div>
						<Label for="aE" class="mb-2">Problem Solved</Label>
						<Textarea id="aE" placeholder="What problem will your business solve?" rows="4" name="problem_solved" bind:value={$form.problem_solved} required />
						{#if $errors.problem_solved}
							<Helper class="mt-2" color="red"><span class="font-medium">ERROR</span> {$errors.problem_solved}</Helper>
						{/if}
					  </div>
					  <div>
						<Label for="aF" class="mb-2">Unique Selling Point</Label>
						<Textarea id="aF" placeholder="Explain what sets your product or service apart from competitors. List 2-3 main features of your product or service that make it stand out provide value." rows="4" name="selling_point" bind:value={$form.selling_point} required />
						{#if $errors.selling_point}
							<Helper class="mt-2" color="red"><span class="font-medium">ERROR</span> {$errors.selling_point}</Helper>
						{/if}
					  </div>
					{#if !data.user.config}
						<P size="xs">By submitting, I agree to the terms of the <A class="font-bold" href="#">MBP© Privacy Policy</A></P>
					{/if}
					<Button class="mb-10 mt-3" type="submit">{data.user.config ? "Save Changes" : "Submit"}</Button>
				  </form>
				<!--<form class="flex flex-col space-y-6" action="#">
					<Input type="email" placeholder="Type Here..." size="lg" />
					<div class="flex flex-row space-x-4">
						<Button outline type="submit" class="w-1/4">Back</Button>
						<Button type="submit" class="w-3/4">Next</Button>
					</div>
				</form>-->
			{/if}
	</Modal>

</div>