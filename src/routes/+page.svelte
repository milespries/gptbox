<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	console.log(data.session)
</script>

<div class="flex flex-col items-center">
	<h1 class="text-5xl font-semibold underline decoration-4 decoration-teal-300"><span class="font-bold">GPT</span><span class="font-light">box</span></h1>
	<h3 class="font-mono italic">beta testing</h3>
</div>

<div class="mt-12 flex justify-center">
	<button on:click={() => {location.href = 'services/email'}} class="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-base font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
		<span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
			Email Generator
		</span>
	</button>
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
