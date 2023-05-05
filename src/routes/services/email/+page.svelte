<script lang="ts">
	import type { ChatCompletionRequestMessage, CreateChatCompletionResponse } from 'openai'
	import { SSE } from 'sse.js'
	import { onMount } from 'svelte'

	let input_form = { "SETTINGS": { "user": "", "user_age": "", "recipient": "", "recipient_age": "", "recipient_description": "", "email_style": "", "email_purpose": "", "email_length": "" } }
	let query: string = ''
	let answer: string = ''
    let answer_continer: HTMLDivElement
	let loading: boolean = false
    let retry_attempts: number = 0
    let temp_loading: boolean = false
	let chatMessages: ChatCompletionRequestMessage[] = []
	let scrollToDiv: HTMLDivElement
    let complete: boolean = false

    let bodyElement;
	onMount(() => {
		bodyElement = document.getElementById('body')
		bodyElement?.setAttribute('class', '')
	})

    function scrollToBottom() {
		setTimeout(function () {
			scrollToDiv.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' })
		}, 100)
	}

    const handleCopy = () => {
        let final_copy = ""
        answer_continer.childNodes.forEach(function (currentValue, currentIndex) {
            console.log(`${currentValue}, ${currentIndex}`)
            if(currentValue.nodeName === "BR") {
                final_copy += "\n"
            } else {
                final_copy += currentValue.textContent + "\n"
            }
        }, "myThisArg")
        navigator.clipboard.writeText(final_copy)
    }

	const handleSubmit = async () => {
		//const botResponse = answer ?? undefined

        if(temp_loading) return

		loading = true
        temp_loading = true
		chatMessages = [...chatMessages, { role: 'user', content: JSON.stringify(input_form) }]

		const eventSource = new SSE('/api/explain', {
			headers: {
				'Content-Type': 'application/json'
			},
			payload: JSON.stringify({ messages: chatMessages })
		})

		query = ''

		eventSource.addEventListener('error', (e) => {
			loading = false
			alert('Something went wrong!')
		})

		eventSource.addEventListener('message', (e) => {
            scrollToBottom()
			try {
				loading = false
				//console.log(e.data)
				if (e.data === '[DONE]') {
                    chatMessages = [...chatMessages, { role: 'assistant', content: answer }]
                    complete = true
					//answer = ''
					return
				}

                const completionResponse = JSON.parse(e.data)
				const [{ delta }] = completionResponse.choices

				if(delta.content){
					answer = (answer ?? '') + delta.content
				}
				//console.log(completionResponse.choices[0].delta.content)
			} catch (err) {
				loading = false
				handleError(err)
				//alert('Something went wrong!')
			}
		})

		eventSource.stream()
        scrollToBottom()
	}

    function handleError<T>(err: T) {
		loading = false
		query = ''
		answer = ''
		console.error(err)
	}
</script>

<div class="lg:flex lg:flex-col lg:items-center lg:py-14 pb-6 pt-11 px-7">

    <div class="flex flex-col items-center">
        <h1 class="text-5xl font-semibold">Email Generator</h1>
    </div>
    <div class="my-6">
        <form class="pt-8" autocomplete="off" on:submit|preventDefault={() => handleSubmit()}>
            <div class="grid gap-6 mb-6 md:grid-cols-2">
                <div>
                    <label for="user_name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Sender's name</label>
                    <input disabled="{temp_loading}" type="text" id="user_name" bind:value={input_form.SETTINGS.user} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="John" required>
                </div>
                <div>
                    <label for="recipient_name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Recipient's name</label>
                    <input disabled="{temp_loading}" type="text" id="recipient_name" bind:value={input_form.SETTINGS.recipient} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Kevin" required>
                </div>
                <div>
                    <label for="user_age" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Sender's age</label>
                    <select disabled="{temp_loading}" id="user_age" bind:value={input_form.SETTINGS.user_age} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        <option value="" selected>Select Generation</option>
                        <option value="Generation Z">Gen Z</option>
                        <option value="Generation X">Gen X</option>
                        <option value="Generation Y">Gen Y</option>
                        <option value="Boomer/old">Boomer</option>
                    </select>
                </div>  
                <div>
                    <label for="recipient_age" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Recipient's age</label>
                    <select disabled="{temp_loading}" id="recipient_age" bind:value={input_form.SETTINGS.recipient_age} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        <option value="" selected>Select Generation</option>
                        <option value="Generation Z">Gen Z</option>
                        <option value="Generation X">Gen X</option>
                        <option value="Generation Y">Gen Y</option>
                        <option value="Boomer/old">Boomer</option>
                    </select>
                </div>
                <div>
                    <label for="style" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Style</label>
                    <select disabled="{temp_loading}" id="style" bind:value={input_form.SETTINGS.email_style} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        <option value="" selected>Select Style</option>
                        <option value="Personal">Personal</option>
                        <option value="Professional">Professional</option>
                    </select>
                </div>
                <div>
                    <label for="length" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Length</label>
                    <select disabled="{temp_loading}" id="length" bind:value={input_form.SETTINGS.email_length} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        <option value="" selected>Select Length</option>
                        <option value="Short">Short</option>
                        <option value="Medium">Medium</option>
                        <option value="Long">Long</option>
                    </select>
                </div>
            </div>
            <div class="mb-6">
                <label for="relationship" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">How do you know the recipient?</label>
                <input disabled="{temp_loading}" type="text" id="relationship" bind:value={input_form.SETTINGS.recipient_description} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="He's my Coworker at Amazon." required>
            </div>
            <div class="mb-6">   
                <label for="context" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">What is your goal for this email?</label>
                <textarea disabled="{temp_loading}" id="context" rows="4" bind:value={input_form.SETTINGS.email_purpose} class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="I want to discuss our pay to see if we are being paid fairly.&#10;(This is just an example. The more detailed you are, the better!"></textarea>
            </div>
            <button type="submit" disabled="{temp_loading}" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 mb-10 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Generate 💫</button>
            {#if answer}
                <div class="w-full max-w-sm p-4 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
                    <div bind:this={answer_continer}>{@html answer}</div>
                    {#if complete}
                        <div class="grid grid-cols-2 gap-2 pt-5">
                            <div>
                                <button type="button" on:click={() => {handleCopy()}} class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2">Copy</button>
                            </div>
                        </div> 
                    {/if}
                </div>
            {/if}
        </form>
    
    </div>
    <div bind:this={scrollToDiv}></div>    

</div>