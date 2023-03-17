<script lang="ts">
	import type { CreateChatCompletionResponse } from 'openai'
	import { SSE } from 'sse.js'

	let input_form = { "SETTINGS": { "user": "", "user_age": "", "recipient": "", "recipient_age": "", "recipient_relationship": "", "email_style": "", "email_purpose": "", "emotions": [""], "email_length": "" } }
	let context = ''
	let loading = false
	let error = false
	$: logCount = 0
	let answer = ''
	let answerHTML: Element

	const handleSubmit = async () => {
		logCount += 1
		const botResponse = answer ?? undefined
		loading = true
		error = false
		answer = ''

		const eventSource = new SSE('/api/explain', {
			headers: {
				'Content-Type': 'application/json'
			},
			payload: JSON.stringify({ context, botResponse })
		})

		context = ''

		eventSource.addEventListener('error', (e) => {
			error = true
			loading = false
			alert('Something went wrong!')
		})

		eventSource.addEventListener('message', (e) => {
			try {
				loading = false
				//console.log(e.data)
				if (e.data === '[DONE]') {
					return
				}

				const completionResponse: CreateChatCompletionResponse = JSON.parse(e.data)
				const final = completionResponse.choices[0].delta.content

				if(final){
					answer = (answer ?? '') + final
				}
				//console.log(completionResponse.choices[0].delta.content)
			} catch (err) {
				error = true
				loading = false
				console.error(err)
				//alert('Something went wrong!')
			}
		})

		eventSource.stream()
	}
</script>

<div class="flex flex-col items-center">
	<h1 class="text-5xl font-semibold underline decoration-4 decoration-teal-300"><span class="font-bold">GPT</span><span class="font-light">box</span></h1>
	<h3 class="font-mono italic">beta testing</h3>
</div>

<div class="mt-20 flex justify-center">
	<button on:click={() => {location.href = 'services/email'}} class="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-base font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
		<span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
			Email Generator
		</span>
	</button>
</div>



<!--<form on:submit|preventDefault={() => handleSubmit()}>
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
