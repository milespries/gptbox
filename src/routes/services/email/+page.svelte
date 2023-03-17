<script lang="ts">
	import type { CreateChatCompletionResponse } from 'openai'
	import { SSE } from 'sse.js'

	let input_form = { "SETTINGS": { "user": "", "user_age": "", "recipient": "", "recipient_age": "", "recipient_description": "", "email_style": "", "email_purpose": "", "email_length": "" } }
	let context = ''
	let loading = false
    let temp_loading = false
	let error = false
	let answer = ''
    let scrollToDiv: HTMLDivElement
	let answerHTML: HTMLDivElement

    function scrollToBottom() {
		setTimeout(function () {
			scrollToDiv.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' })
		}, 100)
	}

	const handleSubmit = async () => {
		//const botResponse = answer ?? undefined
		loading = true
        temp_loading = true
		error = false
		answer = ''


		const eventSource = new SSE('/api/explain', {
			headers: {
				'Content-Type': 'application/json'
			},
			payload: JSON.stringify({ input_form })
		})

		context = ''

		eventSource.addEventListener('error', (e) => {
			error = true
			loading = false
			alert('Something went wrong!')
		})

		eventSource.addEventListener('message', (e) => {
            scrollToBottom()
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
        scrollToBottom()
	}
</script>

<div class="flex flex-col items-center">
	<h1 class="text-5xl font-semibold">Email Generator</h1>
</div>
<div class="my-6">
    <form autocomplete="off" on:submit|preventDefault={() => handleSubmit()}>
        <div class="grid gap-6 mb-6 md:grid-cols-2">
            <div>
                <label for="user_name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Sender's name</label>
                <input type="text" id="user_name" bind:value={input_form.SETTINGS.user} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="John" required>
            </div>
            <div>
                <label for="recipient_name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Recipient's name</label>
                <input type="text" id="recipient_name" bind:value={input_form.SETTINGS.recipient} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Kevin" required>
            </div>
            <div>
                <label for="user_age" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Sender's age</label>
                <input type="number" id="user_age" bind:value={input_form.SETTINGS.user_age} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="18" min="1" max="100">
            </div>  
            <div>
                <label for="recipient_age" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Recipient's age</label>
                <input type="number" id="recipient_age" bind:value={input_form.SETTINGS.recipient_age} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="18" min="1" max="100">
            </div>
            <div>
                <label for="style" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Style</label>
                <select id="style" bind:value={input_form.SETTINGS.email_style} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option value="Personal">Personal</option>
                    <option value="Professional">Professional</option>
                </select>
            </div>
            <div>
                <label for="style" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Length</label>
                <select id="style" bind:value={input_form.SETTINGS.email_length} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option value="Short">Short</option>
                    <option value="Medium">Medium</option>
                    <option value="Long">Long</option>
                </select>
            </div>
        </div>
        <div class="mb-6">
            <label for="relationship" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">How do you know the recipient?</label>
            <input type="text" id="relationship" bind:value={input_form.SETTINGS.recipient_description} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="He's my friend from school" required>
        </div>
        <div class="mb-6">   
            <label for="context" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">What is your goal for this email?</label>
            <textarea id="context" rows="4" bind:value={input_form.SETTINGS.email_purpose} class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="He has the answers to the math test 6th period, but I barley know him. I need to get the answers."></textarea>
        </div>
        <button type="submit" disabled="{temp_loading}" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 mb-10 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Generate 💫</button>
        {#if answer}
            <div class="w-full max-w-sm p-4 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
                {@html answer}
            </div>
        {/if}
    </form>
</div>
<div bind:this={scrollToDiv}></div>
