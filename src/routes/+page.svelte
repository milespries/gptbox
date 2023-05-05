<script lang="ts">
	import { onMount } from 'svelte'
	import type { PageData } from './$types';
	import { Button, Modal } from 'flowbite-svelte';
	let mbpModal = false;
	

	export let data: PageData;
	let bodyElement;
	onMount(() => {
		bodyElement = document.getElementById('body')
		bodyElement?.setAttribute('class', '')
		bodyElement?.classList.add('pattern-circuit-board-blue-950/30')
	})
</script>

<div class="lg:flex lg:flex-col lg:items-center lg:py-14 pb-6 pt-11 px-7">

	<div class="flex flex-col items-center">
		<h1 class="text-5xl font-semibold underline decoration-4 decoration-teal-300"><span class="font-bold">GPT</span><span class="font-light">box</span></h1>
		<h3 class="font-mono italic">beta testing</h3>
	</div>
	
	<div class="mt-12 flex flex-col justify-center items-center">
		<div>
			<button on:click={() => {location.href = 'services/email'}} class="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-base font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
				<span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
					Email Generator
				</span>
			</button>
		</div>
		<div class="p-5">
			<button on:click={() => {location.href = 'mbp'}} class="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-base font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800" type="button">
				<span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
					My Business Pal
				</span>
			</button>
		</div>
	</div>
	
	
	<!--<form on:submit|preventDefault={() => handleSubmit()}>
		{#if data.session}
		<h1>{data.session.uuid}</h1>
	{/if}
		<label for="context">Ask anything</label>
		<textarea name="context" rows="5" bind:value={context} />
		<button disabled="{loading}">RESPOND NOW</button>
		<div class="pt-4">
			<h2>Bartholomew:</h2>
			{#if answer}
				<p bind:this={answerHTML}>{@html answer}</p>
			{/if}
		</div>
	</form>-->
	
	
	
	<Modal title="Introducing My Business Pal: Your Ultimate Business Companion" bind:open={mbpModal} size="xl" autoclose>
		<p class="text-base leading-relaxed text-gray-500 dark:text-slate-300">
			We're excited to announce the current development of "My Business Pal", an AI-powered platform designed to help aspiring entrepreneurs and business owners bring their ideas to life.
		</p><br>
		<p class="text-base leading-relaxed text-gray-500 dark:text-slate-300">
			With My Business Pal, you'll have access to a suite of powerful tools that will assist you in various aspects of starting and growing your business. Here's a sneak peek of what's in store:
		</p><br>
		<ul class="text-base leading-relaxed dark:text-slate-300">
			<li>⦿ <span class="font-semibold">Business Idea Generation:</span> Discover and refine innovative business ideas based on your interests and target market.</li><br>
			<li>⦿ <span class="font-semibold">AI-driven Business Planning:</span> Create comprehensive business plans with AI-assisted prompts and suggestions.</li><br>
			<li>⦿ <span class="font-semibold">Branding Assistance:</span> Generate unique business names, logos, and mottos tailored to your brand identity.</li><br>
			<li>⦿ <span class="font-semibold">Market Analysis:</span> Gain insights into your target audience and competitors to make data-driven decisions.</li><br>
			<li>⦿ <span class="font-semibold">Strategy Development:</span> Receive AI-generated marketing, financial, and growth strategies for your business.</li><br>
			<li>⦿ <span class="font-semibold">Creative Problem Solving:</span> Explore new angles and challenge your business assumptions with thought-provoking questions.</li><br>
			<li>⦿ <span class="font-semibold">Networking and Mentorship:</span> Connect with industry experts and like-minded entrepreneurs for guidance and collaboration.</li><br>
		</ul><br>
		<p class="text-base leading-relaxed text-gray-500 dark:text-slate-300">
			Stay tuned for the official launch of <span class="font-bold">My Business Pal</span>, and get ready to embark on a successful entrepreneurial journey with your new AI-powered companion!
		</p>
		<svelte:fragment slot='footer'>
			<Button>Cant Wait!</Button>
		  </svelte:fragment>
	</Modal>

</div>