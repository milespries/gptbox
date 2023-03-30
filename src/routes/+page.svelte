<script lang="ts">
	import type { PageData } from './$types';
	import 'flowbite';
	import { onMount } from 'svelte';
	import { initFlowbite } from 'flowbite'
	import { Modal } from 'flowbite'
	import type { ModalOptions, ModalInterface } from 'flowbite'

	export let data: PageData;

	console.log(data.session)

	onMount(() => {
		initFlowbite()
	})
</script>

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
		<button data-modal-target="extralarge-modal" data-modal-toggle="extralarge-modal" class="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-base font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800" type="button">
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


<!-- Extra Large Modal -->
<div id="extralarge-modal" tabindex="-1" class="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] md:h-full">
    <div class="relative w-full h-full max-w-7xl md:h-auto">
        <!-- Modal content -->
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <!-- Modal header -->
            <div class="flex items-center justify-between p-5 border-b rounded-t dark:border-gray-600">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                    Introducing My Business Pal: Your Ultimate Business Companion
                </h3>
                <button type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="extralarge-modal">
                    <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                    <span class="sr-only">Close</span>
                </button>
            </div>
            <!-- Modal body -->
            <div class="p-6 space-y-6">
                <p class="text-base leading-relaxed text-gray-500 dark:text-slate-300">
                    We're excited to announce the current development of "My Business Pal", an AI-powered platform designed to help aspiring entrepreneurs and business owners bring their ideas to life.
                </p>
                <p class="text-base leading-relaxed text-gray-500 dark:text-slate-300">
                    With My Business Pal, you'll have access to a suite of powerful tools that will assist you in various aspects of starting and growing your business. Here's a sneak peek of what's in store:
                </p>
                <ul class="text-base leading-relaxed dark:text-slate-300">
                    <li>⦿ Business Idea Generation: Discover and refine innovative business ideas based on your interests and target market.</li>
					<li>⦿ AI-driven Business Planning: Create comprehensive business plans with AI-assisted prompts and suggestions.</li>
					<li>⦿ Branding Assistance: Generate unique business names, logos, and mottos tailored to your brand identity.</li>
					<li>⦿ Market Analysis: Gain insights into your target audience and competitors to make data-driven decisions.</li>
					<li>⦿ Strategy Development: Receive AI-generated marketing, financial, and growth strategies for your business.</li>
					<li>⦿ Creative Problem Solving: Explore new angles and challenge your business assumptions with thought-provoking questions.</li>
					<li>⦿ Networking and Mentorship: Connect with industry experts and like-minded entrepreneurs for guidance and collaboration.</li>
				</ul>
                <p class="text-base leading-relaxed text-gray-500 dark:text-slate-300">
                    Stay tuned for the official launch of My Business Pal, and get ready to embark on a successful entrepreneurial journey with your new AI-powered companion!
                </p>
            </div>
            <!-- Modal footer -->
            <div class="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
                <button data-modal-hide="extralarge-modal" type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cant Wait!</button>
                <button data-modal-hide="extralarge-modal" type="button" class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">Close</button>
            </div>
        </div>
    </div>
</div>